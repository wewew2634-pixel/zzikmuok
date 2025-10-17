"""
Voice Interface Prototype (Non-PHI)
Phase 2 AgentKit Integration

Administrative voice interface for medical AI platform.
NON-PHI only per regulatory yellow flag mitigation.

Regulatory Constraints:
- ❌ No patient-facing voice consultations (PHI risk)
- ✅ Administrative tasks only (scheduling, status, queries)
- ✅ US region only (HIPAA BAA compliance)
- ✅ Zero data retention (ZDR)

Features:
- Voice command processing for admin tasks
- Text-to-speech responses
- Non-PHI query handling
- Integration with 8000/8001/8002 services
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum
import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VoiceCommandType(str, Enum):
    """Supported voice command types (non-PHI only)"""
    CHECK_STATUS = "check_status"
    SCHEDULE_VALIDATION = "schedule_validation"
    GET_METRICS = "get_metrics"
    LIST_MISSIONS = "list_missions"
    GET_PCCP_STATUS = "get_pccp_status"
    QUERY_LOGS = "query_logs"


class VoiceCommand(BaseModel):
    """Voice command input"""
    command_id: str = Field(default_factory=lambda: f"CMD-{datetime.utcnow().timestamp()}")
    command_type: VoiceCommandType
    raw_text: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    user_id: str
    region: str = Field(default="US", description="Must be US for HIPAA BAA")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class VoiceResponse(BaseModel):
    """Voice response output"""
    command_id: str
    response_text: str
    response_data: Dict[str, Any] = Field(default_factory=dict)
    audio_url: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    phi_safe: bool = Field(True, description="Must be True for all responses")


class VoiceInterfaceConfig(BaseModel):
    """Voice interface configuration"""
    enabled: bool = True
    region_whitelist: List[str] = Field(default=["US"], description="HIPAA BAA regions only")
    max_audio_duration_seconds: int = 30
    speech_to_text_provider: str = "openai-whisper"
    text_to_speech_provider: str = "openai-tts"
    
    # Service endpoints
    validation_engine_url: str = "http://localhost:8000"
    mvp_service_url: str = "http://localhost:8001"
    monitoring_url: str = "http://localhost:8002"
    
    # Zero data retention
    store_audio: bool = Field(False, description="ZDR: Never store audio")
    store_transcripts: bool = Field(False, description="ZDR: Never store transcripts")
    log_commands: bool = Field(True, description="Log command metadata only (no content)")


class VoiceInterface:
    """
    Voice interface for administrative medical AI tasks
    
    IMPORTANT: Non-PHI only!
    - ❌ No patient consultations
    - ❌ No clinical advice
    - ❌ No PHI data access
    - ✅ Admin tasks only
    """
    
    def __init__(self, config: VoiceInterfaceConfig):
        self.config = config
        self.client = httpx.AsyncClient(timeout=30)
        logger.info("Voice interface initialized (Non-PHI administrative mode)")
        
        if not config.enabled:
            logger.warning("Voice interface is DISABLED")
    
    async def process_command(self, command: VoiceCommand) -> VoiceResponse:
        """
        Process voice command and generate response
        
        Args:
            command: Voice command to process
        
        Returns:
            Voice response with text and optional audio
        """
        # Validate region
        if command.region not in self.config.region_whitelist:
            return VoiceResponse(
                command_id=command.command_id,
                response_text=f"Voice interface not available in {command.region}. US region only.",
                phi_safe=True,
            )
        
        # Log command metadata (ZDR: no content)
        if self.config.log_commands:
            logger.info(f"Voice command received: {command.command_type} | User: {command.user_id}")
        
        # Route command
        try:
            if command.command_type == VoiceCommandType.CHECK_STATUS:
                return await self._handle_check_status(command)
            
            elif command.command_type == VoiceCommandType.SCHEDULE_VALIDATION:
                return await self._handle_schedule_validation(command)
            
            elif command.command_type == VoiceCommandType.GET_METRICS:
                return await self._handle_get_metrics(command)
            
            elif command.command_type == VoiceCommandType.LIST_MISSIONS:
                return await self._handle_list_missions(command)
            
            elif command.command_type == VoiceCommandType.GET_PCCP_STATUS:
                return await self._handle_get_pccp_status(command)
            
            elif command.command_type == VoiceCommandType.QUERY_LOGS:
                return await self._handle_query_logs(command)
            
            else:
                return VoiceResponse(
                    command_id=command.command_id,
                    response_text="Command not recognized. Please try again.",
                    phi_safe=True,
                )
        
        except Exception as e:
            logger.error(f"Command processing failed: {str(e)}")
            return VoiceResponse(
                command_id=command.command_id,
                response_text="Sorry, I encountered an error processing your request.",
                phi_safe=True,
            )
    
    async def _handle_check_status(self, command: VoiceCommand) -> VoiceResponse:
        """Handle: Check system status"""
        try:
            # Check all services
            services_status = {}
            
            for service_name, url in [
                ("validation", self.config.validation_engine_url),
                ("mvp", self.config.mvp_service_url),
                ("monitoring", self.config.monitoring_url),
            ]:
                try:
                    response = await self.client.get(f"{url}/health", timeout=5)
                    services_status[service_name] = "healthy" if response.status_code == 200 else "unhealthy"
                except:
                    services_status[service_name] = "unreachable"
            
            # Generate response
            healthy_count = sum(1 for s in services_status.values() if s == "healthy")
            total_count = len(services_status)
            
            response_text = f"System status: {healthy_count} out of {total_count} services are healthy. "
            response_text += f"Validation engine is {services_status['validation']}, "
            response_text += f"MVP service is {services_status['mvp']}, "
            response_text += f"and monitoring is {services_status['monitoring']}."
            
            return VoiceResponse(
                command_id=command.command_id,
                response_text=response_text,
                response_data={"services": services_status},
                phi_safe=True,
            )
        
        except Exception as e:
            logger.error(f"Status check failed: {str(e)}")
            return VoiceResponse(
                command_id=command.command_id,
                response_text="Unable to check system status at this time.",
                phi_safe=True,
            )
    
    async def _handle_schedule_validation(self, command: VoiceCommand) -> VoiceResponse:
        """Handle: Schedule validation task"""
        # Extract parameters
        validation_type = command.parameters.get("validation_type", "fda")
        scheduled_time = command.parameters.get("scheduled_time", "now")
        
        response_text = f"Validation task scheduled for {scheduled_time}. "
        response_text += f"Type: {validation_type}. You will be notified when complete."
        
        return VoiceResponse(
            command_id=command.command_id,
            response_text=response_text,
            response_data={
                "validation_type": validation_type,
                "scheduled_time": scheduled_time,
                "status": "scheduled",
            },
            phi_safe=True,
        )
    
    async def _handle_get_metrics(self, command: VoiceCommand) -> VoiceResponse:
        """Handle: Get system metrics"""
        try:
            # Get metrics from monitoring service
            response = await self.client.get(
                f"{self.config.monitoring_url}/separated_metrics/8001",
                timeout=10,
            )
            
            if response.status_code == 200:
                data = response.json()
                metrics = data.get("metrics", [])
                
                if metrics:
                    latest = metrics[-1]
                    accuracy = latest.get("accuracy", 0.0) * 100
                    safety = latest.get("safety_score", 0.0) * 100
                    latency = latest.get("latency_p95", 0.0)
                    
                    response_text = f"Latest metrics: Accuracy is {accuracy:.1f} percent, "
                    response_text += f"safety score is {safety:.1f} percent, "
                    response_text += f"and P95 latency is {latency:.1f} milliseconds."
                else:
                    response_text = "No recent metrics available."
            else:
                response_text = "Unable to retrieve metrics at this time."
            
            return VoiceResponse(
                command_id=command.command_id,
                response_text=response_text,
                response_data={"metrics": metrics if response.status_code == 200 else []},
                phi_safe=True,
            )
        
        except Exception as e:
            logger.error(f"Metrics retrieval failed: {str(e)}")
            return VoiceResponse(
                command_id=command.command_id,
                response_text="Unable to retrieve metrics at this time.",
                phi_safe=True,
            )
    
    async def _handle_list_missions(self, command: VoiceCommand) -> VoiceResponse:
        """Handle: List available missions"""
        # Mock mission data (replace with actual API call)
        missions = [
            {"id": "M-001", "status": "pending", "type": "FDA validation"},
            {"id": "M-002", "status": "in_progress", "type": "Safety check"},
            {"id": "M-003", "status": "completed", "type": "Hospital ops"},
        ]
        
        pending_count = sum(1 for m in missions if m["status"] == "pending")
        in_progress_count = sum(1 for m in missions if m["status"] == "in_progress")
        
        response_text = f"You have {len(missions)} missions. "
        response_text += f"{pending_count} pending, {in_progress_count} in progress."
        
        return VoiceResponse(
            command_id=command.command_id,
            response_text=response_text,
            response_data={"missions": missions},
            phi_safe=True,
        )
    
    async def _handle_get_pccp_status(self, command: VoiceCommand) -> VoiceResponse:
        """Handle: Get PCCP compliance status"""
        try:
            response = await self.client.get(
                f"{self.config.mvp_service_url}/pccp_compliance",
                timeout=10,
            )
            
            if response.status_code == 200:
                data = response.json()
                model_version = data.get("model_version", "unknown")
                status = data.get("regulatory_status", "unknown")
                
                response_text = f"PCCP compliance status: Model version {model_version} is {status}."
            else:
                response_text = "Unable to retrieve PCCP status at this time."
            
            return VoiceResponse(
                command_id=command.command_id,
                response_text=response_text,
                response_data=data if response.status_code == 200 else {},
                phi_safe=True,
            )
        
        except Exception as e:
            logger.error(f"PCCP status check failed: {str(e)}")
            return VoiceResponse(
                command_id=command.command_id,
                response_text="Unable to retrieve PCCP status at this time.",
                phi_safe=True,
            )
    
    async def _handle_query_logs(self, command: VoiceCommand) -> VoiceResponse:
        """Handle: Query system logs (non-PHI)"""
        # Extract parameters
        log_type = command.parameters.get("log_type", "error")
        time_range = command.parameters.get("time_range", "last_hour")
        
        # Mock log summary (replace with actual log query)
        log_summary = {
            "error": 3,
            "warning": 12,
            "info": 156,
        }
        
        response_text = f"In the {time_range}, there were "
        response_text += f"{log_summary['error']} errors, "
        response_text += f"{log_summary['warning']} warnings, "
        response_text += f"and {log_summary['info']} info messages."
        
        return VoiceResponse(
            command_id=command.command_id,
            response_text=response_text,
            response_data={"log_summary": log_summary, "time_range": time_range},
            phi_safe=True,
        )
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
        logger.info("Voice interface closed")


# Example usage
async def main():
    """Example: Voice interface usage"""
    
    # Initialize voice interface
    config = VoiceInterfaceConfig(
        enabled=True,
        region_whitelist=["US"],
        validation_engine_url="http://localhost:8000",
        mvp_service_url="http://localhost:8001",
        monitoring_url="http://localhost:8002",
        store_audio=False,  # ZDR
        store_transcripts=False,  # ZDR
    )
    
    voice_interface = VoiceInterface(config)
    
    try:
        # Example commands
        commands = [
            VoiceCommand(
                command_type=VoiceCommandType.CHECK_STATUS,
                raw_text="Check system status",
                user_id="admin-001",
                region="US",
            ),
            VoiceCommand(
                command_type=VoiceCommandType.GET_METRICS,
                raw_text="Get latest metrics",
                user_id="admin-001",
                region="US",
            ),
            VoiceCommand(
                command_type=VoiceCommandType.GET_PCCP_STATUS,
                raw_text="What is the PCCP compliance status?",
                user_id="admin-001",
                region="US",
            ),
            VoiceCommand(
                command_type=VoiceCommandType.LIST_MISSIONS,
                raw_text="List my missions",
                user_id="admin-001",
                region="US",
            ),
        ]
        
        for command in commands:
            logger.info(f"\n=== Processing: {command.raw_text} ===")
            response = await voice_interface.process_command(command)
            logger.info(f"Response: {response.response_text}")
            logger.info(f"PHI Safe: {response.phi_safe}")
    
    finally:
        await voice_interface.close()


if __name__ == "__main__":
    asyncio.run(main())
