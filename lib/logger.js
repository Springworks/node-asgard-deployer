'use strict';

var log_path = require('path').join(__dirname, '..');
var logger_factory = require('@springworks/logger-factory');
var log_level = 'trace';
var name = 'asgard-deployer';

module.exports = logger_factory.create(name, log_level, log_path);