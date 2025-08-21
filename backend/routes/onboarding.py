from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
import uuid
import logging
from typing import Optional

from models.client import ClientInput, Client, ClientStatus
from models.responses import (
    SuccessResponse, ErrorResponse, ClientCreatedResponse, 
    OnboardingStatusResponse, ApprovalResponse, ApprovalRequiredResponse
)
from agents.onboarding_agent import onboarding_agent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

# In-memory storage for demo purposes (replace with actual database)
clients_db: dict[str, Client] = {}

@router.post("/start", response_model=ClientCreatedResponse)
async def start_onboarding(client_input: ClientInput):
    """Start the onboarding process for a new client"""
    try:
        # Generate unique client ID
        client_id = str(uuid.uuid4())
        
        # Create client record
        client = Client(
            id=client_id,
            name=client_input.name,
            email=client_input.email,
            company=client_input.company,
            phone=client_input.phone,
            project_type=client_input.project_type,
            project_scope=client_input.project_scope,
            budget_range=client_input.budget_range,
            timeline=client_input.timeline,
            additional_notes=client_input.additional_notes,
            status=ClientStatus.PENDING
        )
        
        # Store client
        clients_db[client_id] = client
        
        # Start onboarding process
        progress = await onboarding_agent.start_onboarding(client)
        
        # Update client status
        client.status = ClientStatus.IN_PROGRESS
        
        logger.info(f"Started onboarding for client {client_id}: {client.name}")
        
        return ClientCreatedResponse(
            message=f"Onboarding started successfully for {client.name}",
            client_id=client_id,
            data={
                "client": client.dict(),
                "progress": progress.dict()
            }
        )
        
    except Exception as e:
        logger.error(f"Error starting onboarding: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start onboarding: {str(e)}"
        )

