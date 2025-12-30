import React from 'react';
import { motion } from 'framer-motion';

function CareerDirection({ careerDirection, careerDirectionReason, careerConfidenceLevel }) {
  if (!careerDirection) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-lg p-6 border border-purple-200 dark:border-purple-800 mb-8 transition-colors duration-300"
    >
      <div className="flex items-center mb-4">
        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Career Direction</h2>
          <div className="group relative">
            <svg className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              This indicates areas where your natural strengths are stronger. It does NOT mean you must choose a fixed job or stream right now.
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">
            {careerDirection}
          </h3>
        </div>
        {careerDirectionReason && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Why this direction?
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {careerDirectionReason}
            </p>
          </div>
        )}
        {/* Important Clarification */}
        <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-4">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="text-slate-900 dark:text-slate-100">Important:</strong> This indicates areas where your natural strengths are stronger. It does <strong>NOT</strong> mean you must choose a fixed job or stream right now. You can explore these domains before making final decisions. This is a starting point for exploration, not a final career choice.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default CareerDirection;

