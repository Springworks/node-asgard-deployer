# Asgard Deployer

Executes automated deployments in [Asgard](https://github.com/Netflix/asgard).

## Environment variables

- `NODE_ENV_ASGARD_DEPLOYER_ASGARD_HOST`, e.g. `https://asgard.mydomain.com`
- `NODE_ENV_ASGARD_DEPLOYER_AWS_REGION`, e.g. `eu-west-1`

## Execution of deployment

Create a new automated deployment based on the most recently created auto-scaling group in the cluster:
```sh
node ./deploy.js "<cluster name>" <wait seconds>
```
- `<cluster name>`: name of the Asgard cluster
- `<wait seconds>`: The number of seconds to wait before disabling the existing cluster
