const fixture_loader = require('../test-util/fixture-loader');

export function prepareDeployment() {
  return fixture_loader.loadFixture('./test-util/fixtures/asgard/prepare-deployment.json');
}

export function startDeployment() {
  return fixture_loader.loadFixture('./test-util/fixtures/asgard/start-deployment.json');
}

export function getDeployment() {
  return fixture_loader.loadFixture('./test-util/fixtures/asgard/get-deployment.json');
}


export function getFailedDeployment() {
  return fixture_loader.loadFixture('./test-util/fixtures/asgard/get-failed-deployment.json');
}
