const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnv = ['SLACK_BOT_TOKEN', 'SLACK_APP_TOKEN'];
const missingEnv = [];

requiredEnv.forEach((key) => {
  if (!process.env[key] || process.env[key].includes('-your-') || process.env[key] === 'xoxb-your-bot-token' || process.env[key] === 'xapp-your-app-token') {
    missingEnv.push(key);
  }
});

if (missingEnv.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', '==================================================');
  console.error('\x1b[31m%s\x1b[0m', '🚨 MISSING REQUIRED ENVIRONMENT VARIABLES CONFIG!');
  console.error('\x1b[31m%s\x1b[0m', '==================================================');
  missingEnv.forEach((key) => {
    console.error('\x1b[33m%s\x1b[0m', `👉 ${key} is not configured inside your local .env file.`);
  });
  console.error('');
  console.error('\x1b[36m%s\x1b[0m', 'Please open your `.env` file and replace the placeholders with your real Slack API credentials.');
  console.error('\x1b[31m%s\x1b[0m', '==================================================');
  process.exit(1);
}

module.exports = {
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
  },
  port: process.env.PORT || 3000
};
