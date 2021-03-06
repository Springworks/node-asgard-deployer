const deployer = require('../../src/deployer');
const asgard_service = require('../../src/asgard-service');
const asgard_fixtures = require('../../test-util/asgard-fixtures');

describe('test/unit/deployer-test.js', () => {
  let sinon_sandbox;
  let asgard_service_instance;

  beforeEach(() => {
    sinon_sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sinon_sandbox.restore();
  });

  beforeEach(() => {
    asgard_service_instance = asgard_service.create('http://localhost:3000', 'eu-west-1');
  });

  describe('internals.waitUntilDeploymentComplete', () => {

    describe('with valid asgard_client, deployment_id', () => {
      const deployment_id = 42;
      const status_check_interval_ms = 10;

      describe('when deployment property goes from false -> true after 1 call', () => {
        let get_deployment_stub;

        beforeEach(() => {
          get_deployment_stub = sinon_sandbox.stub(asgard_service_instance, 'getDeployment');
        });

        beforeEach(() => {
          const fixture = asgard_fixtures.getDeployment();
          fixture.done = false;
          get_deployment_stub.onCall(0).returns(Promise.resolve(fixture));
        });

        beforeEach(() => {
          const fixture = asgard_fixtures.getDeployment();
          fixture.done = true;
          get_deployment_stub.onCall(1).returns(Promise.resolve(fixture));
        });

        it('should resolve promise', () => {
          return deployer
              .internals.waitUntilDeploymentComplete(asgard_service_instance, status_check_interval_ms, deployment_id)
              .should.be.fulfilled();
        });

        it('should check deployment status twice', () => {
          return deployer
              .internals.waitUntilDeploymentComplete(asgard_service_instance, status_check_interval_ms, deployment_id)
              .then(() => {
                get_deployment_stub.getCalls().should.have.length(2);
              });
        });

      });

    });

  });

  describe('internals.isDeploymentComplete', () => {

    describe('with valid asgard_client, deployment_id', () => {
      const deployment_id = 42;

      describe('when deployment property "done=false"', () => {

        beforeEach(() => {
          const fixture = asgard_fixtures.getDeployment();
          fixture.done = false;
          sinon_sandbox
              .stub(asgard_service_instance, 'getDeployment')
              .returns(Promise.resolve(fixture));
        });

        it('should resolve with false', () => {
          return deployer.internals.isDeploymentComplete(asgard_service_instance, deployment_id).should.be.fulfilledWith(false);
        });

      });

      describe('when deployment property "done=true"', () => {

        describe('when deployment succeeded', () => {

          beforeEach(() => {
            const fixture = asgard_fixtures.getDeployment();
            fixture.done = true;
            sinon_sandbox
                .stub(asgard_service_instance, 'getDeployment')
                .returns(Promise.resolve(fixture));
          });

          it('should resolve with true', () => {
            return deployer.internals.isDeploymentComplete(asgard_service_instance, deployment_id).should.be.fulfilledWith(true);
          });

        });

        describe('when deployment failed', () => {

          beforeEach(() => {
            const fixture = asgard_fixtures.getFailedDeployment();
            fixture.done = true;
            sinon_sandbox
                .stub(asgard_service_instance, 'getDeployment')
                .returns(Promise.resolve(fixture));
          });

          it('should reject with error', () => {
            return deployer.internals.isDeploymentComplete(asgard_service_instance, deployment_id).should.be.rejectedWith({
              code: 500,
              message: 'Deployment failed',
            });
          });

        });

        describe('when deployment completed, but was rolled back', () => {

          beforeEach(() => {
            const fixture = asgard_fixtures.getRolledBackDeployment();
            fixture.done = true;
            sinon_sandbox
                .stub(asgard_service_instance, 'getDeployment')
                .returns(Promise.resolve(fixture));
          });

          it('should reject with error', () => {
            return deployer.internals.isDeploymentComplete(asgard_service_instance, deployment_id).should.be.rejectedWith({
              code: 500,
              message: 'Deployment rolled back',
            });
          });

        });

      });

    });

  });

});
