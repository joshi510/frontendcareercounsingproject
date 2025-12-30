import React from 'react';
import { motion } from 'framer-motion';

function DoNowDoLater({ doNowActions, doLaterActions }) {
  if ((!doNowActions || doNowActions.length === 0) && (!doLaterActions || doLaterActions.length === 0)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-8"
    >
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
        Do Now vs Do Later
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Do Now */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-300 dark:border-green-800 shadow-lg"
        >
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Do Now (Next 0-3 Months)
            </h3>
          </div>
          <ul className="space-y-3">
            {doNowActions && doNowActions.length > 0 ? (
              doNowActions.map((action, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-start text-slate-700 dark:text-slate-300"
                >
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="leading-relaxed">{action}</span>
                </motion.li>
              ))
            ) : (
              <li className="text-slate-500 dark:text-slate-400 italic">No immediate actions specified</li>
            )}
          </ul>
        </motion.div>

        {/* Do Later */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-amber-300 dark:border-amber-800 shadow-lg"
        >
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Do Later (6-12 Months)
            </h3>
          </div>
          <ul className="space-y-3">
            {doLaterActions && doLaterActions.length > 0 ? (
              doLaterActions.map((action, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-start text-slate-700 dark:text-slate-300"
                >
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="leading-relaxed">{action}</span>
                </motion.li>
              ))
            ) : (
              <li className="text-slate-500 dark:text-slate-400 italic">No future actions specified</li>
            )}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default DoNowDoLater;

