import { createError } from '@springworks/error-factory';
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
        throw err;
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
    const is_done = deployment.done;

    if (!is_done) {
      return false;
    }

    if (deployment.status === 'failed') {
      logger.warn({
        deployment: deployment,
      }, 'Asgard deployment failed');
      throw createError({
        code: 500,
        message: 'Deployment failed',
      });
    }
    else if (logContainsRollbackFailure(deployment.log)) {
      logger.warn({
        deployment: deployment,
      }, 'Asgard deployment rolled back');
      throw createError({
        code: 500,
        message: 'Deployment rolled back',
      });
    }

    return true;
  });
};

function logContainsRollbackFailure(log_messages) {
  return log_messages.some(message => {
    const rollback_log_message_part = 'Deployment was rolled back';
    return message.indexOf(rollback_log_message_part) >= 0;
  });
}

/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  exports.internals = internals;
}
