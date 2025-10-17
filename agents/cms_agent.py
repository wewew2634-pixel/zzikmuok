from typing import Dict, List, Any
from datetime import datetime
from .base_agent import BaseAgent, VerificationResult

class CMSReimbursementAgent(BaseAgent):
    """CMS Reimbursement and Payment Policy Agent"""
    
    def __init__(self):
        super().__init__(
            name="CMS_Reimbursement_Agent",
            description="Manages CMS reimbursement pathways including NTAP and Medicare coverage"
        )
        self.expertise = [
            "NTAP (New Technology Add-on Payment)",
            "Medicare Advantage coverage",
            "Hospital outpatient payment",
            "Physician fee schedule",
            "Value-based care models"
        ]
        self.revenue_models = {
            "ntap_add_on": 0.65,  # 65% add-on payment
            "duration_years": 5,
            "annual_per_hospital": 2100000  # $2.1M
        }
        
    async def verify(self, proposal_data: Dict[str, Any]) -> VerificationResult:
        """Verify CMS reimbursement pathway"""
        
        findings = []
        recommendations = []
        
        # Check NTAP eligibility
        ntap_eligible = self._check_ntap_eligibility(proposal_data)
        if ntap_eligible:
            findings.append("✓ Device qualifies for CMS NTAP (New Technology Add-on Payment)")
            findings.append(f"→ {self.revenue_models['ntap_add_on']*100}% add-on payment for {self.revenue_models['duration_years']} years")
            findings.append(f"→ Estimated revenue: ${self.revenue_models['annual_per_hospital']:,} per hospital annually")
        else:
            findings.append("✗ Device may not qualify for NTAP")
            recommendations.append("Consider demonstrating substantial clinical improvement for NTAP qualification")
        
        # Check Medicare coverage
        medicare_covered = self._check_medicare_coverage(proposal_data)
        if medicare_covered:
            findings.append("✓ Medicare provides automatic coverage for breakthrough devices")
            findings.append("→ No separate coverage determination needed")
        else:
            findings.append("⚠ Medicare coverage may require separate technology assessment")
            recommendations.append("Prepare for Medicare Administrative Contractor (MAC) review")
        
        # Check Health Tech Investment Act implications
        health_tech_benefits = self._check_health_tech_benefits(proposal_data)
        if health_tech_benefits:
            findings.append("✓ Qualifies for Health Tech Investment Act (S.1399) benefits")
            findings.append("→ Accelerated Medicare coverage for algorithm-based health services")
        else:
            findings.append("⚠ May not fully benefit from Health Tech Investment Act")
        
        # Check value-based care alignment
        value_based_aligned = self._check_value_based_care(proposal_data)
        if value_based_aligned:
            findings.append("✓ Aligned with CMS value-based care initiatives")
            findings.append("→ Eligible for alternative payment models")
        else:
            findings.append("⚠ Limited alignment with value-based care models")
            recommendations.append("Consider demonstrating cost-effectiveness and quality improvement metrics")
        
        # Check revenue impact projections
        revenue_impact = self._calculate_revenue_impact(proposal_data)
        if revenue_impact > 1000000:  # >$1M
            findings.append(f"✓ Projected CMS revenue impact: ${revenue_impact:,}")
        else:
            findings.append(f"⚠ Limited CMS revenue impact: ${revenue_impact:,}")
        
        # Determine status
        confidence = self.get_confidence_score(findings)
        if ntap_eligible and medicare_covered:
            status = "approved"
            risk_assessment = "High revenue potential with guaranteed CMS payments"
        elif ntap_eligible or medicare_covered:
            status = "needs_revision"
            risk_assessment = "Good revenue potential but may need additional evidence"
        else:
            status = "rejected"
            risk_assessment = "Limited CMS reimbursement pathway identified"
        
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
    
    def _check_ntap_eligibility(self, proposal_data: Dict[str, Any]) -> bool:
        """Check if device qualifies for NTAP"""
        # NTAP criteria: New technology that substantially improves clinical outcomes
        is_new_tech = proposal_data.get("technology_novelty", 0) > 7.0
        substantial_improvement = proposal_data.get("clinical_improvement", 0) > 8.0
        
        return is_new_tech and substantial_improvement
    
    def _check_medicare_coverage(self, proposal_data: Dict[str, Any]) -> bool:
        """Check Medicare coverage for breakthrough devices"""
        # Automatic coverage for FDA-designated breakthrough devices
        fda_breakthrough = proposal_data.get("fda_breakthrough_designation", False)
        return fda_breakthrough
    
    def _check_health_tech_benefits(self, proposal_data: Dict[str, Any]) -> bool:
        """Check Health Tech Investment Act benefits"""
        # Benefits for algorithm-based health services
        is_algorithm_based = "algorithm" in proposal_data.get("technology_type", "").lower()
        is_health_service = "medical" in proposal_data.get("device_type", "").lower()
        
        return is_algorithm_based and is_health_service
    
    def _check_value_based_care(self, proposal_data: Dict[str, Any]) -> bool:
        """Check alignment with value-based care models"""
        quality_metrics = proposal_data.get("quality_metrics", [])
        cost_reduction = proposal_data.get("cost_reduction_percent", 0)
        
        return len(quality_metrics) > 0 and cost_reduction > 10  # >10% cost reduction
    
    def _calculate_revenue_impact(self, proposal_data: Dict[str, Any]) -> int:
        """Calculate projected CMS revenue impact"""
        hospitals_targeted = proposal_data.get("target_hospitals", 100)
        annual_revenue_per_hospital = self.revenue_models["annual_per_hospital"]
        
        return int(hospitals_targeted * annual_revenue_per_hospital * 0.6)  # 60% capture rate