from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio
from .base_agent import BaseAgent, VerificationResult
from .fda_agent import FDARegulatoryAgent
from .cms_agent import CMSReimbursementAgent
from .hospital_ops_agent import HospitalOperationsAgent
from .clinical_safety_agent import ClinicalSafetyAgent
from .tech_integration_agent import TechIntegrationAgent
import structlog

logger = structlog.get_logger()

class CrossVerificationSystem:
    """Cross-verification system coordinating multiple AI agents"""
    
    def __init__(self):
        self.agents = {
            "fda": FDARegulatoryAgent(),
            "cms": CMSReimbursementAgent(),
            "hospital_ops": HospitalOperationsAgent(),
            "clinical_safety": ClinicalSafetyAgent(),
            "tech_integration": TechIntegrationAgent()
        }
        self.verification_history = []
        
    async def cross_verify_proposal(self, proposal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run cross-verification across all agents"""
        
        logger.info("Starting cross-verification of proposal", 
                   proposal_name=proposal_data.get("name", "Unknown"))
        
        # Run all agent verifications in parallel
        tasks = []
        for agent_name, agent in self.agents.items():
            task = asyncio.create_task(agent.verify(proposal_data))
            tasks.append((agent_name, task))
        
        # Collect results
        results = {}
        for agent_name, task in tasks:
            try:
                result = await task
                results[agent_name] = result
            except Exception as e:
                logger.error(f"Agent {agent_name} verification failed", error=str(e))
                results[agent_name] = self._create_error_result(agent_name, str(e))
        
        # Analyze cross-verification results
        analysis = self._analyze_results(results)
        
        # Store in history
        verification_record = {
            "timestamp": datetime.now(),
            "proposal_id": proposal_data.get("id", "unknown"),
            "results": results,
            "analysis": analysis
        }
        self.verification_history.append(verification_record)
        
        return {
            "results": results,
            "analysis": analysis,
            "recommendations": self._generate_recommendations(results, analysis)
        }
    
    def _analyze_results(self, results: Dict[str, VerificationResult]) -> Dict[str, Any]:
        """Analyze cross-verification results"""
        
        approved_agents = [name for name, result in results.items() if result.status == "approved"]
        revision_agents = [name for name, result in results.items() if result.status == "needs_revision"]
        rejected_agents = [name for name, result in results.items() if result.status == "rejected"]
        
        # Calculate overall confidence
        confidences = [result.confidence for result in results.values()]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        
        # Determine overall status
        if len(approved_agents) == len(results):
            overall_status = "APPROVED"
            recommendation = "Proposal ready for submission"
        elif len(approved_agents) >= 3 and len(rejected_agents) == 0:
            overall_status = "CONDITIONAL"
            recommendation = "Address revision recommendations and resubmit"
        elif len(approved_agents) >= 2:
            overall_status = "REVISION_REQUIRED"
            recommendation = "Significant revisions needed before resubmission"
        else:
            overall_status = "REJECTED"
            recommendation = "Major rework required - consider redesign"
        
        # Identify critical issues
        critical_issues = []
        for agent_name, result in results.items():
            if result.status in ["needs_revision", "rejected"]:
                critical_issues.extend([
                    f"{agent_name.upper()}: {finding}" 
                    for finding in result.findings 
                    if any(keyword in finding.lower() for keyword in ["✗", "risk", "violation", "insufficient"])
                ])
        
        return {
            "overall_status": overall_status,
            "overall_recommendation": recommendation,
            "approved_agents": approved_agents,
            "revision_agents": revision_agents,
            "rejected_agents": rejected_agents,
            "average_confidence": avg_confidence,
            "critical_issues": critical_issues[:5]  # Top 5 critical issues
        }
    
    def _generate_recommendations(self, results: Dict[str, VerificationResult], 
                                 analysis: Dict[str, Any]) -> List[str]:
        """Generate overall recommendations based on cross-verification"""
        
        recommendations = []
        
        # Overall status-based recommendations
        if analysis["overall_status"] == "APPROVED":
            recommendations.extend([
                "✓ Proposal is ready for regulatory submission",
                "→ Prepare comprehensive submission package",
                "→ Consider expedited review pathways"
            ])
        elif analysis["overall_status"] == "CONDITIONAL":
            recommendations.extend([
                "⚠ Address identified revision requirements",
                "→ Focus on agents requiring revision",
                "→ Consider parallel submission pathways"
            ])
        elif analysis["overall_status"] == "REVISION_REQUIRED":
            recommendations.extend([
                "🔴 Significant revisions needed",
                "→ Prioritize high-impact improvements",
                "→ Consider stakeholder feedback sessions"
            ])
        else:  # REJECTED
            recommendations.extend([
                "🔴 Major redesign recommended",
                "→ Reassess core technology approach",
                "→ Consider alternative regulatory pathways"
            ])
        
        # Agent-specific recommendations
        for agent_name, result in results.items():
            if result.recommendations:
                recommendations.append(f"{agent_name.upper()}: {result.recommendations[0]}")
        
        # Priority actions
        if analysis["critical_issues"]:
            recommendations.append(f"🚨 CRITICAL: Address {len(analysis['critical_issues'])} high-priority issues")
        
        return recommendations
    
    def _create_error_result(self, agent_name: str, error: str) -> VerificationResult:
        """Create error result for failed agent verification"""
        return VerificationResult(
            agent_name=agent_name,
            status="error",
            confidence=0.0,
            findings=[f"Error during verification: {error}"],
            recommendations=["Retry verification or contact support"],
            risk_assessment="Verification failed - cannot assess risk",
            timestamp=datetime.now()
        )
    
    def get_verification_summary(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get summary of recent verifications"""
        recent = self.verification_history[-limit:] if self.verification_history else []
        
        summary = []
        for record in recent:
            analysis = record.get("analysis", {})
            summary.append({
                "timestamp": record["timestamp"],
                "proposal_id": record["proposal_id"],
                "overall_status": analysis.get("overall_status", "Unknown"),
                "confidence": analysis.get("average_confidence", 0.0),
                "approved_agents": len(analysis.get("approved_agents", [])),
                "total_agents": len(self.agents)
            })
        
        return summary