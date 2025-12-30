import React from 'react';
import { motion } from 'framer-motion';

function CareerConfidence({ careerConfidenceLevel, careerConfidenceExplanation }) {
  if (!careerConfidenceLevel || !careerConfidenceExplanation) {
    return null;
  }

  const getConfidenceColor = () => {
    if (careerConfidenceLevel === 'HIGH') {
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
        badge: 'bg-green-500'
      };
    } else if (careerConfidenceLevel === 'MODERATE') {
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        badge: 'bg-amber-500'
      };
    } else {
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        badge: 'bg-blue-500'
      };
    }
  };

  const colors = getConfidenceColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`${colors.bg} ${colors.border} border rounded-xl p-5 mb-6`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-3 h-3 ${colors.badge} rounded-full`}></div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Career Direction Confidence: 
          <span className={`ml-2 ${colors.text} font-bold`}>{careerConfidenceLevel}</span>
        </h3>
      </div>
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        {careerConfidenceExplanation}
      </p>
    </motion.div>
  );
}

export default CareerConfidence;

