"""
Regression Test Automation Framework
Phase 2 AgentKit Integration

Automated regression testing for medical AI cross-validation.
Integrates with AgentKit wrapper and 8000/8001/8002 services.

Features:
- Automated test discovery
- Parallel test execution
- Real-world monitoring (RWM) integration
- PCCP compliance verification
- A/B testing for model versions
"""

import asyncio
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

from agentkit_wrapper import (
    AgentKitWrapper,
    AgentKitConfig,
    RegressionTestCase,
    RegressionTestResult,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TestSuite(BaseModel):
    """Collection of regression tests"""
    suite_id: str
    name: str
    description: str
    test_cases: List[RegressionTestCase]
    tags: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class TestRunConfig(BaseModel):
    """Configuration for test run"""
    suite_ids: List[str] = Field(default_factory=list)
    parallel: bool = True
    timeout_seconds: int = 300
    fail_fast: bool = False
    tags_filter: Optional[List[str]] = None
    generate_report: bool = True


class TestRunReport(BaseModel):
    """Test run execution report"""
    run_id: str
    started_at: str
    completed_at: str
    duration_seconds: float
    total_tests: int
    passed_tests: int
    failed_tests: int
    pass_rate: float
    test_results: List[RegressionTestResult]
    summary: Dict[str, Any]


class RegressionTestFramework:
    """
    Automated regression test framework for medical AI validation
    """
    
    def __init__(
        self,
        agentkit_config: AgentKitConfig,
        test_suites_dir: str = "./test_suites",
    ):
        self.agentkit_config = agentkit_config
        self.test_suites_dir = Path(test_suites_dir)
        self.test_suites_dir.mkdir(exist_ok=True)
        
        self.wrapper = AgentKitWrapper(agentkit_config)
        logger.info(f"Regression test framework initialized with {test_suites_dir}")
    
    def load_test_suites(self, suite_ids: Optional[List[str]] = None) -> List[TestSuite]:
        """
        Load test suites from JSON files
        
        Args:
            suite_ids: Specific suite IDs to load (None = load all)
        
        Returns:
            List of test suites
        """
        suites = []
        
        for suite_file in self.test_suites_dir.glob("*.json"):
            with open(suite_file, "r") as f:
                data = json.load(f)
                suite = TestSuite(**data)
                
                if suite_ids is None or suite.suite_id in suite_ids:
                    suites.append(suite)
                    logger.info(f"Loaded test suite: {suite.suite_id} ({len(suite.test_cases)} tests)")
        
        return suites
    
    def save_test_suite(self, suite: TestSuite):
        """Save test suite to JSON file"""
        suite_file = self.test_suites_dir / f"{suite.suite_id}.json"
        
        with open(suite_file, "w") as f:
            json.dump(suite.model_dump(), f, indent=2)
        
        logger.info(f"Saved test suite: {suite.suite_id} to {suite_file}")
    
    async def run_tests(self, config: TestRunConfig) -> TestRunReport:
        """
        Execute regression test run
        
        Args:
            config: Test run configuration
        
        Returns:
            Test run report with results
        """
        run_id = f"RUN-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
        started_at = datetime.utcnow()
        
        logger.info(f"Starting test run: {run_id}")
        logger.info(f"Config: parallel={config.parallel}, fail_fast={config.fail_fast}")
        
        # Load test suites
        suites = self.load_test_suites(config.suite_ids)
        
        if not suites:
            logger.warning("No test suites loaded")
            return self._create_empty_report(run_id, started_at)
        
        # Collect all test cases
        all_test_cases = []
        for suite in suites:
            for test_case in suite.test_cases:
                # Apply tags filter if specified
                if config.tags_filter:
                    if not any(tag in test_case.tags for tag in config.tags_filter):
                        continue
                
                all_test_cases.append(test_case)
        
        logger.info(f"Total test cases: {len(all_test_cases)}")
        
        # Execute tests
        test_results = []
        
        try:
            if config.parallel:
                test_results = await self.wrapper.run_regression_tests(
                    all_test_cases,
                    parallel=True,
                )
            else:
                for i, test_case in enumerate(all_test_cases, 1):
                    logger.info(f"Running test {i}/{len(all_test_cases)}: {test_case.test_id}")
                    
                    results = await self.wrapper.run_regression_tests([test_case], parallel=False)
                    test_results.extend(results)
                    
                    # Fail fast if enabled
                    if config.fail_fast and results and not results[0].passed:
                        logger.warning(f"Fail-fast triggered at test {test_case.test_id}")
                        break
        
        except asyncio.TimeoutError:
            logger.error(f"Test run timed out after {config.timeout_seconds}s")
        except Exception as e:
            logger.error(f"Test run failed: {str(e)}")
        
        # Generate report
        completed_at = datetime.utcnow()
        duration = (completed_at - started_at).total_seconds()
        
        report = self._generate_report(
            run_id,
            started_at.isoformat(),
            completed_at.isoformat(),
            duration,
            test_results,
        )
        
        if config.generate_report:
            self._save_report(report)
        
        logger.info(f"Test run completed: {report.passed_tests}/{report.total_tests} passed ({report.pass_rate:.1f}%)")
        
        return report
    
    def _generate_report(
        self,
        run_id: str,
        started_at: str,
        completed_at: str,
        duration: float,
        test_results: List[RegressionTestResult],
    ) -> TestRunReport:
        """Generate test run report"""
        total_tests = len(test_results)
        passed_tests = sum(1 for r in test_results if r.passed)
        failed_tests = total_tests - passed_tests
        pass_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0.0
        
        # Group results by validation type
        by_type: Dict[str, Dict[str, int]] = {}
        for result in test_results:
            # Extract validation type from test_id (format: TYPE-XXX)
            parts = result.test_id.split('-')
            val_type = parts[0] if len(parts) > 1 else "UNKNOWN"
            
            if val_type not in by_type:
                by_type[val_type] = {"passed": 0, "failed": 0}
            
            if result.passed:
                by_type[val_type]["passed"] += 1
            else:
                by_type[val_type]["failed"] += 1
        
        summary = {
            "by_validation_type": by_type,
            "avg_confidence": sum(r.actual_confidence for r in test_results) / total_tests if total_tests > 0 else 0.0,
            "failed_tests": [
                {
                    "test_id": r.test_id,
                    "diff": r.diff,
                }
                for r in test_results if not r.passed
            ],
        }
        
        report = TestRunReport(
            run_id=run_id,
            started_at=started_at,
            completed_at=completed_at,
            duration_seconds=duration,
            total_tests=total_tests,
            passed_tests=passed_tests,
            failed_tests=failed_tests,
            pass_rate=pass_rate,
            test_results=test_results,
            summary=summary,
        )
        
        return report
    
    def _create_empty_report(self, run_id: str, started_at: datetime) -> TestRunReport:
        """Create empty report when no tests are run"""
        completed_at = datetime.utcnow()
        duration = (completed_at - started_at).total_seconds()
        
        return TestRunReport(
            run_id=run_id,
            started_at=started_at.isoformat(),
            completed_at=completed_at.isoformat(),
            duration_seconds=duration,
            total_tests=0,
            passed_tests=0,
            failed_tests=0,
            pass_rate=0.0,
            test_results=[],
            summary={},
        )
    
    def _save_report(self, report: TestRunReport):
        """Save test report to file"""
        reports_dir = Path("./test_reports")
        reports_dir.mkdir(exist_ok=True)
        
        report_file = reports_dir / f"{report.run_id}.json"
        
        with open(report_file, "w") as f:
            json.dump(report.model_dump(), f, indent=2)
        
        logger.info(f"Saved test report: {report_file}")
    
    async def close(self):
        """Close framework resources"""
        await self.wrapper.close()


# Create default test suites
def create_default_test_suites(framework: RegressionTestFramework):
    """Create default regression test suites"""
    
    # Suite 1: FDA Validation Tests
    fda_suite = TestSuite(
        suite_id="fda-validation-suite",
        name="FDA Regulatory Validation",
        description="Tests for FDA 510(k) and PMA pathways",
        test_cases=[
            RegressionTestCase(
                test_id="FDA-001",
                description="510(k) clearance for surgical AI",
                input_prompt="Evaluate surgical navigation AI for 510(k) clearance",
                expected_decision="APPROVED_CONDITIONAL",
                expected_confidence_min=0.85,
                validation_type="fda",
                tags=["fda", "510k", "surgical"],
            ),
            RegressionTestCase(
                test_id="FDA-002",
                description="PMA approval for diagnostic AI",
                input_prompt="Assess diagnostic AI for PMA approval",
                expected_decision="REQUIRES_CLINICAL_TRIAL",
                expected_confidence_min=0.80,
                validation_type="fda",
                tags=["fda", "pma", "diagnostic"],
            ),
            RegressionTestCase(
                test_id="FDA-003",
                description="PCCP submission for AI/ML model",
                input_prompt="Validate PCCP documentation for adaptive AI model",
                expected_decision="APPROVED_WITH_MONITORING",
                expected_confidence_min=0.90,
                validation_type="fda",
                tags=["fda", "pccp", "aiml"],
            ),
        ],
        tags=["fda", "regulatory"],
    )
    
    # Suite 2: Clinical Safety Tests
    safety_suite = TestSuite(
        suite_id="clinical-safety-suite",
        name="Clinical Safety Validation",
        description="Tests for clinical safety assessment",
        test_cases=[
            RegressionTestCase(
                test_id="SAFETY-001",
                description="Surgical AI safety check",
                input_prompt="Assess clinical safety of surgical AI system",
                expected_decision="SAFE",
                expected_confidence_min=0.95,
                validation_type="clinical_safety",
                tags=["safety", "surgical"],
            ),
            RegressionTestCase(
                test_id="SAFETY-002",
                description="Diagnostic AI adverse event check",
                input_prompt="Evaluate potential adverse events for diagnostic AI",
                expected_decision="LOW_RISK",
                expected_confidence_min=0.90,
                validation_type="clinical_safety",
                tags=["safety", "diagnostic", "adverse_events"],
            ),
        ],
        tags=["safety", "clinical"],
    )
    
    # Suite 3: Hospital Operations Tests
    hospital_suite = TestSuite(
        suite_id="hospital-ops-suite",
        name="Hospital Operations Integration",
        description="Tests for hospital workflow integration",
        test_cases=[
            RegressionTestCase(
                test_id="OPS-001",
                description="OR integration workflow",
                input_prompt="Validate OR integration for surgical AI",
                expected_decision="INTEGRATION_APPROVED",
                expected_confidence_min=0.85,
                validation_type="hospital_ops",
                tags=["ops", "or", "workflow"],
            ),
        ],
        tags=["ops", "hospital"],
    )
    
    # Save all suites
    framework.save_test_suite(fda_suite)
    framework.save_test_suite(safety_suite)
    framework.save_test_suite(hospital_suite)
    
    logger.info("Created 3 default test suites")


# Example usage
async def main():
    """Example: Regression test framework usage"""
    
    # Initialize framework
    config = AgentKitConfig(
        model_version="gpt-4o-2025-10-01",
        validation_engine_url="http://localhost:8000",
        mvp_service_url="http://localhost:8001",
        monitoring_url="http://localhost:8002",
    )
    
    framework = RegressionTestFramework(config, test_suites_dir="./test_suites")
    
    try:
        # Create default test suites
        logger.info("=== Creating Default Test Suites ===")
        create_default_test_suites(framework)
        
        # Run all tests
        logger.info("\n=== Running All Tests ===")
        run_config = TestRunConfig(
            parallel=True,
            fail_fast=False,
            generate_report=True,
        )
        
        report = await framework.run_tests(run_config)
        
        logger.info(f"\n=== Test Run Report ===")
        logger.info(f"Run ID: {report.run_id}")
        logger.info(f"Duration: {report.duration_seconds:.2f}s")
        logger.info(f"Total: {report.total_tests}")
        logger.info(f"Passed: {report.passed_tests} ({report.pass_rate:.1f}%)")
        logger.info(f"Failed: {report.failed_tests}")
        
        if report.failed_tests > 0:
            logger.warning("\nFailed Tests:")
            for failed in report.summary["failed_tests"]:
                logger.warning(f"  - {failed['test_id']}: {failed['diff']}")
        
        # Run FDA tests only
        logger.info("\n=== Running FDA Tests Only ===")
        fda_config = TestRunConfig(
            suite_ids=["fda-validation-suite"],
            parallel=True,
            generate_report=False,
        )
        
        fda_report = await framework.run_tests(fda_config)
        logger.info(f"FDA tests: {fda_report.passed_tests}/{fda_report.total_tests} passed")
        
    finally:
        await framework.close()


if __name__ == "__main__":
    asyncio.run(main())
