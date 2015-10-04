const internals = {};

export function create(asgard_client) {
  return {
    startDeploymentInCluster: internals.startDeploymentInCluster.bind(null, asgard_client),
  };
}


internals.startDeploymentInCluster = function(asgard_client, cluster_name) {
  return asgard_client
      .prepareDeployment(cluster_name)
      .then(prepared_deployment => {
        return asgard_client.startDeployment(cluster_name, prepared_deployment.lcOptions, prepared_deployment.asgOptions);
      });
};
