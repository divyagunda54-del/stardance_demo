# 🚀 StarDance Slack Bot

Welcome to **StarDance Slack Bot**, a feature-rich, high-performance, and interactive Slack bot built for the Hack Club StarDance mission using Node.js, the `@slack/bolt` SDK, and public REST APIs. 

This bot runs seamlessly via Socket Mode to respond instantly to interactive slash commands in Slack.

---

## 🛠️ Slash Commands

Interact with the bot in Slack using these commands:

### 🌟 General Commands
* `/dsb-help` - 📖 Open the main interactive help menu.
* `/dsb-ping` - ⚡ Test bot response latency in milliseconds.
* `/dsb-hello` - 👋 Get a personalized welcome message.
* `/dsb-qotd` - 💭 Get an inspirational Quote of the Day.
* `/dsb-trivia` - 🧠 Fetch a random trivia question with hidden answers.
* `/dsb-dadjoke` - 😂 Receive a clean, random dad joke.
* `/dsb-joker` - 🃏 Fetch a random joke.
* `/dsb-urban <term>` - 📖 Look up slang and definitions from Urban Dictionary.

### 🌤️ Utility Commands
* `/dsb-weather <city>` - 🌡️ Fetch instant weather reports using wttr.in.
* `/dsb-catfact` - 🐱 Fetch a random fun fact about cats.

---

## ⚡ Technical Stack

* **Runtime:** Node.js
* **Framework:** `@slack/bolt`
* **HTTP Client:** `axios`
* **Configuration:** `dotenv`

---

## 🚀 Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/divyagunda54-del/stardance_demo.git
   cd stardance_demo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Slack credentials:
   ```env
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   SLACK_APP_TOKEN=xapp-your-app-token
   ```

4. **Run the bot locally:**
   ```bash
   npm start
   ```
