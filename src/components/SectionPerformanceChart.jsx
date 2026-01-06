import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

function SectionPerformanceChart({ sectionScores }) {
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#475569' : '#e2e8f0';
  const axisColor = isDark ? '#475569' : '#cbd5e1';
  const tooltipBg = isDark ? '#1e293b' : '#fff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

  if (!sectionScores || sectionScores.length === 0) {
    return null;
  }

  // Map section numbers to display names
  const sectionNameMap = {
    1: 'Logical Reasoning',
    2: 'Numerical Ability',
    3: 'Verbal Ability',
    4: 'Learning Style',
    5: 'Interest Areas'
  };

  // Prepare chart data
  const chartData = sectionScores.map(item => ({
    name: item.section_name || sectionNameMap[item.section_number] || `Section ${item.section_number}`,
    score: Math.round(item.score),
    sectionNumber: item.section_number
  }));

  // Find strongest and weakest sections
  const sortedScores = [...chartData].sort((a, b) => b.score - a.score);
  const strongestScore = sortedScores[0]?.score || 0;
  const weakestScore = sortedScores[sortedScores.length - 1]?.score || 0;

  // Determine color for each bar
  const getBarColor = (score) => {
    // Strong: >= 60% (green)
    if (score >= 60) return '#10b981'; // green-500
    // Developing: 40-59% (yellow/amber)
    if (score >= 40) return '#f59e0b'; // amber-500
    // Weak: < 40% (orange)
    return '#f97316'; // orange-500
  };

  // Get strength indicator
  const getStrengthIndicator = (score) => {
    if (score >= 60) return { label: 'Strong', color: 'text-green-600 dark:text-green-400' };
    if (score >= 40) return { label: 'Developing', color: 'text-amber-600 dark:text-amber-400' };
    return { label: 'Needs Focus', color: 'text-orange-600 dark:text-orange-400' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 mb-8 transition-colors duration-300"
    >
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
        Section-wise Performance
      </h2>

      {/* Chart */}
      <div className="mb-6 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div style={{ width: '100%', height: '300px', minWidth: '100%', minHeight: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: textColor, fontSize: 10 }}
                axisLine={{ stroke: axisColor }}
                interval={0}
              />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: textColor, fontSize: 12 }}
              axisLine={{ stroke: axisColor }}
              label={{ 
                value: 'Score (%)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: textColor, fontSize: 12 }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: isDark ? '#f1f5f9' : '#1e293b'
              }}
              formatter={(value) => [`${value}%`, 'Score']}
            />
            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.score)}
                  stroke={entry.score === strongestScore ? '#3b82f6' : 'none'}
                  strokeWidth={entry.score === strongestScore ? 2 : 0}
                />
              ))}
            </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score Explanation */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-slate-100">Understanding Your Scores:</strong> This chart shows how your abilities vary across different areas. Higher scores indicate stronger aptitude in that section. Each section represents a different aspect of career readiness.
        </p>
      </div>

      {/* Strength Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <p className="text-xs font-semibold text-green-700 dark:text-green-300">Strong (60%+)</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Well-developed area</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Developing (40-59%)</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Building skills</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <div>
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">Needs Focus (&lt;40%)</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Growth opportunity</p>
          </div>
        </div>
      </div>

      {/* Section Breakdown */}
      <div className="space-y-3">
        {chartData.map((item, index) => {
          const indicator = getStrengthIndicator(item.score);
          const isStrongest = item.score === strongestScore;
          const isWeakest = item.score === weakestScore;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isStrongest 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : isWeakest
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                  : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getBarColor(item.score) }}
                ></div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {item.name}
                </span>
                {isStrongest && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold">
                    Strongest
                  </span>
                )}
                {isWeakest && (
                  <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-semibold">
                    Focus Area
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold ${indicator.color}`}>
                  {indicator.label}
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100 min-w-[50px] text-right">
                  {item.score}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Parent-Friendly Disclaimer */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
          <strong className="text-slate-700 dark:text-slate-300">Note:</strong> This assessment indicates aptitude trends, not final career outcomes. Skills and interests can improve with guidance and practice. These scores reflect your current stage of development and should be used as a starting point for career exploration.
        </p>
      </div>
    </motion.div>
  );
}

export default SectionPerformanceChart;

