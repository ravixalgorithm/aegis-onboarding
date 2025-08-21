import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { WebSocketMessage, UseWebSocketReturn } from '@/types';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const clientIdRef = useRef<string | null>(null);

  const connect = useCallback((clientId: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    clientIdRef.current = clientId;
    const wsUrl = `${WS_BASE_URL}/ws/${clientId}`;
    
    try {
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('WebSocket connected for client:', clientId);
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          setLastMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          // Handle plain text messages
          setLastMessage({
            type: 'message',
            client_id: clientId,
            data: { message: event.data },
            timestamp: new Date().toISOString(),
          });
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds if it wasn't a manual close
        if (event.code !== 1000 && clientIdRef.current) {
          setTimeout(() => {
            if (clientIdRef.current) {
              connect(clientIdRef.current);
            }
          }, 3000);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      socketRef.current = socket;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      clientIdRef.current = null;
      socketRef.current.close(1000, 'Manual disconnect');
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const messageString = typeof message === 'string' ? message : JSON.stringify(message);
      socketRef.current.send(messageString);
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
};

// Alternative hook using socket.io-client (commented out for now)
/*
export const useSocketIO = (clientId?: string): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback((id: string) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(WS_BASE_URL, {
      query: { client_id: id },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected for client:', id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
    });

    socket.on('message', (data: WebSocketMessage) => {
      console.log('Socket.IO message received:', data);
      setLastMessage(data);
    });

    socket.on('step_update', (data: WebSocketMessage) => {
      setLastMessage({ ...data, type: 'step_update' });
    });

    socket.on('approval_request', (data: WebSocketMessage) => {
      setLastMessage({ ...data, type: 'approval_request' });
    });

    socket.on('onboarding_complete', (data: WebSocketMessage) => {
      setLastMessage({ ...data, type: 'onboarding_complete' });
    });

    socket.on('error', (data: WebSocketMessage) => {
      setLastMessage({ ...data, type: 'error' });
    });

    socketRef.current = socket;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (socketRef.current) {
      socketRef.current.emit('message', message);
    }
  }, []);

  useEffect(() => {
    if (clientId) {
      connect(clientId);
    }

    return () => {
      disconnect();
    };
  }, [clientId, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
};
*/

// Utility hook for handling specific WebSocket message types
export const useWebSocketHandlers = (
  onStepUpdate?: (data: any) => void,
  onApprovalRequest?: (data: any) => void,
  onOnboardingComplete?: (data: any) => void,
  onError?: (data: any) => void
) => {
  const { lastMessage, ...websocket } = useWebSocket();

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'step_update':
        onStepUpdate?.(lastMessage.data);
        break;
      case 'approval_request':
        onApprovalRequest?.(lastMessage.data);
        break;
      case 'onboarding_complete':
        onOnboardingComplete?.(lastMessage.data);
        break;
      case 'error':
        onError?.(lastMessage.data);
        break;
      default:
        console.log('Unhandled WebSocket message type:', lastMessage.type);
    }
  }, [lastMessage, onStepUpdate, onApprovalRequest, onOnboardingComplete, onError]);

  return {
    ...websocket,
    lastMessage,
  };
};