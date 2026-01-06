import React from 'react';
import { motion } from 'framer-motion';

function WhatThisMeans({ readinessStatus, overallPercentage, careerDirection, readinessExplanation }) {
  // Generate friendly, parent-friendly message
  const getMessage = () => {
    if (readinessStatus === 'NOT READY') {
      return {
        title: "What This Means for You",
        content: [
          "Your assessment shows that you have developing strengths in certain areas. You are currently in an exploration and preparation stage, which means this is the right time to build skills and gain clarity.",
          "This report does not lock you into a single career. It highlights areas where you can grow with the right guidance.",
          "You have time to explore different career paths and discover what truly interests you. There's no pressure to decide right away.",
          "Focus on understanding your strengths, trying new activities, and working with a career counsellor to build a personalized plan."
        ]
      };
    } else if (readinessStatus === 'PARTIALLY READY') {
      return {
        title: "What This Means for You",
        content: [
          "Your assessment shows that you have developing strengths in certain areas. You are currently in a preparation and exploration stage, which means this is the right time to build skills and gain clarity.",
          "This report does not lock you into a single career. It highlights areas where you can grow with the right guidance.",
          "Continue building skills and exploring options before making any final career decisions. This is a positive stage of development.",
          "Work with a career counsellor to refine your direction and create a personalized plan that matches your interests and strengths."
        ]
      };
    } else {
      return {
        title: "What This Means for You",
        content: [
          "Your assessment shows that you have developed strengths in certain areas. You are currently in a readiness stage, which means you can begin exploring specific career paths with guidance.",
          "This report does not lock you into a single career. It highlights areas where your natural strengths are stronger, but you can still explore multiple options.",
          "Continue testing your interests through practical experience and real-world exposure before making final decisions.",
          "Work closely with a career counsellor to refine your options and make informed choices that align with your goals."
        ]
      };
    }
  };

  const message = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-indigo-200 dark:border-indigo-800 mb-6 sm:mb-8 transition-colors duration-300"
    >
      <div className="flex items-center mb-4">
        <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100">{message.title}</h2>
      </div>
      
      <div className="space-y-4">
        {message.content.map((paragraph, idx) => (
          <motion.p
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className="text-slate-700 dark:text-slate-300 leading-relaxed flex items-start"
          >
            <span className="text-indigo-500 mr-3 mt-1">•</span>
            <span>{paragraph}</span>
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}

export default WhatThisMeans;

