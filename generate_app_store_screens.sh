#!/bin/bash
# Exit on error
set -e

echo "🚀 Starting HelloBrick App Store Screenshot Capture Sequence..."

# 1. Clean up old background Vite server instances if running on port 5173
echo "🧹 Purging port 5173..."
npx kill-port 5173 || true

# 2. Spin up Vite dev server in the background
echo "⚡ Starting dev server in background..."
npm run dev -- --port 5173 &
VITE_PID=$!

# 3. Wait for Vite server to boot up
echo "⏳ Waiting for local server to be ready on port 5173..."
for i in {1..10}; do
  if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Local dev server is UP and ready!"
    break
  fi
  sleep 1.5
done

# 4. Run the Playwright base screenshots script
echo "📸 Capturing 5 base screen views from running app main..."
node /tmp/pw_screenshots/take_base_shots.js

# 5. Run the Playwright composer script to output 5 App Store Marketing templates
echo "🎨 Rendering 5 high-fidelity App Store Marketing templates (1284x2778)..."
node /Users/akeemojuko/.gemini/antigravity/scratch/appstore-screenshots/capture.js

# 6. Tear down background dev server
echo "🛑 Shutting down local dev server..."
kill $VITE_PID || true

echo "🎉 Capture pipeline finished successfully!"
echo "✨ Your 5 high-fidelity, congruent App Store screenshots are ready at:"
echo "📂 /Users/akeemojuko/.gemini/antigravity/brain/c9a346fa-fd30-491b-b36f-544379ba2170/marketing_1.png to marketing_5.png"
