import React from 'react';
import { motion } from 'framer-motion';

function ReadinessActionGuidance({ readinessActionGuidance, readinessStatus }) {
  if (!readinessActionGuidance || readinessActionGuidance.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl shadow-lg p-6 border border-blue-200 dark:border-blue-800 mb-8"
    >
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
        What This Stage Means for You
      </h2>
      <ul className="space-y-3">
        {readinessActionGuidance.map((guidance, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className="flex items-start text-slate-700 dark:text-slate-300"
          >
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="leading-relaxed">{guidance}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export default ReadinessActionGuidance;

