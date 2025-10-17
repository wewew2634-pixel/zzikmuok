from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncio
import uvicorn
import json
import pandas as pd
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from prometheus_client.core import CollectorRegistry
import structlog

logger = structlog.get_logger()

# In-memory storage for MVP (replace with Redis in production)
class InMemoryStorage:
    def __init__(self):
        self.data = {}
        
    def hset(self, key, mapping=None, **kwargs):
        if mapping:
            self.data[key] = mapping
        else:
            self.data[key] = kwargs
            
    def hgetall(self, key):
        return self.data.get(key, {})
        
    def setex(self, key, expiration, value):
        self.data[key] = value
        
    def get(self, key):
        return self.data.get(key)
        
    def keys(self, pattern):
        import fnmatch
        return [k for k in self.data.keys() if fnmatch.fnmatch(k, pattern)]
        
    def sadd(self, key, value):
        if key not in self.data:
            self.data[key] = set()
        self.data[key].add(value)
        
    def scard(self, key):
        return len(self.data.get(key, set()))
        
    def ping(self):
        return True

# Use in-memory storage for MVP
redis_client = InMemoryStorage()

# Prometheus metrics
registry = CollectorRegistry()
ab_test_counter = Counter(
    'ab_tests_total',
    'Total number of A/B tests run',
    ['test_name', 'variant', 'outcome'],
    registry=registry
)
monitoring_gauge = Gauge(
    'system_metrics',
    'Current system metrics',
    ['metric_type'],
    registry=registry
)

# Separated metrics for medical accuracy
accuracy_gauge = Gauge(
    'medical_accuracy',
    'Medical AI accuracy (TP / Total)',
    ['service', 'analysis_type'],
    registry=registry
)
safety_gauge = Gauge(
    'medical_safety_score',
    'Medical safety score (1 - Critical Errors / Total)',
    ['service', 'analysis_type'],
    registry=registry
)
latency_histogram = Histogram(
    'medical_latency_seconds',
    'Medical AI latency distribution',
    ['service', 'analysis_type', 'percentile'],
    registry=registry
)
error_rate_gauge = Gauge(
    'medical_error_rate',
    'Medical AI error rate (%)',
    ['service', 'error_type'],
    registry=registry
)

