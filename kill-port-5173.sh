#!/bin/bash
# Kill process using port 5173

echo "🔍 Finding process on port 5173..."

PID=$(lsof -ti:5173 2>/dev/null)

if [ -z "$PID" ]; then
    echo "✅ Port 5173 is free"
    exit 0
fi

echo "Found process: $PID"
ps -p $PID -o pid,command

echo ""
read -p "Kill this process? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    kill -9 $PID 2>/dev/null
    echo "✅ Killed process $PID"
    echo "✅ Port 5173 is now free"
else
    echo "❌ Cancelled"
fi




