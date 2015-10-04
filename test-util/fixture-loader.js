const fs = require('fs');
const path = require('path');

const internals = {};


exports.loadFixture = function(fixture_filename) {
  if (!fixture_filename) {
    throw new Error('fixture_filename not defined');
  }
  return internals.loadJsonFixture(fixture_filename);
};


internals.loadJsonFixture = function(fixture_filename) {
  return JSON.parse(internals.loadFixtureFile(fixture_filename));
};


internals.loadFixtureFile = function(fixture_filename) {
  var resolved_path = path.resolve(fixture_filename);
  return fs.readFileSync(resolved_path, { encoding: 'utf-8' });
};
