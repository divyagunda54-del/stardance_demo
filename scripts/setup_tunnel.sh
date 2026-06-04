#!/bin/bash
set -e

# Check if domain argument is provided
if [ -z "$1" ]; then
  echo "❌ Error: Please provide the target subdomain as an argument."
  echo "Usage: ./setup_tunnel.sh <subdomain.yourdomain.com>"
  exit 1
fi

SUBDOMAIN=$1

echo "📥 Installing cloudflared..."
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
dpkg -i cloudflared.deb
rm cloudflared.deb
echo "✅ cloudflared installed!"

echo ""
echo "🔑 Starting Cloudflare Tunnel authentication..."
echo "👉 Follow the URL that will print below to authorize the tunnel in your browser:"
echo "------------------------------------------------------------"
cloudflared tunnel login
echo "------------------------------------------------------------"
echo "✅ Authentication complete!"

echo ""
echo "🌪️ Creating tunnel 'slackbot-tunnel'..."
# Delete old tunnel config if exists to prevent conflicts
cloudflared tunnel delete -f slackbot-tunnel 2>/dev/null || true
cloudflared tunnel create slackbot-tunnel
echo "✅ Tunnel created!"

# Extract Tunnel ID
TUNNEL_ID=$(cloudflared tunnel list | grep slackbot-tunnel | awk '{print $1}')

if [ -z "$TUNNEL_ID" ]; then
  echo "❌ Error: Could not retrieve Tunnel ID. Please check 'cloudflared tunnel list' manually."
  exit 1
fi

echo ""
echo "📝 Routing DNS subdomain ${SUBDOMAIN} to the tunnel..."
cloudflared tunnel route dns slackbot-tunnel "${SUBDOMAIN}"
echo "✅ DNS routed!"

echo ""
echo "⚙️ Creating configuration file at /root/.cloudflared/config.yml..."
mkdir -p /root/.cloudflared
cat <<EOF > /root/.cloudflared/config.yml
tunnel: ${TUNNEL_ID}
credentials-file: /root/.cloudflared/${TUNNEL_ID}.json

ingress:
  - hostname: ${SUBDOMAIN}
    service: http://localhost:80
  - service: http_status:404
EOF
echo "✅ Configuration file created!"

echo ""
echo "🖥️ Registering cloudflared as a systemd service..."
# Remove any old service first
cloudflared service uninstall 2>/dev/null || true
cloudflared service install
echo "✅ Systemd service registered!"

echo ""
echo "🚀 Starting cloudflared system service..."
systemctl daemon-reload
systemctl enable cloudflared
systemctl restart cloudflared
echo "✅ cloudflared service started!"

echo ""
echo "🎉 SUCCESS! Your backend is now securely tunneled to https://${SUBDOMAIN}"
echo "💡 To check tunnel logs: journalctl -u cloudflared -f"
