import os
import logging
import asyncio
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime

from models.client import Client, OnboardingStep, OnboardingProgress, ClientStatus
from utils.websocket import notify_step_update, notify_approval_required, notify_onboarding_complete, notify_error

logger = logging.getLogger(__name__)

class OnboardingAgent:
    """Portia-powered onboarding agent for automated client setup"""
    
    def __init__(self):
        self.portia_api_key = os.getenv("PORTIA_API_KEY")
        if not self.portia_api_key:
            logger.warning("PORTIA_API_KEY not set. Agent will run in simulation mode.")
        
        # Define the onboarding workflow steps
        self.workflow_steps = [
            {
                "id": "create_drive_folder",
                "name": "Create Google Drive Folder",
                "description": "Setting up dedicated project folder in Google Drive",
                "requires_approval": False,
                "estimated_duration": 30  # seconds
            },
            {
                "id": "draft_contract",
                "name": "Draft Contract",
                "description": "Generating project contract in Google Docs",
                "requires_approval": True,
                "estimated_duration": 60
            },
            {
                "id": "human_approval",
                "name": "Contract Review",
                "description": "Waiting for human approval of the contract",
                "requires_approval": True,
                "estimated_duration": 0  # Manual step
            },
            {
                "id": "create_communication_channel",
                "name": "Setup Communication",
                "description": "Creating Slack/Discord channel for project communication",
                "requires_approval": False,
                "estimated_duration": 45
            },
            {
                "id": "setup_github_repo",
                "name": "Create GitHub Repository",
                "description": "Setting up GitHub repository for project code",
                "requires_approval": False,
                "estimated_duration": 40
            },
            {
                "id": "create_notion_board",
                "name": "Setup Project Board",
                "description": "Creating Notion project management board",
                "requires_approval": False,
                "estimated_duration": 50
            },
            {
                "id": "send_welcome_email",
                "name": "Send Welcome Email",
                "description": "Sending welcome email with calendar invite",
                "requires_approval": False,
                "estimated_duration": 35
            },
            {
                "id": "setup_billing",
                "name": "Setup Billing",
                "description": "Creating Stripe customer and initial invoice",
                "requires_approval": False,
                "estimated_duration": 45
            }
        ]
        
        # Track active onboarding processes
        self.active_processes: Dict[str, OnboardingProgress] = {}
    
    def create_onboarding_steps(self, client_id: str) -> List[OnboardingStep]:
        """Create onboarding steps for a client"""
        steps = []
        for step_config in self.workflow_steps:
            step = OnboardingStep(
                id=step_config["id"],
                name=step_config["name"],
                description=step_config["description"],
                status="pending"
            )
            steps.append(step)
        return steps
    
    async def start_onboarding(self, client: Client) -> OnboardingProgress:
        """Start the onboarding process for a client"""
        logger.info(f"Starting onboarding for client {client.id}: {client.name}")
        
        # Create onboarding progress tracking
        steps = self.create_onboarding_steps(client.id)
        progress = OnboardingProgress(
            client_id=client.id,
            steps=steps,
            current_step=0,
            overall_status=ClientStatus.IN_PROGRESS,
            started_at=datetime.utcnow(),
            progress_percentage=0.0
        )
        
        # Store the progress
        self.active_processes[client.id] = progress
        
        # Start the workflow
        asyncio.create_task(self._execute_workflow(client, progress))
        
        return progress
    
    async def _execute_workflow(self, client: Client, progress: OnboardingProgress):
        """Execute the onboarding workflow"""
        try:
            total_steps = len(progress.steps)
            
            for i, step in enumerate(progress.steps):
                # Update current step
                progress.current_step = i
                step.status = "in_progress"
                step.started_at = datetime.utcnow()
                
                # Calculate progress percentage
                progress.progress_percentage = (i / total_steps) * 100
                
                # Notify frontend of step start
                await notify_step_update(
                    client.id,
                    step.id,
                    "in_progress",
                    progress.progress_percentage,
                    {"step_name": step.name, "description": step.description}
                )
                
                logger.info(f"Executing step {step.id} for client {client.id}")
                
                # Execute the step
                try:
                    result = await self._execute_step(client, step)
                    
                    if step.id == "human_approval" and result.get("requires_approval"):
                        # Handle approval step
                        await notify_approval_required(
                            client.id,
                            step.id,
                            result.get("approval_data", {})
                        )
                        # Wait for approval (this would be handled by the approval endpoint)
                        return  # Pause workflow until approval
                    
                    # Step completed successfully
                    step.status = "completed"
                    step.completed_at = datetime.utcnow()
                    step.metadata = result
                    
                    # Update progress
                    progress.progress_percentage = ((i + 1) / total_steps) * 100
                    
                    # Notify frontend of step completion
                    await notify_step_update(
                        client.id,
                        step.id,
                        "completed",
                        progress.progress_percentage,
                        result
                    )
                    
                except Exception as e:
                    logger.error(f"Error executing step {step.id} for client {client.id}: {e}")
                    step.status = "failed"
                    step.error_message = str(e)
                    
                    # Notify frontend of error
                    await notify_error(
                        client.id,
                        f"Failed to complete step: {step.name}",
                        error_code=f"STEP_{step.id.upper()}_FAILED",
                        error_details={"step_id": step.id, "error": str(e)}
                    )
                    
                    # Mark overall process as failed
                    progress.overall_status = ClientStatus.FAILED
                    return
                
                # Add delay between steps for better UX
                await asyncio.sleep(2)
            
            # All steps completed successfully
            progress.overall_status = ClientStatus.COMPLETED
            progress.completed_at = datetime.utcnow()
            progress.progress_percentage = 100.0
            
            # Notify frontend of completion
            await notify_onboarding_complete(
                client.id,
                {
                    "client_name": client.name,
                    "completed_at": progress.completed_at.isoformat(),
                    "total_steps": total_steps,
                    "summary": self._generate_completion_summary(client, progress)
                }
            )
            
            logger.info(f"Onboarding completed successfully for client {client.id}")
            
        except Exception as e:
            logger.error(f"Workflow execution failed for client {client.id}: {e}")
            progress.overall_status = ClientStatus.FAILED
            await notify_error(
                client.id,
                f"Onboarding workflow failed: {str(e)}",
                error_code="WORKFLOW_FAILED"
            )
    
    async def _execute_step(self, client: Client, step: OnboardingStep) -> Dict[str, Any]:
        """Execute an individual onboarding step"""
        step_handlers = {
            "create_drive_folder": self._create_drive_folder,
            "draft_contract": self._draft_contract,
            "human_approval": self._handle_human_approval,
            "create_communication_channel": self._create_communication_channel,
            "setup_github_repo": self._setup_github_repo,
            "create_notion_board": self._create_notion_board,
            "send_welcome_email": self._send_welcome_email,
            "setup_billing": self._setup_billing
        }
        
        handler = step_handlers.get(step.id)
        if not handler:
            raise ValueError(f"No handler found for step: {step.id}")
        
        return await handler(client, step)
    
    async def _create_drive_folder(self, client: Client, step: OnboardingStep) -> Dict[str, Any]:
        """Create Google Drive folder for the client"""
        # Simulate API call delay
        await asyncio.sleep(3)
        
        folder_name = f"{client.name} - {client.project_type.replace('_', ' ').title()} Project"
        folder_id = f"drive_folder_{uuid.uuid4().hex[:8]}"
        
        return {
            "folder_id": folder_id,
            "folder_name": folder_name,
            "folder_url": f"https://drive.google.com/drive/folders/{folder_id}",
            "permissions": "client_read_write"
        }
    
    async def _draft_contract(self, client: Client, step: OnboardingStep) -> Dict[str, Any]:
        """Draft contract in Google Docs"""
        await asyncio.sleep(4)
        
        doc_id = f"doc_{uuid.uuid4().hex[:8]}"
        doc_title = f"Service Agreement - {client.name}"
        
        return {
            "document_id": doc_id,
            "document_title": doc_title,
            "document_url": f"https://docs.google.com/document/d/{doc_id}",
            "template_used": "standard_service_agreement",
            "requires_approval": True
        }
    
    async def _handle_human_approval(self, client: Client, step: OnboardingStep) -> Dict[str, Any]:
        """Handle human approval checkpoint"""
        return {
            "requires_approval": True,
            "approval_data": {
                "contract_url": "https://docs.google.com/document/d/sample_doc_id",
                "client_name": client.name,
                "project_scope": client.project_scope,
                "approval_message": f"Please review the contract for {client.name} before proceeding."
            }
        }
    
    async def _create_communication_channel(self, client: Client, step: OnboardingStep) -> Dict[str, Any]:
        """Create Slack/Discord communication channel"""
        await asyncio.sleep(3)
        
        channel_name = f"project-{client.name.lower().replace(' ', '-')}"
        channel_id = f"C{uuid.uuid4().hex[:8].upper()}"
        
        return {
            "channel_id": channel_id,
            "channel_name": channel_name,
            "platform": "slack",
            "invite_url": f"https://slack.com/channels/{channel_id}",
            "members_added": ["client", "project_manager"]
        }
    
    async def _setup_github_repo(self, client: Client, step: OnboardingStep) -> Dict[str, Any]:
        """Setup GitHub repository"""
        await asyncio.sleep(3)
        
        repo_name = f"{client.name.lower().replace(' ', '-')}-project"
        repo_url = f"https://github.com/your-org/{repo_name}"
        
        return {
            "repository_url": repo_url,
            "repository_name": repo_name,
            "default_branch": "main",
            "collaborators_added": [client.email],
            "initial_structure": True
        }
    
    async def _create_notion_board(self, client: Client, step: OnboardingStep) -> Dict[str, Any]:
        """Create Notion project board"""
        await asyncio.sleep(4)
        
        board_id = f"notion_{uuid.uuid4().hex[:8]}"
        board_title = f"{client.name} - Project Board"
        
        return {
            "board_id": board_id,
            "board_title": board_title,
            "board_url": f"https://notion.so/{board_id}",
            "template": "project_management",
            "sections_created": ["Backlog", "In Progress", "Review", "Completed"]
        }
    
    async def _send_welcome_email(self, client: Client, step: OnboardingStep) -> Dict[str, Any]:
        """Send welcome email with calendar invite"""
        await asyncio.sleep(3)
        
        return {
            "email_sent": True,
            "recipient": client.email,
            "subject": f"Welcome to your project, {client.name}!",
            "calendar_invite": True,
            "meeting_scheduled": "2024-12-01T10:00:00Z",
            "meeting_link": "https://meet.google.com/sample-meeting-id"
        }
    
    async def _setup_billing(self, client: Client, step: OnboardingStep) -> Dict[str, Any]:
        """Setup Stripe billing"""
        await asyncio.sleep(3)
        
        customer_id = f"cus_{uuid.uuid4().hex[:8]}"
        invoice_id = f"in_{uuid.uuid4().hex[:8]}"
        
        return {
            "stripe_customer_id": customer_id,
            "invoice_id": invoice_id,
            "invoice_url": f"https://dashboard.stripe.com/invoices/{invoice_id}",
            "amount": client.budget_range or "TBD",
            "payment_terms": "Net 30"
        }
    
    def _generate_completion_summary(self, client: Client, progress: OnboardingProgress) -> Dict[str, Any]:
        """Generate completion summary"""
        completed_steps = [step for step in progress.steps if step.status == "completed"]
        
        return {
            "client_name": client.name,
            "project_type": client.project_type,
            "total_steps": len(progress.steps),
            "completed_steps": len(completed_steps),
            "duration_minutes": (progress.completed_at - progress.started_at).total_seconds() / 60,
            "resources_created": [
                step.metadata for step in completed_steps 
                if step.metadata and step.metadata.get("repository_url") or step.metadata.get("folder_url") or step.metadata.get("board_url")
            ]
        }
    
    async def approve_step(self, client_id: str, step_id: str, approved: bool, feedback: Optional[str] = None) -> bool:
        """Handle approval for a step"""
        if client_id not in self.active_processes:
            logger.error(f"No active process found for client {client_id}")
            return False
        
        progress = self.active_processes[client_id]
        
        # Find the step
        step = next((s for s in progress.steps if s.id == step_id), None)
        if not step:
            logger.error(f"Step {step_id} not found for client {client_id}")
            return False
        
        if approved:
            step.status = "completed"
            step.completed_at = datetime.utcnow()
            step.metadata = {"approved": True, "feedback": feedback}
            
            # Continue workflow from next step
            # This would typically resume the workflow
            logger.info(f"Step {step_id} approved for client {client_id}")
            return True
        else:
            step.status = "failed"
            step.error_message = f"Approval rejected: {feedback}"
            progress.overall_status = ClientStatus.FAILED
            
            await notify_error(
                client_id,
                f"Step rejected: {step.name}",
                error_code="APPROVAL_REJECTED",
                error_details={"feedback": feedback}
            )
            
            logger.info(f"Step {step_id} rejected for client {client_id}: {feedback}")
            return False
    
    def get_progress(self, client_id: str) -> Optional[OnboardingProgress]:
        """Get onboarding progress for a client"""
        return self.active_processes.get(client_id)

# Global agent instance
onboarding_agent = OnboardingAgent()