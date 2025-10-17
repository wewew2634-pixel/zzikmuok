#!/bin/bash

# Andoqest AI Agent System Startup Script

echo "🚀 Starting Andoqest AI Agent System..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p data
mkdir -p models

# Start Redis (if available)
if command -v redis-server &> /dev/null; then
    echo "🔧 Starting Redis server..."
    redis-server --daemonize yes --port 6379
else
    echo "⚠️  Redis not found. Some features may be limited."
fi

# Start services
echo "🎯 Starting AI Agent Service on port 8000..."
python3 main.py &
AGENT_PID=$!

echo "🎥 Starting MVP Beta Service on port 8001..."
python3 mvp_service.py &
MVP_PID=$!

echo "📊 Starting Monitoring Service on port 8002..."
python3 monitoring.py &
MONITORING_PID=$!

# Wait a moment for services to start
sleep 3

# Check if services started successfully
if ps -p $AGENT_PID > /dev/null; then
    echo "✅ AI Agent Service started successfully (PID: $AGENT_PID)"
else
    echo "❌ AI Agent Service failed to start"
fi

if ps -p $MVP_PID > /dev/null; then
    echo "✅ MVP Beta Service started successfully (PID: $MVP_PID)"
else
    echo "❌ MVP Beta Service failed to start"
fi

if ps -p $MONITORING_PID > /dev/null; then
    echo "✅ Monitoring Service started successfully (PID: $MONITORING_PID)"
else
    echo "❌ Monitoring Service failed to start"
fi

# Save PIDs for shutdown
echo $AGENT_PID > logs/agent.pid
echo $MVP_PID > logs/mvp.pid
echo $MONITORING_PID > logs/monitoring.pid

echo ""
echo "🎉 Andoqest AI Agent System is running!"
echo "   • AI Agent Service: http://localhost:8000"
echo "   • MVP Beta Service: http://localhost:8001"
echo "   • Monitoring Service: http://localhost:8002"
echo ""
echo "📊 Metrics endpoints:"
echo "   • Agent metrics: http://localhost:8000/metrics"
echo "   • MVP metrics: http://localhost:8001/metrics"
echo "   • Monitoring metrics: http://localhost:8002/metrics"
echo ""
echo "🛑 To stop all services, run: ./stop.sh"
echo "📖 For documentation, see README.md"