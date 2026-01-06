import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import Error from '../../components/Error';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Toast from '../../components/admin/Toast';

// Premium Icons
const IconSearch = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconFilter = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const IconEye = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const IconRefreshCw = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const IconChevronLeft = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const IconChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// Skeleton Loader Component
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto"></div>
    </td>
  </tr>
);

function StudentsList() {
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  
  // Data state
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    total_records: 0,
    total_pages: 0,
    current_page: 1,
    limit: 10
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [readinessFilter, setReadinessFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Load students with pagination and filters
  const loadStudents = useCallback(async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      const response = await adminAPI.getStudents(page, pageSize, {
        search: searchQuery,
        status: statusFilter,
        readiness: readinessFilter
      });
      
      // Handle both old format (array) and new format (object with students array)
      const studentsList = Array.isArray(response) ? response : (response?.students || []);
      const paginationData = response?.pagination || {
        total_records: Array.isArray(response) ? response.length : studentsList.length,
        total_pages: 1,
        current_page: page,
        limit: pageSize
      };
      
      if (append) {
        setStudents(prev => [...(prev || []), ...studentsList]);
      } else {
        setStudents(studentsList);
      }
      
      setPagination(paginationData);
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pageSize, searchQuery, statusFilter, readinessFilter]);

  // Initial load and reload when filters change
  useEffect(() => {
    loadStudents(1);
  }, [loadStudents]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!infiniteScroll || loadingMore || loading) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    
    if (isNearBottom && pagination.current_page < pagination.total_pages) {
      loadStudents(pagination.current_page + 1, true);
    }
  }, [infiniteScroll, loadingMore, loading, pagination, loadStudents]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && infiniteScroll) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [infiniteScroll, handleScroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't interfere with input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const filtered = getFilteredStudents();
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedRowIndex(prev => Math.min(prev + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedRowIndex(prev => Math.max(prev - 1, -1));
          break;
        case 'Enter':
          if (focusedRowIndex >= 0 && filtered[focusedRowIndex]?.has_completed_test) {
            handleViewResult(filtered[focusedRowIndex]);
          }
          break;
        case 'ArrowLeft':
          if (pagination.current_page > 1) {
            e.preventDefault();
            handlePageChange(pagination.current_page - 1);
          }
          break;
        case 'ArrowRight':
          if (pagination.current_page < pagination.total_pages) {
            e.preventDefault();
            handlePageChange(pagination.current_page + 1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedRowIndex, pagination]);

  const handleViewResult = (student) => {
    // Handle both student object and studentId for backward compatibility
    const studentData = typeof student === 'object' ? student : filteredStudents.find(s => s.id === student);
    
    if (!studentData) {
      setToast({
        visible: true,
        message: 'Student data not found.',
        type: 'error'
      });
      return;
    }
    
    // Safety check: Only allow viewing results for completed tests
    if (!studentData?.has_completed_test) {
      setToast({
        visible: true,
        message: 'Result not available yet. Student must complete the test first.',
        type: 'warning'
      });
      return;
    }
    
    // Get and clean studentId - ensure it's a valid integer with NO colons
    let rawStudentId = studentData?.id || student;
    const studentIdString = String(rawStudentId).trim();
    const cleanStudentId = studentIdString.split(':')[0].split('/')[0].split(' ')[0]; // Remove colons, slashes, spaces
    const parsedStudentId = parseInt(cleanStudentId, 10);
    
    if (isNaN(parsedStudentId)) {
      setToast({
        visible: true,
        message: 'Invalid student ID. Cannot view result.',
        type: 'error'
      });
      return;
    }
    
    // Get test_attempt_id from student data
    let resultId = studentData?.test_attempt_id;
    
    if (!resultId) {
      setToast({
        visible: true,
        message: 'Test attempt ID not found. Cannot view result.',
        type: 'error'
      });
      return;
    }
    
    // Ensure resultId is a clean number (remove any invalid characters like colons)
    // Convert to string first, then clean, then parse to ensure it's a valid integer
    const resultIdString = String(resultId).trim();
    const cleanResultId = resultIdString.split(':')[0].split('/')[0].split(' ')[0]; // Remove colons, slashes, spaces
    const parsedResultId = parseInt(cleanResultId, 10);
    
    if (isNaN(parsedResultId)) {
      setToast({
        visible: true,
        message: 'Invalid test attempt ID. Cannot view result.',
        type: 'error'
      });
      return;
    }
    
    // Build URL with clean integers - NO colons, NO template literal issues
    // Double-check: ensure both are numbers before navigation
    const finalStudentId = Number(parsedStudentId);
    const finalResultId = Number(parsedResultId);
    
    if (isNaN(finalStudentId) || isNaN(finalResultId)) {
      setToast({
        visible: true,
        message: 'Invalid IDs. Cannot view result.',
        type: 'error'
      });
      return;
    }
    
    // Navigate to admin student result page with both studentId and resultId
    // Ensure NO colons in the URL - use clean numeric values only
    const navigationUrl = `/admin/students/${finalStudentId}/result/${finalResultId}`;
    
    // Final validation: ensure URL contains no colons in the actual path values
    // Route definitions use :param but actual URLs should have numeric values
    if (navigationUrl.match(/\/\d+:\d+/)) {
      console.error('❌ Invalid URL generated with colon in path:', navigationUrl);
      setToast({
        visible: true,
        message: 'Invalid URL format. Please try again.',
        type: 'error'
      });
      return;
    }
    
    console.log('🔵 Navigating to:', navigationUrl, 'StudentId:', finalStudentId, 'ResultId:', finalResultId);
    navigate(navigationUrl);
  };

  const handleAllowRetake = (student) => {
    setSelectedStudent(student);
    setShowConfirmModal(true);
  };

  const confirmRetake = async () => {
    if (!selectedStudent) return;

    try {
      await adminAPI.allowRetake(selectedStudent.id);
      setToast({
        visible: true,
        message: `Test retake enabled for ${selectedStudent.full_name}`,
        type: 'success'
      });
      setShowConfirmModal(false);
      setSelectedStudent(null);
      loadStudents(pagination.current_page);
    } catch (err) {
      setToast({
        visible: true,
        message: `Failed to allow retake: ${err.message}`,
        type: 'error'
      });
    }
  };

  // Students are already filtered by backend, no need for client-side filtering
  const filteredStudents = students || [];

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.total_pages) return;
    loadStudents(page);
    setFocusedRowIndex(-1);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const getReadinessBadge = (status) => {
    if (!status) return null;
    
    const styles = {
      'READY': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      'PARTIALLY READY': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      'NOT READY': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
        {status}
      </span>
    );
  };

  const getRiskBadge = (riskLevel) => {
    if (!riskLevel) return null;

    const styles = {
      'LOW': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      'MEDIUM': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      'HIGH': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[riskLevel] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
        {riskLevel}
      </span>
    );
  };

  const getStatusBadge = (student) => {
    if (student.has_completed_test) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
          Completed
        </span>
      );
    } else if (student.test_status === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
          In Progress
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
          Not Started
        </span>
      );
    }
  };

  // Calculate pagination display
  const startRecord = (pagination.current_page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.current_page * pagination.limit, pagination.total_records);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const total = pagination.total_pages;
    const current = pagination.current_page;
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
    }
    return pages;
  };

  if (error && students.length === 0) {
    return (
      <AdminLayout>
        <Error message={error} onRetry={() => loadStudents(1)} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Students</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage and view student test results
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Infinite Scroll Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={infiniteScroll}
                onChange={(e) => {
                  setInfiniteScroll(e.target.checked);
                  if (e.target.checked) {
                    setPagination(prev => ({ ...prev, current_page: 1 }));
                    loadStudents(1);
                  }
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Infinite Scroll</span>
            </label>
            <motion.button
              onClick={() => loadStudents(pagination.current_page)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <IconRefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <IconFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="not_started">Not Started</option>
              </select>
            </div>

            {/* Readiness Filter */}
            <div className="relative">
              <IconFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={readinessFilter}
                onChange={(e) => setReadinessFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Readiness</option>
                <option value="ready">Ready</option>
                <option value="partially_ready">Partially Ready</option>
                <option value="not_ready">Not Ready</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Table Container with Sticky Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm"
        >
          {/* Desktop Table */}
          <div 
            ref={scrollContainerRef}
            className="hidden lg:block overflow-x-auto max-h-[600px] overflow-y-auto"
            style={{ scrollBehavior: 'smooth' }}
          >
            <table ref={tableRef} className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Readiness</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Risk</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <AnimatePresence>
                  {loading && !infiniteScroll ? (
                    // Skeleton loaders
                    Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={i} />)
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-slate-500 dark:text-slate-400">No students found</p>
                          {(searchQuery || statusFilter !== 'all' || readinessFilter !== 'all') && (
                            <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your filters</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.01 }}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors even:bg-slate-50/50 dark:even:bg-slate-800/50 ${
                          focusedRowIndex === index ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        tabIndex={0}
                        onFocus={() => setFocusedRowIndex(index)}
                        onBlur={() => setFocusedRowIndex(-1)}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {student.full_name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {student.email}
                            </div>
                            {student.ai_insight && (
                              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">
                                {student.ai_insight}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(student)}
                        </td>
                        <td className="px-6 py-4">
                          {student.score !== null ? (
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {student.score.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getReadinessBadge(student.readiness_status)}
                        </td>
                        <td className="px-6 py-4">
                          {getRiskBadge(student.risk_level)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {student.has_completed_test && (
                              <>
                                <motion.button
                                  onClick={() => handleViewResult(student)}
                                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="View Result"
                                >
                                  <IconEye className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  onClick={() => handleAllowRetake(student)}
                                  className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Allow Retake"
                                >
                                  <IconRefreshCw className="w-4 h-4" />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
                {loadingMore && (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={`loading-${i}`} />)
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-slate-500 dark:text-slate-400">No students found</p>
                  {(searchQuery || statusFilter !== 'all' || readinessFilter !== 'all') && (
                    <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your filters</p>
                  )}
                </div>
              </div>
            ) : (
              filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="space-y-3">
                    <div>
                      <div className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {student.full_name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {student.email}
                      </div>
                      {student.ai_insight && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">
                          {student.ai_insight}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(student)}
                      {student.score !== null && (
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Score: {student.score.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {getReadinessBadge(student.readiness_status)}
                      {getRiskBadge(student.risk_level)}
                    </div>
                    {student.has_completed_test && (
                      <div className="flex items-center gap-2 pt-2">
                        <motion.button
                          onClick={() => handleViewResult(student)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors touch-manipulation min-h-[44px]"
                          whileTap={{ scale: 0.98 }}
                        >
                          <IconEye className="w-4 h-4" />
                          View Result
                        </motion.button>
                        <motion.button
                          onClick={() => handleAllowRetake(student)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors touch-manipulation min-h-[44px]"
                          whileTap={{ scale: 0.98 }}
                        >
                          <IconRefreshCw className="w-4 h-4" />
                          Allow Retake
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {!infiniteScroll && (
            <div className="px-4 lg:px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Page Size Selector */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-slate-600 dark:text-slate-400">per page</span>
                </div>

                {/* Pagination Info */}
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{startRecord}</span>–<span className="font-semibold text-slate-900 dark:text-slate-100">{endRecord}</span> of{' '}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.total_records}</span> students
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconChevronLeft className="w-5 h-5" />
                  </motion.button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
                      ) : (
                        <motion.button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            page === pagination.current_page
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                          }`}
                          whileTap={{ scale: 0.95 }}
                        >
                          {page}
                        </motion.button>
                      )
                    ))}
                  </div>

                  <motion.button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.total_pages}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* Infinite Scroll Loading Indicator */}
          {infiniteScroll && loadingMore && (
            <div className="px-4 lg:px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">Loading more students...</p>
            </div>
          )}

          {/* Infinite Scroll End Indicator */}
          {infiniteScroll && !loadingMore && pagination.current_page >= pagination.total_pages && students.length > 0 && (
            <div className="px-4 lg:px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">All students loaded ({pagination.total_records} total)</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedStudent(null);
        }}
        onConfirm={confirmRetake}
        title="Allow Test Retake"
        message={`Are you sure you want to allow ${selectedStudent?.full_name} to retake the test? This will delete their current test results.`}
        confirmText="Allow Retake"
        cancelText="Cancel"
        variant="warning"
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </AdminLayout>
  );
}

export default StudentsList;
