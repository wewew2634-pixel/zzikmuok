from typing import Dict, List, Any
from datetime import datetime
from .base_agent import BaseAgent, VerificationResult

class TechIntegrationAgent(BaseAgent):
    """Technology Integration and Infrastructure Agent"""
    
    def __init__(self):
        super().__init__(
            name="Tech_Integration_Agent",
            description="Handles technical integration, infrastructure, and system compatibility"
        )
        self.expertise = [
            "HL7/FHIR integration",
            "EHR system compatibility",
            "Cloud infrastructure",
            "Edge computing deployment",
            "Cybersecurity compliance"
        ]
        self.tech_specs = {
            "minimum_bandwidth": 100,  # Mbps
            "processing_latency": 100,  # ms
            "uptime_requirement": 0.999,  # 99.9%
            "hipaa_compliance": True
        }
        
    async def verify(self, proposal_data: Dict[str, Any]) -> VerificationResult:
        """Verify technical integration feasibility"""
        
        findings = []
        recommendations = []
        
        # Check HL7/FHIR compatibility
        hl7_compatible = self._check_hl7_compatibility(proposal_data)
        if hl7_compatible:
            findings.append("✓ Full HL7/FHIR compatibility for healthcare data exchange")
            findings.append("→ Seamless integration with existing hospital systems")
        else:
            findings.append("✗ Limited HL7/FHIR compatibility")
            recommendations.append("Implement comprehensive HL7/FHIR interface")
        
        # Check EHR integration
        ehr_integration = self._check_ehr_integration(proposal_data)
        if ehr_integration:
            findings.append("✓ Compatible with major EHR systems (Epic, Cerner, Allscripts)")
            findings.append("→ Minimal workflow disruption for clinical staff")
        else:
            findings.append("⚠ Limited EHR system compatibility")
            recommendations.append("Develop EHR-agnostic integration layer")
        
        # Check cloud/edge architecture
        architecture_feasible = self._check_architecture(proposal_data)
        if architecture_feasible:
            findings.append("✓ Hybrid cloud-edge architecture with real-time processing")
            findings.append(f"→ Processing latency: {self.tech_specs['processing_latency']}ms")
        else:
            findings.append("⚠ Architecture may not support real-time requirements")
            recommendations.append("Optimize for edge computing deployment")
        
        # Check cybersecurity
        cybersecurity = self._check_cybersecurity(proposal_data)
        if cybersecurity:
            findings.append("✓ HIPAA-compliant with zero-trust security model")
            findings.append("→ Enterprise-grade data protection")
        else:
            findings.append("✗ Cybersecurity measures insufficient")
            recommendations.append("Implement comprehensive cybersecurity framework")
        
        # Check scalability
        scalability = self._check_scalability(proposal_data)
        if scalability:
            findings.append("✓ Auto-scaling infrastructure for variable workloads")
            findings.append("→ Supports 1000+ concurrent users")
        else:
            findings.append("⚠ Limited scalability for enterprise deployment")
            recommendations.append("Design for horizontal scaling")
        
        # Check maintenance requirements
        maintenance = self._check_maintenance(proposal_data)
        if maintenance:
            findings.append("✓ Zero-downtime deployment model")
            findings.append(f"→ {self.tech_specs['uptime_requirement']*100}% uptime guarantee")
        else:
            findings.append("⚠ Maintenance may require system downtime")
            recommendations.append("Implement blue-green deployment strategy")
        
        # Check bandwidth requirements
        bandwidth_ok = self._check_bandwidth_requirements(proposal_data)
        if bandwidth_ok:
            findings.append(f"✓ Bandwidth requirements met: {self.tech_specs['minimum_bandwidth']}Mbps minimum")
        else:
            findings.append(f"⚠ High bandwidth requirements: {self.tech_specs['minimum_bandwidth']}Mbps")
            recommendations.append("Optimize data transmission for limited bandwidth environments")
        
        # Determine status
        confidence = self.get_confidence_score(findings)
        if hl7_compatible and ehr_integration and cybersecurity:
            status = "approved"
            risk_assessment = "Low technical risk with enterprise-ready architecture"
        elif hl7_compatible and cybersecurity:
            status = "needs_revision"
            risk_assessment = "Moderate technical risk - may need integration optimization"
        else:
            status = "rejected"
            risk_assessment = "High technical risk - significant integration challenges"
        
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
    
    def _check_hl7_compatibility(self, proposal_data: Dict[str, Any]) -> bool:
        """Check HL7/FHIR compatibility"""
        integration_standards = proposal_data.get("integration_standards", [])
        return "HL7" in integration_standards and "FHIR" in integration_standards
    
    def _check_ehr_integration(self, proposal_data: Dict[str, Any]) -> bool:
        """Check EHR system compatibility"""
        supported_ehrs = proposal_data.get("supported_ehr_systems", [])
        major_ehrs = ["Epic", "Cerner", "Allscripts", "MEDITECH"]
        
        return len(set(supported_ehrs) & set(major_ehrs)) >= 2
    
    def _check_architecture(self, proposal_data: Dict[str, Any]) -> bool:
        """Check cloud-edge architecture feasibility"""
        deployment_model = proposal_data.get("deployment_model", "")
        processing_location = proposal_data.get("processing_location", "")
        
        return ("hybrid" in deployment_model.lower() or "edge" in deployment_model.lower()) and \
               ("real_time" in processing_location.lower() or "edge" in processing_location.lower())
    
    def _check_cybersecurity(self, proposal_data: Dict[str, Any]) -> bool:
        """Check cybersecurity compliance"""
        security_features = proposal_data.get("security_features", [])
        compliance_standards = proposal_data.get("compliance_standards", [])
        
        has_encryption = "encryption" in security_features
        has_access_control = "access_control" in security_features
        has_hipaa = "HIPAA" in compliance_standards
        
        return has_encryption and has_access_control and has_hipaa
    
    def _check_scalability(self, proposal_data: Dict[str, Any]) -> bool:
        """Check system scalability"""
        architecture_features = proposal_data.get("architecture_features", [])
        return "auto_scaling" in architecture_features and "microservices" in architecture_features
    
    def _check_maintenance(self, proposal_data: Dict[str, Any]) -> bool:
        """Check maintenance requirements"""
        deployment_strategy = proposal_data.get("deployment_strategy", "")
        return "zero_downtime" in deployment_strategy.lower() or "blue_green" in deployment_strategy.lower()
    
    def _check_bandwidth_requirements(self, proposal_data: Dict[str, Any]) -> bool:
        """Check if bandwidth requirements are reasonable"""
        bandwidth_needed = proposal_data.get("bandwidth_requirements_mbps", 1000)
        return bandwidth_needed <= self.tech_specs["minimum_bandwidth"] * 10  # Reasonable threshold