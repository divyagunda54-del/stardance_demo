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
}

module.exports = registerPingCommand;
