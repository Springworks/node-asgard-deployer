'use strict';

var deployer = require('./deployer');
var asgard_service = require('./asgard-service');
var internals = {

  run: function run(cluster_name, wait_to_complete) {
    console.log('');
    console.log('Starting deployment of cluster: %s', cluster_name);
    console.log('(wait_to_complete=%s)', wait_to_complete);
    console.log('');

    var asgard_basic_auth = internals.parseBasicAuth();
    var asgard_service_instance = asgard_service.create(process.env.NODE_ASGARD_DEPLOYER_ASGARD_HOST, process.env.NODE_ASGARD_DEPLOYER_AWS_REGION, asgard_basic_auth);

    var deployer_instance = deployer.create(asgard_service_instance);
    deployer_instance.makeDeploymentInCluster(cluster_name, wait_to_complete).then(function () {
      console.log('Done');
      process.exit(0);
    })['catch'](function (err) {
      console.warn('Deployment failed, err:', err);
      process.exit(1);
    });
  },

  parseBasicAuth: function parseBasicAuth() {
    if (process.env.NODE_ASGARD_DEPLOYER_ASGARD_USERNAME && process.env.NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD) {
      return {
        username: process.env.NODE_ASGARD_DEPLOYER_ASGARD_USERNAME,
        password: process.env.NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD
      };
    }
    return undefined;
  }

};

var cluster_name_arg = process.argv[2];
var wait_to_complete = process.argv[3] === 'true';
internals.run(cluster_name_arg, wait_to_complete);