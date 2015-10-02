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

exports.create = function(asgard_host, aws_region) {
  let auth;
  if (process.env.NODE_ASGARD_DEPLOYER_ASGARD_USERNAME && process.env.NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD) {
    auth = {
      user: process.env.NODE_ASGARD_DEPLOYER_ASGARD_USERNAME,
      pass: process.env.NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD,
    };
  }

  const api_client = api_client_factory.createClient({
    base_url: `${asgard_host}/${aws_region}`,
    circuit_breaker_config: internals.circuit_breaker,
    logger,
    opt_options: {
      opt_auth: auth,
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
  return api_client.sendRequest(req_opts);
};


internals.startDeployment = function(api_client, cluster_name, launch_config_options, asg_options) {
  const req_body = internals.provideDeploymentRequestBody(cluster_name, launch_config_options, asg_options);
  const req_opts = {
    method: 'post',
    endpoint_uri: '/deployment/start',
    json: req_body,
  };
  return api_client.sendRequest(req_opts);
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
  return api_client.sendRequest(req_opts);
};


/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  exports.internals = internals;
}