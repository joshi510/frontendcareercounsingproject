import React from 'react';
import { motion } from 'framer-motion';

function CounsellorSummary({ counsellorSummary }) {
  if (!counsellorSummary || !counsellorSummary.trim()) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-2xl shadow-lg p-6 border-2 border-indigo-200 dark:border-indigo-800 mb-8"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center">
            Counsellor Summary
            <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">(Quick Reference)</span>
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
            {counsellorSummary}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default CounsellorSummary;

