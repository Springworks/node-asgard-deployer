# Asgard Deployer

Executes automated deployments in [Asgard](https://github.com/Netflix/asgard).

## Environment variables

- `NODE_ENV_ASGARD_DEPLOYER_ASGARD_HOST`, e.g. `https://asgard.mydomain.com`
- `NODE_ENV_ASGARD_DEPLOYER_AWS_REGION`, e.g. `eu-west-1`
- `NODE_ASGARD_DEPLOYER_ASGARD_USERNAME`, username if Asgard is behind basic auth
- `NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD`, password if Asgard is behind basic auth

## Execution of deployment

Create a new automated deployment based on the most recently created auto-scaling group in the cluster:
```sh
node ./deploy.js "<cluster name>" <wait to complete>
```
- `<cluster name>`: name of the Asgard cluster
- `<wait to complete>`: `true | false`, deciding if process should be kept alive until entire deployment has completed (several minute)
