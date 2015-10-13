const input_validator = require('@springworks/input-validator');
const joi = input_validator.joi;

const internals = {
  env_vars_validation_schema: joi.object().required().keys({
    NODE_ASGARD_DEPLOYER_ASGARD_HOST: joi.string().required(),
    NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD: joi.string().required(),
    NODE_ASGARD_DEPLOYER_ASGARD_USERNAME: joi.string().required(),
    NODE_ASGARD_DEPLOYER_AWS_REGION: joi.string().required(),
  }),
};

exports.createConfigFromEnvVars = function(env_vars) {
  const validated = input_validator.validateSchema(env_vars, internals.env_vars_validation_schema, null, { stripUnknown: true });
  const config = {
    host: validated.NODE_ASGARD_DEPLOYER_ASGARD_HOST,
    aws_region: validated.NODE_ASGARD_DEPLOYER_AWS_REGION,
  };

  const basic_auth = internals.parseBasicAuth(validated);
  if (basic_auth) {
    config.basic_auth = basic_auth;
  }

  return config;
};


internals.parseBasicAuth = function(validated_env_vars) {
  if (validated_env_vars.NODE_ASGARD_DEPLOYER_ASGARD_USERNAME && validated_env_vars.NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD) {
    return {
      username: validated_env_vars.NODE_ASGARD_DEPLOYER_ASGARD_USERNAME,
      password: validated_env_vars.NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD,
    };
  }
  return null;
};

