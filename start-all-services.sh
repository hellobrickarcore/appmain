#!/bin/bash
# Start all backend services for HelloBrick

cd "$(dirname "$0")/server"

echo "🚀 Starting all HelloBrick services..."
echo ""

# Function to start a service in background
start_service() {
    local service_name=$1
    local service_file=$2
    local port=$3
    
    echo "📡 Starting $service_name on port $port..."
    python3 "$service_file" > "../logs/${service_name}.log" 2>&1 &
    echo $! > "../logs/${service_name}.pid"
    sleep 2
    echo "✅ $service_name started (PID: $(cat ../logs/${service_name}.pid))"
    echo ""
}

# Create logs directory
mkdir -p ../logs

# Kill any existing services
echo "🧹 Cleaning up existing services..."
pkill -f "auth-service.py" 2>/dev/null
pkill -f "xp-service.py" 2>/dev/null
pkill -f "feed-service.py" 2>/dev/null
pkill -f "dataset-server.py" 2>/dev/null
pkill -f "yolo-detection-server.py" 2>/dev/null
sleep 1

# Start services
start_service "auth-service" "auth-service.py" "3007"
start_service "xp-service" "xp-service.py" "3005"
start_service "feed-service" "feed-service.py" "3006"
start_service "dataset-server" "dataset-server.py" "3004"
start_service "detection-server" "yolo-detection-server.py" "3003"

echo "✅ All services started!"
echo ""
echo "📊 Service Status:"
echo "   Auth Service:     http://localhost:3007"
echo "   XP Service:        http://localhost:3005"
echo "   Feed Service:      http://localhost:3006"
echo "   Dataset Server:    http://localhost:3004"
echo "   Detection Server:  http://localhost:3003"
echo ""
echo "📝 Logs are in: logs/"
echo "🛑 To stop all services: ./stop-all-services.sh"
echo ""
