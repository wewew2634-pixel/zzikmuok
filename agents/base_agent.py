from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime
import structlog

logger = structlog.get_logger()

class VerificationResult(BaseModel):
    """Result of agent verification"""
    agent_name: str
    status: str  # "approved", "rejected", "needs_revision"
    confidence: float  # 0.0 to 1.0
    findings: List[str]
    recommendations: List[str]
    risk_assessment: str
    timestamp: datetime
    
class BaseAgent(ABC):
    """Base class for all verification agents"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.verification_history = []
        
    @abstractmethod
    async def verify(self, proposal_data: Dict[str, Any]) -> VerificationResult:
        """Verify proposal against agent's expertise"""
        pass
    
    def get_confidence_score(self, findings: List[str]) -> float:
        """Calculate confidence score based on findings"""
        positive_indicators = sum(1 for finding in findings if "✓" in finding or "compliant" in finding.lower())
        negative_indicators = sum(1 for finding in findings if "✗" in finding or "risk" in finding.lower() or "violation" in finding.lower())
        
        if positive_indicators + negative_indicators == 0:
            return 0.5
            
        return min(1.0, max(0.0, positive_indicators / (positive_indicators + negative_indicators)))
    
    def log_verification(self, result: VerificationResult):
        """Log verification result"""
        self.verification_history.append(result)
        logger.info(
            "Agent verification completed",
            agent=self.name,
            status=result.status,
            confidence=result.confidence
        )