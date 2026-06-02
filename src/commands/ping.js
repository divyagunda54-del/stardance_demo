/**
 * Registers the ping slash command with the Bolt App
 * @param {import('@slack/bolt').App} app - The Bolt App instance
 */
function registerPingCommand(app) {
  app.command('/dsb-ping', async ({ command, ack, respond }) => {
    const start = Date.now();

    // Acknowledge the command request immediately to Slack (must be within 3 seconds)
    await ack();

    const latency = Date.now() - start;

    // Respond back to Slack with the calculated command execution latency
    await respond({
      text: `Pong! 🏓\nLatency: *${latency}ms*`
    });
  });

  // Hello slash command
  app.command('/hello', async ({ command, ack, respond }) => {
    // Acknowledge the command request immediately
    await ack();

    // Respond back with a personalized greeting
    await respond({
      text: `Hello <@${command.user_id}>! Welcome to my Slackbot! 🎉`
    });
  });
}

module.exports = registerPingCommand;
