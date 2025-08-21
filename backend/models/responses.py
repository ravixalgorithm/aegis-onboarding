from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

class BaseResponse(BaseModel):
    """Base response model for all API responses"""
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="Response message")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ErrorResponse(BaseResponse):
    """Error response model"""
    success: bool = False
    error_code: Optional[str] = Field(None, description="Error code for programmatic handling")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")

class SuccessResponse(BaseResponse):
    """Success response model"""
    success: bool = True
    data: Optional[Dict[str, Any]] = Field(None, description="Response data")

class ClientCreatedResponse(SuccessResponse):
    """Response for client creation"""
    client_id: str = Field(..., description="Created client ID")

class OnboardingStatusResponse(SuccessResponse):
    """Response for onboarding status queries"""
    client_id: str = Field(..., description="Client ID")
    status: str = Field(..., description="Overall onboarding status")
    progress_percentage: float = Field(..., description="Progress percentage (0-100)")
    current_step: str = Field(..., description="Current step description")
    steps: List[Dict[str, Any]] = Field(..., description="List of all onboarding steps")

class OnboardingStepResponse(SuccessResponse):
    """Response for individual step updates"""
    client_id: str = Field(..., description="Client ID")
    step_id: str = Field(..., description="Step ID")
    step_status: str = Field(..., description="Step status")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Step metadata")

class ApprovalRequiredResponse(BaseResponse):
    """Response when human approval is required"""
    success: bool = True
    approval_required: bool = True
    client_id: str = Field(..., description="Client ID")
    step_id: str = Field(..., description="Step requiring approval")
    approval_data: Dict[str, Any] = Field(..., description="Data for approval decision")
    approval_url: Optional[str] = Field(None, description="URL for approval interface")

class ApprovalResponse(BaseResponse):
    """Response for approval decisions"""
    client_id: str = Field(..., description="Client ID")
    step_id: str = Field(..., description="Step ID")
    approved: bool = Field(..., description="Whether the step was approved")
    feedback: Optional[str] = Field(None, description="Approval feedback or comments")

class WebSocketMessage(BaseModel):
    """WebSocket message model"""
    type: str = Field(..., description="Message type")
    client_id: str = Field(..., description="Client ID")
    data: Dict[str, Any] = Field(..., description="Message data")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class StepUpdateMessage(WebSocketMessage):
    """WebSocket message for step updates"""
    type: str = "step_update"
    step_id: str = Field(..., description="Step ID")
    step_status: str = Field(..., description="New step status")
    progress_percentage: float = Field(..., description="Updated progress percentage")

class ApprovalRequestMessage(WebSocketMessage):
    """WebSocket message for approval requests"""
    type: str = "approval_request"
    step_id: str = Field(..., description="Step ID requiring approval")
    approval_data: Dict[str, Any] = Field(..., description="Data for approval decision")

class OnboardingCompleteMessage(WebSocketMessage):
    """WebSocket message for onboarding completion"""
    type: str = "onboarding_complete"
    completion_data: Dict[str, Any] = Field(..., description="Completion summary data")

class ErrorMessage(WebSocketMessage):
    """WebSocket message for errors"""
    type: str = "error"
    error_code: Optional[str] = Field(None, description="Error code")
    error_details: Optional[Dict[str, Any]] = Field(None, description="Error details")

# Union type for all possible WebSocket messages
WebSocketMessageType = Union[
    StepUpdateMessage,
    ApprovalRequestMessage,
    OnboardingCompleteMessage,
    ErrorMessage,
    WebSocketMessage
]