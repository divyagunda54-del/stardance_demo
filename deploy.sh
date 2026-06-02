#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting Automated Nest Server Deployment..."
echo "----------------------------------------------"

# Connection details
USER="slackfm"
HOST="hackclub.app"
DEST="/home/slackfm/stardance_demo"

echo "📂 [Step 1/3] Creating directory on Nest server..."
echo "👉 You will be prompted to enter your Nest password now:"
ssh ${USER}@${HOST} "mkdir -p ${DEST}"

echo "📤 [Step 2/3] Uploading code and your active .env tokens..."
echo "👉 You will be prompted for your Nest password a second time:"
scp .env index.js package.json package-lock.json slackbot.service ${USER}@${HOST}:${DEST}/

echo "⚙️ [Step 3/3] Installing Bolt dependencies and starting 24/7 service on Nest..."
echo "👉 You will be prompted for your Nest password one last time:"
ssh ${USER}@${HOST} "cd ${DEST} && npm install && sudo cp slackbot.service /etc/systemd/system/slackbot.service && sudo systemctl daemon-reload && sudo systemctl enable --now slackbot.service && echo '🎉 Success! slackbot.service is active!' && systemctl status slackbot.service --no-pager"

echo "----------------------------------------------"
echo "🎉 DEPLOYMENT COMPLETE! Your Slackbot is officially hosted 24/7 on Nest!"
