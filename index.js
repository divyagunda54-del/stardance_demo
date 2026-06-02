require("dotenv").config();

const { App } = require("@slack/bolt");

// Initialize your app with your bot token and app-level token
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

// Slash command to ping the bot and measure latency
app.command("/dsb-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

(async () => {
  // Start your app
  await app.start();
  console.log("bot is running!");
})();
