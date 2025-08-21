import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusDashboardProps, ClientStatus } from '@/types';
import { ProgressStep } from './ProgressStep';
import { ApprovalModal } from './ApprovalModal';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  User,
  Calendar,
  Briefcase
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const StatusDashboard: React.FC<StatusDashboardProps> = ({ 
  progress, 
  onApprove 
}) => {
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    stepId: string;
    stepName: string;
    approvalData: Record<string, any>;
  }>({
    isOpen: false,
    stepId: '',
    stepName: '',
    approvalData: {},
  });

  const handleApprovalRequest = useCallback((stepId: string, stepName: string, approvalData: Record<string, any>) => {
    setApprovalModal({
      isOpen: true,
      stepId,
      stepName,
      approvalData,
    });
  }, []);

  const handleApprovalResponse = useCallback(async (approved: boolean, feedback?: string) => {
    await onApprove(approvalModal.stepId, approved, feedback);
    setApprovalModal(prev => ({ ...prev, isOpen: false }));
  }, [onApprove, approvalModal.stepId]);

  const closeApprovalModal = useCallback(() => {
    setApprovalModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  if (!progress) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Waiting for Onboarding to Start
        </h3>
        <p className="text-gray-500">
          Fill out the form to begin your automated onboarding process.
        </p>
      </motion.div>
    );
  }

  const getStatusIcon = () => {
    switch (progress.overall_status) {
      case ClientStatus.COMPLETED:
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case ClientStatus.FAILED:
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      case ClientStatus.IN_PROGRESS:
        return <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-8 w-8 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (progress.overall_status) {
      case ClientStatus.COMPLETED:
        return 'Onboarding Complete!';
      case ClientStatus.FAILED:
        return 'Onboarding Failed';
      case ClientStatus.IN_PROGRESS:
        return 'Onboarding in Progress...';
      default:
        return 'Onboarding Pending';
    }
  };

  const getStatusColor = () => {
    switch (progress.overall_status) {
      case ClientStatus.COMPLETED:
        return 'text-green-600';
      case ClientStatus.FAILED:
        return 'text-red-600';
      case ClientStatus.IN_PROGRESS:
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const completedSteps = progress.steps.filter(step => step.status === 'completed').length;
  const totalSteps = progress.steps.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getStatusIcon()}
              <div>
                <CardTitle className={cn("text-2xl font-bold", getStatusColor())}>
                  {getStatusText()}
                </CardTitle>
                <p className="text-gray-500 mt-1">
                  {completedSteps} of {totalSteps} steps completed
                </p>
              </div>
            </div>
            {progress.overall_status === ClientStatus.COMPLETED && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <Sparkles className="h-12 w-12 text-yellow-500" />
              </motion.div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">
                {Math.round(progress.progress_percentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.progress_percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "h-3 rounded-full transition-colors duration-300",
                  progress.overall_status === ClientStatus.COMPLETED 
                    ? "bg-green-500" 
                    : progress.overall_status === ClientStatus.FAILED
                    ? "bg-red-500"
                    : "bg-primary"
                )}
              />
            </div>
          </div>

          {/* Timing Information */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            {progress.started_at && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Started</p>
                  <p className="text-sm font-medium">
                    {new Date(progress.started_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {progress.completed_at && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-sm font-medium">
                    {new Date(progress.completed_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Client ID</p>
                <p className="text-sm font-medium font-mono">
                  {progress.client_id.slice(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5" />
            <span>Onboarding Steps</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <AnimatePresence>
            {progress.steps.map((step, index) => {
              const isActive = index === progress.current_step;
              const isCompleted = step.status === 'completed';
              
              return (
                <div key={step.id}>
                  <ProgressStep
                    step={step}
                    isActive={isActive}
                    isCompleted={isCompleted}
                    index={index}
                  />
                  
                  {/* Approval Button for human approval steps */}
                  {step.id === 'human_approval' && step.status === 'in_progress' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="ml-14 mb-4"
                    >
                      <Button
                        onClick={() => handleApprovalRequest(
                          step.id,
                          step.name,
                          step.metadata?.approval_data || {}
                        )}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Review & Approve
                      </Button>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Completion Celebration */}
      {progress.overall_status === ClientStatus.COMPLETED && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="text-center py-8">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Sparkles className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                Welcome to the Team! 🎉
              </h3>
              <p className="text-green-700 mb-4">
                Your onboarding is complete! All systems are set up and ready to go.
              </p>
              <div className="text-sm text-green-600">
                <p>✓ Project folder created</p>
                <p>✓ Contract signed and approved</p>
                <p>✓ Communication channels set up</p>
                <p>✓ Development environment ready</p>
                <p>✓ Project management tools configured</p>
                <p>✓ Billing and invoicing set up</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={approvalModal.isOpen}
        onClose={closeApprovalModal}
        onApprove={handleApprovalResponse}
        approvalData={approvalModal.approvalData}
        stepName={approvalModal.stepName}
      />
    </motion.div>
  );
};