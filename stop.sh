#!/bin/bash

# Andoqest AI Agent System Shutdown Script

echo "🛑 Stopping Andoqest AI Agent System..."

# Function to stop service
stop_service() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "Stopping $service_name (PID: $pid)..."
            kill $pid
            rm -f "$pid_file"
            echo "✅ $service_name stopped"
        else
            echo "⚠️  $service_name not running"
            rm -f "$pid_file"
        fi
    else
        echo "⚠️  $service_name PID file not found"
    fi
}

# Stop services
stop_service "logs/agent.pid" "AI Agent Service"
stop_service "logs/mvp.pid" "MVP Beta Service"
stop_service "logs/monitoring.pid" "Monitoring Service"

# Stop Redis (if we started it)
if command -v redis-cli &> /dev/null; then
    echo "Stopping Redis server..."
    redis-cli shutdown 2>&1 || echo "Redis not running or already stopped"
fi

echo ""
echo "✅ Andoqest AI Agent System stopped successfully!"
echo ""
echo "📊 Service logs are available in the logs/ directory"
echo "🚀 To start again, run: ./start.sh"