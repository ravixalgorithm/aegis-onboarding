import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApprovalModalProps } from '@/types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, CheckCircle, XCircle, FileText, MessageSquare } from 'lucide-react';

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  approvalData,
  stepName,
}) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async (approved: boolean) => {
    setIsSubmitting(true);
    try {
      await onApprove(approved, feedback);
      setFeedback('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card>
            <CardHeader className="relative">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <X className="h-6 w-6" />
              </button>
              <CardTitle className="text-xl font-semibold text-gray-900 pr-8">
                Approval Required: {stepName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Approval Message */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-amber-800 font-medium">
                      {approvalData.approval_message || 'Please review the following and provide your approval.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contract/Document Preview */}
              {approvalData.contract_url && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Contract Document</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      A service agreement has been generated for <strong>{approvalData.client_name}</strong>.
                    </p>
                    {approvalData.project_scope && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Project Scope:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                          {approvalData.project_scope}
                        </p>
                      </div>
                    )}
                    <div className="pt-2">
                      <a
                        href={approvalData.contract_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Review Document
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional approval data */}
              {Object.entries(approvalData).map(([key, value]) => {
                if (['approval_message', 'contract_url', 'client_name', 'project_scope'].includes(key)) {
                  return null;
                }
                return (
                  <div key={key} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </p>
                  </div>
                );
              })}

              {/* Feedback Section */}
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback or Comments (Optional)
                </label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Add any feedback or comments about this step..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={() => handleApprove(true)}
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {isSubmitting ? 'Approving...' : 'Approve & Continue'}
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={() => handleApprove(false)}
                    disabled={isSubmitting}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    {isSubmitting ? 'Rejecting...' : 'Reject'}
                  </Button>
                </motion.div>
              </div>

              {/* Info message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Approving this step will continue the onboarding process automatically. 
                  Rejecting will pause the process and require manual intervention.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};