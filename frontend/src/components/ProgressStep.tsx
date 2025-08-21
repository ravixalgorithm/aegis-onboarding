import React from 'react';
import { motion } from 'framer-motion';
import { ProgressStepProps } from '@/types';
import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export const ProgressStep: React.FC<ProgressStepProps> = ({ 
  step, 
  isActive, 
  isCompleted, 
  index 
}) => {
  const getStepIcon = () => {
    if (isCompleted) {
      return <Check className="h-5 w-5 text-white" />;
    }
    if (isActive && step.status === 'in_progress') {
      return <Loader2 className="h-5 w-5 text-white animate-spin" />;
    }
    if (step.status === 'failed') {
      return <AlertCircle className="h-5 w-5 text-white" />;
    }
    if (isActive) {
      return <Clock className="h-5 w-5 text-white" />;
    }
    return <span className="text-white font-semibold">{index + 1}</span>;
  };

  const getStepColor = () => {
    if (step.status === 'failed') return 'bg-red-500';
    if (isCompleted) return 'bg-green-500';
    if (isActive) return 'bg-primary';
    return 'bg-gray-300';
  };

  const getStepTextColor = () => {
    if (step.status === 'failed') return 'text-red-600';
    if (isCompleted) return 'text-green-600';
    if (isActive) return 'text-primary';
    return 'text-gray-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 hover:bg-gray-50"
    >
      {/* Step Circle */}
      <motion.div
        animate={{
          scale: isActive ? 1.1 : 1,
        }}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-colors duration-300",
          getStepColor()
        )}
      >
        {getStepIcon()}
      </motion.div>

      {/* Step Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={cn(
            "text-sm font-semibold transition-colors duration-300",
            getStepTextColor()
          )}>
            {step.name}
          </h3>
          {step.status === 'completed' && step.completed_at && (
            <span className="text-xs text-gray-400">
              {new Date(step.completed_at).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mt-1">
          {step.description}
        </p>

        {/* Progress Status */}
        <div className="mt-2">
          {step.status === 'pending' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Waiting
            </span>
          )}
          {step.status === 'in_progress' && (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Processing...
            </motion.span>
          )}
          {step.status === 'completed' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              <Check className="h-3 w-3 mr-1" />
              Completed
            </motion.span>
          )}
          {step.status === 'failed' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Failed
            </span>
          )}
        </div>

        {/* Error Message */}
        {step.error_message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 p-2 bg-red-50 border-l-4 border-red-400 rounded"
          >
            <p className="text-sm text-red-700">{step.error_message}</p>
          </motion.div>
        )}

        {/* Step Metadata */}
        {step.metadata && Object.keys(step.metadata).length > 0 && isCompleted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md"
          >
            <div className="space-y-1">
              {step.metadata.folder_url && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Drive Folder:</span>
                  <a
                    href={step.metadata.folder_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Folder
                  </a>
                </div>
              )}
              {step.metadata.document_url && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Document:</span>
                  <a
                    href={step.metadata.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Document
                  </a>
                </div>
              )}
              {step.metadata.repository_url && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Repository:</span>
                  <a
                    href={step.metadata.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Repo
                  </a>
                </div>
              )}
              {step.metadata.board_url && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Project Board:</span>
                  <a
                    href={step.metadata.board_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Board
                  </a>
                </div>
              )}
              {step.metadata.invite_url && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Communication:</span>
                  <a
                    href={step.metadata.invite_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Join Channel
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};