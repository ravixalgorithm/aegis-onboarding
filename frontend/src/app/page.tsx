'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientForm } from '@/components/ClientForm';
import { StatusDashboard } from '@/components/StatusDashboard';
import { OnboardingModal } from '@/components/OnboardingModal';
import { ClientDetails } from '@/components/ClientDetails';
import { useWebSocket } from '@/hooks/useWebSocket';
import { onboardingApi, handleApiError } from '@/utils/api';
import { useOnboardingStore } from '@/store/onboardingStore';
import { 
  ClientInput, 
  StepUpdateMessage,
  ApprovalRequestMessage,
  OnboardingCompleteMessage,
  ClientStatus,
  OnboardingProgress
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
  RotateCcw,
  Play,
  BarChart3,
  Users
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const {
    currentClient,
    currentProgress,
    isOnboardingActive,
    currentView,
    showOnboardingModal,
    isLoading,
    error,
    isConnected,
    setCurrentClient,
    setCurrentProgress,
    setOnboardingActive,
    setCurrentView,
    setShowOnboardingModal,
    setLoading,
    setError,
    setConnected,
    addClient,
    updateClient,
    reset
  } = useOnboardingStore();

  const { lastMessage, connect, disconnect } = useWebSocket();

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage || !currentClient?.id) return;

    console.log('Received WebSocket message:', lastMessage);

    switch (lastMessage.type) {
      case 'step_update':
        const stepUpdate = lastMessage as StepUpdateMessage;
        if (currentProgress) {
          const updatedSteps = currentProgress.steps.map(step => 
            step.id === stepUpdate.step_id 
              ? { 
                  ...step, 
                  status: stepUpdate.step_status as any,
                  ...(stepUpdate.data.metadata && { metadata: stepUpdate.data.metadata })
                }
              : step
          );
          
          const updatedProgress = {
            ...currentProgress,
            steps: updatedSteps,
            progress_percentage: stepUpdate.progress_percentage,
            ...(stepUpdate.data.current_step !== undefined && { 
              current_step: stepUpdate.data.current_step 
            })
          };

          setCurrentProgress(updatedProgress);
        }
        break;
        
      case 'approval_request':
        const approvalRequest = lastMessage as ApprovalRequestMessage;
        if (currentProgress) {
          const updatedSteps = currentProgress.steps.map(step => 
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
          
          setCurrentProgress({ ...currentProgress, steps: updatedSteps });
        }
        break;
        
      case 'onboarding_complete':
        const completion = lastMessage as OnboardingCompleteMessage;
        if (currentProgress) {
          const completedProgress = {
            ...currentProgress,
            overall_status: ClientStatus.COMPLETED,
            progress_percentage: 100,
            completed_at: completion.completion_data.completed_at
          };
          setCurrentProgress(completedProgress);
        }

        // Update client status
        if (currentClient) {
          const updatedClient = {
            ...currentClient,
            status: ClientStatus.COMPLETED,
            updated_at: new Date().toISOString()
          };
          setCurrentClient(updatedClient);
          updateClient(currentClient.id, { 
            status: ClientStatus.COMPLETED,
            updated_at: new Date().toISOString()
          });
        }

        // Switch to completion view
        setCurrentView('complete');
        break;
        
      case 'error':
        setError(lastMessage.data.message || 'An error occurred during onboarding');
        break;
    }
  }, [lastMessage, currentClient?.id, setCurrentProgress, setCurrentClient, updateClient, setCurrentView, setError]);

  // Update WebSocket connection status
  useEffect(() => {
    setConnected(false); // Set based on actual WebSocket connection
  }, [setConnected]);

  const handleStartOnboarding = async (clientData: ClientInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await onboardingApi.start(clientData);
      
      const client = response.data.client;
      const progress = response.data.progress;

      setCurrentClient(client);
      setCurrentProgress(progress);
      setOnboardingActive(true);
      setCurrentView('orchestration');
      setShowOnboardingModal(false);
      
      // Add to client history
      addClient(client);
      
      // Connect to WebSocket for real-time updates
      connect(response.client_id);
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to start onboarding:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (stepId: string, approved: boolean, feedback?: string) => {
    if (!currentClient?.id) return;

    try {
      await onboardingApi.approve(currentClient.id, stepId, approved, feedback);
      
      // The response will come through WebSocket, so we don't need to update state here
      console.log(`Step ${stepId} ${approved ? 'approved' : 'rejected'}`);
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to handle approval:', err);
    }
  };

  const handleReset = () => {
    reset();
    disconnect();
  };

  const handleRetry = async () => {
    if (!currentClient?.id) return;
    
    try {
      setError(null);
      const response = await onboardingApi.status(currentClient.id);
      setCurrentProgress(response.data.progress || null);
      
      if (!isConnected) {
        connect(currentClient.id);
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'orchestration':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Reset Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Onboarding In Progress</span>
                  </CardTitle>
                  <CardDescription>
                    Your onboarding process is now running. Watch the progress on the right.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full"
                  >
                    Start New Onboarding
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Status Dashboard */}
            <div>
              <StatusDashboard 
                progress={currentProgress}
                onApprove={handleApproval}
              />
            </div>
          </div>
        );

      case 'complete':
        return currentClient && currentProgress ? (
          <ClientDetails
            client={currentClient}
            progress={currentProgress}
            onStartNew={() => {
              handleReset();
              setShowOnboardingModal(true);
            }}
            onViewDashboard={() => setCurrentView('dashboard')}
          />
        ) : null;

      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - CTA Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col justify-center"
            >
              <Card className="card-glass card-hover-glass">
                <CardHeader className="text-center">
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
                    className="mb-4"
                  >
                    <Sparkles className="h-16 w-16 text-primary mx-auto" />
                  </motion.div>
                  <CardTitle className="text-2xl gradient-text mb-4">
                    Ready to Transform Your Onboarding?
                  </CardTitle>
                  <CardDescription className="text-base">
                    Start onboarding a new client with our AI-powered automation platform. 
                    Save hours of manual work and impress your clients with seamless setup.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button
                    onClick={() => setShowOnboardingModal(true)}
                    size="lg"
                    className="w-full h-14 text-lg font-semibold btn-press"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Onboarding New Client
                  </Button>
                  
                  <div className="text-center">
                    <Link href="/dashboard">
                      <Button variant="ghost" className="text-sm">
                        <Users className="h-4 w-4 mr-2" />
                        View Client Dashboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Preview Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Quick Stats</span>
                  </CardTitle>
                  <CardDescription>
                    See how Aegis Onboarding transforms your workflow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/50 rounded-lg p-4 border border-white/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Avg. Time Saved</span>
                        <span className="text-lg font-bold text-green-600">5h 20m</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">vs manual process</p>
                    </div>
                    
                    <div className="bg-white/50 rounded-lg p-4 border border-white/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className="text-lg font-bold text-blue-600">94%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">automated completion</p>
                    </div>
                    
                    <div className="bg-white/50 rounded-lg p-4 border border-white/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cost Savings</span>
                        <span className="text-lg font-bold text-purple-600">$2,150</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">per month average</p>
                    </div>
                  </div>
                  
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      See Full Analytics
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        );
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
          <h1 className="text-4xl md:text-6xl font-bold gradient-text">
            {currentView === 'complete' ? 'Onboarding Complete!' : 
             currentView === 'orchestration' ? 'Live Onboarding in Progress' :
             'Welcome to Aegis Onboarding'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {currentView === 'complete' ? 'Your client has been successfully onboarded!' :
             currentView === 'orchestration' ? 'Watch as AI handles your client setup automatically' :
             'Automate your client onboarding process with AI-powered workflows'}
          </p>
        </div>

        {/* Features - only show on landing */}
        {currentView === 'landing' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="card-glass card-hover-glass">
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
              <Card className="card-glass card-hover-glass">
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
              <Card className="card-glass card-hover-glass">
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
        )}
      </motion.div>

      {/* Connection Status */}
      {isOnboardingActive && (
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
      {renderCurrentView()}

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onSubmit={handleStartOnboarding}
        isLoading={isLoading}
      />
    </div>
  );
}