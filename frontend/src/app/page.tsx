'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientForm } from '@/components/ClientForm';
import { StatusDashboard } from '@/components/StatusDashboard';
import { useWebSocket } from '@/hooks/useWebSocket';
import { onboardingApi, handleApiError } from '@/utils/api';
import { 
  ClientInput, 
  OnboardingProgress, 
  ClientStatus, 
  StepUpdateMessage,
  ApprovalRequestMessage,
  OnboardingCompleteMessage 
} from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Wifi,
  WifiOff,
  RotateCcw
} from 'lucide-react';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnboardingStarted, setIsOnboardingStarted] = useState(false);

  const { isConnected, lastMessage, connect, disconnect } = useWebSocket();

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage || !clientId) return;

    console.log('Received WebSocket message:', lastMessage);

    switch (lastMessage.type) {
      case 'step_update':
        const stepUpdate = lastMessage as StepUpdateMessage;
        setProgress(prev => {
          if (!prev) return prev;
          
          const updatedSteps = prev.steps.map(step => 
            step.id === stepUpdate.step_id 
              ? { 
                  ...step, 
                  status: stepUpdate.step_status as any,
                  ...(stepUpdate.data.metadata && { metadata: stepUpdate.data.metadata })
                }
              : step
          );
          
          return {
            ...prev,
            steps: updatedSteps,
            progress_percentage: stepUpdate.progress_percentage,
            ...(stepUpdate.data.current_step !== undefined && { 
              current_step: stepUpdate.data.current_step 
            })
          };
        });
        break;
        
      case 'approval_request':
        const approvalRequest = lastMessage as ApprovalRequestMessage;
        setProgress(prev => {
          if (!prev) return prev;
          
          const updatedSteps = prev.steps.map(step => 
            step.id === approvalRequest.step_id 
              ? { 
                  ...step, 
                  status: 'in_progress' as any,
                  metadata: { 
                    ...step.metadata, 
                    approval_data: approvalRequest.approval_data 
                  }
                }
              : step
          );
          
          return { ...prev, steps: updatedSteps };
        });
        break;
        
      case 'onboarding_complete':
        const completion = lastMessage as OnboardingCompleteMessage;
        setProgress(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            overall_status: ClientStatus.COMPLETED,
            progress_percentage: 100,
            completed_at: completion.completion_data.completed_at
          };
        });
        break;
        
      case 'error':
        setError(lastMessage.data.message || 'An error occurred during onboarding');
        break;
    }
  }, [lastMessage, clientId]);

  const handleStartOnboarding = async (clientData: ClientInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await onboardingApi.start(clientData);
      
      setClientId(response.client_id);
      setProgress(response.data.progress);
      setIsOnboardingStarted(true);
      
      // Connect to WebSocket for real-time updates
      connect(response.client_id);
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to start onboarding:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (stepId: string, approved: boolean, feedback?: string) => {
    if (!clientId) return;

    try {
      await onboardingApi.approve(clientId, stepId, approved, feedback);
      
      // The response will come through WebSocket, so we don't need to update state here
      console.log(`Step ${stepId} ${approved ? 'approved' : 'rejected'}`);
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to handle approval:', err);
    }
  };

  const handleReset = () => {
    setProgress(null);
    setClientId(null);
    setIsOnboardingStarted(false);
    setError(null);
    disconnect();
  };

  const handleRetry = async () => {
    if (!clientId) return;
    
    try {
      setError(null);
      const response = await onboardingApi.status(clientId);
      setProgress(response.data.progress || null);
      
      if (!isConnected) {
        connect(clientId);
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="space-y-4">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            <Sparkles className="h-16 w-16 text-primary mx-auto" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold gradient-text">
            Welcome to Aegis Onboarding
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Automate your client onboarding process with AI-powered workflows. 
            From contracts to project setup, we handle it all seamlessly.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-600 text-sm">
                  Complete onboarding in minutes, not hours
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Secure & Reliable</h3>
                <p className="text-gray-600 text-sm">
                  Enterprise-grade security with human oversight
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
                <p className="text-gray-600 text-sm">
                  Watch your onboarding progress in real-time
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Connection Status */}
      {isOnboardingStarted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center"
        >
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4" />
                <span>Real-time updates connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span>Connection lost - retrying...</span>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-red-800 font-medium">Error</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <div className="mt-3 flex space-x-2">
                  <Button
                    onClick={handleRetry}
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-300 hover:bg-red-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                  <Button
                    onClick={() => setError(null)}
                    size="sm"
                    variant="ghost"
                    className="text-red-700 hover:bg-red-50"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form or Reset */}
        <div>
          {!isOnboardingStarted ? (
            <ClientForm 
              onSubmit={handleStartOnboarding}
              isLoading={isLoading}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Onboarding Started</span>
                  </CardTitle>
                  <CardDescription>
                    Your onboarding process is now running. Watch the progress on the right.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full"
                  >
                    Start New Onboarding
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column - Status Dashboard */}
        <div>
          <StatusDashboard 
            progress={progress}
            onApprove={handleApproval}
          />
        </div>
      </div>
    </div>
  );
}