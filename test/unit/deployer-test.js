const deployer = require('../../lib/deployer');
const asgard_service = require('../../lib/asgard-service');
const asgard_fixtures = require('../../test-util/asgard-fixtures');

describe(__filename, () => {
  let sinon_sandbox;
  let asgard_service_instance;

  beforeEach(() => {
    sinon_sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sinon_sandbox.restore();
  });

  beforeEach(function createMockAsgardClient() {
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

        beforeEach(function mockFirstCallToBeNotDone() {
          const fixture = asgard_fixtures.getDeployment();
          fixture.done = false;
          get_deployment_stub.onCall(0).returns(Promise.resolve(fixture));
        });

        beforeEach(function mockSecondCallToBeDone() {
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

    });

  });

});
