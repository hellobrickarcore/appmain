#!/bin/bash
# Start the authentication service

cd "$(dirname "$0")"

echo "🚀 Starting Auth Service..."
python3 auth-service.py
