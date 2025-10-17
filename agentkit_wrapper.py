"""
AgentKit Wrapper for 8000 Cross-Validation Engine

Integrates OpenAI Dev Day 2025 AgentKit with medical AI cross-validation.
Phase 2 implementation per FINAL_VALIDATED_ROADMAP_2025.md

Key Features:
- FDA PCCP compliant version locking
- Regression testing integration
- Real-world monitoring (RWM)
- Custom evaluation harness (not "AgentKit Evals")
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field
import httpx

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AgentKitConfig(BaseModel):
    """AgentKit configuration"""
    model_version: str = Field(..., description="Fixed model version (PCCP)")
    temperature: float = Field(0.0, description="Deterministic for medical use")
    max_tokens: int = Field(2048, description="Max response tokens")
    timeout: int = Field(30, description="Request timeout (seconds)")
    retry_count: int = Field(3, description="Number of retries")
    
    # Cross-validation endpoints
    validation_engine_url: str = Field(
        default="http://localhost:8000",
        description="8000 cross-validation engine"
    )
    mvp_service_url: str = Field(
        default="http://localhost:8001",
        description="8001 Andoqest MVP service"
    )
    monitoring_url: str = Field(
        default="http://localhost:8002",
        description="8002 monitoring service"
    )


class ValidationRequest(BaseModel):
    """Cross-validation request"""
    prompt: str
    context: Dict[str, Any]
    validation_type: str = Field(..., description="fda|cms|hospital_ops|clinical_safety|tech_integration")
    require_pccp_log: bool = Field(True, description="Include PCCP audit log")


class ValidationResult(BaseModel):
    """Cross-validation result with AgentKit enhancement"""
    agent_type: str
    decision: str
    confidence: float
    reasoning: List[str]
    citations: List[str]
    pccp_log: Optional[Dict[str, Any]] = None
    agentkit_metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class RegressionTestCase(BaseModel):
    """Regression test case"""
    test_id: str
    description: str
    input_prompt: str
    expected_decision: str
    expected_confidence_min: float
    validation_type: str
    tags: List[str] = Field(default_factory=list)


class RegressionTestResult(BaseModel):
    """Regression test execution result"""
    test_id: str
    passed: bool
    actual_decision: str
    actual_confidence: float
    expected_decision: str
    expected_confidence_min: float
    diff: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class AgentKitWrapper:
    """
    Wrapper for AgentKit integration with medical AI cross-validation.
    
    Combines:
    - 8000 multi-agent cross-validation (FDA, CMS, Hospital, Safety, Tech)
    - AgentKit custom evaluation harness (NOT "AgentKit Evals")
    - PCCP compliance logging
    - Regression test automation
    """
    
    def __init__(self, config: AgentKitConfig):
        self.config = config
        self.client = httpx.AsyncClient(timeout=config.timeout)
        logger.info(f"AgentKit wrapper initialized with model: {config.model_version}")
    
    async def validate(self, request: ValidationRequest) -> ValidationResult:
        """
        Execute cross-validation with AgentKit enhancement
        
        Steps:
        1. Route to appropriate agent (8000)
        2. Execute validation with AgentKit tools
        3. Collect PCCP audit log (8001)
        4. Return enhanced result
        """
        try:
            # Step 1: Execute cross-validation
            agent_response = await self._call_validation_engine(request)
            
            # Step 2: Enhance with AgentKit metadata
            agentkit_metadata = {
                "model_version": self.config.model_version,
                "temperature": self.config.temperature,
                "tools_used": agent_response.get("tools_used", []),
                "reasoning_steps": agent_response.get("reasoning_steps", []),
            }
            
            # Step 3: Get PCCP log if required
            pccp_log = None
            if request.require_pccp_log:
                pccp_log = await self._get_pccp_log()
            
            # Step 4: Construct result
            result = ValidationResult(
                agent_type=request.validation_type,
                decision=agent_response.get("decision", "PENDING"),
                confidence=agent_response.get("confidence", 0.0),
                reasoning=agent_response.get("reasoning", []),
                citations=agent_response.get("citations", []),
                pccp_log=pccp_log,
                agentkit_metadata=agentkit_metadata,
            )
            
            logger.info(f"Validation completed: {request.validation_type} -> {result.decision}")
            return result
            
        except Exception as e:
            logger.error(f"Validation failed: {str(e)}")
            raise
    
    async def _call_validation_engine(self, request: ValidationRequest) -> Dict[str, Any]:
        """Call 8000 cross-validation engine"""
        try:
            response = await self.client.post(
                f"{self.config.validation_engine_url}/validate",
                json={
                    "prompt": request.prompt,
                    "context": request.context,
                    "agent_types": [request.validation_type],
                },
                timeout=self.config.timeout,
            )
            response.raise_for_status()
            data = response.json()
            
            # Extract agent response
            agent_results = data.get("agent_results", {})
            agent_data = agent_results.get(request.validation_type, {})
            
            return agent_data
            
        except httpx.HTTPError as e:
            logger.error(f"HTTP error calling validation engine: {str(e)}")
            raise
    
    async def _get_pccp_log(self) -> Dict[str, Any]:
        """Get PCCP compliance log from 8001"""
        try:
            response = await self.client.get(
                f"{self.config.mvp_service_url}/pccp_compliance",
                timeout=self.config.timeout,
            )
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to get PCCP log: {str(e)}")
            return {}
    
    async def run_regression_tests(
        self,
        test_cases: List[RegressionTestCase],
        parallel: bool = True,
    ) -> List[RegressionTestResult]:
        """
        Run regression test suite
        
        Args:
            test_cases: List of regression test cases
            parallel: Run tests in parallel (default True)
        
        Returns:
            List of test results
        """
        logger.info(f"Running {len(test_cases)} regression tests (parallel={parallel})")
        
        if parallel:
            tasks = [self._run_single_test(tc) for tc in test_cases]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out exceptions
            valid_results = [r for r in results if isinstance(r, RegressionTestResult)]
            failed_count = len(results) - len(valid_results)
            
            if failed_count > 0:
                logger.warning(f"{failed_count} tests failed with exceptions")
            
            return valid_results
        else:
            results = []
            for tc in test_cases:
                result = await self._run_single_test(tc)
                results.append(result)
            return results
    
    async def _run_single_test(self, test_case: RegressionTestCase) -> RegressionTestResult:
        """Execute single regression test"""
        try:
            # Execute validation
            request = ValidationRequest(
                prompt=test_case.input_prompt,
                context={"test_id": test_case.test_id},
                validation_type=test_case.validation_type,
                require_pccp_log=False,  # Skip PCCP for regression tests
            )
            
            result = await self.validate(request)
            
            # Check if test passed
            passed = (
                result.decision == test_case.expected_decision and
                result.confidence >= test_case.expected_confidence_min
            )
            
            diff = None
            if not passed:
                diff = f"Expected: {test_case.expected_decision} (conf≥{test_case.expected_confidence_min}), "
                diff += f"Got: {result.decision} (conf={result.confidence:.3f})"
            
            test_result = RegressionTestResult(
                test_id=test_case.test_id,
                passed=passed,
                actual_decision=result.decision,
                actual_confidence=result.confidence,
                expected_decision=test_case.expected_decision,
                expected_confidence_min=test_case.expected_confidence_min,
                diff=diff,
            )
            
            status = "✅ PASS" if passed else "❌ FAIL"
            logger.info(f"{status} | {test_case.test_id}: {test_case.description}")
            
            return test_result
            
        except Exception as e:
            logger.error(f"Test execution failed for {test_case.test_id}: {str(e)}")
            
            # Return failed test result
            return RegressionTestResult(
                test_id=test_case.test_id,
                passed=False,
                actual_decision="ERROR",
                actual_confidence=0.0,
                expected_decision=test_case.expected_decision,
                expected_confidence_min=test_case.expected_confidence_min,
                diff=f"Exception: {str(e)}",
            )
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
        logger.info("AgentKit wrapper closed")


# Example usage
async def main():
    """Example: AgentKit wrapper usage"""
    
    # Initialize wrapper
    config = AgentKitConfig(
        model_version="gpt-4o-2025-10-01",  # PCCP version locked
        validation_engine_url="http://localhost:8000",
        mvp_service_url="http://localhost:8001",
        monitoring_url="http://localhost:8002",
    )
    
    wrapper = AgentKitWrapper(config)
    
    try:
        # Example 1: Single validation
        logger.info("=== Example 1: FDA Validation ===")
        request = ValidationRequest(
            prompt="Evaluate surgical AI model for FDA 510(k) clearance",
            context={"model_type": "surgical_navigation", "risk_class": "II"},
            validation_type="fda",
        )
        
        result = await wrapper.validate(request)
        logger.info(f"Decision: {result.decision}")
        logger.info(f"Confidence: {result.confidence:.3f}")
        logger.info(f"Reasoning: {result.reasoning}")
        
        # Example 2: Regression tests
        logger.info("\n=== Example 2: Regression Tests ===")
        test_cases = [
            RegressionTestCase(
                test_id="REG-001",
                description="FDA approval for surgical AI",
                input_prompt="Evaluate surgical AI model for FDA 510(k) clearance",
                expected_decision="APPROVED_CONDITIONAL",
                expected_confidence_min=0.85,
                validation_type="fda",
                tags=["fda", "surgical", "510k"],
            ),
            RegressionTestCase(
                test_id="REG-002",
                description="Clinical safety check",
                input_prompt="Assess clinical safety of diagnostic AI",
                expected_decision="SAFE",
                expected_confidence_min=0.90,
                validation_type="clinical_safety",
                tags=["safety", "diagnostic"],
            ),
        ]
        
        test_results = await wrapper.run_regression_tests(test_cases, parallel=True)
        
        passed = sum(1 for r in test_results if r.passed)
        total = len(test_results)
        logger.info(f"\nRegression tests: {passed}/{total} passed ({passed/total*100:.1f}%)")
        
        for result in test_results:
            if not result.passed:
                logger.warning(f"Failed: {result.test_id} - {result.diff}")
        
    finally:
        await wrapper.close()


if __name__ == "__main__":
    asyncio.run(main())
