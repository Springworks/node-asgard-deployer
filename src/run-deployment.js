const deployer = require('./deployer');
const asgard_service = require('./asgard-service');
const asgard_configurator = require('./asgard-configurator');
const logger = require('./logger');
const internals = {

  run(cluster_name, wait_to_complete) {
    logger.info({
      cluster_name,
      wait_to_complete,
    }, 'Starting deployment of cluster');

    Promise
        .resolve(process.env)
        .then(asgard_configurator.createConfigFromEnvVars)
        .catch(err => {
          logger.error(err, 'Failed to validate environment variables');
          throw err;
        })
        .then(asgard_config => asgard_service.create(asgard_config.host, asgard_config.aws_region, asgard_config.basic_auth))
        .then(asgard_service_instance => deployer.create(asgard_service_instance))
        .then(deployer_instance => deployer_instance.makeDeploymentInCluster(cluster_name, wait_to_complete))
        .then(() => {
          logger.info('Done');
          process.exit(0);
        })
        .catch(err => {
          logger.error(err, 'Deployment failed!');
          process.exit(1);
        });
  },

};

const cluster_name_arg = process.argv[2];
const wait_to_complete = process.argv[3] === 'true';
internals.run(cluster_name_arg, wait_to_complete);
