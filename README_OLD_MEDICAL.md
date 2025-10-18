# Andoqest AI Agent System - Premium Cross-Verification Platform

## 🎯 Overview

The Andoqest AI Agent System is a premium cross-verification platform designed for medical AI proposals, featuring 5 specialized AI agents that validate regulatory compliance, reimbursement pathways, operational efficiency, clinical safety, and technical integration.

## 🏗️ Architecture

### Core Components

1. **AI Agent Service** (Port 8000)
   - 5 specialized agents: FDA, CMS, Hospital Ops, Clinical Safety, Tech Integration
   - Cross-verification system with confidence scoring
   - RESTful API with comprehensive validation

2. **MVP Beta Service** (Port 8001)
   - Real-time surgical video analysis
   - WebSocket support for live processing
   - TensorRT-optimized inference (mock implementation)

3. **Monitoring Service** (Port 8002)
   - A/B testing framework
   - Real-time metrics and alerting
   - Dashboard with system health monitoring

### Technology Stack

- **Backend**: FastAPI, Python 3.9+
- **AI/ML**: TensorRT, YOLO-X (mock implementation)
- **Database**: Redis for caching and session management
- **Monitoring**: Prometheus, Grafana
- **Containerization**: Docker, Docker Compose

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Redis (optional, for full functionality)
- Docker (optional, for containerized deployment)

### Installation

1. **Clone and Setup**
   ```bash
   cd /home/user/webapp
   pip install -r requirements.txt
   ```

2. **Start Services**
   ```bash
   ./start.sh
   ```

3. **Test System**
   ```bash
   ./test.sh
   ```

### Docker Deployment

```bash
docker-compose up -d
```

## 📊 Service Endpoints

### AI Agent Service (Port 8000)

- `GET /health` - Health check
- `POST /verify` - Cross-verify proposal
- `GET /agents` - List available agents
- `GET /metrics` - Prometheus metrics

### MVP Beta Service (Port 8001)

- `GET /health` - Health check
- `POST /analyze` - Analyze video frame
- `WS /ws/analyze/{video_id}` - WebSocket for real-time analysis
- `GET /models` - Available AI models
- `GET /stats` - Processing statistics

### Monitoring Service (Port 8002)

- `GET /health` - Health check
- `POST /ab_tests` - Create A/B test
- `GET /dashboard` - Dashboard data
- `GET /metrics` - Prometheus metrics

## 🧪 Testing

Run the comprehensive test suite:

```bash
./test.sh
```

This will test:
- All service health endpoints
- Cross-verification with sample proposal
- Video analysis capabilities
- A/B testing framework

## 📈 Monitoring

Access monitoring dashboards:

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Custom Dashboard**: http://localhost:8002/dashboard

## 🔧 Configuration

Edit `.env` file to configure:

- Server ports and hosts
- Redis connection settings
- AI model parameters
- Security settings
- Monitoring thresholds

## 🏥 Healthcare Compliance

The system includes:

- HIPAA compliance features
- Audit logging
- Data encryption
- 7-year data retention
- Zero-trust security model

## 📋 API Examples

### Cross-Verification Request

```python
import requests

proposal_data = {
    "id": "proposal_001",
    "name": "AI Surgical System",
    "device_type": "AI Surgical Video Analysis",
    "technology_novelty": 9.0,
    "clinical_improvement": 8.5,
    "fda_breakthrough_designation": True,
    # ... additional fields
}

response = requests.post(
    "http://localhost:8000/verify",
    json={"proposal": proposal_data, "priority": "high"}
)

result = response.json()
print(f"Overall Status: {result['overall_status']}")
print(f"Confidence: {result['confidence']}")
```

### Video Analysis Request

```python
import requests
import base64

# Read and encode image
with open("surgical_frame.jpg", "rb") as f:
    image_data = base64.b64encode(f.read()).decode()

frame_data = {
    "frame_id": "frame_001",
    "image_data": image_data,
    "timestamp": "2025-10-17T10:00:00Z"
}

analysis_request = {
    "video_id": "surgery_001",
    "analysis_type": "surgical_detection",
    "confidence_threshold": 0.7
}

response = requests.post(
    "http://localhost:8001/analyze",
    json=frame_data
)

result = response.json()
print(f"Detections: {len(result['detections'])}")
print(f"Processing Time: {result['processing_time_ms']}ms")
```

## 🔒 Security

- JWT-based authentication (configurable)
- Role-based access control
- Encrypted data transmission
- Audit logging for compliance
- Regular security updates

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 8000-8002 are available
2. **Redis connection**: Check Redis is running on port 6379
3. **Permission errors**: Run `chmod +x *.sh` for scripts
4. **Python dependencies**: Use virtual environment for isolation

### Logs

Check logs in `logs/` directory:
- `agent.log` - AI Agent service logs
- `mvp.log` - MVP Beta service logs  
- `monitoring.log` - Monitoring service logs

## 📞 Support

For issues and questions:
1. Check troubleshooting section
2. Review service logs
3. Run health checks
4. Contact development team

## 📄 License

This project is proprietary software for Andoqest medical AI systems.