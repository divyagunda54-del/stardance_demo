const app = require('./app');
const config = require('./config');
const registerPingCommand = require('./commands/ping');

// Register all modular command handlers
registerPingCommand(app);

(async () => {
  try {
    // Start the Slackbot receiver service in Socket Mode
    await app.start();
    
    console.log('\x1b[32m%s\x1b[0m', '==================================================');
    console.log('\x1b[32m%s\x1b[0m', '🚀 Slackbot service successfully initialized!    ');
    console.log('\x1b[32m%s\x1b[0m', '💡 Running in Socket Mode... listening to Slack. ');
    console.log('\x1b[32m%s\x1b[0m', '==================================================');
  } catch (error) {
    console.error('Fatal error starting the Slackbot receiver service:', error);
    process.exit(1);
  }
})();
