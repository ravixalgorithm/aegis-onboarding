'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  CheckCircle, 
  ExternalLink, 
  Copy, 
  Star, 
  Calendar,
  FileText,
  MessageSquare,
  Github,
  CreditCard,
  FolderOpen,
  BookOpen,
  Clock,
  User
} from 'lucide-react';
import { OnboardingProgress, Client } from '@/types';

interface ClientDetailsProps {
  client: Client;
  progress: OnboardingProgress;
  onStartNew: () => void;
  onViewDashboard: () => void;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({
  client,
  progress,
  onStartNew,
  onViewDashboard
}) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'google_drive':
        return <FolderOpen className="h-4 w-4" />;
      case 'contract_generation':
        return <FileText className="h-4 w-4" />;
      case 'communication_setup':
        return <MessageSquare className="h-4 w-4" />;
      case 'github_repository':
        return <Github className="h-4 w-4" />;
      case 'project_board':
        return <BookOpen className="h-4 w-4" />;
      case 'welcome_email':
        return <Calendar className="h-4 w-4" />;
      case 'billing_setup':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const completedSteps = progress.steps.filter(step => step.status === 'completed');
  const duration = progress.completed_at && progress.started_at 
    ? Math.round((new Date(progress.completed_at).getTime() - new Date(progress.started_at).getTime()) / 60000)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center py-8"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="mb-4"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🎉 Onboarding Complete!
        </h2>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          <strong>{client.name}</strong> has been successfully onboarded to your system.
        </p>
        {duration > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Completed in {Math.floor(duration / 60)}h {duration % 60}m
          </p>
        )}
      </motion.div>

      {/* Client Summary */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{client.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{client.email}</span>
                </div>
                {client.company && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium">{client.company}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{client.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Project Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{client.project_type?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Scope:</span>
                  <span className="font-medium">{client.project_scope}</span>
                </div>
                {client.budget_range && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">{client.budget_range}</span>
                  </div>
                )}
                {client.timeline && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timeline:</span>
                    <span className="font-medium">{client.timeline}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources & Links */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Resources & Links
          </CardTitle>
          <CardDescription>
            All the resources created during the onboarding process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedSteps.map((step, index) => (
              step.metadata && Object.keys(step.metadata).length > 0 && (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {getStepIcon(step.id)}
                    <h4 className="font-medium text-gray-900">{step.name}</h4>
                  </div>
                  
                  <div className="space-y-2">
                    {step.metadata?.folder_url && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Drive Folder:</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={step.metadata.folder_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Open
                          </a>
                          <button
                            onClick={() => copyToClipboard(step.metadata?.folder_url || '')}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {step.metadata?.contract_url && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Contract:</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={step.metadata.contract_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View
                          </a>
                          <button
                            onClick={() => copyToClipboard(step.metadata?.contract_url || '')}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {step.metadata?.repository_url && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Repository:</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={step.metadata.repository_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Repo
                          </a>
                          <button
                            onClick={() => copyToClipboard(step.metadata?.repository_url || '')}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {step.metadata?.board_url && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Project Board:</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={step.metadata.board_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Board
                          </a>
                          <button
                            onClick={() => copyToClipboard(step.metadata?.board_url || '')}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {step.metadata?.invite_url && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Communication:</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={step.metadata.invite_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Join Channel
                          </a>
                          <button
                            onClick={() => copyToClipboard(step.metadata?.invite_url || '')}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
          <CardDescription>
            Continue growing your business with Aegis Onboarding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={onStartNew} className="h-auto p-4 flex-col gap-2">
              <Star className="h-5 w-5" />
              <span className="font-medium">Start New Onboarding</span>
              <span className="text-xs opacity-75">Onboard another client</span>
            </Button>
            
            <Button onClick={onViewDashboard} variant="outline" className="h-auto p-4 flex-col gap-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">View Dashboard</span>
              <span className="text-xs opacity-75">See all your clients</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};