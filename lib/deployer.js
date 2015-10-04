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
      .catch(err => {
        logger.error(err, 'startDeploymentInCluster failed');
      });
};
