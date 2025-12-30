import React from 'react';
import { motion } from 'framer-motion';

function ReadinessStatus({ readinessStatus, readinessExplanation, riskLevel, riskExplanation, riskExplanationHuman }) {
  // Convert harsh labels to friendly ones
  const getFriendlyReadinessLabel = (status) => {
    if (status === 'READY') return 'Ready for Career Planning';
    if (status === 'PARTIALLY READY') return 'Preparation Stage';
    return 'Exploration Stage';
  };

  const getFriendlyRiskLabel = (risk) => {
    if (risk === 'LOW') return 'Low Decision Risk';
    if (risk === 'MEDIUM') return 'Requires Guided Decision-Making';
    return 'Requires Guided Decision-Making';
  };

  const getStatusColor = (status) => {
    if (status === 'READY') return 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (status === 'PARTIALLY READY') return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  };

  const getRiskColor = (risk) => {
    if (risk === 'LOW') return 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (risk === 'MEDIUM') return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 mb-8 transition-colors duration-300"
    >
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Your Career Readiness Assessment</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Readiness Status */}
        <div className={`rounded-xl p-5 border-2 ${getStatusColor(readinessStatus)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Career Readiness</h3>
              <div className="group relative">
                <svg className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {readinessExplanation || 'This indicates your current stage of career exploration and readiness for making career decisions.'}
                </div>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-white/50 dark:bg-slate-800/50" title={readinessStatus}>
              {getFriendlyReadinessLabel(readinessStatus)}
            </span>
          </div>
          {readinessExplanation && (
            <div className="mt-3">
              <p className="text-sm leading-relaxed mb-2">
                {readinessExplanation}
              </p>
              {readinessStatus === 'PARTIALLY READY' && (
                <p className="text-xs text-amber-700 dark:text-amber-400 italic mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                  ⚠️ Making a career decision now without further exploration may lead to course dissatisfaction or switching later.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Risk Level */}
        <div className={`rounded-xl p-5 border-2 ${getRiskColor(riskLevel)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Decision Guidance</h3>
              <div className="group relative">
                <svg className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {riskExplanation || 'This indicates the level of risk associated with making career decisions at your current stage.'}
                </div>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-white/50 dark:bg-slate-800/50" title={`Risk Level: ${riskLevel}`}>
              {getFriendlyRiskLabel(riskLevel)}
            </span>
          </div>
          {(riskExplanationHuman || riskExplanation) && (
            <div className="mt-3">
              <p className="text-sm leading-relaxed mb-2">
                {riskExplanationHuman || riskExplanation}
              </p>
              {riskLevel === 'MEDIUM' && (
                <p className="text-xs text-amber-700 dark:text-amber-400 italic mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                  ⚠️ With guidance and preparation, career decisions can become more reliable. Rushing may limit future options.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ReadinessStatus;