@router.get("/status/{client_id}", response_model=OnboardingStatusResponse)
async def get_onboarding_status(client_id: str):
    """Get the current onboarding status for a client"""
    try:
        # Check if client exists
        if client_id not in clients_db:
            raise HTTPException(
                status_code=404,
                detail=f"Client {client_id} not found"
            )
        
        client = clients_db[client_id]
        
        # Get progress from agent
        progress = onboarding_agent.get_progress(client_id)
        
        if not progress:
            # If no progress found, client might be pending
            return OnboardingStatusResponse(
                message="Client onboarding status retrieved",
                client_id=client_id,
                status=client.status.value,
                progress_percentage=0.0,
                current_step="Waiting to start",
                steps=[],
                data={
                    "client": client.dict(),
                    "progress": None
                }
            )
        
        # Format steps for response
        steps_data = []
        for step in progress.steps:
            step_data = {
                "id": step.id,
                "name": step.name,
                "description": step.description,
                "status": step.status,
                "started_at": step.started_at.isoformat() if step.started_at else None,
                "completed_at": step.completed_at.isoformat() if step.completed_at else None,
                "error_message": step.error_message,
                "metadata": step.metadata
            }
            steps_data.append(step_data)
        
        current_step_name = "Completed"
        if progress.current_step < len(progress.steps):
            current_step_name = progress.steps[progress.current_step].name
        
        return OnboardingStatusResponse(
            message="Onboarding status retrieved successfully",
            client_id=client_id,
            status=progress.overall_status.value,
            progress_percentage=progress.progress_percentage,
            current_step=current_step_name,
            steps=steps_data,
            data={
                "client": client.dict(),
                "progress": progress.dict(),
                "started_at": progress.started_at.isoformat() if progress.started_at else None,
                "completed_at": progress.completed_at.isoformat() if progress.completed_at else None
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting onboarding status for {client_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get onboarding status: {str(e)}"
        )

@router.post("/approve/{client_id}/{step_id}", response_model=ApprovalResponse)
async def approve_step(
    client_id: str, 
    step_id: str, 
    approved: bool = Query(..., description="Whether to approve the step"),
    feedback: Optional[str] = Query(None, description="Optional feedback for the approval")
):
    """Approve or reject a step that requires human approval"""
    try:
        # Check if client exists
        if client_id not in clients_db:
            raise HTTPException(
                status_code=404,
                detail=f"Client {client_id} not found"
            )
        
        # Handle approval through agent
        result = await onboarding_agent.approve_step(client_id, step_id, approved, feedback)
        
        if not result:
            raise HTTPException(
                status_code=400,
                detail="Failed to process approval. Step may not exist or not require approval."
            )
        
        action = "approved" if approved else "rejected"
        logger.info(f"Step {step_id} {action} for client {client_id}")
        
        return ApprovalResponse(
            message=f"Step {action} successfully",
            client_id=client_id,
            step_id=step_id,
            approved=approved,
            feedback=feedback,
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing approval for {client_id}/{step_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process approval: {str(e)}"
        )

@router.get("/clients", response_model=SuccessResponse)
async def list_clients(
    status: Optional[ClientStatus] = Query(None, description="Filter by client status"),
    limit: int = Query(10, ge=1, le=100, description="Number of clients to return"),
    offset: int = Query(0, ge=0, description="Number of clients to skip")
):
    """List all clients with optional filtering"""
    try:
        clients_list = list(clients_db.values())
        
        # Filter by status if provided
        if status:
            clients_list = [c for c in clients_list if c.status == status]
        
        # Apply pagination
        total = len(clients_list)
        clients_list = clients_list[offset:offset + limit]
        
        # Convert to dict format
        clients_data = [client.dict() for client in clients_list]
        
        return SuccessResponse(
            message=f"Retrieved {len(clients_data)} clients",
            data={
                "clients": clients_data,
                "total": total,
                "limit": limit,
                "offset": offset,
                "has_more": offset + limit < total
            }
        )
        
    except Exception as e:
        logger.error(f"Error listing clients: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list clients: {str(e)}"
        )

@router.get("/client/{client_id}", response_model=SuccessResponse)
async def get_client(client_id: str):
    """Get detailed information about a specific client"""
    try:
        if client_id not in clients_db:
            raise HTTPException(
                status_code=404,
                detail=f"Client {client_id} not found"
            )
        
        client = clients_db[client_id]
        progress = onboarding_agent.get_progress(client_id)
        
        return SuccessResponse(
            message="Client information retrieved successfully",
            data={
                "client": client.dict(),
                "progress": progress.dict() if progress else None
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting client {client_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get client information: {str(e)}"
        )

@router.delete("/client/{client_id}", response_model=SuccessResponse)
async def delete_client(client_id: str):
    """Delete a client and their onboarding process"""
    try:
        if client_id not in clients_db:
            raise HTTPException(
                status_code=404,
                detail=f"Client {client_id} not found"
            )
        
        # Remove from database
        client_name = clients_db[client_id].name
        del clients_db[client_id]
        
        # TODO: Cleanup any ongoing processes and resources
        
        logger.info(f"Deleted client {client_id}: {client_name}")
        
        return SuccessResponse(
            message=f"Client {client_name} deleted successfully",
            data={"client_id": client_id}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting client {client_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete client: {str(e)}"
        )

@router.post("/simulate/{client_id}", response_model=SuccessResponse)
async def simulate_onboarding(client_id: str):
    """Simulate the onboarding process for testing purposes"""
    try:
        if client_id not in clients_db:
            raise HTTPException(
                status_code=404,
                detail=f"Client {client_id} not found"
            )
        
        client = clients_db[client_id]
        
        # Start onboarding if not already started
        if client.status == ClientStatus.PENDING:
            progress = await onboarding_agent.start_onboarding(client)
            client.status = ClientStatus.IN_PROGRESS
        
        return SuccessResponse(
            message=f"Onboarding simulation started for {client.name}",
            data={
                "client_id": client_id,
                "simulation_mode": True,
                "message": "Check WebSocket connection for real-time updates"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error simulating onboarding for {client_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to simulate onboarding: {str(e)}"
        )