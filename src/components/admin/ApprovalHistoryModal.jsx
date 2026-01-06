import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../services/api';
import Loading from '../Loading';

const IconX = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconCheck = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const IconXCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function ApprovalHistoryModal({ isOpen, onClose, questionId, questionText }) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && questionId) {
      loadApprovals();
    } else {
      setApprovals([]);
      setError('');
    }
  }, [isOpen, questionId]);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminAPI.getQuestionApprovals(questionId);
      setApprovals(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load approval history');
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Approval History
              </h3>
              {questionText && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {questionText}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loading message="Loading approval history..." />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
                <button
                  onClick={loadApprovals}
                  className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : approvals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                  <IconXCircle className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  No approval history
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  This question has not been approved or rejected yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvals.map((approval, index) => (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-8 pb-4 border-l-2 border-slate-200 dark:border-slate-700 last:border-l-0 last:pb-0"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${
                      approval.approval_status === 'approved'
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-rose-500 border-rose-500'
                    } transform -translate-x-[9px]`} />

                    {/* Content */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {approval.approval_status === 'approved' ? (
                            <IconCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <IconXCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                          )}
                          <span className={`text-sm font-semibold ${
                            approval.approval_status === 'approved'
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-rose-700 dark:text-rose-300'
                          }`}>
                            {approval.approval_status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        </div>
                        {approval.approved_at && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(approval.approved_at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>

                      {approval.approver && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {approval.approver.full_name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {approval.approver.email}
                          </p>
                        </div>
                      )}

                      {approval.admin_comment && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                            Comment:
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                            {approval.admin_comment}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 flex items-center justify-end border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ApprovalHistoryModal;

