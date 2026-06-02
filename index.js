require("dotenv").config();

const { App } = require("@slack/bolt");
const axios = require("axios");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
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
    text: `*Advanced Slack Bot Help*

*General Commands:*
\`/dsb-help\` - Show this menu
\`/dsb-qotd\` - Get the quote of the day
\`/dsb-trivia\` - Get a random trivia question
\`/dsb-dadjoke\` - Get a random dad joke
\`/dsb-urban <term>\` - Look up a term on Urban Dictionary

*Utility Commands:*
\`/dsb-weather <city>\` - Get weather info
\`/dsb-catfact\` - Get a cat fact`
  });
});

app.command("/dsb-catfact", async ({ ack, respond }) => {
  await ack();
  try {
    const res = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `🐱 Cat Fact: ${res.data.fact}` });
  } catch (e) {
    await respond({ text: "Couldn't fetch a cat fact right now." });
  }
});

app.command("/dsb-joker", async ({ ack, respond }) => {
  await ack();
  try {
    const res = await axios.get("https://sellyourballs.com/api/jokes/random");
    await respond({ text: res.data.joke });
  } catch (e) {
    await respond({ text: "Couldn't fetch a joke right now." });
  }
});

app.command("/dsb-dadjoke", async ({ ack, respond }) => {
  await ack();
  try {
    const res = await axios.get("https://icanhazdadjoke.com/", { headers: { Accept: "application/json" } });
    await respond({ text: `😂 ${res.data.joke}` });
  } catch (e) {
    await respond({ text: "Couldn't fetch a dad joke right now." });
  }
});

app.command("/dsb-qotd", async ({ ack, respond }) => {
  await ack();
  try {
    const res = await axios.get("https://api.quotable.io/random");
    await respond({ text: `> "${res.data.content}"\n- *${res.data.author}*` });
  } catch (e) {
    await respond({ text: "Couldn't fetch a quote right now." });
  }
});

app.command("/dsb-trivia", async ({ ack, respond }) => {
  await ack();
  try {
    const res = await axios.get("https://opentdb.com/api.php?amount=1");
    if (res.data.results && res.data.results.length > 0) {
      const q = res.data.results[0];
      await respond({ text: `🧠 *Trivia (${q.difficulty} ${q.category})*\n${q.question}\n\n*Answer:* ||${q.correct_answer}||` });
    } else {
      await respond({ text: "Couldn't find a trivia question." });
    }
  } catch (e) {
    await respond({ text: "Couldn't fetch a trivia question right now." });
  }
});

app.command("/dsb-urban", async ({ command, ack, respond }) => {
  await ack();
  try {
    const term = command.text;
    if (!term) {
      await respond({ text: "Please provide a term! Usage: `/dsb-urban <term>`" });
      return;
    }
    const res = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`);
    if (res.data.list && res.data.list.length > 0) {
      const def = res.data.list[0];
      await respond({ text: `📖 *${def.word}*\n${def.definition.replace(/\[/g, '').replace(/\]/g, '')}\n\n*Example:*\n_${def.example.replace(/\[/g, '').replace(/\]/g, '')}_` });
    } else {
      await respond({ text: `No definition found for "${term}".` });
    }
  } catch (e) {
    await respond({ text: "Couldn't fetch from Urban Dictionary right now." });
  }
});

app.command("/dsb-weather", async ({ command, ack, respond }) => {
  await ack();
  try {
    const city = command.text;
    if (!city) {
      await respond({ text: "Please provide a city! Usage: `/dsb-weather <city>`" });
      return;
    }
    const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=3`);
    await respond({ text: res.data });
  } catch (e) {
    await respond({ text: "Couldn't fetch weather right now." });
  }
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();
