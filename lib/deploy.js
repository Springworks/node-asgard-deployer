const deployer = require('./deployer');
const asgard_service = require('./asgard-service');
const internals = {

  run(cluster_name) {
    console.log('');
    console.log('Starting deployment of cluster: %s', cluster_name);
    console.log('');

    const asgard_basic_auth = internals.parseBasicAuth();
    const asgard_service_instance = asgard_service.create(process.env.NODE_ENV_ASGARD_DEPLOYER_ASGARD_HOST,
        process.env.NODE_ENV_ASGARD_DEPLOYER_AWS_REGION,
        asgard_basic_auth);

    const deployer_instance = deployer.create(asgard_service_instance);
    deployer_instance.startDeploymentInCluster(cluster_name)
        .then(() => {
          console.log('Deployment complete!');
        })
        .catch(err => {
          console.warn('Deployment failed, err:', err);
        });
  },

  parseBasicAuth() {
    if (process.env.NODE_ASGARD_DEPLOYER_ASGARD_USERNAME && process.env.NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD) {
      return {
        username: process.env.NODE_ASGARD_DEPLOYER_ASGARD_USERNAME,
        password: process.env.NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD,
      };
    }
    return undefined;
  },

};

const cluster_name_arg = process.argv[2];
internals.run(cluster_name_arg);
