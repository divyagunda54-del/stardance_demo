#!/bin/bash

echo "🚀 Starting Automated Nest Server Deployment..."
echo "----------------------------------------------"

USER="slackfm"
HOST="hackclub.app"
DEST="/home/slackfm/stardance_demo"

echo "📂 [Step 1/3] Creating directories on Nest server..."
ssh -o ConnectTimeout=30 ${USER}@${HOST} "mkdir -p ${DEST} && mkdir -p ~/.config/systemd/user" || true
echo "✅ Done"

echo ""
echo "📤 [Step 2/3] Uploading files..."
scp -o ConnectTimeout=30 .env index.js package.json package-lock.json slackbot.service ${USER}@${HOST}:${DEST}/
scp -o ConnectTimeout=30 -r public ${USER}@${HOST}:${DEST}/
if [ $? -ne 0 ]; then
  echo "❌ Upload failed. Retrying..."
  sleep 2
  scp -o ConnectTimeout=30 .env index.js package.json package-lock.json slackbot.service ${USER}@${HOST}:${DEST}/
  scp -o ConnectTimeout=30 -r public ${USER}@${HOST}:${DEST}/
fi
echo "✅ Files uploaded!"

echo ""
echo "⚙️ [Step 3/3] Installing dependencies and starting service..."
ssh -o ConnectTimeout=30 ${USER}@${HOST} "cd ${DEST} && npm ci && cp slackbot.service ~/.config/systemd/user/slackbot.service && systemctl --user daemon-reload && systemctl --user enable slackbot.service && systemctl --user restart slackbot.service && loginctl enable-linger && echo '🎉 Service started!' && systemctl --user status slackbot.service --no-pager" || true

echo "----------------------------------------------"
echo "🎉 DEPLOYMENT COMPLETE! Your Slackbot is hosted 24/7 on Nest!"
echo "💡 TIP: To check logs later:"
echo "   ssh ${USER}@${HOST}"
echo "   journalctl --user -u slackbot.service -f"
