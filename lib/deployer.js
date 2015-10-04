const logger = require('./logger');
const internals = {};

export function create(asgard_service) {
  return {
    startDeploymentInCluster: internals.startDeploymentInCluster.bind(null, asgard_service),
  };
}


internals.startDeploymentInCluster = function(asgard_client, cluster_name) {
  return asgard_client
      .prepareDeployment(cluster_name)
      .then(prepared_deployment => {
        return asgard_client.startDeployment(cluster_name, prepared_deployment.lcOptions, prepared_deployment.asgOptions);
      })
      .then(deployment => {
        logger.info({ deployment }, 'Started deployment');
      })
      .catch(err => {
        logger.error(err, 'startDeploymentInCluster failed');
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
