import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ActionPlan({ actionPlan, roadmap }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Use roadmap if available, otherwise fallback to actionPlan
  let timePeriods = [];
  
  if (roadmap && roadmap.phase1 && roadmap.phase2 && roadmap.phase3) {
    timePeriods = [
      { 
        label: roadmap.phase1.duration || '0-3 Months', 
        title: roadmap.phase1.title || 'Foundation',
        description: roadmap.phase1.description || '',
        steps: roadmap.phase1.actions || [] 
      },
      { 
        label: roadmap.phase2.duration || '3-6 Months', 
        title: roadmap.phase2.title || 'Skill Build',
        description: roadmap.phase2.description || '',
        steps: roadmap.phase2.actions || [] 
      },
      { 
        label: roadmap.phase3.duration || '6-12 Months', 
        title: roadmap.phase3.title || 'Decision',
        description: roadmap.phase3.description || '',
        steps: roadmap.phase3.actions || [] 
      }
    ].filter(period => period.steps.length > 0);
  } else if (actionPlan && Array.isArray(actionPlan)) {
    // Fallback to old format
    timePeriods = [
      { label: '0-3 Months', title: 'Foundation', steps: actionPlan.slice(0, Math.ceil(actionPlan.length / 3)) },
      { label: '3-6 Months', title: 'Skill Build', steps: actionPlan.slice(Math.ceil(actionPlan.length / 3), Math.ceil(actionPlan.length * 2 / 3)) },
      { label: '6-12 Months', title: 'Decision', steps: actionPlan.slice(Math.ceil(actionPlan.length * 2 / 3)) }
    ].filter(period => period.steps.length > 0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Your Action Roadmap</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
          <svg 
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Timeline Visual */}
            <div className="relative mb-8">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400"></div>
              <div className="space-y-8 pl-8">
                {timePeriods.map((period, periodIdx) => (
                  <motion.div
                    key={periodIdx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + periodIdx * 0.1 }}
                    className="relative"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute -left-12 top-2 w-4 h-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full border-4 border-white dark:border-slate-800 shadow-lg"></div>
                    
                    <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 border ${periodIdx === 0 ? 'border-2 border-green-300 dark:border-green-700 shadow-lg' : 'border-slate-200 dark:border-slate-700'} shadow-sm hover:shadow-md transition-all duration-300`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 ${periodIdx === 0 ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} text-white text-sm font-bold rounded-full`}>
                              {period.label}
                            </span>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{period.title || period.label}</h3>
                            {periodIdx === 0 && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                                Next 3 Months
                              </span>
                            )}
                          </div>
                          {period.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic mt-2">{period.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3 mt-4">
                        {period.steps.map((step, stepIdx) => (
                          <motion.div
                            key={stepIdx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + periodIdx * 0.1 + stepIdx * 0.05 }}
                            className="flex items-start"
                          >
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{step}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isExpanded && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Click "Expand" to view the complete action roadmap with detailed steps for each phase.
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default ActionPlan;
