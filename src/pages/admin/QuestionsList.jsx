import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Toast from '../../components/admin/Toast';
import AIQuestionGenerator from '../../components/admin/AIQuestionGenerator';

// Icons
const IconSearch = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconPlus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const IconEdit = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconTrash = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconCheck = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const IconX = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

const IconFilter = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const IconSparkles = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const IconClock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Enhanced Skeleton Loader
const SkeletonRow = () => (
  <tr className="border-b border-slate-100 dark:border-slate-800">
    <td className="px-4 py-4">
      <div className="h-4 w-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 w-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mx-auto"></div>
    </td>
    <td className="px-4 py-4">
      <div className="space-y-2">
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 animate-pulse"></div>
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2 animate-pulse"></div>
      </div>
    </td>
    <td className="px-4 py-4">
      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-24 animate-pulse"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-20 animate-pulse"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-16 animate-pulse"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-24 animate-pulse"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-20 animate-pulse"></div>
    </td>
    <td className="px-4 py-4">
      <div className="flex items-center justify-end gap-2">
        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
      </div>
    </td>
  </tr>
);

function QuestionsList() {
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [pagination, setPagination] = useState({
    total_records: 0,
    total_pages: 0,
    current_page: 1,
    limit: 25
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [onlyPending, setOnlyPending] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);

  useEffect(() => {
    loadSections();
    loadQuestions(1);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Reset and reload when filters change
  useEffect(() => {
    setCurrentPage(1);
    loadQuestions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, sectionFilter, statusFilter, typeFilter, difficultyFilter, onlyPending, pageSize]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (focusedRowIndex < 0 || !questions.length) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedRowIndex(prev => Math.min(prev + 1, questions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedRowIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && focusedRowIndex >= 0) {
        e.preventDefault();
        navigate(`/admin/questions/${questions[focusedRowIndex].id}/edit`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedRowIndex, questions, navigate]);

  const loadSections = async () => {
    try {
      const data = await adminAPI.getSections();
      setSections(data);
    } catch (err) {
      console.error('Failed to load sections:', err);
    }
  };

  const loadQuestions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: page,
        limit: pageSize,
        search: debouncedSearchQuery || undefined,
        section_id: sectionFilter !== 'all' ? sectionFilter : undefined,
        status: onlyPending ? undefined : (statusFilter !== 'all' ? statusFilter : undefined),
        question_type: typeFilter !== 'all' ? typeFilter : undefined,
        difficulty_level: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        only_pending: onlyPending ? 'true' : undefined
      };
      
      const response = await adminAPI.getQuestions(params);
      
      setQuestions(response.questions || []);
      setPagination(response.pagination || {
        total_records: 0,
        total_pages: 0,
        current_page: 1,
        limit: pageSize
      });
    } catch (err) {
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [pageSize, debouncedSearchQuery, sectionFilter, statusFilter, typeFilter, difficultyFilter, onlyPending]);


  const handlePageChange = (page) => {
    const totalPages = pagination.total_pages || 1;
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadQuestions(page);
    setFocusedRowIndex(-1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    loadQuestions(1);
  };

  const handleDelete = (question) => {
    setSelectedQuestion(question);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedQuestion) return;

    // Handle bulk delete (array of IDs)
    if (Array.isArray(selectedQuestion)) {
      try {
        const promises = selectedQuestion.map(id => adminAPI.deleteQuestion(id));
        await Promise.all(promises);
        
        setToast({
          visible: true,
          message: `${selectedQuestion.length} question(s) deleted successfully`,
          type: 'success'
        });
        setSelectedQuestionIds(new Set());
        setSelectedQuestion(null);
        setShowConfirmModal(false);
        loadQuestions(currentPage);
      } catch (err) {
        setToast({
          visible: true,
          message: `Failed to delete questions: ${err.message}`,
          type: 'error'
        });
      }
      return;
    }

    // Handle single delete
    try {
      await adminAPI.deleteQuestion(selectedQuestion.id);
      setToast({
        visible: true,
        message: 'Question deleted successfully',
        type: 'success'
      });
      setShowConfirmModal(false);
      setSelectedQuestion(null);
      loadQuestions(currentPage);
    } catch (err) {
      setToast({
        visible: true,
        message: `Failed to delete question: ${err.message}`,
        type: 'error'
      });
    }
  };

  const handleBulkActivate = async () => {
    if (selectedQuestionIds.size === 0) return;
    
    try {
      const questionIds = Array.from(selectedQuestionIds);
      const promises = questionIds.map(id => adminAPI.activateQuestion(id));
      await Promise.all(promises);
      
      setToast({
        visible: true,
        message: `${questionIds.length} question(s) activated successfully`,
        type: 'success'
      });
      setSelectedQuestionIds(new Set());
      loadQuestions(currentPage);
    } catch (err) {
      setToast({
        visible: true,
        message: `Failed to activate questions: ${err.message}`,
        type: 'error'
      });
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedQuestionIds.size === 0) return;
    
    try {
      const questionIds = Array.from(selectedQuestionIds);
      const promises = questionIds.map(id => adminAPI.deactivateQuestion(id));
      await Promise.all(promises);
      
      setToast({
        visible: true,
        message: `${questionIds.length} question(s) deactivated successfully`,
        type: 'success'
      });
      setSelectedQuestionIds(new Set());
      loadQuestions(currentPage);
    } catch (err) {
      setToast({
        visible: true,
        message: `Failed to deactivate questions: ${err.message}`,
        type: 'error'
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedQuestionIds.size === 0) return;
    
    const questionIds = Array.from(selectedQuestionIds);
    setSelectedQuestion(questionIds);
    setShowConfirmModal(true);
  };

  const handleToggleStatus = async (question) => {
    try {
      // Ensure is_active is treated as boolean (handle 0/1 from DB)
      const isActive = question.is_active === true || question.is_active === 1 || question.is_active === '1';
      
      // Simplified: All questions can be activated/deactivated (no status check needed)
      if (isActive) {
        await adminAPI.deactivateQuestion(question.id);
        setToast({
          visible: true,
          message: 'Question deactivated successfully',
          type: 'success'
        });
      } else {
        await adminAPI.activateQuestion(question.id);
        setToast({
          visible: true,
          message: 'Question activated successfully',
          type: 'success'
        });
      }
      loadQuestions(currentPage);
    } catch (err) {
      setToast({
        visible: true,
        message: `Failed to update question status: ${err.message}`,
        type: 'error'
      });
    }
  };

  const handleBulkApprove = () => {
    // Removed - approval workflow simplified
  };


  // Handle individual question selection
  const handleSelectQuestion = (questionId) => {
    setSelectedQuestionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Handle Select All checkbox - selects/deselects all currently visible questions
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      // Select all currently visible question IDs
      const visibleIds = new Set(questions.map(q => q.id));
      setSelectedQuestionIds(visibleIds);
    } else {
      // Clear selection
      setSelectedQuestionIds(new Set());
    }
  };

  // Check if all visible questions are selected
  const areAllVisibleSelected = questions.length > 0 && 
    questions.every(q => selectedQuestionIds.has(q.id));


  const getStatusBadge = (question) => {
    // Ensure is_active is treated as boolean (handle 0/1 from DB)
    const isActive = question.is_active === true || question.is_active === 1 || question.is_active === '1';
    const styles = {
      active: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      inactive: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${isActive ? styles.active : styles.inactive}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const styles = {
      'MULTIPLE_CHOICE': 'text-blue-600 dark:text-blue-400',
      'LIKERT_SCALE': 'text-purple-600 dark:text-purple-400',
      'TEXT': 'text-slate-600 dark:text-slate-400'
    };
    
    return (
      <span className={`text-xs font-medium ${styles[type] || styles.TEXT}`}>
        {type.replace('_', ' ')}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    if (!difficulty) {
      return (
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
          Medium
        </span>
      );
    }
    
    const styles = {
      'Easy': 'text-emerald-600 dark:text-emerald-400',
      'Medium': 'text-amber-600 dark:text-amber-400',
      'Hard': 'text-rose-600 dark:text-rose-400'
    };
    
    return (
      <span className={`text-xs font-medium ${styles[difficulty] || 'text-slate-600 dark:text-slate-400'}`}>
        {difficulty}
      </span>
    );
  };

  const getSourceBadge = (source) => {
    if (source === 'AI' || source === 'ai') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          🤖 AI Generated
        </span>
      );
    } else if (source === 'ADMIN' || source === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          👤 Admin
        </span>
      );
    }
    // Fallback for unknown source
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
        {source || '—'}
      </span>
    );
  };

  const startRecord = pagination.total_records > 0 ? (pagination.current_page - 1) * pagination.limit + 1 : 0;
  const endRecord = Math.min(pagination.current_page * pagination.limit, pagination.total_records);

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

  if (error && questions.length === 0) {
    return (
      <AdminLayout>
        <Error message={error} onRetry={() => loadQuestions(currentPage)} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100">Questions</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage and review test questions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setShowAIGenerator(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm sm:text-base font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm touch-manipulation min-h-[44px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconSparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Generate with AI</span>
              <span className="sm:hidden">AI</span>
            </motion.button>
            <motion.button
              onClick={() => navigate('/admin/questions/new')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm sm:text-base font-medium transition-all hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm touch-manipulation min-h-[44px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Question</span>
              <span className="sm:hidden">Add</span>
            </motion.button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent transition-all"
              />
            </div>

            {/* Pending Only Toggle */}
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
              <input
                type="checkbox"
                checked={onlyPending}
                onChange={(e) => setOnlyPending(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                Show Pending Only
              </span>
            </label>

            {/* Filter Toggle */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                showFilters || sectionFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all' || difficultyFilter !== 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <IconFilter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </motion.button>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent"
                  >
                    <option value="all">All Sections</option>
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>{section.name}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="LIKERT_SCALE">Likert Scale</option>
                    <option value="TEXT">Text</option>
                  </select>

                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Action Bar */}
        {selectedQuestionIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedQuestionIds.size} question{selectedQuestionIds.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <motion.button
                onClick={handleBulkActivate}
                disabled={selectedQuestionIds.size === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: selectedQuestionIds.size === 0 ? 1 : 1.02 }}
                whileTap={{ scale: selectedQuestionIds.size === 0 ? 1 : 0.98 }}
              >
                <IconCheck className="w-4 h-4" />
                Activate Selected
              </motion.button>
              <motion.button
                onClick={handleBulkDeactivate}
                disabled={selectedQuestionIds.size === 0}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 dark:bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: selectedQuestionIds.size === 0 ? 1 : 1.02 }}
                whileTap={{ scale: selectedQuestionIds.size === 0 ? 1 : 0.98 }}
              >
                <IconX className="w-4 h-4" />
                Deactivate Selected
              </motion.button>
              <motion.button
                onClick={handleBulkDelete}
                disabled={selectedQuestionIds.size === 0}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 dark:bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-700 dark:hover:bg-rose-600 transition-colors touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: selectedQuestionIds.size === 0 ? 1 : 1.02 }}
                whileTap={{ scale: selectedQuestionIds.size === 0 ? 1 : 0.98 }}
              >
                <IconTrash className="w-4 h-4" />
                Delete Selected
              </motion.button>
              <button
                onClick={() => setSelectedQuestionIds(new Set())}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors touch-manipulation min-h-[44px]"
              >
                Clear Selection
              </button>
            </div>
          </motion.div>
        )}

        {/* Questions Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table ref={tableRef} className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={areAllVisibleSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-12">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Question</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Section</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Difficulty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Source</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : questions.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <IconSearch className="w-6 h-6 text-slate-400" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">No questions found</p>
                          <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your filters or create a new question</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    questions.map((question, index) => (
                      <motion.tr
                        key={question.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
                          focusedRowIndex === index ? 'bg-blue-50 dark:bg-blue-900/10 ring-2 ring-blue-500 dark:ring-blue-400' : ''
                        } ${
                          (question.source === 'AI' || question.source === 'ai') ? 'bg-purple-50/30 dark:bg-purple-900/5' : ''
                        }`}
                        onClick={() => setFocusedRowIndex(index)}
                        tabIndex={0}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedQuestionIds.has(question.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectQuestion(question.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                          {startRecord + index}
                        </td>
                        <td className="px-4 py-4">
                          <div className="max-w-md">
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                              {question.question_text}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {question.section?.name || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {getTypeBadge(question.question_type)}
                        </td>
                        <td className="px-4 py-4">
                          {getDifficultyBadge(question.difficulty_level)}
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(question)}
                        </td>
                        <td className="px-4 py-4">
                          {getSourceBadge(question.source)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/questions/${question.id}/edit`);
                              }}
                              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Edit"
                            >
                              <IconEdit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(question);
                              }}
                              className={`p-2 rounded transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center ${
                                (question.is_active === true || question.is_active === 1 || question.is_active === '1')
                                  ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title={(question.is_active === true || question.is_active === 1 || question.is_active === '1') ? 'Deactivate' : 'Activate'}
                            >
                              {(question.is_active === true || question.is_active === 1 || question.is_active === '1') ? (
                                <IconX className="w-4 h-4" />
                              ) : (
                                <IconCheck className="w-4 h-4" />
                              )}
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(question);
                              }}
                              className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Delete"
                            >
                              <IconTrash className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
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
                    <div className="flex gap-2">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : questions.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <IconSearch className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No questions found</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your filters or create a new question</p>
                </div>
              </div>
            ) : (
              questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
                    (question.source === 'AI' || question.source === 'ai') ? 'bg-purple-50/30 dark:bg-purple-900/5' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.has(question.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectQuestion(question.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-4 h-4 text-blue-600 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer flex-shrink-0"
                      />
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 w-6 text-center flex-shrink-0 mt-1">
                        {startRecord + index}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5 line-clamp-2">
                          {question.question_text}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Section: <span className="font-medium text-slate-700 dark:text-slate-300">{question.section?.name || '—'}</span>
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      {getTypeBadge(question.question_type)}
                      <span className="text-xs text-slate-400">•</span>
                      {getDifficultyBadge(question.difficulty_level)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(question)}
                        {getSourceBadge(question.source)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <motion.button
                          onClick={() => navigate(`/admin/questions/${question.id}/edit`)}
                          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                          whileTap={{ scale: 0.9 }}
                          title="Edit"
                        >
                          <IconEdit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleToggleStatus(question)}
                          className={`p-2 rounded transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center ${
                            (question.is_active === true || question.is_active === 1 || question.is_active === '1')
                              ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                              : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                          }`}
                          whileTap={{ scale: 0.9 }}
                          title={(question.is_active === true || question.is_active === 1 || question.is_active === '1') ? 'Deactivate' : 'Activate'}
                        >
                          {(question.is_active === true || question.is_active === 1 || question.is_active === '1') ? (
                            <IconX className="w-4 h-4" />
                          ) : (
                            <IconCheck className="w-4 h-4" />
                          )}
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(question)}
                          className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                          whileTap={{ scale: 0.9 }}
                          title="Delete"
                        >
                          <IconTrash className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>


          {/* Pagination Controls */}
          {questions.length > 0 && pagination.total_pages > 1 && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Showing {startRecord} to {endRecord} of {pagination.total_records} questions
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
                    disabled={loading}
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      const prevPage = (pagination.current_page || 1) - 1;
                      if (prevPage >= 1) {
                        handlePageChange(prevPage);
                      }
                    }}
                    disabled={(pagination.current_page || 1) <= 1 || loading}
                    className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 touch-manipulation min-h-[36px] min-w-[80px]"
                    whileHover={{ scale: (pagination.current_page || 1) <= 1 || loading ? 1 : 1.02 }}
                    whileTap={{ scale: (pagination.current_page || 1) <= 1 || loading ? 1 : 0.98 }}
                  >
                    Previous
                  </motion.button>
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 px-2">
                    Page {pagination.current_page || 1} of {pagination.total_pages || 1}
                  </span>
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      const nextPage = (pagination.current_page || 1) + 1;
                      const totalPages = pagination.total_pages || 1;
                      if (nextPage <= totalPages) {
                        handlePageChange(nextPage);
                      }
                    }}
                    disabled={(pagination.current_page || 1) >= (pagination.total_pages || 1) || loading}
                    className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 touch-manipulation min-h-[36px] min-w-[80px]"
                    whileHover={{ scale: (pagination.current_page || 1) >= (pagination.total_pages || 1) || loading ? 1 : 1.02 }}
                    whileTap={{ scale: (pagination.current_page || 1) >= (pagination.total_pages || 1) || loading ? 1 : 0.98 }}
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            </div>
          )}
          
          {/* Results Count (when no pagination) */}
          {questions.length > 0 && pagination.total_pages <= 1 && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Showing {pagination.total_records} question{pagination.total_records !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedQuestion(null);
        }}
        onConfirm={confirmDelete}
        title={Array.isArray(selectedQuestion) ? "Delete Questions" : "Delete Question"}
        message={Array.isArray(selectedQuestion) 
          ? `Are you sure you want to delete ${selectedQuestion.length} question(s)? This will set them to Inactive status.`
          : `Are you sure you want to delete this question? This will set it to Inactive status.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />


      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* AI Question Generator Modal */}
      {showAIGenerator && (
        <AIQuestionGenerator
          sections={sections}
          onQuestionsGenerated={() => {
            loadQuestions(currentPage);
          }}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </AdminLayout>
  );
}

export default QuestionsList;
