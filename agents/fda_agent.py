from typing import Dict, List, Any
from datetime import datetime
import re
from .base_agent import BaseAgent, VerificationResult

class FDARegulatoryAgent(BaseAgent):
    """FDA Regulatory Compliance Agent for medical AI devices"""
    
    def __init__(self):
        super().__init__(
            name="FDA_Regulatory_Agent",
            description="Handles FDA compliance, 510(k) pathway, and Breakthrough Device designation"
        )
        self.expertise = [
            "510(k) pathway analysis",
            "Breakthrough Device designation",
            "De Novo process",
            "AI/ML-enabled medical devices",
            "Software as Medical Device (SaMD)"
        ]
        self.approval_timeline = "6 months for AI-enabled surgical analysis"
        
    async def verify(self, proposal_data: Dict[str, Any]) -> VerificationResult:
        """Verify FDA regulatory compliance"""
        
        findings = []
        recommendations = []
        
        # Check if device qualifies for Breakthrough Device designation
        breakthrough_eligible = self._check_breakthrough_eligibility(proposal_data)
        if breakthrough_eligible:
            findings.append("✓ Device qualifies for FDA Breakthrough Device designation")
            findings.append(f"→ Expected approval timeline: {self.approval_timeline}")
        else:
            findings.append("✗ Device may not qualify for Breakthrough designation")
            recommendations.append("Consider modifying device to address unmet medical need")
        
        # Check 510(k) pathway eligibility
        predicate_device_exists = self._check_predicate_device(proposal_data)
        if predicate_device_exists:
            findings.append("✓ Suitable predicate device identified for 510(k) pathway")
        else:
            findings.append("⚠ Limited predicate devices available - may need De Novo pathway")
            recommendations.append("Prepare for De Novo classification if 510(k) pathway not viable")
        
        # Check AI/ML compliance
        ai_compliance = self._check_ai_compliance(proposal_data)
        if ai_compliance:
            findings.append("✓ AI/ML algorithms meet FDA Good Machine Learning Practice (GMLP)")
        else:
            findings.append("✗ AI algorithms may not meet FDA GMLP requirements")
            recommendations.append("Implement model validation and performance monitoring per FDA guidance")
        
        # Check clinical data requirements
        clinical_data_adequate = self._check_clinical_data(proposal_data)
        if clinical_data_adequate:
            findings.append("✓ Clinical data package appears adequate for submission")
        else:
            findings.append("⚠ Clinical data may need strengthening")
            recommendations.append("Consider additional clinical studies or real-world evidence")
        
        # Determine status
        confidence = self.get_confidence_score(findings)
        if breakthrough_eligible and ai_compliance and clinical_data_adequate:
            status = "approved"
            risk_assessment = "Low regulatory risk with Breakthrough pathway"
        elif ai_compliance and clinical_data_adequate:
            status = "needs_revision"
            risk_assessment = "Medium regulatory risk - may need additional evidence"
        else:
            status = "rejected"
            risk_assessment = "High regulatory risk - significant compliance gaps identified"
        
        result = VerificationResult(
            agent_name=self.name,
            status=status,
            confidence=confidence,
            findings=findings,
            recommendations=recommendations,
            risk_assessment=risk_assessment,
            timestamp=datetime.now()
        )
        
        self.log_verification(result)
        return result
    
    def _check_breakthrough_eligibility(self, proposal_data: Dict[str, Any]) -> bool:
        """Check if device qualifies for Breakthrough Device designation"""
        # Criteria: Treats/diagnoses life-threatening condition AND represents breakthrough technology
        device_type = proposal_data.get("device_type", "").lower()
        is_life_threatening = any(term in device_type for term in ["surgical", "cardiac", "oncology", "trauma"])
        is_breakthrough = proposal_data.get("technology_novelty", 0) > 8.0
        
        return is_life_threatening and is_breakthrough
    
    def _check_predicate_device(self, proposal_data: Dict[str, Any]) -> bool:
        """Check if suitable predicate device exists for 510(k)"""
        # Simulate predicate device database lookup
        device_category = proposal_data.get("device_category", "AI_Surgical_Analysis")
        return device_category in ["AI_Surgical_Analysis", "Surgical_Video_Processing"]
    
    def _check_ai_compliance(self, proposal_data: Dict[str, Any]) -> bool:
        """Check AI/ML compliance with FDA GMLP"""
        required_elements = ["model_validation", "performance_monitoring", "bias_mitigation", "explainability"]
        ai_features = proposal_data.get("ai_features", [])
        return all(element in ai_features for element in required_elements)
    
    def _check_clinical_data(self, proposal_data: Dict[str, Any]) -> bool:
        """Check if clinical data is adequate"""
        clinical_trials = proposal_data.get("clinical_trials", [])
        real_world_evidence = proposal_data.get("real_world_evidence", [])
        
        # Minimum requirements: At least 1 clinical trial or substantial RWE
        return len(clinical_trials) > 0 or len(real_world_evidence) > 5