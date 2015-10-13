const asgard_config = require('../../src/asgard-configurator');
const internals = {};

describe(__filename, () => {

  describe('createConfigFromEnvVars', () => {

    describe('having all variables defined in env object', () => {
      let variables;

      beforeEach(() => {
        variables = internals.createValidEnvVars();
      });

      it('should return validated env vars', () => {
        const validated = asgard_config.createConfigFromEnvVars(variables);
        validated.should.eql({
          host: variables.NODE_ASGARD_DEPLOYER_ASGARD_HOST,
          aws_region: variables.NODE_ASGARD_DEPLOYER_AWS_REGION,
          basic_auth: {
            username: variables.NODE_ASGARD_DEPLOYER_ASGARD_USERNAME,
            password: variables.NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD,
          },
        });
      });

    });

    describe('missing env vars', () => {
      const required_variables = [
        'NODE_ASGARD_DEPLOYER_ASGARD_HOST',
        'NODE_ASGARD_DEPLOYER_AWS_REGION',
        'NODE_ASGARD_DEPLOYER_ASGARD_USERNAME',
        'NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD',
      ];

      required_variables.forEach(param => {
        let variables;

        beforeEach(() => {
          variables = internals.createValidEnvVars();
        });

        describe(`missing ${param}`, () => {

          beforeEach(() => {
            delete variables[param];
          });

          it('should fail with validation error', () => {
            (() => {
              asgard_config.createConfigFromEnvVars(variables);
            }).should.throw('Validation Failed');
          });

        });

      });

    });

  });

});

internals.createValidEnvVars = function() {
  return {
    NODE_ASGARD_DEPLOYER_ASGARD_HOST: 'foo',
    NODE_ASGARD_DEPLOYER_AWS_REGION: 'foo',
    NODE_ASGARD_DEPLOYER_ASGARD_USERNAME: 'foo',
    NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD: 'foo',
  };
};
