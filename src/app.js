const { App } = require('@slack/bolt');
const config = require('./config');

// Initialize the Bolt App instance with modular configurations
const app = new App({
  token: config.slack.botToken,
  appToken: config.slack.appToken,
  socketMode: true
});

module.exports = app;
