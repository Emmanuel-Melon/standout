#!/bin/bash

# Load environment variables
# e.g., STRIPE_WEBHOOK_URL=http://localhost:3000/api/v1/webhooks/stripe
WEBHOOK_PATH="/api/v1/webhooks/stripe"
PORT=${PORT:-3000}
TARGET_URL="http://localhost:$PORT$WEBHOOK_PATH"

echo "📡 Preparing Stripe Processor Ingress..."
echo "🔗 Forwarding to: $TARGET_URL"

# Auto-restart loop for those pesky i/o timeouts
while true; do
  stripe listen --forward-to "$TARGET_URL"
  echo "⚠️ Stripe CLI disconnected. Reconnecting in 3 seconds..."
  sleep 3
done