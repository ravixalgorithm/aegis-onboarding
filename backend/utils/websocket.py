from fastapi import WebSocket
from typing import Dict, List, Optional
import json
import logging
from models.responses import WebSocketMessageType, WebSocketMessage

logger = logging.getLogger(__name__)

class ConnectionManager:
    """WebSocket connection manager for real-time updates"""
    
    def __init__(self):
        # Store active connections by client_id
        self.active_connections: Dict[str, WebSocket] = {}
        # Store client metadata
        self.client_metadata: Dict[str, Dict] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.client_metadata[client_id] = {
            "connected_at": None,
            "last_activity": None
        }
        logger.info(f"Client {client_id} connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, client_id: str):
        """Remove a WebSocket connection"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        if client_id in self.client_metadata:
            del self.client_metadata[client_id]
        logger.info(f"Client {client_id} disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, client_id: str):
        """Send a message to a specific client"""
        if client_id in self.active_connections:
            try:
                websocket = self.active_connections[client_id]
                await websocket.send_text(message)
                logger.debug(f"Sent message to {client_id}: {message}")
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {e}")
                self.disconnect(client_id)
    
    async def send_personal_json(self, data: dict, client_id: str):
        """Send JSON data to a specific client"""
        if client_id in self.active_connections:
            try:
                websocket = self.active_connections[client_id]
                await websocket.send_json(data)
                logger.debug(f"Sent JSON to {client_id}: {data}")
            except Exception as e:
                logger.error(f"Error sending JSON to {client_id}: {e}")
                self.disconnect(client_id)
    
    async def send_websocket_message(self, message: WebSocketMessageType, client_id: str):
        """Send a structured WebSocket message to a specific client"""
        try:
            message_dict = message.dict() if hasattr(message, 'dict') else message
            await self.send_personal_json(message_dict, client_id)
        except Exception as e:
            logger.error(f"Error sending WebSocket message to {client_id}: {e}")
    
    async def broadcast_message(self, message: str):
        """Broadcast a message to all connected clients"""
        disconnected_clients = []
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting to {client_id}: {e}")
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    async def broadcast_json(self, data: dict):
        """Broadcast JSON data to all connected clients"""
        disconnected_clients = []
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(data)
            except Exception as e:
                logger.error(f"Error broadcasting JSON to {client_id}: {e}")
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    def get_connected_clients(self) -> List[str]:
        """Get list of connected client IDs"""
        return list(self.active_connections.keys())
    
    def is_client_connected(self, client_id: str) -> bool:
        """Check if a client is connected"""
        return client_id in self.active_connections
    
    def get_connection_count(self) -> int:
        """Get total number of active connections"""
        return len(self.active_connections)

# Global connection manager instance
manager = ConnectionManager()

# Convenience functions for common operations
async def notify_step_update(client_id: str, step_id: str, status: str, progress: float, metadata: Optional[dict] = None):
    """Notify client of step update"""
    from models.responses import StepUpdateMessage
    
    message = StepUpdateMessage(
        client_id=client_id,
        step_id=step_id,
        step_status=status,
        progress_percentage=progress,
        data=metadata or {}
    )
    await manager.send_websocket_message(message, client_id)

async def notify_approval_required(client_id: str, step_id: str, approval_data: dict):
    """Notify client that approval is required"""
    from models.responses import ApprovalRequestMessage
    
    message = ApprovalRequestMessage(
        client_id=client_id,
        step_id=step_id,
        approval_data=approval_data,
        data={"approval_required": True}
    )
    await manager.send_websocket_message(message, client_id)

async def notify_onboarding_complete(client_id: str, completion_data: dict):
    """Notify client that onboarding is complete"""
    from models.responses import OnboardingCompleteMessage
    
    message = OnboardingCompleteMessage(
        client_id=client_id,
        completion_data=completion_data,
        data=completion_data
    )
    await manager.send_websocket_message(message, client_id)

async def notify_error(client_id: str, error_message: str, error_code: Optional[str] = None, error_details: Optional[dict] = None):
    """Notify client of an error"""
    from models.responses import ErrorMessage
    
    message = ErrorMessage(
        client_id=client_id,
        error_code=error_code,
        error_details=error_details or {},
        data={"message": error_message}
    )
    await manager.send_websocket_message(message, client_id)