#!/bin/bash
# HelloBrick Multi-Service Launcher (Standalone/Fast-Start)
# This script runs all backend microservices as background processes.

printf "🚀 \033[1;34mStarting HelloBrick Microservices...\033[0m\n"

# Cleanup existing processes to avoid port conflicts
printf "🧹 Cleaning up existing services...\n"
pkill -f "python3 .*service.py" 2>/dev/null
pkill -f "python3 yolo_detection_server.py" 2>/dev/null
sleep 1

# Check for required directories
mkdir -p models logs

# Start Services
printf "📡 [3003] \033[1;33mDetection Engine\033[0m starting...\n"
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsY3FpaXhscG1wZ3VpeHpiYnhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ0ODk3MCwiZXhwIjoyMDg4MDI0OTcwfQ.OK9uiI8sl-sRk7BlpsLkFxs-gxFzDj3RpJsivpgCvTg
export VITE_SUPABASE_URL=https://tlcqiixlpmpguixzbbxj.supabase.co
nohup python3 yolo_detection_server.py > logs/detection.log 2>&1 &

printf "🎮 [3005] \033[1;33mXP/Progression\033[0m starting...\n"
nohup python3 xp-service.py > logs/xp.log 2>&1 &

printf "📸 [3006] \033[1;33mFeed/Moderation\033[0m starting...\n"
nohup python3 feed-service.py > logs/feed.log 2>&1 &

printf "🔑 [3007] \033[1;33mAuth/Gateway\033[0m starting...\n"
nohup python3 auth-service.py > logs/auth.log 2>&1 &

printf "📊 [3008] \033[1;33mAdmin/Dashboard\033[0m starting...\n"
nohup python3 admin-service.py > logs/admin.log 2>&1 &

printf "\n✅ \033[1;32mBackend Stack Active.\033[0m\n"
printf "💡 Watch Admin logs: \033[1mdf -h tail -f logs/admin.log\033[0m\n"
