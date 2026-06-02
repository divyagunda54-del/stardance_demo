require("dotenv").config();

const express = require("express");
const path = require("path");
const { App } = require("@slack/bolt");
const axios = require("axios");

const web = express();
const publicDir = path.join(__dirname, "..", "public");

web.use(express.static(publicDir));
web.use(express.json());

web.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "stardance-demo" });
});

web.post("/api/command", async (req, res) => {
  const { cmd, text } = req.body || {};
  if (!cmd) return res.status(400).json({ ok: false, error: "missing cmd" });

  try {
    switch (cmd) {
      case "dsb-ping": {
        return res.json({ ok: true, text: `Pong!` });
      }
      case "dsb-hello": {
        return res.json({ ok: true, text: `Hello! Welcome to the demo.` });
      }
      case "dsb-help": {
        return res.json({ ok: true, text: `Commands: /dsb-help, /dsb-qotd, /dsb-trivia, /dsb-dadjoke, /dsb-urban <term>, /dsb-weather <city>, /dsb-catfact` });
      }
      case "dsb-catfact": {
        const r = await axios.get("https://catfact.ninja/fact");
        return res.json({ ok: true, text: `🐱 Cat Fact: ${r.data.fact}` });
      }
      case "dsb-dadjoke": {
        const r = await axios.get("https://icanhazdadjoke.com/", { headers: { Accept: "application/json" } });
        return res.json({ ok: true, text: `😂 ${r.data.joke}` });
      }
      case "dsb-qotd": {
        const r = await axios.get("https://api.quotable.io/random");
        return res.json({ ok: true, text: `"${r.data.content}" — ${r.data.author}` });
      }
      case "dsb-trivia": {
        const r = await axios.get("https://opentdb.com/api.php?amount=1");
        if (r.data.results && r.data.results.length > 0) {
          const q = r.data.results[0];
          return res.json({ ok: true, text: `🧠 ${q.question}\nAnswer: ${q.correct_answer}` });
        }
        return res.json({ ok: false, error: "no-trivia" });
      }
      case "dsb-urban": {
        if (!text) return res.status(400).json({ ok: false, error: "missing term" });
        const r = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(text)}`);
        if (r.data.list && r.data.list.length > 0) {
          const def = r.data.list[0];
          const cleanDef = def.definition.replace(/\[/g, '').replace(/\]/g, '');
          return res.json({ ok: true, text: `${def.word}: ${cleanDef}` });
        }
        return res.json({ ok: true, text: `No definition found for \"${text}\".` });
      }
      case "dsb-weather": {
        if (!text) return res.status(400).json({ ok: false, error: "missing city" });
        const r = await axios.get(`https://wttr.in/${encodeURIComponent(text)}?format=3`);
        return res.json({ ok: true, text: r.data });
      }
      default:
        return res.status(400).json({ ok: false, error: "unknown-cmd" });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: "upstream-failed" });
  }
});

const webPort = process.env.PORT || 3000;

web.listen(webPort, () => {
  console.log(`web demo is running on port ${webPort}`);
});

const slackBotToken = process.env.SLACK_BOT_TOKEN;
const slackAppToken = process.env.SLACK_APP_TOKEN;

const tokensValid = slackBotToken && slackAppToken && !slackBotToken.includes('your-') && !slackAppToken.includes('your-');

if (tokensValid) {
  try {
    const app = new App({
      token: slackBotToken,
      appToken: slackAppToken,
      socketMode: true
    });

    app.command("/dsb-ping", async ({ command, ack, respond }) => {
      const start = Date.now();
      await ack();
      const latency = Date.now() - start;
      await respond({ text: `Pong!\nLatency: ${latency}ms` });
    });

    app.command("/dsb-hello", async ({ command, ack, respond }) => {
      await ack();
      await respond({ text: `Hello <@${command.user_id}>! Welcome to my Slackbot! 🎉` });
    });

    app.command("/dsb-help", async ({ ack, respond }) => {
      await ack();
      await respond({
        text: `*Advanced Slack Bot Help*\n\n*General Commands:*\n\`/dsb-help\` - Show this menu\n\`/dsb-qotd\` - Get the quote of the day\n\`/dsb-trivia\` - Get a random trivia question\n\`/dsb-dadjoke\` - Get a random dad joke\n\`/dsb-urban <term>\` - Look up a term on Urban Dictionary\n\n*Utility Commands:*\n\`/dsb-weather <city>\` - Get weather info\n\`/dsb-catfact\` - Get a cat fact`
      });
    });

    (async () => {
      try {
        await app.start();
        console.log("bot is running!");
      } catch (e) {
        console.error("Slack app failed to start:", e && e.message ? e.message : e);
      }
    })();
  } catch (e) {
    console.error("Slack initialization failed:", e && e.message ? e.message : e);
  }
} else {
  console.log("Slack bot disabled. Set SLACK_BOT_TOKEN and SLACK_APP_TOKEN to enable it.");
}
