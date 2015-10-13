const bunyan = require('bunyan');

module.exports = bunyan.createLogger({
  name: 'asgard-deployer',
  streams: [
    {
      level: 'trace',
      stream: process.stdout,
    },
  ],
});
