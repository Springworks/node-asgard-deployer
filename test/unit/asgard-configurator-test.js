const asgard_config = require('../../src/asgard-configurator');
const internals = {};

describe('test/unit/asgard-configurator-test.js', () => {

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

    describe('having all variables except basic auth', () => {
      let variables;

      beforeEach(() => {
        variables = internals.createValidEnvVars();
        delete variables.NODE_ASGARD_DEPLOYER_ASGARD_USERNAME;
        delete variables.NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD;
      });

      it('should return validated env vars', () => {
        const validated = asgard_config.createConfigFromEnvVars(variables);
        validated.should.eql({
          host: variables.NODE_ASGARD_DEPLOYER_ASGARD_HOST,
          aws_region: variables.NODE_ASGARD_DEPLOYER_AWS_REGION,
        });
      });

    });

    describe('with excessive parameters', () => {
      let valid_env_vars;
      let variables;

      beforeEach(() => {
        valid_env_vars = internals.createValidEnvVars();
        variables = valid_env_vars;
        variables.foo = 'foo';
      });

      it('should strip unknown (since there are lots of other env vars)', () => {
        const validated = asgard_config.createConfigFromEnvVars(variables);
        validated.should.have.keys('host',
            'aws_region',
            'basic_auth');
      });

    });

    describe('missing required env vars', () => {
      const required_variables = [
        'NODE_ASGARD_DEPLOYER_ASGARD_HOST',
        'NODE_ASGARD_DEPLOYER_AWS_REGION',
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
