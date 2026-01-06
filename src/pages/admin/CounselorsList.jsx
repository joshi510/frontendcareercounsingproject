import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import { useAlert } from '../../hooks/useAlert';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Toast from '../../components/admin/Toast';

const CENTERS = ['CG', 'SG', 'Nikol', 'Maninagar', 'Surat', 'Rajkot'];

/* -------------------- Floating Input -------------------- */
const FloatingInput = React.memo(
  ({ label, type = 'text', name, value, onChange, required = false, options = null, error = null }) => {
    const hasValue = value !== '';

    return (
      <div className="relative">
        {options ? (
          <div className="relative">
            <select
              name={name}
              value={value}
              onChange={onChange}
              required={required}
              className={`w-full px-4 pt-6 pb-2 border rounded-xl transition-all duration-200
                ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'}
                bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 appearance-none`}
            >
              <option value="">Select Center</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <label
              className={`absolute left-4 pointer-events-none transition-all duration-200
                ${hasValue
                  ? 'top-2 text-xs text-blue-600 dark:text-blue-400 font-medium'
                  : 'top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400'
                }`}
            >
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          </div>
        ) : (
          <>
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              required={required}
              autoComplete="off"
              className={`w-full px-4 pt-6 pb-2 border rounded-xl transition-all duration-200
                ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'}
                bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100`}
            />
            <label
              className={`absolute left-4 pointer-events-none transition-all duration-200
                ${hasValue
                  ? 'top-2 text-xs text-blue-600 dark:text-blue-400 font-medium'
                  : 'top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400'
                }`}
            >
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          </>
        )}

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

/* -------------------- Modal -------------------- */
const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700`}
      >
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

/* -------------------- Skeleton Loader -------------------- */
const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="border-b border-slate-200 dark:border-slate-700">
        <td className="px-6 py-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="flex justify-end gap-2">
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

/* -------------------- Empty State -------------------- */
const EmptyState = ({ onAddClick }) => (
  <div className="text-center py-16 px-6">
    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No counsellors yet</h3>
    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
      Get started by adding your first counsellor to the system.
    </p>
    <button
      onClick={onAddClick}
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add Counsellor
    </button>
  </div>
);

/* -------------------- Main Component -------------------- */
function CounselorsList() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCounselor, setEditingCounselor] = useState(null);
  const [deletingCounselor, setDeletingCounselor] = useState(null);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [centerFilter, setCenterFilter] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [pagination, setPagination] = useState({
    total_records: 0,
    total_pages: 1,
    current_page: 1,
    limit: 25
  });
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false);
  const scrollContainerRef = useRef(null);
  const observerTarget = useRef(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    center: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const { showToast } = useAlert();
  const isLoadingRef = useRef(false);
  const showToastRef = useRef(showToast);

  // Keep showToast ref updated
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Helper function to build clean filters
  const buildFilters = (search, center) => {
    const filters = {};

    if (search && search.trim() !== '') {
      filters.search = search.trim();
    }

    if (center && center !== 'all' && center !== '') {
      filters.center = center;
    }

    return filters;
  };

  // Load counselors with pagination and filters
  const loadCounselors = useCallback(async (pageNum = 1, append = false) => {
    // Prevent duplicate calls only for non-append operations
    if (isLoadingRef.current && !append) {
      return;
    }
    
    try {
      isLoadingRef.current = true;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const filterParams = buildFilters(debouncedSearch, centerFilter);
      console.log('🔵 Loading counselors with filters:', filterParams);
      
      const response = await adminAPI.getUsers('COUNSELOR', pageNum, pageSize, filterParams);

      const counselorsList = response.users || [];
      const paginationData = response.pagination || {
        total_records: counselorsList.length,
        total_pages: 1,
        current_page: pageNum,
        limit: pageSize
      };

      if (append) {
        setCounselors(prev => [...(prev || []), ...counselorsList]);
      } else {
        setCounselors(counselorsList);
      }

      setPagination(paginationData);
      setPage(pageNum);
    } catch (err) {
      showToastRef.current(err.message || 'Failed to load counsellors', 'danger');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [pageSize, debouncedSearch, centerFilter]); // Removed showToast from dependencies

  // Load data when filters or page size changes
  useEffect(() => {
    loadCounselors(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, debouncedSearch, centerFilter]); // Use direct dependencies instead of loadCounselors

  // Infinite scroll handler
  useEffect(() => {
    if (!useInfiniteScroll || loadingMore || loading) return;
    if (!observerTarget.current) return;
    if (pagination.current_page >= pagination.total_pages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.current_page < pagination.total_pages && !loadingMore && !loading) {
          loadCounselors(pagination.current_page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    observer.observe(currentTarget);

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [useInfiniteScroll, loadingMore, loading, pagination.current_page, pagination.total_pages]); // Use specific pagination fields, not loadCounselors

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((p) => ({ ...p, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.full_name) errors.full_name = 'Name required';
    if (!formData.email) errors.email = 'Username required';
    if (showCreateModal && !formData.password) errors.password = 'Password required';
    if (!formData.center) errors.center = 'Center required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({ full_name: '', email: '', password: '', center: '' });
    setFormErrors({});
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await adminAPI.createUser({ ...formData, role: 'COUNSELLOR' });
      setToast({ visible: true, message: 'Counsellor created successfully', type: 'success' });
      setShowCreateModal(false);
      resetForm();
      loadCounselors(1, false); // Reload first page
    } catch (err) {
      setToast({ visible: true, message: err.message || 'Failed to create counsellor', type: 'error' });
    }
  };

  const handleEdit = (c) => {
    setEditingCounselor(c);
    setFormData({ full_name: c.full_name, email: c.email, password: '', center: c.center || '' });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const updateData = { ...formData, role: 'COUNSELLOR' };
      if (!updateData.password) delete updateData.password;
      await adminAPI.updateUser(editingCounselor.id, updateData);
      setToast({ visible: true, message: 'Counsellor updated successfully', type: 'success' });
      setShowEditModal(false);
      setEditingCounselor(null);
      resetForm();
      loadCounselors(page, false); // Reload current page
    } catch (err) {
      setToast({ visible: true, message: err.message || 'Failed to update counsellor', type: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteUser(deletingCounselor.id);
      setToast({ visible: true, message: 'Counsellor deleted successfully', type: 'success' });
      setShowDeleteModal(false);
      setDeletingCounselor(null);
      loadCounselors(page, false); // Reload current page
    } catch (err) {
      setToast({ visible: true, message: err.message || 'Failed to delete counsellor', type: 'error' });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      loadCounselors(newPage, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Counsellors</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
              Manage counsellor accounts and center assignments
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Counsellor
          </motion.button>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          
          {/* Center Filter */}
          <div className="relative sm:w-48">
            <select
              value={centerFilter}
              onChange={(e) => {
                const newCenter = e.target.value;
                console.log('🔵 Center filter changed:', newCenter);
                setCenterFilter(newCenter);
                setPage(1);
              }}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer pr-10"
            >
              <option value="all">All</option>
              {CENTERS.map(center => (
                <option key={center} value={center}>{center}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <label className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span>Page size:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </label>
            <label className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <input
                type="checkbox"
                checked={useInfiniteScroll}
                onChange={(e) => setUseInfiniteScroll(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span>Infinite scroll</span>
            </label>
          </div>
          
          {!useInfiniteScroll && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.total_pages || loading}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Next
              </button>
            </div>
          )}
          
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {counselors.length} of {pagination.total_records} counsellors
          </div>
        </div>

        {/* Premium Data Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700/30 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Center
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (
                  <TableSkeleton />
                ) : counselors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12">
                      <EmptyState onAddClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                      }} />
                    </td>
                  </tr>
                ) : (
                  counselors.map((counselor, index) => (
                    <motion.tr
                      key={counselor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border-b border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                            {counselor.full_name?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {counselor.full_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {counselor.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {counselor.center || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(counselor.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(counselor)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setDeletingCounselor(counselor);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : counselors.length === 0 ? (
              <div className="p-6">
                <EmptyState onAddClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }} />
              </div>
            ) : (
              counselors.map((counselor, index) => (
                <motion.div
                  key={counselor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-base mr-3">
                        {counselor.full_name?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {counselor.full_name}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {counselor.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(counselor)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setDeletingCounselor(counselor);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Center</span>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {counselor.center || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Created</span>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(counselor.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Infinite Scroll Observer */}
          {useInfiniteScroll && pagination.current_page < pagination.total_pages && (
            <div ref={observerTarget} className="py-8 text-center border-t border-slate-200 dark:border-slate-700">
              {loadingMore ? (
                <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Loading more...</span>
                </div>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Scroll to load more
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create Modal */}
        <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Add Counsellor" maxWidth="max-w-lg">
          <form onSubmit={handleCreate} className="space-y-5" onClick={(e) => e.stopPropagation()}>
            <FloatingInput 
              label="Name" 
              name="full_name" 
              value={formData.full_name} 
              onChange={handleInputChange} 
              required 
              error={formErrors.full_name}
            />
            <FloatingInput 
              label="Username" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              required 
              error={formErrors.email}
            />
            <FloatingInput 
              label="Password" 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              required 
              error={formErrors.password}
            />
            <FloatingInput 
              label="Center" 
              name="center" 
              value={formData.center} 
              onChange={handleInputChange} 
              required 
              options={CENTERS}
              error={formErrors.center}
            />
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="flex-1 px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Create
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingCounselor(null); resetForm(); }} title="Edit Counsellor" maxWidth="max-w-lg">
          <form onSubmit={handleUpdate} className="space-y-5" onClick={(e) => e.stopPropagation()}>
            <FloatingInput 
              label="Name" 
              name="full_name" 
              value={formData.full_name} 
              onChange={handleInputChange} 
              required 
              error={formErrors.full_name}
            />
            <FloatingInput 
              label="Username" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              required 
              error={formErrors.email}
            />
            <FloatingInput 
              label="New Password (optional)" 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleInputChange}
              error={formErrors.password}
            />
            <FloatingInput 
              label="Center" 
              name="center" 
              value={formData.center} 
              onChange={handleInputChange} 
              required 
              options={CENTERS}
              error={formErrors.center}
            />
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditingCounselor(null); resetForm(); }}
                className="flex-1 px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Update
              </button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingCounselor(null); }}
          onConfirm={handleDelete}
          title="Delete Counsellor"
          message={`Are you sure you want to delete ${deletingCounselor?.full_name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />

        <Toast
          isVisible={toast.visible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      </div>
    </AdminLayout>
  );
}

export default CounselorsList;
