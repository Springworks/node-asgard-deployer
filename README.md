# Asgard Deployer

[![Greenkeeper badge](https://badges.greenkeeper.io/Springworks/node-asgard-deployer.svg)](https://greenkeeper.io/)

Executes automated deployments in [Asgard](https://github.com/Netflix/asgard).

## Environment variables

- `NODE_ASGARD_DEPLOYER_ASGARD_HOST`, e.g. `https://asgard.mydomain.com` (required)
- `NODE_ASGARD_DEPLOYER_AWS_REGION`, e.g. `eu-west-1` (required)
- `NODE_ASGARD_DEPLOYER_ASGARD_USERNAME`, username if Asgard is behind basic auth (optional)
- `NODE_ASGARD_DEPLOYER_ASGARD_PASSWORD`, password if Asgard is behind basic auth (optional)

## Execution of deployment

### Locally

Install module:
```
npm i asgard-deployer
```

Create a new automated deployment based on the most recently created auto-scaling group in the cluster:
```sh
node ./deploy.js "<cluster name>" <wait to complete>
```
- `<cluster name>`: name of the Asgard cluster
- `<wait to complete>`: `true | false`, deciding if process should be kept alive until entire deployment has completed (several minutes)

### Globally

Install module:
```
npm i -g asgard-deployer
```

Run from command line:
```
asgard-deployer "<cluster name>" <wait to complete>
```

## Development
The library is built using ES6, but code is generated to ES5 by [Babel](https://babeljs.io).
