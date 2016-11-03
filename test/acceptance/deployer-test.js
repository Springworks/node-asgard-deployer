const deployer = require('../../src/deployer');
const asgard_service = require('../../src/asgard-service');
const asgard_fixtures = require('../../test-util/asgard-fixtures');

describe('test/acceptance/deployer-test.js', () => {
  let sinon_sandbox;
  let asgard_service_instance;
  let deployer_instance;

  beforeEach(() => {
    sinon_sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sinon_sandbox.restore();
  });

  beforeEach(() => {
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

  describe('makeDeploymentInCluster', () => {

    describe('with valid env vars', () => {

      describe('with valid cluster_name', () => {
        const cluster_name = 'milky-way';

        describe('wait_to_complete=false', () => {
          const wait_to_complete = false;

          it('should resolve Promise once deployment has started', () => {
            return deployer_instance.makeDeploymentInCluster(cluster_name, wait_to_complete).should.be.fulfilled();
          });

          it('should use asgard-client to prepare deployment', () => {
            return deployer_instance.makeDeploymentInCluster(cluster_name, wait_to_complete).then(() => {
              asgard_service_instance.prepareDeployment.should.have.callCount(1);
              asgard_service_instance.prepareDeployment.getCall(0).args[0].should.eql(cluster_name);
            });
          });

          it('should use asgard-client to start prepared deployment', () => {
            return deployer_instance.makeDeploymentInCluster(cluster_name, wait_to_complete).then(() => {
              asgard_service_instance.startDeployment.should.have.callCount(1);

              const start_deployment_args = asgard_service_instance.startDeployment.getCall(0).args;
              start_deployment_args.should.have.length(3);
              start_deployment_args[0].should.eql(cluster_name);
            });
          });

        });

        describe('wait_to_complete=true', () => {
          const wait_to_complete = true;
          let wait_until_deployment_complete_stub;

          beforeEach(() => {
            wait_until_deployment_complete_stub = sinon_sandbox.stub(deployer.internals, 'waitUntilDeploymentComplete');
            wait_until_deployment_complete_stub.returns(Promise.resolve());
          });

          it('should resolve Promise once deployment has started', () => {
            return deployer_instance.makeDeploymentInCluster(cluster_name, wait_to_complete).should.be.fulfilled();
          });

          it('should invoke waitUntilDeploymentComplete()', () => {
            return deployer_instance.makeDeploymentInCluster(cluster_name, wait_to_complete).then(() => {
              wait_until_deployment_complete_stub.should.have.callCount(1);
            });
          });

        });

      });

      describe('without cluster_name', () => {
        let cluster_name;

        it('should fail', () => {
          return deployer_instance.makeDeploymentInCluster(cluster_name, false).should.be.rejected();
        });

      });

    });

  });

});
