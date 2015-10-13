const log_path = require('path').join(__dirname, '..');
const logger_factory = require('@springworks/logger-factory');
const log_level = 'trace';
const name = 'asgard-deployer';

module.exports = logger_factory.create(name, log_level, log_path);
