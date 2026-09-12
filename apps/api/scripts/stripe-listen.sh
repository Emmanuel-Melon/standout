#!/bin/bash

# Dynamically resolve the URL from your environment using your existing logic
# Fallback to the versioned URL if the env var isn't set
TARGET_URL=$(npx dotenv-cli -e .env -- node -e "console.log(process.env.STRIPE_WEBHOOK_URL || 'http://localhost:3000/api/webhooks/v1/stripe')")

echo "🛡️  Stripe Webhook Ingress: ACTIVE"
echo "📍 Forwarding events to: $TARGET_URL"
echo "----------------------------------------------------"

while true; do
  stripe listen --forward-to "$TARGET_URL"
  echo "⚠️  Connection lost. Retrying in 2s..."
  sleep 2
done