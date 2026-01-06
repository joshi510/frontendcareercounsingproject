import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import ReadinessChart from '../../components/ReadinessChart';
import CareerClusterBarChart from '../../components/CareerClusterBarChart';

// Premium Icon Components
const IconUsers = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconCheckCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconClock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconAlertTriangle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const IconTrendingUp = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    completedAttempts: 0,
    inProgressAttempts: 0,
    highRiskStudents: 0
  });
  const [readinessData, setReadinessData] = useState([
    { range: '0-30', count: 0, label: 'High Risk' },
    { range: '31-60', count: 0, label: 'Medium Risk' },
    { range: '61-80', count: 0, label: 'Good' },
    { range: '81-100', count: 0, label: 'Excellent' }
  ]);
  const [careerClusterData, setCareerClusterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const analyticsResponse = await adminAPI.getAnalytics().catch(() => null);

      let allStudents = [];
      let currentPage = 1;
      let hasMore = true;
      const limit = 100;

      while (hasMore) {
        const studentsResponse = await adminAPI.getStudents(currentPage, limit);
        const students = studentsResponse?.students || [];
        allStudents = [...allStudents, ...students];
        
        const pagination = studentsResponse?.pagination;
        hasMore = pagination?.has_next || false;
        currentPage++;
        
        if (students.length < limit) {
          hasMore = false;
        }
      }

      const students = allStudents;
      
      const totalStudents = students.length;
      const completedAttempts = students.filter(s => s.test_status === 'COMPLETED').length;
      const inProgressAttempts = students.filter(s => s.test_status === 'IN_PROGRESS').length;
      const highRiskStudents = students.filter(s => {
        const score = s.score;
        return score !== null && score !== undefined && score < 40;
      }).length;

      setStats({
        totalStudents,
        completedAttempts,
        inProgressAttempts,
        highRiskStudents
      });

      const readinessRanges = {
        '0-30': 0,
        '31-60': 0,
        '61-80': 0,
        '81-100': 0
      };

      students.forEach(student => {
        const score = student.score;
        if (score !== null && score !== undefined) {
          if (score >= 0 && score <= 30) {
            readinessRanges['0-30']++;
          } else if (score >= 31 && score <= 60) {
            readinessRanges['31-60']++;
          } else if (score >= 61 && score <= 80) {
            readinessRanges['61-80']++;
          } else if (score >= 81 && score <= 100) {
            readinessRanges['81-100']++;
          }
        }
      });

      setReadinessData([
        { range: '0-30', count: readinessRanges['0-30'], label: 'High Risk' },
        { range: '31-60', count: readinessRanges['31-60'], label: 'Medium Risk' },
        { range: '61-80', count: readinessRanges['61-80'], label: 'Good' },
        { range: '81-100', count: readinessRanges['81-100'], label: 'Excellent' }
      ]);

      let careerClusterMap = {};
      
      if (analyticsResponse && analyticsResponse.career_cluster_distribution) {
        careerClusterMap = analyticsResponse.career_cluster_distribution;
      }

      const careerClusterArray = Object.entries(careerClusterMap)
        .map(([cluster, count]) => ({ cluster, count }))
        .sort((a, b) => b.count - a.count);

      setCareerClusterData(careerClusterArray);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading message="Loading dashboard..." />
      </AdminLayout>
    );
  }

  if (error && Object.values(stats).every(v => v === 0)) {
    return (
      <AdminLayout>
        <Error message={error} onRetry={loadDashboardData} />
      </AdminLayout>
    );
  }

  const totalReadiness = readinessData.reduce((sum, item) => sum + item.count, 0);
  const completionRate = stats.totalStudents > 0 
    ? Math.round((stats.completedAttempts / stats.totalStudents) * 100) 
    : 0;

  const StatCard = ({ icon: Icon, label, value, subtitle, trend, color = 'blue', onClick, delay = 0 }) => {
    const colorConfigs = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
        iconBg: 'bg-blue-500',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800'
      },
      green: {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20',
        iconBg: 'bg-green-500',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800'
      },
      yellow: {
        bg: 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-800/20',
        iconBg: 'bg-yellow-500',
        text: 'text-yellow-700 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-800'
      },
      red: {
        bg: 'bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-800/20',
        iconBg: 'bg-red-500',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800'
      }
    };

    const config = colorConfigs[color];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        onClick={onClick}
        className={`relative overflow-hidden rounded-xl border ${config.border} ${config.bg} p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              {label}
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {value}
              </p>
              {trend && (
                <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                  <IconTrendingUp className="w-3 h-3" />
                  {trend}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className={`${config.iconBg} p-3 rounded-xl text-white shadow-lg`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {onClick && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        )}
      </motion.div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Welcome back
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Here's what's happening with your students today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            icon={IconUsers}
            label="Total Students"
            value={stats.totalStudents}
            subtitle="Registered users"
            color="blue"
            onClick={() => navigate('/admin/students')}
            delay={0}
          />
          <StatCard
            icon={IconCheckCircle}
            label="Tests Completed"
            value={stats.completedAttempts}
            subtitle={`${completionRate}% completion rate`}
            color="green"
            delay={0.1}
          />
          <StatCard
            icon={IconClock}
            label="In Progress"
            value={stats.inProgressAttempts}
            subtitle="Active tests"
            color="yellow"
            delay={0.2}
          />
          <StatCard
            icon={IconAlertTriangle}
            label="High Risk Students"
            value={stats.highRiskStudents}
            subtitle="Require attention"
            color="red"
            delay={0.3}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Readiness Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Readiness Distribution
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Student readiness breakdown
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {totalReadiness} students
              </span>
            </div>
            {totalReadiness > 0 ? (
              <ReadinessChart data={readinessData} />
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">
                <div className="text-center">
                  <p className="text-sm">No readiness data available</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Career Cluster Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Career Clusters
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Career interest distribution
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {careerClusterData.length} clusters
              </span>
            </div>
            {careerClusterData.length > 0 ? (
              <CareerClusterBarChart data={Object.fromEntries(careerClusterData.map(item => [item.cluster, item.count]))} />
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">
                <div className="text-center">
                  <p className="text-sm">No career cluster data available</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.button
              onClick={() => navigate('/admin/students')}
              className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left group"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30 transition-colors">
                <IconUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">View Students</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Manage student accounts</p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
