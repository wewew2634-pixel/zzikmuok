"""
Self-Healing Growth Loop System
자동 치유 및 성장 루프 - 이전 누락 오류 분석 및 다음 작업 단계 자동 연결
"""

from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncio
import httpx
import structlog
from enum import Enum

logger = structlog.get_logger()

app = FastAPI(
    title="Self-Healing Growth Loop",
    description="Automated error detection, healing, and continuous improvement system",
    version="1.0.0"
)

# Enums
class ErrorSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class HealingStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

# Models
class ErrorEvent(BaseModel):
    """Error event from any service"""
    service: str = Field(..., description="Service name (8000/8001/8002)")
    error_type: str
    error_message: str
    severity: ErrorSeverity
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    context: Dict[str, Any] = {}

class HealingAction(BaseModel):
    """Healing action to be executed"""
    action_id: str
    error_type: str
    action_type: str = Field(..., description="restart, scale, alert, fallback")
    parameters: Dict[str, Any] = {}
    status: HealingStatus = HealingStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    result: Optional[str] = None

class GrowthMetrics(BaseModel):
    """Growth loop metrics"""
    cycle_count: int = 0
    errors_detected: int = 0
    errors_healed: int = 0
    healing_success_rate: float = 0.0
    avg_healing_time_seconds: float = 0.0
    improvements_implemented: int = 0
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Self-Healing Engine
class SelfHealingEngine:
    """Main engine for self-healing and growth loops"""
    
    def __init__(self):
        self.error_history: List[ErrorEvent] = []
        self.healing_actions: List[HealingAction] = []
        self.growth_metrics = GrowthMetrics()
        self.service_urls = {
            "8000": "http://localhost:8000",
            "8001": "http://localhost:8001",
            "8002": "http://localhost:8002"
        }
        self.healing_threshold = 3  # Trigger healing after 3 errors
        self.analysis_interval = 60  # Analyze every 60 seconds
    
    async def detect_errors(self) -> List[ErrorEvent]:
        """Detect errors across all services"""
        detected_errors = []
        
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # Check 8001 (Andoqest) for errors
                try:
                    response = await client.get(f"{self.service_urls['8001']}/error_analysis")
                    if response.status_code == 200:
                        data = response.json()
                        error_analysis = data.get("error_analysis", {})
                        
                        for error_type, count in error_analysis.get("error_counts", {}).items():
                            if count > 0:
                                error = ErrorEvent(
                                    service="8001",
                                    error_type=error_type,
                                    error_message=f"Detected {count} occurrences",
                                    severity=ErrorSeverity.MEDIUM if count < 5 else ErrorSeverity.HIGH,
                                    context={"count": count}
                                )
                                detected_errors.append(error)
                except Exception as e:
                    logger.error("Failed to check 8001 errors", error=str(e))
                
                # Check health of all services
                for service_id, url in self.service_urls.items():
                    try:
                        response = await client.get(f"{url}/health")
                        if response.status_code != 200:
                            error = ErrorEvent(
                                service=service_id,
                                error_type="health_check_failed",
                                error_message=f"Service unhealthy: {response.status_code}",
                                severity=ErrorSeverity.CRITICAL
                            )
                            detected_errors.append(error)
                    except Exception as e:
                        error = ErrorEvent(
                            service=service_id,
                            error_type="service_unreachable",
                            error_message=str(e),
                            severity=ErrorSeverity.CRITICAL
                        )
                        detected_errors.append(error)
        
        except Exception as e:
            logger.error("Error detection failed", error=str(e))
        
        return detected_errors
    
    async def analyze_patterns(self, errors: List[ErrorEvent]) -> Dict[str, Any]:
        """Analyze error patterns for root cause"""
        patterns = {
            "by_service": {},
            "by_type": {},
            "by_severity": {},
            "temporal_clusters": [],
            "root_causes": []
        }
        
        # Group by service
        for error in errors:
            if error.service not in patterns["by_service"]:
                patterns["by_service"][error.service] = []
            patterns["by_service"][error.service].append(error.dict())
        
        # Group by type
        for error in errors:
            if error.error_type not in patterns["by_type"]:
                patterns["by_type"][error.error_type] = 0
            patterns["by_type"][error.error_type] += 1
        
        # Group by severity
        for error in errors:
            severity = error.severity.value
            if severity not in patterns["by_severity"]:
                patterns["by_severity"][severity] = 0
            patterns["by_severity"][severity] += 1
        
        # Detect temporal clusters (errors within 5 minutes)
        sorted_errors = sorted(errors, key=lambda x: x.timestamp)
        current_cluster = []
        
        for error in sorted_errors:
            if not current_cluster:
                current_cluster.append(error)
            else:
                last_error = current_cluster[-1]
                time_diff = (error.timestamp - last_error.timestamp).total_seconds()
                
                if time_diff < 300:  # 5 minutes
                    current_cluster.append(error)
                else:
                    if len(current_cluster) >= 3:
                        patterns["temporal_clusters"].append({
                            "size": len(current_cluster),
                            "time_range": f"{current_cluster[0].timestamp} to {current_cluster[-1].timestamp}",
                            "services": list(set(e.service for e in current_cluster))
                        })
                    current_cluster = [error]
        
        # Identify root causes
        if patterns["by_type"]:
            most_common = max(patterns["by_type"].items(), key=lambda x: x[1])
            patterns["root_causes"].append({
                "type": "recurring_error",
                "error_type": most_common[0],
                "frequency": most_common[1],
                "recommendation": f"Investigate {most_common[0]} pattern"
            })
        
        if patterns["temporal_clusters"]:
            patterns["root_causes"].append({
                "type": "cascade_failure",
                "clusters": len(patterns["temporal_clusters"]),
                "recommendation": "Check service dependencies and communication"
            })
        
        return patterns
    
    async def create_healing_action(self, error: ErrorEvent, analysis: Dict[str, Any]) -> HealingAction:
        """Create appropriate healing action"""
        
        action_id = f"heal_{error.service}_{error.error_type}_{datetime.utcnow().timestamp()}"
        
        # Determine action type based on error
        if error.severity == ErrorSeverity.CRITICAL:
            action_type = "restart"
            parameters = {
                "service": error.service,
                "restart_delay": 5
            }
        elif error.error_type == "high_latency":
            action_type = "scale"
            parameters = {
                "service": error.service,
                "scale_factor": 1.5
            }
        elif error.error_type.endswith("_error"):
            action_type = "fallback"
            parameters = {
                "service": error.service,
                "fallback_mode": "safe"
            }
        else:
            action_type = "alert"
            parameters = {
                "service": error.service,
                "alert_level": error.severity.value
            }
        
        return HealingAction(
            action_id=action_id,
            error_type=error.error_type,
            action_type=action_type,
            parameters=parameters
        )
    
    async def execute_healing_action(self, action: HealingAction) -> bool:
        """Execute healing action"""
        
        logger.info("Executing healing action", action_id=action.action_id, action_type=action.action_type)
        
        action.status = HealingStatus.IN_PROGRESS
        
        try:
            if action.action_type == "restart":
                # Simulate restart (in production, would use orchestrator API)
                await asyncio.sleep(2)
                logger.info("Service restart initiated", service=action.parameters.get("service"))
                
            elif action.action_type == "scale":
                # Simulate scaling
                await asyncio.sleep(1)
                logger.info("Service scaling initiated", service=action.parameters.get("service"))
                
            elif action.action_type == "fallback":
                # Switch to fallback mode
                service = action.parameters.get("service")
                async with httpx.AsyncClient(timeout=5.0) as client:
                    # Try to trigger fallback via service API
                    try:
                        response = await client.post(
                            f"{self.service_urls.get(service)}/fallback",
                            json={"mode": "safe"}
                        )
                        logger.info("Fallback mode activated", service=service)
                    except:
                        logger.warning("Fallback API not available, logged only")
                
            elif action.action_type == "alert":
                # Send alert (in production, would integrate with PagerDuty/Slack)
                logger.warning(
                    "ALERT triggered",
                    service=action.parameters.get("service"),
                    level=action.parameters.get("alert_level")
                )
            
            action.status = HealingStatus.COMPLETED
            action.completed_at = datetime.utcnow()
            action.result = "success"
            
            return True
            
        except Exception as e:
            logger.error("Healing action failed", action_id=action.action_id, error=str(e))
            action.status = HealingStatus.FAILED
            action.completed_at = datetime.utcnow()
            action.result = f"failed: {str(e)}"
            
            return False
    
    async def learn_and_improve(self, healing_actions: List[HealingAction]):
        """Learn from healing actions and improve"""
        
        successful_actions = [a for a in healing_actions if a.status == HealingStatus.COMPLETED]
        failed_actions = [a for a in healing_actions if a.status == HealingStatus.FAILED]
        
        # Update growth metrics
        self.growth_metrics.cycle_count += 1
        self.growth_metrics.errors_healed += len(successful_actions)
        self.growth_metrics.healing_success_rate = (
            len(successful_actions) / len(healing_actions) if healing_actions else 0.0
        )
        
        # Calculate average healing time
        healing_times = [
            (a.completed_at - a.created_at).total_seconds()
            for a in successful_actions
            if a.completed_at
        ]
        if healing_times:
            self.growth_metrics.avg_healing_time_seconds = sum(healing_times) / len(healing_times)
        
        # Learn patterns
        if failed_actions:
            logger.warning(
                "Learning from failures",
                failed_count=len(failed_actions),
                action_types=[a.action_type for a in failed_actions]
            )
            # In production: adjust healing strategies
        
        # Identify improvements
        if self.growth_metrics.healing_success_rate > 0.9:
            self.growth_metrics.improvements_implemented += 1
            logger.info("System improvement milestone reached", success_rate=self.growth_metrics.healing_success_rate)
    
    async def run_growth_loop(self):
        """Main growth loop - continuous self-improvement"""
        
        while True:
            try:
                logger.info("Growth loop cycle starting", cycle=self.growth_metrics.cycle_count + 1)
                
                # Step 1: Detect errors
                errors = await self.detect_errors()
                self.error_history.extend(errors)
                self.growth_metrics.errors_detected += len(errors)
                
                if errors:
                    logger.warning("Errors detected", count=len(errors))
                    
                    # Step 2: Analyze patterns
                    analysis = await self.analyze_patterns(errors)
                    logger.info("Error patterns analyzed", root_causes=len(analysis.get("root_causes", [])))
                    
                    # Step 3: Create healing actions
                    new_actions = []
                    for error in errors:
                        action = await self.create_healing_action(error, analysis)
                        new_actions.append(action)
                        self.healing_actions.append(action)
                    
                    # Step 4: Execute healing
                    for action in new_actions:
                        success = await self.execute_healing_action(action)
                        if success:
                            logger.info("Healing action succeeded", action_id=action.action_id)
                        else:
                            logger.error("Healing action failed", action_id=action.action_id)
                    
                    # Step 5: Learn and improve
                    await self.learn_and_improve(new_actions)
                
                else:
                    logger.info("No errors detected - system healthy")
                
                # Sleep before next cycle
                await asyncio.sleep(self.analysis_interval)
                
            except Exception as e:
                logger.error("Growth loop error", error=str(e))
                await asyncio.sleep(self.analysis_interval)

# Global engine instance
engine = SelfHealingEngine()

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "growth_loop_running": True
    }

@app.get("/metrics")
async def get_metrics():
    """Get growth loop metrics"""
    return engine.growth_metrics.dict()

@app.get("/error_history")
async def get_error_history(hours: int = 24):
    """Get error history"""
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    recent_errors = [
        e.dict() for e in engine.error_history
        if e.timestamp >= cutoff
    ]
    return {
        "total_errors": len(recent_errors),
        "time_range_hours": hours,
        "errors": recent_errors
    }

@app.get("/healing_actions")
async def get_healing_actions(limit: int = 100):
    """Get recent healing actions"""
    return {
        "total_actions": len(engine.healing_actions),
        "recent_actions": [a.dict() for a in engine.healing_actions[-limit:]]
    }

@app.get("/analysis")
async def get_current_analysis():
    """Get current error pattern analysis"""
    recent_errors = [
        e for e in engine.error_history
        if e.timestamp >= datetime.utcnow() - timedelta(hours=1)
    ]
    analysis = await engine.analyze_patterns(recent_errors)
    return analysis

@app.post("/trigger_healing")
async def trigger_manual_healing(error: ErrorEvent):
    """Manually trigger healing for an error"""
    analysis = await engine.analyze_patterns([error])
    action = await engine.create_healing_action(error, analysis)
    engine.healing_actions.append(action)
    
    success = await engine.execute_healing_action(action)
    
    return {
        "action": action.dict(),
        "success": success
    }

@app.on_event("startup")
async def startup_event():
    """Start growth loop on startup"""
    logger.info("Self-Healing Growth Loop starting...")
    asyncio.create_task(engine.run_growth_loop())

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Self-Healing Growth Loop shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "self_healing_loop:app",
        host="0.0.0.0",
        port=8003,
        reload=True,
        log_level="info"
    )