# FastAPI app
app = FastAPI(
    title="Andoqest Monitoring & A/B Testing Service",
    description="Real-time monitoring and A/B testing framework",
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

# Pydantic models
class ABTestVariant(BaseModel):
    """A/B test variant model"""
    name: str
    description: str
    traffic_allocation: float = Field(..., ge=0.0, le=1.0)
    configuration: Dict[str, Any]

class ABTest(BaseModel):
    """A/B test model"""
    name: str
    description: str
    start_date: datetime
    end_date: Optional[datetime]
    variants: List[ABTestVariant]
    success_metrics: List[str]
    sample_size: int = Field(default=1000, ge=100)
    confidence_level: float = Field(default=0.95, ge=0.8, le=0.99)

class ABTestAssignment(BaseModel):
    """A/B test assignment model"""
    user_id: str
    test_name: str
    variant: str
    timestamp: datetime

class ABTestResult(BaseModel):
    """A/B test result model"""
    test_name: str
    variant: str
    user_id: str
    outcome: str
    value: float
    timestamp: datetime
    metadata: Dict[str, Any] = {}

class MonitoringMetric(BaseModel):
    """Monitoring metric model"""
    metric_name: str
    value: float
    timestamp: datetime
    tags: Dict[str, str] = {}

class SeparatedMetrics(BaseModel):
    """Separated medical metrics (NEVER use combined 'medical accuracy 99.9%')"""
    accuracy: float = Field(
        ..., 
        description="Accuracy = TP / (TP + FP + FN)",
        ge=0.0,
        le=1.0
    )
    safety_score: float = Field(
        ...,
        description="Safety Score = 1 - (Critical Errors / Total)",
        ge=0.0,
        le=1.0
    )
    latency_p50: float = Field(..., description="P50 latency in ms", ge=0.0)
    latency_p95: float = Field(..., description="P95 latency in ms", ge=0.0)
    latency_p99: float = Field(..., description="P99 latency in ms", ge=0.0)
    error_rate: float = Field(
        ...,
        description="Error rate in percentage",
        ge=0.0,
        le=100.0
    )
    service: str = Field(..., description="Service name (8000/8001/8002)")
    analysis_type: str = Field(..., description="Analysis type")

class AlertRule(BaseModel):
    """Alert rule model"""
    name: str
    metric: str
    condition: str  # ">", "<", "==", "!=", ">=", "<="
    threshold: float
    duration_minutes: int = Field(default=5, ge=1)
    severity: str = Field(default="warning", pattern="^(info|warning|critical)$")
    enabled: bool = True

class DashboardData(BaseModel):
    """Dashboard data model"""
    timestamp: datetime
    metrics: Dict[str, float]
    ab_test_results: Dict[str, Any]
    system_health: str
    active_alerts: List[str]

# A/B Testing Manager
class ABTestManager:
    """Manages A/B tests and experiments"""
    
    def __init__(self):
        self.active_tests = {}
        self.test_results = {}
        
    def create_test(self, test: ABTest) -> bool:
        """Create a new A/B test"""
        try:
            test_key = f"ab_test:{test.name}"
            test_data = test.dict()
            test_data["created_at"] = datetime.now().isoformat()
            test_data["status"] = "active"
            
            redis_client.hset(test_key, mapping=test_data)
            self.active_tests[test.name] = test
            
            logger.info("A/B test created", test_name=test.name)
            return True
            
        except Exception as e:
            logger.error("Failed to create A/B test", test_name=test.name, error=str(e))
            return False
    
    def assign_variant(self, user_id: str, test_name: str) -> Optional[str]:
        """Assign user to A/B test variant"""
        try:
            test_key = f"ab_test:{test_name}"
            test_data = redis_client.hgetall(test_key)
            
            if not test_data:
                return None
                
            # Check if user already assigned
            assignment_key = f"ab_assignment:{user_id}:{test_name}"
            existing_assignment = redis_client.get(assignment_key)
            
            if existing_assignment:
                return existing_assignment
            
            # Assign based on traffic allocation
            import random
            random_value = random.random()
            cumulative_allocation = 0.0
            
            variants = json.loads(test_data.get("variants", "[]"))
            for variant in variants:
                cumulative_allocation += variant["traffic_allocation"]
                if random_value <= cumulative_allocation:
                    assigned_variant = variant["name"]
                    break
            else:
                assigned_variant = variants[0]["name"]  # Default to first variant
            
            # Store assignment
            assignment_data = {
                "user_id": user_id,
                "test_name": test_name,
                "variant": assigned_variant,
                "timestamp": datetime.now().isoformat()
            }
            
            redis_client.setex(
                assignment_key,
                timedelta(days=30),  # 30 day expiration
                assigned_variant
            )
            
            # Log assignment
            assignment_key_log = f"ab_assignments:{test_name}:{assigned_variant}"
            redis_client.sadd(assignment_key_log, user_id)
            
            logger.info("User assigned to A/B test variant", 
                       user_id=user_id, test_name=test_name, variant=assigned_variant)
            
            return assigned_variant
            
        except Exception as e:
            logger.error("Failed to assign A/B test variant", 
                      user_id=user_id, test_name=test_name, error=str(e))
            return None
    
    def record_result(self, result: ABTestResult) -> bool:
        """Record A/B test result"""
        try:
            result_key = f"ab_result:{result.test_name}:{result.variant}:{result.user_id}"
            result_data = result.dict()
            result_data["recorded_at"] = datetime.now().isoformat()
            
            redis_client.hset(result_key, mapping=result_data)
            
            # Update counter
            ab_test_counter.labels(
                test_name=result.test_name,
                variant=result.variant,
                outcome=result.outcome
            ).inc()
            
            logger.info("A/B test result recorded", 
                      test_name=result.test_name, 
                      variant=result.variant,
                      outcome=result.outcome)
            
            return True
            
        except Exception as e:
            logger.error("Failed to record A/B test result", 
                      result=result.dict(), error=str(e))
            return False
    
    def get_test_results(self, test_name: str) -> Dict[str, Any]:
        """Get A/B test results and statistics"""
        try:
            # Get assignments
            assignments = {}
            for variant in ["control", "treatment"]:
                assignment_key = f"ab_assignments:{test_name}:{variant}"
                assignments[variant] = redis_client.scard(assignment_key)
            
            # Get results
            results_pattern = f"ab_result:{test_name}:*"
            result_keys = redis_client.keys(results_pattern)
            
            variant_results = {}
            total_conversions = 0
            
            for result_key in result_keys:
                result_data = redis_client.hgetall(result_key)
                if result_data:
                    variant = result_data.get("variant", "unknown")
                    outcome = result_data.get("outcome", "")
                    value = float(result_data.get("value", 0))
                    
                    if variant not in variant_results:
                        variant_results[variant] = {
                            "conversions": 0,
                            "total_value": 0.0,
                            "count": 0
                        }
                    
                    variant_results[variant]["count"] += 1
                    if outcome == "conversion":
                        variant_results[variant]["conversions"] += 1
                        total_conversions += 1
                    variant_results[variant]["total_value"] += value
            
            # Calculate statistics
            statistics = {}
            for variant, data in variant_results.items():
                count = data["count"]
                conversions = data["conversions"]
                conversion_rate = (conversions / count * 100) if count > 0 else 0
                avg_value = (data["total_value"] / count) if count > 0 else 0
                
                statistics[variant] = {
                    "assignments": assignments.get(variant, 0),
                    "conversions": conversions,
                    "conversion_rate": round(conversion_rate, 2),
                    "avg_value": round(avg_value, 4),
                    "count": count
                }
            
            return {
                "test_name": test_name,
                "statistics": statistics,
                "total_conversions": total_conversions,
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error("Failed to get A/B test results", test_name=test_name, error=str(e))
            return {}

# Monitoring Manager
class MonitoringManager:
    """Manages system monitoring and metrics"""
    
    def __init__(self):
        self.metrics_history = []
        self.alert_rules = []
        
    def record_metric(self, metric: MonitoringMetric) -> bool:
        """Record a monitoring metric"""
        try:
            metric_key = f"metric:{metric.metric_name}:{int(metric.timestamp.timestamp())}"
            metric_data = metric.dict()
            
            redis_client.hset(metric_key, mapping=metric_data)
            redis_client.expire(metric_key, timedelta(days=7))  # 7 day retention
            
            # Update gauge
            monitoring_gauge.labels(metric_type=metric.metric_name).set(metric.value)
            
            # Check alert rules
            self._check_alerts(metric)
            
            logger.debug("Metric recorded", metric_name=metric.metric_name, value=metric.value)
            return True
            
        except Exception as e:
            logger.error("Failed to record metric", metric=metric.dict(), error=str(e))
            return False
    
    def _check_alerts(self, metric: MonitoringMetric):
        """Check if metric triggers any alert rules"""
        for rule in self.alert_rules:
            if rule.enabled and rule.metric == metric.metric_name:
                try:
                    # Simple threshold checking
                    if rule.condition == ">" and metric.value > rule.threshold:
                        self._trigger_alert(rule, metric)
                    elif rule.condition == "<" and metric.value < rule.threshold:
                        self._trigger_alert(rule, metric)
                    elif rule.condition == "==" and metric.value == rule.threshold:
                        self._trigger_alert(rule, metric)
                    elif rule.condition == ">=" and metric.value >= rule.threshold:
                        self._trigger_alert(rule, metric)
                    elif rule.condition == "<=" and metric.value <= rule.threshold:
                        self._trigger_alert(rule, metric)
                        
                except Exception as e:
                    logger.error("Alert check failed", rule=rule.name, error=str(e))
    
    def _trigger_alert(self, rule: AlertRule, metric: MonitoringMetric):
        """Trigger an alert"""
        alert_key = f"alert:{rule.name}:{int(datetime.now().timestamp())}"
        alert_data = {
            "rule_name": rule.name,
            "metric": metric.metric_name,
            "value": metric.value,
            "threshold": rule.threshold,
            "condition": rule.condition,
            "severity": rule.severity,
            "timestamp": metric.timestamp.isoformat(),
            "tags": json.dumps(metric.tags)
        }
        
        redis_client.hset(alert_key, mapping=alert_data)
        redis_client.expire(alert_key, timedelta(hours=24))  # 24 hour retention
        
        logger.warning("Alert triggered", 
                    rule=rule.name, 
                    metric=metric.metric_name,
                    value=metric.value,
                    threshold=rule.threshold)
    
    def get_dashboard_data(self, hours: int = 24) -> DashboardData:
        """Get dashboard data for specified time period"""
        try:
            end_time = datetime.now()
            start_time = end_time - timedelta(hours=hours)
            
            # Get metrics
            metrics = {}
            metric_keys = redis_client.keys("metric:*")
            
            for key in metric_keys:
                timestamp_str = key.split(":")[-1]
                timestamp = datetime.fromtimestamp(int(timestamp_str))
                
                if start_time <= timestamp <= end_time:
                    metric_data = redis_client.hgetall(key)
                    if metric_data:
                        metric_name = metric_data.get("metric_name", "")
                        value = float(metric_data.get("value", 0))
                        
                        if metric_name not in metrics:
                            metrics[metric_name] = []
                        metrics[metric_name].append(value)
            
            # Calculate averages
            averaged_metrics = {}
            for metric_name, values in metrics.items():
                averaged_metrics[metric_name] = sum(values) / len(values) if values else 0
            
            # Get active alerts
            alert_keys = redis_client.keys("alert:*")
            active_alerts = []
            
            for key in alert_keys:
                alert_data = redis_client.hgetall(key)
                if alert_data:
                    active_alerts.append(f"{alert_data.get('rule_name', 'Unknown')}: {alert_data.get('metric', 'Unknown')}")
            
            return DashboardData(
                timestamp=datetime.now(),
                metrics=averaged_metrics,
                ab_test_results={},
                system_health="healthy" if len(active_alerts) < 5 else "degraded",
                active_alerts=active_alerts[:10]  # Top 10 alerts
            )
            
        except Exception as e:
            logger.error("Failed to get dashboard data", error=str(e))
            return DashboardData(
                timestamp=datetime.now(),
                metrics={},
                ab_test_results={},
                system_health="error",
                active_alerts=[str(e)]
            )

# Initialize managers
ab_test_manager = ABTestManager()
monitoring_manager = MonitoringManager()

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "redis_connected": redis_client.ping() if redis_client else False
    }

@app.post("/ab_tests")
async def create_ab_test(test: ABTest):
    """Create a new A/B test"""
    success = ab_test_manager.create_test(test)
    if success:
        return {"status": "created", "test_name": test.name}
    else:
        raise HTTPException(status_code=500, detail="Failed to create A/B test")

@app.post("/ab_tests/assign")
async def assign_ab_test(assignment: ABTestAssignment):
    """Assign user to A/B test variant"""
    variant = ab_test_manager.assign_variant(assignment.user_id, assignment.test_name)
    if variant:
        return {"variant": variant}
    else:
        raise HTTPException(status_code=404, detail="A/B test not found")

@app.post("/ab_tests/results")
async def record_ab_result(result: ABTestResult):
    """Record A/B test result"""
    success = ab_test_manager.record_result(result)
    if success:
        return {"status": "recorded"}
    else:
        raise HTTPException(status_code=500, detail="Failed to record result")

@app.get("/ab_tests/{test_name}/results")
async def get_ab_test_results(test_name: str):
    """Get A/B test results"""
    results = ab_test_manager.get_test_results(test_name)
    if results:
        return results
    else:
        raise HTTPException(status_code=404, detail="A/B test not found")

@app.post("/metrics")
async def record_metric(metric: MonitoringMetric):
    """Record a monitoring metric"""
    success = monitoring_manager.record_metric(metric)
    if success:
        return {"status": "recorded"}
    else:
        raise HTTPException(status_code=500, detail="Failed to record metric")

@app.get("/dashboard")
async def get_dashboard(hours: int = 24):
    """Get dashboard data"""
    dashboard_data = monitoring_manager.get_dashboard_data(hours)
    return dashboard_data.dict()

@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    return generate_latest(registry)

@app.post("/separated_metrics")
async def record_separated_metrics(metrics: SeparatedMetrics):
    """Record separated medical metrics (NEVER combined)"""
    try:
        # Update Prometheus gauges
        accuracy_gauge.labels(
            service=metrics.service,
            analysis_type=metrics.analysis_type
        ).set(metrics.accuracy)
        
        safety_gauge.labels(
            service=metrics.service,
            analysis_type=metrics.analysis_type
        ).set(metrics.safety_score)
        
        error_rate_gauge.labels(
            service=metrics.service,
            error_type="all"
        ).set(metrics.error_rate)
        
        # Store in Redis for history
        redis_client.hset(
            f"separated_metrics:{metrics.service}:{datetime.utcnow().timestamp()}",
            mapping=metrics.dict()
        )
        
        logger.info(
            "Separated metrics recorded",
            service=metrics.service,
            accuracy=metrics.accuracy,
            safety_score=metrics.safety_score,
            latency_p95=metrics.latency_p95
        )
        
        return {"status": "recorded", "timestamp": datetime.utcnow()}
        
    except Exception as e:
        logger.error("Failed to record separated metrics", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to record metrics: {str(e)}")

@app.get("/separated_metrics/{service}")
async def get_separated_metrics(service: str, hours: int = 24):
    """Get separated metrics for a service"""
    try:
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        # Get all metric keys for this service
        metric_keys = redis_client.keys(f"separated_metrics:{service}:*")
        
        metrics_history = []
        for key in metric_keys:
            timestamp_str = key.split(":")[-1]
            timestamp = datetime.fromtimestamp(float(timestamp_str))
            
            if start_time <= timestamp <= end_time:
                metric_data = redis_client.hgetall(key)
                if metric_data:
                    metrics_history.append(metric_data)
        
        # Calculate aggregates
        if metrics_history:
            avg_accuracy = sum(float(m.get("accuracy", 0)) for m in metrics_history) / len(metrics_history)
            avg_safety = sum(float(m.get("safety_score", 0)) for m in metrics_history) / len(metrics_history)
            avg_latency_p95 = sum(float(m.get("latency_p95", 0)) for m in metrics_history) / len(metrics_history)
            avg_error_rate = sum(float(m.get("error_rate", 0)) for m in metrics_history) / len(metrics_history)
        else:
            avg_accuracy = avg_safety = avg_latency_p95 = avg_error_rate = 0.0
        
        return {
            "service": service,
            "time_range_hours": hours,
            "data_points": len(metrics_history),
            "aggregates": {
                "avg_accuracy": round(avg_accuracy, 4),
                "avg_safety_score": round(avg_safety, 4),
                "avg_latency_p95_ms": round(avg_latency_p95, 2),
                "avg_error_rate_pct": round(avg_error_rate, 2)
            },
            "history": metrics_history[-100:]  # Last 100 data points
        }
        
    except Exception as e:
        logger.error("Failed to get separated metrics", service=service, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Monitoring & A/B Testing Service starting up...")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Monitoring & A/B Testing Service shutting down...")

if __name__ == "__main__":
    uvicorn.run(
        "monitoring_mvp:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    )