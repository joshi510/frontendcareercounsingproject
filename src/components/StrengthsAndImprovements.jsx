import React from 'react';
import { motion } from 'framer-motion';

function StrengthsAndImprovements({ strengths, weaknesses }) {
  // Get top 2 strengths and bottom 2 improvement areas
  const topStrengths = strengths && strengths.length > 0 ? strengths.slice(0, 2) : [];
  const topImprovements = weaknesses && weaknesses.length > 0 ? weaknesses.slice(0, 2) : [];

  if (topStrengths.length === 0 && topImprovements.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-8"
    >
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6">Your Assessment Highlights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Key Strengths</h3>
          </div>
          
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 italic">
            You have a good base in some skills. With practice, these strengths can become stronger.
          </p>
          
          <ul className="space-y-3">
            {topStrengths.length > 0 ? (
              topStrengths.map((strength, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + idx * 0.1 }}
                  className="flex items-start"
                >
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{strength}</span>
                </motion.li>
              ))
            ) : (
              <li className="text-slate-500 dark:text-slate-400 italic">No specific strengths identified yet</li>
            )}
          </ul>
        </motion.div>

        {/* Improvement Areas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Areas to Improve</h3>
          </div>
          
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 italic">
            Some skills need more practice. This is normal and can be improved over time with guidance and effort.
          </p>
          
          <ul className="space-y-3">
            {topImprovements.length > 0 ? (
              topImprovements.map((improvement, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + idx * 0.1 }}
                  className="flex items-start"
                >
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{improvement}</span>
                </motion.li>
              ))
            ) : (
              <li className="text-slate-500 dark:text-slate-400 italic">No specific improvement areas identified yet</li>
            )}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default StrengthsAndImprovements;

