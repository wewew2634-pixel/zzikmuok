from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio
import uvicorn
from prometheus_client import Counter, Histogram, generate_latest
from prometheus_client.core import CollectorRegistry
import structlog

from agents import CrossVerificationSystem, VerificationResult

# Configure logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Prometheus metrics
registry = CollectorRegistry()
verification_counter = Counter(
    'proposal_verifications_total', 
    'Total number of proposal verifications',
    ['status', 'agent'],
    registry=registry
)
verification_duration = Histogram(
    'verification_duration_seconds',
    'Time spent on verification',
    ['agent'],
    registry=registry
)

# FastAPI app
app = FastAPI(
    title="Andoqest AI Agent Cross-Verification Service",
    description="Premium cross-verification system for medical AI proposals",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global verification system
verification_system = CrossVerificationSystem()

# Pydantic models
class ProposalData(BaseModel):
    """Proposal data model"""
    id: str = Field(..., description="Unique proposal identifier")
    name: str = Field(..., description="Proposal name")
    device_type: str = Field(..., description="Type of medical device")
    device_category: str = Field(default="AI_Surgical_Analysis", description="Device category")
    technology_type: str = Field(..., description="Technology type")
    technology_novelty: float = Field(..., ge=1.0, le=10.0, description="Technology novelty score (1-10)")
    clinical_improvement: float = Field(..., ge=1.0, le=10.0, description="Clinical improvement score (1-10)")
    fda_breakthrough_designation: bool = Field(default=False, description="FDA breakthrough designation status")
    ai_features: List[str] = Field(default_factory=list, description="AI/ML features")
    ai_capabilities: List[str] = Field(default_factory=list, description="AI capabilities")
    automation_features: List[str] = Field(default_factory=list, description="Automation features")
    safety_features: List[str] = Field(default_factory=list, description="Safety features")
    security_features: List[str] = Field(default_factory=list, description="Security features")
    architecture_features: List[str] = Field(default_factory=list, description="Architecture features")
    integration_standards: List[str] = Field(default_factory=list, description="Integration standards")
    supported_ehr_systems: List[str] = Field(default_factory=list, description="Supported EHR systems")
    compliance_standards: List[str] = Field(default_factory=list, description="Compliance standards")
    clinical_trials: List[str] = Field(default_factory=list, description="Clinical trials")
    validated_populations: List[str] = Field(default_factory=list, description="Validated patient populations")
    real_world_evidence: List[str] = Field(default_factory=list, description="Real-world evidence")
    quality_metrics: List[str] = Field(default_factory=list, description="Quality metrics")
    post_market_surveillance: List[str] = Field(default_factory=list, description="Post-market surveillance features")
    clinical_outcomes: List[str] = Field(default_factory=list, description="Clinical outcomes")
    quality_of_life_improvement: float = Field(default=0.0, description="Quality of life improvement")
    survival_benefit: float = Field(default=0.0, description="Survival benefit")
    performance_metrics: Dict[str, float] = Field(default_factory=dict, description="Performance metrics")
    target_hospitals: int = Field(default=100, description="Number of target hospitals")
    implementation_cost: int = Field(default=500000, description="Implementation cost")
    system_integrations: List[str] = Field(default_factory=list, description="System integrations")
    staff_training_hours: int = Field(default=40, description="Staff training hours required")
    deployment_model: str = Field(default="hybrid_cloud_edge", description="Deployment model")
    processing_location: str = Field(default="real_time_edge", description="Processing location")
    deployment_strategy: str = Field(default="zero_downtime", description="Deployment strategy")
    bandwidth_requirements_mbps: int = Field(default=100, description="Bandwidth requirements in Mbps")

class VerificationRequest(BaseModel):
    """Verification request model"""
    proposal: ProposalData
    priority: str = Field(default="normal", pattern="^(low|normal|high|critical)$")
    callback_url: Optional[str] = Field(None, description="Callback URL for async results")

class VerificationResponse(BaseModel):
    """Verification response model"""
    verification_id: str
    status: str
    overall_status: str
    confidence: float
    results: Dict[str, Any]
    recommendations: List[str]
    timestamp: datetime

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: datetime
    version: str
    agents_status: Dict[str, str]

# API Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        version="1.0.0",
        agents_status={name: "active" for name in verification_system.agents.keys()}
    )

@app.post("/verify", response_model=VerificationResponse)
async def verify_proposal(request: VerificationRequest, background_tasks: BackgroundTasks):
    """Verify a proposal using all agents"""
    
    verification_id = f"verify_{request.proposal.id}_{int(datetime.now().timestamp())}"
    
    # Convert proposal to dict
    proposal_dict = request.proposal.dict()
    
    # Run verification
    try:
        with verification_duration.labels(agent="all").time():
            results = await verification_system.cross_verify_proposal(proposal_dict)
        
        # Update metrics
        for agent_name, result in results["results"].items():
            verification_counter.labels(
                status=result.status, 
                agent=agent_name
            ).inc()
        
        # Schedule callback if provided
        if request.callback_url:
            background_tasks.add_task(
                send_callback, 
                request.callback_url, 
                verification_id, 
                results
            )
        
        return VerificationResponse(
            verification_id=verification_id,
            status="completed",
            overall_status=results["analysis"]["overall_status"],
            confidence=results["analysis"]["average_confidence"],
            results=results,
            recommendations=results["recommendations"],
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error("Verification failed", verification_id=verification_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@app.post("/verify/{agent_name}")
async def verify_with_agent(agent_name: str, request: VerificationRequest):
    """Verify proposal with specific agent"""
    
    if agent_name not in verification_system.agents:
        raise HTTPException(status_code=404, detail=f"Agent {agent_name} not found")
    
    agent = verification_system.agents[agent_name]
    proposal_dict = request.proposal.dict()
    
    try:
        with verification_duration.labels(agent=agent_name).time():
            result = await agent.verify(proposal_dict)
        
        verification_counter.labels(
            status=result.status,
            agent=agent_name
        ).inc()
        
        return result
        
    except Exception as e:
        logger.error(f"Agent verification failed", agent=agent_name, error=str(e))
        raise HTTPException(status_code=500, detail=f"Agent verification failed: {str(e)}")

@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    return generate_latest(registry)

@app.get("/history")
async def get_verification_history(limit: int = 10):
    """Get recent verification history"""
    return verification_system.get_verification_summary(limit)

@app.get("/agents")
async def get_agents():
    """Get list of available agents"""
    agents_info = []
    for name, agent in verification_system.agents.items():
        agents_info.append({
            "name": name,
            "description": agent.description,
            "expertise": agent.expertise if hasattr(agent, 'expertise') else []
        })
    return {"agents": agents_info}

async def send_callback(callback_url: str, verification_id: str, results: Dict[str, Any]):
    """Send callback notification"""
    # Implementation for callback notification
    logger.info("Sending callback", url=callback_url, verification_id=verification_id)
    # This would typically be an HTTP POST to the callback URL

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Andoqest AI Agent Service starting up...")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Andoqest AI Agent Service shutting down...")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )