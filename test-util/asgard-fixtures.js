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
