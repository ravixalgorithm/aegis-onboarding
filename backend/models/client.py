from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ProjectType(str, Enum):
    """Project type enumeration"""
    WEB_DEVELOPMENT = "web_development"
    MOBILE_APP = "mobile_app"
    DESIGN = "design"
    MARKETING = "marketing"
    CONSULTING = "consulting"
    OTHER = "other"

class ClientStatus(str, Enum):
    """Client onboarding status enumeration"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class ClientInput(BaseModel):
    """Client input data model for onboarding form"""
    name: str = Field(..., min_length=2, max_length=100, description="Client's full name")
    email: EmailStr = Field(..., description="Client's email address")
    company: Optional[str] = Field(None, max_length=100, description="Client's company name")
    phone: Optional[str] = Field(None, description="Client's phone number")
    project_type: ProjectType = Field(..., description="Type of project")
    project_scope: str = Field(..., min_length=10, max_length=1000, description="Detailed project scope")
    budget_range: Optional[str] = Field(None, description="Expected budget range")
    timeline: Optional[str] = Field(None, description="Expected project timeline")
    additional_notes: Optional[str] = Field(None, max_length=500, description="Additional notes or requirements")

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()

    @validator('project_scope')
    def validate_project_scope(cls, v):
        if not v.strip():
            raise ValueError('Project scope cannot be empty')
        return v.strip()

class Client(BaseModel):
    """Client data model with tracking information"""
    id: str = Field(..., description="Unique client identifier")
    name: str
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None
    project_type: ProjectType
    project_scope: str
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    additional_notes: Optional[str] = None
    status: ClientStatus = ClientStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Onboarding tracking
    drive_folder_id: Optional[str] = None
    contract_doc_id: Optional[str] = None
    slack_channel_id: Optional[str] = None
    github_repo_url: Optional[str] = None
    notion_board_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    invoice_id: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class OnboardingStep(BaseModel):
    """Individual onboarding step model"""
    id: str = Field(..., description="Step identifier")
    name: str = Field(..., description="Step name")
    description: str = Field(..., description="Step description")
    status: str = Field(default="pending", description="Step status: pending, in_progress, completed, failed")
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class OnboardingProgress(BaseModel):
    """Onboarding progress tracking model"""
    client_id: str
    steps: List[OnboardingStep]
    current_step: int = 0
    overall_status: ClientStatus = ClientStatus.PENDING
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    progress_percentage: float = 0.0

    @validator('progress_percentage')
    def validate_percentage(cls, v):
        return max(0.0, min(100.0, v))

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }