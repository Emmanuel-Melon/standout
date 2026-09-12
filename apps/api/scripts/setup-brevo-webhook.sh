#!/bin/bash
# Load environment variables (adjust path to your .env)
source .env

# Use the webhook URL from config (or override via env)
WEBHOOK_URL=${BREVO_WEBHOOK_URL:-"http://localhost:3000/api/webhooks/v1/brevo"}

echo "🔌 Setting up Brevo transactional webhook..."
echo "📍 Target URL: $WEBHOOK_URL"
echo "----------------------------------------------------"

curl -X POST "https://api.brevo.com/v3/webhooks" \
  -H "accept: application/json" \
  -H "api-key: $BREVO_API_KEY" \
  -H "content-type: application/json" \
  -d "{
    \"url\": \"$WEBHOOK_URL\",
    \"description\": \"Transactional email events\",
    \"events\": [\"delivered\", \"opened\", \"clicked\", \"bounced\", \"complaint\", \"unsubscribed\"],
    \"type\": \"transactional\"
  }"

echo -e "\n✅ Webhook registration complete."