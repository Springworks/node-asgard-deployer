const api_client_factory = require('@springworks/api-client');
const logger = require('./logger');
const internals = {
  circuit_breaker: {
    source_name: 'deployer',
    target_name: 'asgard',
    window_duration: 1000,
    num_buckets: 10,
    timeout_duration: 10000,
    error_threshold: 50,
    volume_threshold: 5,
  },
};

exports.create = function(asgard_host, aws_region, opt_basic_auth) {
  const api_client = api_client_factory.createClient({
    base_url: `${asgard_host}/${aws_region}`,
    circuit_breaker_config: internals.circuit_breaker,
    logger,
    opt_options: {
      opt_auth: opt_basic_auth,
    },
  });

  return {
    prepareDeployment: internals.prepareDeployment.bind(null, api_client),
    startDeployment: internals.startDeployment.bind(null, api_client),
    getDeployment: internals.getDeployment.bind(null, api_client),
  };
};


internals.prepareDeployment = function(api_client, cluster_name) {
  const req_opts = {
    method: 'get',
    endpoint_uri: `/deployment/prepare/${cluster_name}`,
    qs: {
      deploymentTemplateName: 'CreateAndCleanUpPreviousAsg',
      includeEnvironment: true,
    },
  };

  logger.info(req_opts, 'prepareDeployment');

  return api_client.sendRequest(req_opts, [200]);
};


internals.startDeployment = function(api_client, cluster_name, launch_config_options, asg_options) {
  const req_body = internals.provideDeploymentRequestBody(cluster_name, launch_config_options, asg_options);
  const req_opts = {
    method: 'post',
    endpoint_uri: '/deployment/start',
    json: req_body,
  };

  logger.info(req_opts, 'startDeployment');

  return api_client.sendRequest(req_opts, [200]);
};


internals.provideDeploymentRequestBody = function(cluster_name, launch_config_options, asg_options) {
  return {
    deploymentOptions: {
      clusterName: cluster_name,
      notificationDestination: 'm2h@springworks.se',
      steps: [
        {
          type: 'CreateAsg',
        },
        {
          type: 'Resize',
          targetAsg: 'Next',
          capacity: 2,
          startUpTimeoutMinutes: 20,
        },
        {
          type: 'Wait',
          durationMinutes: '5',
        },
        {
          type: 'DisableAsg',
          targetAsg: 'Previous',
        },
        {
          type: 'DeleteAsg',
          targetAsg: 'Previous',
        },
      ],
    },
    asgOptions: asg_options,
    lcOptions: launch_config_options,
  };
};


internals.getDeployment = function(api_client, deployment_id) {
  const req_opts = {
    method: 'get',
    endpoint_uri: `/deployment/show/${deployment_id}.json`,
    json: true,
  };

  logger.info(req_opts, 'getDeployment');

  return api_client.sendRequest(req_opts, [200]);
};


/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  exports.internals = internals;
}
