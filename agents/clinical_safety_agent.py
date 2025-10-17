from typing import Dict, List, Any
from datetime import datetime
from .base_agent import BaseAgent, VerificationResult

class ClinicalSafetyAgent(BaseAgent):
    """Clinical Safety and Patient Outcomes Agent"""
    
    def __init__(self):
        super().__init__(
            name="Clinical_Safety_Agent",
            description="Ensures patient safety, clinical validation, and safety monitoring"
        )
        self.expertise = [
            "Patient safety monitoring",
            "Clinical validation studies",
            "Adverse event detection",
            "Risk-benefit analysis",
            "Post-market surveillance"
        ]
        self.safety_thresholds = {
            "serious_adverse_event_rate": 0.02,  # 2%
            "device_malfunction_rate": 0.01,  # 1%
            "false_positive_rate": 0.05,  # 5%
            "false_negative_rate": 0.03  # 3%
        }
        
    async def verify(self, proposal_data: Dict[str, Any]) -> VerificationResult:
        """Verify clinical safety and patient outcomes"""
        
        findings = []
        recommendations = []
        
        # Check clinical validation
        clinical_validation = self._check_clinical_validation(proposal_data)
        if clinical_validation:
            findings.append("✓ Comprehensive clinical validation studies completed")
            findings.append("→ Safety profile established across patient populations")
        else:
            findings.append("✗ Insufficient clinical validation")
            recommendations.append("Conduct additional clinical studies before market entry")
        
        # Check safety monitoring
        safety_monitoring = self._check_safety_monitoring(proposal_data)
        if safety_monitoring:
            findings.append("✓ Robust safety monitoring system in place")
            findings.append("→ Real-time adverse event detection enabled")
        else:
            findings.append("⚠ Limited safety monitoring capabilities")
            recommendations.append("Implement comprehensive post-market surveillance")
        
        # Check performance metrics
        performance_metrics = self._check_performance_metrics(proposal_data)
        if performance_metrics:
            findings.append("✓ Performance metrics meet clinical safety standards")
            findings.append(f"→ SAE rate: {self.safety_thresholds['serious_adverse_event_rate']*100:.1f}% threshold")
        else:
            findings.append("✗ Performance metrics below safety standards")
            recommendations.append("Improve device performance before clinical use")
        
        # Check patient benefit
        patient_benefit = self._assess_patient_benefit(proposal_data)
        if patient_benefit > 7.0:  # Scale 1-10
            findings.append(f"✓ Strong patient benefit demonstrated: {patient_benefit}/10")
        else:
            findings.append(f"⚠ Limited patient benefit: {patient_benefit}/10")
            recommendations.append("Enhance clinical value proposition for patients")
        
        # Check risk-benefit ratio
        risk_benefit = self._assess_risk_benefit(proposal_data)
        if risk_benefit > 2.0:  # Benefit outweighs risk by 2:1
            findings.append(f"✓ Favorable risk-benefit ratio: {risk_benefit}:1")
        else:
            findings.append(f"⚠ Risk-benefit ratio needs improvement: {risk_benefit}:1")
            recommendations.append("Improve risk-benefit profile through enhanced safety features")
        
        # Check post-market surveillance
        post_market_surveillance = self._check_post_market_surveillance(proposal_data)
        if post_market_surveillance:
            findings.append("✓ Comprehensive post-market surveillance plan")
            findings.append("→ Long-term safety monitoring enabled")
        else:
            findings.append("⚠ Limited post-market surveillance planning")
            recommendations.append("Develop robust post-market surveillance strategy")
        
        # Determine status
        confidence = self.get_confidence_score(findings)
        if clinical_validation and safety_monitoring and performance_metrics:
            status = "approved"
            risk_assessment = "Low clinical risk with robust safety profile"
        elif clinical_validation or safety_monitoring:
            status = "needs_revision"
            risk_assessment = "Moderate clinical risk - may need enhanced monitoring"
        else:
            status = "rejected"
            risk_assessment = "High clinical risk - significant safety concerns identified"
        
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
    
    def _check_clinical_validation(self, proposal_data: Dict[str, Any]) -> bool:
        """Check clinical validation completeness"""
        clinical_trials = proposal_data.get("clinical_trials", [])
        patient_populations = proposal_data.get("validated_populations", [])
        
        # Minimum: 2 clinical trials across diverse populations
        return len(clinical_trials) >= 2 and len(patient_populations) >= 3
    
    def _check_safety_monitoring(self, proposal_data: Dict[str, Any]) -> bool:
        """Check safety monitoring capabilities"""
        safety_features = proposal_data.get("safety_features", [])
        real_time_monitoring = "real_time_safety" in safety_features
        adverse_event_detection = "adverse_event_detection" in safety_features
        
        return real_time_monitoring and adverse_event_detection
    
    def _check_performance_metrics(self, proposal_data: Dict[str, Any]) -> bool:
        """Check if performance meets safety thresholds"""
        performance_data = proposal_data.get("performance_metrics", {})
        
        sae_rate = performance_data.get("serious_adverse_event_rate", 1.0)
        malfunction_rate = performance_data.get("device_malfunction_rate", 1.0)
        false_positive = performance_data.get("false_positive_rate", 1.0)
        false_negative = performance_data.get("false_negative_rate", 1.0)
        
        return (sae_rate < self.safety_thresholds["serious_adverse_event_rate"] and
                malfunction_rate < self.safety_thresholds["device_malfunction_rate"] and
                false_positive < self.safety_thresholds["false_positive_rate"] and
                false_negative < self.safety_thresholds["false_negative_rate"])
    
    def _assess_patient_benefit(self, proposal_data: Dict[str, Any]) -> float:
        """Assess patient benefit score (1-10)"""
        clinical_outcomes = proposal_data.get("clinical_outcomes", [])
        quality_of_life = proposal_data.get("quality_of_life_improvement", 0)
        survival_benefit = proposal_data.get("survival_benefit", 0)
        
        benefit_score = (len(clinical_outcomes) * 2) + (quality_of_life * 0.5) + (survival_benefit * 0.3)
        return min(10.0, benefit_score)
    
    def _assess_risk_benefit(self, proposal_data: Dict[str, Any]) -> float:
        """Assess risk-benefit ratio"""
        patient_benefit = self._assess_patient_benefit(proposal_data)
        safety_risk = proposal_data.get("safety_risk_score", 5.0)
        
        return patient_benefit / max(1.0, safety_risk)
    
    def _check_post_market_surveillance(self, proposal_data: Dict[str, Any]) -> bool:
        """Check post-market surveillance planning"""
        surveillance_features = proposal_data.get("post_market_surveillance", [])
        required_elements = ["adverse_event_reporting", "performance_monitoring", "patient_registry"]
        
        return all(element in surveillance_features for element in required_elements)