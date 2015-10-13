const logger = require('./logger');
const bluebird = require('bluebird');
const internals = {
  STATUS_CHECK_TIMEOUT_MS: 10000,
};

export function create(asgard_service) {
  return {
    makeDeploymentInCluster: internals.makeDeploymentInCluster.bind(null, asgard_service),
  };
}


internals.makeDeploymentInCluster = function(asgard_client, cluster_name, wait_until_complete) {
  if (!cluster_name) {
    return Promise.reject(new Error('Invalid cluster_name provided to makeDeploymentInCluster()'));
  }

  return asgard_client
      .prepareDeployment(cluster_name)
      .then(prepared_deployment => {
        return asgard_client.startDeployment(cluster_name, prepared_deployment.lcOptions, prepared_deployment.asgOptions);
      })
      .then(deployment => {
        logger.info({ deployment }, 'Started deployment');
        if (wait_until_complete) {
          logger.info({ deployment }, 'Waiting for deployment to complete');
          return internals.waitUntilDeploymentComplete(asgard_client, internals.STATUS_CHECK_TIMEOUT_MS, deployment.deploymentId);
        }
      })
      .catch(err => {
        logger.error(err, 'makeDeploymentInCluster failed');
      });
};


internals.waitUntilDeploymentComplete = function(asgard_client, check_interval_millis, deployment_id) {
  return internals
      .isDeploymentComplete(asgard_client, deployment_id)
      .then(complete => {
        if (!complete) {
          logger.info('Deployment not done yet, checking again in %d ms...', check_interval_millis);
          return bluebird.delay(check_interval_millis).then(() => {
            return internals.waitUntilDeploymentComplete(asgard_client, check_interval_millis, deployment_id);
          });
        }
        logger.info({ deployment_id }, 'Deployment completed!');
      });
};


internals.isDeploymentComplete = function(asgard_client, deployment_id) {
  return asgard_client.getDeployment(deployment_id).then(deployment => {
    return deployment.done;
  });
};


/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  exports.internals = internals;
}
