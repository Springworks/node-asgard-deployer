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
