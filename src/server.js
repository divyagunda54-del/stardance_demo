require("dotenv").config();

const express = require("express");
const path = require("path");
const { App } = require("@slack/bolt");
const axios = require("axios");

const web = express();
const publicDir = path.join(__dirname, "..", "public");

// Fallback arrays for robust operation
const fallbackTrivia = [
  { question: "What is the capital of France?", correct_answer: "Paris" },
  { question: "Which planet is known as the Red Planet?", correct_answer: "Mars" },
  { question: "What is the largest ocean on Earth?", correct_answer: "Pacific Ocean" },
  { question: "Who wrote the play 'Romeo and Juliet'?", correct_answer: "William Shakespeare" },
  { question: "What is the chemical symbol for gold?", correct_answer: "Au" },
  { question: "How many bones are there in an adult human body?", correct_answer: "206" },
  { question: "Which country is home to the kangaroo?", correct_answer: "Australia" },
  { question: "What is the hardest natural substance on Earth?", correct_answer: "Diamond" },
  { question: "Which element has the atomic number 1?", correct_answer: "Hydrogen" },
  { question: "What is the smallest country in the world?", correct_answer: "Vatican City" }
];

const fallbackQuotes = [
  { content: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { content: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
  { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { content: "Get busy living or get busy dying.", author: "Stephen King" },
  { content: "You only live once, but if you do it right, once is enough.", author: "Mae West" }
];

const fallbackCatFacts = [
  "Cats spend about 70% of their lives sleeping.",
  "A cat can jump up to six times its height.",
  "Cats have over 20 muscles that control their ears.",
  "The first cat in space was a French cat named Felicette in 1963.",
  "Cats have a third eyelid called the haw."
];

const fallbackDadJokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "What do you call a factory that makes okay products? A satisfactory.",
  "Did you hear about the guy who invented the knock-knock joke? He won the no-bell prize.",
  "I only know 25 letters of the alphabet. I don't know y.",
  "Why did the scarecrow win an award? Because he was outstanding in his field."
];

// Helper to decode HTML entities returned by OpenTDB
function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&deg;/g, '°');
}

async function getCatFact() {
  try {
    const r = await axios.get("https://catfact.ninja/fact", { timeout: 3000 });
    return `🐱 Cat Fact: ${r.data.fact}`;
  } catch (e) {
    const randomFact = fallbackCatFacts[Math.floor(Math.random() * fallbackCatFacts.length)];
    return `🐱 Cat Fact: ${randomFact}`;
  }
}

async function getDadJoke() {
  try {
    const r = await axios.get("https://icanhazdadjoke.com/", { headers: { Accept: "application/json" }, timeout: 3000 });
    return `😂 ${r.data.joke}`;
  } catch (e) {
    const randomJoke = fallbackDadJokes[Math.floor(Math.random() * fallbackDadJokes.length)];
    return `😂 ${randomJoke}`;
  }
}

async function getQuote() {
  try {
    const r = await axios.get("https://api.quotable.io/random", { timeout: 3000 });
    return `"${r.data.content}" — ${r.data.author}`;
  } catch (e) {
    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    return `"${randomQuote.content}" — ${randomQuote.author}`;
  }
}

async function getTrivia() {
  try {
    const r = await axios.get("https://opentdb.com/api.php?amount=1", { timeout: 3000 });
    if (r.data && r.data.response_code === 0 && r.data.results && r.data.results.length > 0) {
      const q = r.data.results[0];
      const cleanQ = decodeHtmlEntities(q.question);
      const cleanA = decodeHtmlEntities(q.correct_answer);
      return { question: cleanQ, answer: cleanA, category: q.category, difficulty: q.difficulty };
    }
  } catch (e) {
    console.warn("OpenTDB request failed, using local fallback trivia question:", e.message);
  }
  const randomTrivia = fallbackTrivia[Math.floor(Math.random() * fallbackTrivia.length)];
  return {
    question: randomTrivia.question,
    answer: randomTrivia.correct_answer,
    category: "General Knowledge",
    difficulty: "easy"
  };
}

async function getWeather(city) {
  if (!city) return null;
  try {
    const r = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=3`, { timeout: 3000 });
    return r.data;
  } catch (e) {
    return `Unable to fetch weather for "${city}" right now.`;
  }
}

async function getUrbanDefinition(term) {
  if (!term) return null;
  try {
    const r = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`, { timeout: 3000 });
    if (r.data.list && r.data.list.length > 0) {
      const def = r.data.list[0];
      const cleanDef = def.definition.replace(/\[/g, '').replace(/\]/g, '');
      const cleanExample = def.example ? def.example.replace(/\[/g, '').replace(/\]/g, '') : '';
      return { word: def.word, definition: cleanDef, example: cleanExample };
    }
  } catch (e) {
    console.warn("Urban Dictionary request failed:", e.message);
  }
  return null;
}

web.use(express.static(publicDir));
web.use(express.json());

// Enable CORS for frontend clients (e.g. Cloudflare Pages)
web.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

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
        const factText = await getCatFact();
        return res.json({ ok: true, text: factText });
      }
      case "dsb-dadjoke": {
        const jokeText = await getDadJoke();
        return res.json({ ok: true, text: jokeText });
      }
      case "dsb-qotd": {
        const quoteText = await getQuote();
        return res.json({ ok: true, text: quoteText });
      }
      case "dsb-trivia": {
        const q = await getTrivia();
        return res.json({ ok: true, text: `🧠 ${q.question}\nAnswer: ${q.answer}` });
      }
      case "dsb-urban": {
        if (!text) return res.status(400).json({ ok: false, error: "missing term" });
        const def = await getUrbanDefinition(text);
        if (def) {
          return res.json({ ok: true, text: `${def.word}: ${def.definition}` });
        }
        return res.json({ ok: true, text: `No definition found for \"${text}\".` });
      }
      case "dsb-weather": {
        if (!text) return res.status(400).json({ ok: false, error: "missing city" });
        const weatherText = await getWeather(text);
        return res.json({ ok: true, text: weatherText });
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

    app.command("/dsb-catfact", async ({ ack, respond }) => {
      await ack();
      const text = await getCatFact();
      await respond({ text });
    });

    app.command("/dsb-dadjoke", async ({ ack, respond }) => {
      await ack();
      const text = await getDadJoke();
      await respond({ text });
    });

    app.command("/dsb-qotd", async ({ ack, respond }) => {
      await ack();
      const text = await getQuote();
      await respond({ text });
    });

    app.command("/dsb-trivia", async ({ ack, respond }) => {
      await ack();
      const q = await getTrivia();
      await respond({ text: `🧠 *Trivia (${q.difficulty} ${q.category})*\n${q.question}\n\n*Answer:* ||${q.answer}||` });
    });

    app.command("/dsb-urban", async ({ command, ack, respond }) => {
      await ack();
      const term = command.text;
      if (!term) {
        await respond({ text: "Please provide a term! Usage: `/dsb-urban <term>`" });
        return;
      }
      const def = await getUrbanDefinition(term);
      if (def) {
        await respond({ text: `📖 *${def.word}*\n${def.definition}\n\n*Example:*\n_${def.example}_` });
      } else {
        await respond({ text: `No definition found for "${term}".` });
      }
    });

    app.command("/dsb-weather", async ({ command, ack, respond }) => {
      await ack();
      const city = command.text;
      if (!city) {
        await respond({ text: "Please provide a city! Usage: `/dsb-weather <city>`" });
        return;
      }
      const text = await getWeather(city);
      await respond({ text });
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
