import React from 'react';
import { motion } from 'framer-motion';

const IconLightbulb = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

function AIInsights({ readinessData, careerClusterData, stats, sectionScores }) {
  const insights = [];

  // Insight 1: Readiness Distribution Analysis
  const totalReadiness = Object.values(readinessData).reduce((a, b) => a + b, 0);
  if (totalReadiness > 0) {
    const notReadyPercent = ((readinessData['NOT READY'] || 0) / totalReadiness) * 100;
    const readyPercent = ((readinessData['READY'] || 0) / totalReadiness) * 100;
    const partiallyReadyPercent = ((readinessData['PARTIALLY READY'] || 0) / totalReadiness) * 100;

    if (notReadyPercent > 50) {
      insights.push({
        type: 'warning',
        title: 'High Exploration Phase',
        message: `Over ${Math.round(notReadyPercent)}% of students are in the exploration phase (NOT READY). This suggests students may be taking the assessment too early in their academic journey, or they need more career exposure before making decisions. Consider providing early-stage career counselling focused on exploration rather than finalization.`,
        action: 'Schedule early career exploration sessions for students showing NOT READY status.'
      });
    } else if (readyPercent > 40) {
      insights.push({
        type: 'success',
        title: 'Strong Career Clarity',
        message: `${Math.round(readyPercent)}% of students show strong career readiness, indicating good self-awareness and career direction. These students are likely ready for more specific career planning and mentorship programs.`,
        action: 'Connect READY students with industry mentors and advanced career planning resources.'
      });
    } else if (partiallyReadyPercent > 40) {
      insights.push({
        type: 'info',
        title: 'Development in Progress',
        message: `Most students (${Math.round(partiallyReadyPercent)}%) are in the PARTIALLY READY stage, showing they're developing career-related strengths but need further guidance. This is a healthy development stage that requires targeted support.`,
        action: 'Provide structured career development workshops focusing on skill-building and career exploration.'
      });
    }
  }

  // Insight 2: Test Completion Analysis
  const completionRate = stats.totalAttempts > 0 
    ? (stats.completedAttempts / stats.totalAttempts) * 100 
    : 0;
  
  if (stats.totalAttempts > 0) {
    if (completionRate < 70) {
      insights.push({
        type: 'warning',
        title: 'Low Completion Rate',
        message: `Only ${Math.round(completionRate)}% of test attempts are being completed. This may indicate the test is too long, students are losing interest, or technical issues are preventing completion. High abandonment rates can skew results and reduce data quality.`,
        action: 'Review test length and user experience. Consider adding progress indicators and break points to improve completion rates.'
      });
    } else if (completionRate > 85) {
      insights.push({
        type: 'success',
        title: 'Excellent Engagement',
        message: `${Math.round(completionRate)}% completion rate shows strong student engagement with the assessment. Students are finding value in completing the full test, which leads to more accurate and comprehensive results.`,
        action: 'Maintain current test structure and consider expanding assessment offerings for engaged students.'
      });
    }
  }

  // Insight 3: Section Performance Analysis
  if (sectionScores && sectionScores.length > 0) {
    const sortedSections = [...sectionScores].sort((a, b) => b.score - a.score);
    const strongest = sortedSections[0];
    const weakest = sortedSections[sortedSections.length - 1];
    const scoreGap = strongest.score - weakest.score;

    if (scoreGap > 20) {
      insights.push({
        type: 'info',
        title: 'Significant Performance Variation',
        message: `Students show a ${Math.round(scoreGap)}-point gap between strongest (${strongest.section_name || `Section ${strongest.section_number}`}) and weakest (${weakest.section_name || `Section ${weakest.section_number}`}) sections. This indicates clear aptitude patterns rather than uniform performance, which is valuable for career guidance.`,
        action: `Focus counselling on leveraging strengths in ${strongest.section_name || `Section ${strongest.section_number}`} while providing targeted support for ${weakest.section_name || `Section ${weakest.section_number}`}.`
      });
    }

    // Check for analytical vs creative patterns
    const analyticalSections = sectionScores.filter(s => 
      s.section_name?.toLowerCase().includes('logical') || 
      s.section_name?.toLowerCase().includes('numerical') ||
      s.section_number === 1 || s.section_number === 2
    );
    const avgAnalytical = analyticalSections.length > 0
      ? analyticalSections.reduce((sum, s) => sum + s.score, 0) / analyticalSections.length
      : 0;

    if (avgAnalytical > 60) {
      insights.push({
        type: 'info',
        title: 'Strong Analytical Inclination',
        message: `Students consistently show higher scores in logical and numerical reasoning sections (average ${Math.round(avgAnalytical)}%), indicating a strong analytical aptitude across the student population. This suggests many students may be well-suited for STEM, data analysis, or problem-solving oriented careers.`,
        action: 'Highlight analytical career paths and provide resources for students interested in STEM fields.'
      });
    }
  }

  // Insight 4: Career Cluster Distribution
  if (careerClusterData && Object.keys(careerClusterData).length > 0) {
    const clusterEntries = Object.entries(careerClusterData);
    const totalClusters = clusterEntries.reduce((sum, [, value]) => sum + value, 0);
    
    if (totalClusters > 0) {
      const dominantCluster = clusterEntries.sort((a, b) => b[1] - a[1])[0];
      const dominantPercent = (dominantCluster[1] / totalClusters) * 100;

      if (dominantPercent > 40) {
        insights.push({
          type: 'info',
          title: 'Career Interest Concentration',
          message: `${Math.round(dominantPercent)}% of career recommendations fall into the "${dominantCluster[0]}" category, showing a clear interest pattern among students. This concentration can help focus career counselling resources and industry partnerships.`,
          action: `Develop specialized resources and partnerships in the ${dominantCluster[0]} domain to better serve student interests.`
        });
      } else if (dominantPercent < 25) {
        insights.push({
          type: 'info',
          title: 'Diverse Career Interests',
          message: `Career recommendations are well-distributed across multiple categories, with no single category dominating above ${Math.round(dominantPercent)}%. This diversity indicates students have varied interests and require a broad range of career guidance resources.`,
          action: 'Ensure career counselling resources cover multiple domains to support diverse student interests.'
        });
      }
    }
  }

  // Insight 5: Overall Health Check
  if (stats.totalStudents > 0 && stats.completedAttempts > 0) {
    const avgScore = stats.averageScore || 0;
    if (avgScore < 40) {
      insights.push({
        type: 'warning',
        title: 'Low Average Performance',
        message: `The average test score is ${Math.round(avgScore)}%, which is below typical performance levels. This could indicate the assessment is too challenging, students need more preparation, or there are systemic issues affecting performance.`,
        action: 'Review assessment difficulty and provide pre-assessment preparation resources to help students perform better.'
      });
    } else if (avgScore > 70) {
      insights.push({
        type: 'success',
        title: 'Strong Overall Performance',
        message: `Students are performing well with an average score of ${Math.round(avgScore)}%, indicating good alignment between student capabilities and assessment expectations. This suggests the assessment is appropriately calibrated.`,
        action: 'Maintain current assessment standards and consider advanced pathways for high-performing students.'
      });
    }
  }

  if (insights.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <IconLightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            AI Insights
          </h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Insights will appear here as more data becomes available.
        </p>
      </motion.div>
    );
  }

  const typeStyles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      title: 'text-green-900 dark:text-green-200'
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      icon: 'text-amber-600 dark:text-amber-400',
      title: 'text-amber-900 dark:text-amber-200'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-900 dark:text-blue-200'
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <IconLightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            AI-Powered Insights
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Actionable insights based on your data
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const styles = typeStyles[insight.type] || typeStyles.info;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${styles.bg} ${styles.border} border rounded-lg p-4`}
            >
              <div className="flex items-start gap-3">
                <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>
                  <IconLightbulb className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-semibold ${styles.title} mb-2`}>
                    {insight.title}
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                    {insight.message}
                  </p>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Recommended Action:
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {insight.action}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default AIInsights;

