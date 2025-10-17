from typing import Dict, List, Any
from datetime import datetime
from .base_agent import BaseAgent, VerificationResult

class HospitalOperationsAgent(BaseAgent):
    """Hospital Operations and Efficiency Agent"""
    
    def __init__(self):
        super().__init__(
            name="Hospital_Operations_Agent",
            description="Optimizes hospital operational efficiency and cost reduction"
        )
        self.expertise = [
            "OR efficiency optimization",
            "Documentation automation",
            "Staff workflow improvement",
            "Cost reduction strategies",
            "Quality metrics enhancement"
        ]
        self.optimization_targets = {
            "documentation_time_reduction": 0.30,  # 30%
            "or_efficiency_gain": 0.25,  # 25%
            "staff_productivity_increase": 0.20,  # 20%
            "roi_calculation": 14.0  # 1,400% return
        }
        
    async def verify(self, proposal_data: Dict[str, Any]) -> VerificationResult:
        """Verify hospital operational benefits"""
        
        findings = []
        recommendations = []
        
        # Check documentation automation potential
        doc_automation = self._check_documentation_automation(proposal_data)
        if doc_automation:
            findings.append(f"✓ AI can reduce documentation time by {self.optimization_targets['documentation_time_reduction']*100:.0f}%")
            findings.append("→ Surgeons can focus more on patient care")
        else:
            findings.append("⚠ Limited documentation automation potential")
            recommendations.append("Enhance AI capabilities for surgical documentation")
        
        # Check OR efficiency improvements
        or_efficiency = self._check_or_efficiency(proposal_data)
        if or_efficiency:
            findings.append(f"✓ OR efficiency can be improved by {self.optimization_targets['or_efficiency_gain']*100:.0f}%")
            findings.append("→ Reduced surgery duration and improved throughput")
        else:
            findings.append("⚠ Limited OR efficiency improvements identified")
            recommendations.append("Focus on real-time surgical guidance capabilities")
        
        # Check staff productivity
        staff_productivity = self._check_staff_productivity(proposal_data)
        if staff_productivity:
            findings.append(f"✓ Staff productivity can increase by {self.optimization_targets['staff_productivity_increase']*100:.0f}%")
            findings.append("→ Reduced cognitive load on surgical team")
        else:
            findings.append("⚠ Limited staff productivity benefits")
        
        # Check cost reduction
        cost_reduction = self._calculate_cost_reduction(proposal_data)
        if cost_reduction > 500000:  # >$500K annually
            findings.append(f"✓ Annual cost reduction: ${cost_reduction:,}")
            findings.append("→ Significant operational savings")
        else:
            findings.append(f"⚠ Limited cost reduction: ${cost_reduction:,}")
        
        # Check ROI
        roi = self._calculate_roi(proposal_data)
        if roi > self.optimization_targets["roi_calculation"] * 100:  # >1400%
            findings.append(f"✓ Exceptional ROI: {roi:.0f}% within 12 months")
        elif roi > 500:  # >500%
            findings.append(f"✓ Strong ROI: {roi:.0f}% within 12 months")
        else:
            findings.append(f"⚠ Moderate ROI: {roi:.0f}% within 12 months")
            recommendations.append("Enhance value proposition for hospital administrators")
        
        # Check implementation complexity
        implementation_complexity = self._assess_implementation_complexity(proposal_data)
        if implementation_complexity < 5:  # Scale 1-10
            findings.append("✓ Low implementation complexity")
            findings.append("→ Minimal disruption to existing workflows")
        else:
            findings.append(f"⚠ Implementation complexity: {implementation_complexity}/10")
            recommendations.append("Develop comprehensive change management strategy")
        
        # Determine status
        confidence = self.get_confidence_score(findings)
        if doc_automation and or_efficiency and roi > 500:
            status = "approved"
            risk_assessment = "High operational value with strong ROI"
        elif doc_automation or or_efficiency:
            status = "needs_revision"
            risk_assessment = "Good operational value but may need optimization"
        else:
            status = "rejected"
            risk_assessment = "Limited operational benefits identified"
        
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
    
    def _check_documentation_automation(self, proposal_data: Dict[str, Any]) -> bool:
        """Check documentation automation potential"""
        ai_capabilities = proposal_data.get("ai_capabilities", [])
        has_video_analysis = "video_analysis" in ai_capabilities
        has_nlp = "natural_language_processing" in ai_capabilities
        
        return has_video_analysis and has_nlp
    
    def _check_or_efficiency(self, proposal_data: Dict[str, Any]) -> bool:
        """Check OR efficiency improvement potential"""
        real_time_capability = proposal_data.get("real_time_processing", False)
        surgical_focus = "surgical" in proposal_data.get("device_type", "").lower()
        
        return real_time_capability and surgical_focus
    
    def _check_staff_productivity(self, proposal_data: Dict[str, Any]) -> bool:
        """Check staff productivity benefits"""
        automation_features = proposal_data.get("automation_features", [])
        decision_support = "decision_support" in automation_features
        workflow_integration = "workflow_integration" in automation_features
        
        return decision_support and workflow_integration
    
    def _calculate_cost_reduction(self, proposal_data: Dict[str, Any]) -> int:
        """Calculate annual cost reduction"""
        hospitals_targeted = proposal_data.get("target_hospitals", 100)
        cost_reduction_per_hospital = 75000  # $75K per hospital annually
        
        return int(hospitals_targeted * cost_reduction_per_hospital)
    
    def _calculate_roi(self, proposal_data: Dict[str, Any]) -> float:
        """Calculate return on investment"""
        cost_reduction = self._calculate_cost_reduction(proposal_data)
        implementation_cost = proposal_data.get("implementation_cost", 500000)
        
        return (cost_reduction / implementation_cost) * 100 if implementation_cost > 0 else 0
    
    def _assess_implementation_complexity(self, proposal_data: Dict[str, Any]) -> int:
        """Assess implementation complexity (1-10 scale)"""
        integration_points = len(proposal_data.get("system_integrations", []))
        staff_training_hours = proposal_data.get("staff_training_hours", 40)
        
        complexity = min(10, (integration_points * 2) + (staff_training_hours / 20))
        return int(complexity)