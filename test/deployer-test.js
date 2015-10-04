const deployer = require('../lib/deployer');
const asgard_service = require('../lib/asgard-service');
const asgard_fixtures = require('../test-util/asgard-fixtures');

describe(__filename, function() {
  let sinon_sandbox;
  let asgard_service_instance;
  let deployer_instance;

  beforeEach(() => {
    sinon_sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sinon_sandbox.restore();
  });

  beforeEach(function createMockAsgardClient() {
    asgard_service_instance = asgard_service.create('http://localhost:3000', 'eu-west-1');

    sinon_sandbox
        .stub(asgard_service_instance, 'prepareDeployment')
        .returns(Promise.resolve(asgard_fixtures.prepareDeployment()));

    sinon_sandbox
        .stub(asgard_service_instance, 'startDeployment')
        .returns(Promise.resolve(asgard_fixtures.startDeployment()));
  });

  beforeEach(() => {
    deployer_instance = deployer.create(asgard_service_instance);
  });

  describe('start', () => {

    describe('with valid env vars', () => {

      describe('with valid cluster_name', () => {
        const cluster_name = 'milky-way';

        it('should use asgard-client to prepare deployment', () => {
          return deployer_instance.startDeploymentInCluster(cluster_name).then(() => {
            asgard_service_instance.prepareDeployment.should.have.callCount(1);
            asgard_service_instance.prepareDeployment.getCall(0).args[0].should.eql(cluster_name);
          });
        });

        it('should use asgard-client to start prepared deployment', () => {
          return deployer_instance.startDeploymentInCluster(cluster_name).then(() => {
            asgard_service_instance.startDeployment.should.have.callCount(1);

            const start_deployment_args = asgard_service_instance.startDeployment.getCall(0).args;
            start_deployment_args.should.have.length(3);
            start_deployment_args[0].should.eql(cluster_name);
          });
        });

        it('should check state of deployment using asgard-client');

        it('should resolve Promise once deployment has succeeded');

      });

    });

  });

});
