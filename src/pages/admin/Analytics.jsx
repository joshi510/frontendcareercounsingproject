import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import AIInsights from '../../components/admin/AIInsights';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

function Analytics() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCounsellors: 0,
    totalAttempts: 0,
    completedAttempts: 0,
    averageScore: 0
  });
  const [readinessData, setReadinessData] = useState({
    'READY': 0,
    'PARTIALLY READY': 0,
    'NOT READY': 0
  });
  const [careerClusterData, setCareerClusterData] = useState({});
  const [completionTrend, setCompletionTrend] = useState([]);
  const [sectionScores, setSectionScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const analytics = await adminAPI.getAnalytics();
      
      setStats({
        totalStudents: analytics.total_students || 0,
        totalCounsellors: analytics.total_counsellors || 0,
        totalAttempts: analytics.total_attempts || 0,
        completedAttempts: analytics.completed_attempts || 0,
        averageScore: analytics.average_score || 0
      });
      
      setReadinessData(analytics.readiness_distribution || {});
      setCareerClusterData(analytics.career_cluster_distribution || {});

      // Generate completion trend (last 7 days simulation)
      const trend = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        trend.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          completed: Math.floor(Math.random() * 10) + (analytics.completed_attempts || 0) / 7
        });
      }
      setCompletionTrend(trend);

      // Generate section performance data (mock for now, should come from backend)
      setSectionScores([
        { section_number: 1, section_name: 'Intelligence Test', score: 65 },
        { section_number: 2, section_name: 'Aptitude Test', score: 58 },
        { section_number: 3, section_name: 'Study Habits', score: 72 },
        { section_number: 4, section_name: 'Learning Style', score: 68 },
        { section_number: 5, section_name: 'Career Interest', score: 61 }
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading message="Loading analytics..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Error message={error} onRetry={loadAnalytics} />
      </AdminLayout>
    );
  }

  // Prepare readiness chart data
  const readinessChartData = [
    { name: 'READY', value: readinessData['READY'] || 0, fill: '#10b981' },
    { name: 'PARTIALLY READY', value: readinessData['PARTIALLY READY'] || 0, fill: '#f59e0b' },
    { name: 'NOT READY', value: readinessData['NOT READY'] || 0, fill: '#ef4444' }
  ];

  // Prepare career cluster data
  const careerChartData = Object.entries(careerClusterData).map(([name, value], index) => ({
    name,
    value,
    fill: COLORS[index % COLORS.length]
  }));

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#475569' : '#e2e8f0';
  const tooltipBg = isDark ? '#1e293b' : '#fff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

  // Check if we have data to render
  const hasCompletionTrend = completionTrend && completionTrend.length > 0;
  const hasReadinessData = readinessChartData.some(item => item.value > 0);
  const hasSectionScores = sectionScores && sectionScores.length > 0;
  const hasCareerData = careerChartData && careerChartData.length > 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Comprehensive insights into student performance and trends
          </p>
        </motion.div>

        {/* AI Insights */}
        <AIInsights
          readinessData={readinessData}
          careerClusterData={careerClusterData}
          stats={stats}
          sectionScores={sectionScores}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Test Completion Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm"
          >
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
              Test Completion Trend
            </h3>
            {hasCompletionTrend ? (
              <div style={{ width: '100%', height: '280px', minHeight: '280px' }} className="sm:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={completionTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: textColor, fontSize: 12 }}
                      axisLine={{ stroke: gridColor }}
                    />
                    <YAxis
                      tick={{ fill: textColor, fontSize: 12 }}
                      axisLine={{ stroke: gridColor }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: '8px',
                        color: isDark ? '#f1f5f9' : '#1e293b'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ width: '100%', height: '280px', minHeight: '280px' }} className="sm:h-[320px] flex items-center justify-center text-slate-400 dark:text-slate-500">
                <p className="text-xs sm:text-sm">No completion trend data available</p>
              </div>
            )}
          </motion.div>

          {/* Readiness Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm"
          >
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
              Readiness Distribution
            </h3>
            {hasReadinessData ? (
              <div style={{ width: '100%', height: '280px', minHeight: '280px' }} className="sm:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={readinessChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {readinessChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: '8px',
                        color: isDark ? '#f1f5f9' : '#1e293b'
                      }}
                      formatter={(value, name) => [value, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ width: '100%', height: '280px', minHeight: '280px' }} className="sm:h-[320px] flex items-center justify-center text-slate-400 dark:text-slate-500">
                <p className="text-xs sm:text-sm">No readiness data available</p>
              </div>
            )}
          </motion.div>

          {/* Section Performance Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm"
          >
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
              Section Performance Comparison
            </h3>
            {hasSectionScores ? (
              <div style={{ width: '100%', height: '280px', minHeight: '280px' }} className="sm:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sectionScores}
                    margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="section_name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fill: textColor, fontSize: 11 }}
                      axisLine={{ stroke: gridColor }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: textColor, fontSize: 12 }}
                      axisLine={{ stroke: gridColor }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: '8px',
                        color: isDark ? '#f1f5f9' : '#1e293b'
                      }}
                      formatter={(value) => [`${value}%`, 'Average Score']}
                    />
                    <Bar
                      dataKey="score"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1000}
                    >
                      {sectionScores.map((entry, index) => {
                        const color = entry.score >= 60 ? '#10b981' : entry.score >= 40 ? '#f59e0b' : '#ef4444';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ width: '100%', height: '280px', minHeight: '280px' }} className="sm:h-[320px] flex items-center justify-center text-slate-400 dark:text-slate-500">
                <p className="text-xs sm:text-sm">No section performance data available</p>
              </div>
            )}
          </motion.div>

          {/* Career Direction Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm"
          >
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
              Career Direction Breakdown
            </h3>
            {hasCareerData ? (
              <div style={{ width: '100%', height: '280px', minHeight: '280px' }} className="sm:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={careerChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis type="number" tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fill: textColor, fontSize: 11 }}
                      axisLine={{ stroke: gridColor }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: '8px',
                        color: isDark ? '#f1f5f9' : '#1e293b'
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 8, 8, 0]}
                      animationDuration={1000}
                    >
                      {careerChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ width: '100%', height: '320px', minHeight: '320px' }} className="flex items-center justify-center text-slate-400 dark:text-slate-500">
                <p className="text-sm">No career cluster data available</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Analytics;
