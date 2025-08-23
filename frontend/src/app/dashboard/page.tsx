'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { useOnboardingStore, useAnalytics } from '@/store/onboardingStore';
import { ClientStatus } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const {
    clients,
    setCurrentView,
    setShowOnboardingModal
  } = useOnboardingStore();

  const analytics = useAnalytics();

  const handleStartNewOnboarding = () => {
    setCurrentView('landing');
    setShowOnboardingModal(true);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getStatusIcon = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case ClientStatus.IN_PROGRESS:
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case ClientStatus.FAILED:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case ClientStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case ClientStatus.FAILED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold gradient-text">Client Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Monitor your onboarding performance and client analytics
          </p>
        </div>
        <Button 
          onClick={handleStartNewOnboarding}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Start New Onboarding
        </Button>
      </motion.div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalClients}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                <span>{analytics.completedClients} completed</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Time to Onboard</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatTime(analytics.avgTimeToOnboard)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <span>vs. 5-6h manual process</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Time Saved</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatTime(analytics.totalTimeSaved)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <span>across all clients</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Money Saved</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${analytics.totalMoneySaved.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <span>at $50/hour rate</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Client List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Clients
            </CardTitle>
            <CardDescription>
              Track the progress and status of your client onboarding
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
                <p className="text-gray-600 mb-4">
                  Start your first onboarding to see client data here
                </p>
                <Button onClick={handleStartNewOnboarding}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start First Onboarding
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {clients.slice(0, 10).map((client, index) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200 hover:bg-white/70 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(client.status)}
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          <p className="text-sm text-gray-600">{client.email}</p>
                        </div>
                      </div>
                      {client.company && (
                        <div className="hidden sm:block">
                          <p className="text-sm text-gray-600">{client.company}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                        {client.status.replace('_', ' ')}
                      </span>
                      {client.project_type && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {client.project_type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {clients.length > 10 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      and {clients.length - 10} more clients...
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Success Rate Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Success Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {analytics.successRate}%
                </div>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analytics.inProgressClients}
                </div>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {analytics.failedClients}
                </div>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}