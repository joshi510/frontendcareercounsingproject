import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const sidebarItems = [
  { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { path: '/admin/students', label: 'Students', icon: 'users' },
  { path: '/admin/questions', label: 'Questions', icon: 'questions' },
  { path: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
  { path: '/admin/counselors', label: 'Counsellors', icon: 'add-user' },
];

// SVG Icon Components
const IconDashboard = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const IconUsers = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconAnalytics = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconMenu = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconX = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const IconChevronLeft = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const IconLogout = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconUser = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconSun = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconMoon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const IconChevronDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const IconFileText = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconUserPlus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14H8c-2.209 0-4 1.791-4 4v1h16v-1c0-2.209-1.791-4-4-4z" />
  </svg>
);

const getIcon = (iconName, className) => {
  const icons = {
    dashboard: <IconDashboard className={className} />,
    users: <IconUsers className={className} />,
    questions: <IconFileText className={className} />,
    analytics: <IconAnalytics className={className} />,
    'add-user': <IconUserPlus className={className} />,
  };
  return icons[iconName] || <IconDashboard className={className} />;
};

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('adminSidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    localStorage.setItem('adminSidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        // Restore saved state on desktop
        const saved = localStorage.getItem('adminSidebarOpen');
        if (saved !== null) {
          setSidebarOpen(JSON.parse(saved));
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      const handleClickOutside = (e) => {
        if (!e.target.closest('aside') && !e.target.closest('button[aria-label="Toggle sidebar"]')) {
          setSidebarOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [sidebarOpen, isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const getPageTitle = () => {
    if (location.pathname === '/admin') return 'Dashboard';
    if (location.pathname.startsWith('/admin/students')) {
      if (location.pathname.includes('/result')) return 'Student Result';
      return 'Students';
    }
    if (location.pathname === '/admin/analytics') return 'Analytics';
    return 'Admin Panel';
  };

  const sidebarWidth = sidebarOpen ? '256px' : '80px';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? (sidebarOpen ? sidebarWidth : 0) : sidebarWidth,
          x: isMobile && !sidebarOpen ? -sidebarWidth : 0
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40 shadow-sm overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <AnimatePresence mode="wait">
              {sidebarOpen ? (
                <motion.div
                  key="logo-expanded"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CP</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Career Profiling
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="logo-collapsed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto"
                >
                  <span className="text-white font-bold text-sm">CP</span>
                </motion.div>
              )}
            </AnimatePresence>
            {sidebarOpen && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
              >
                <IconChevronLeft className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const active = isActive(item.path);
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={`flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {getIcon(item.icon, 'w-5 h-5')}
                  </span>
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {active && (
                    <motion.div
                      className="absolute right-2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                      layoutId="activeIndicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-700">
            <AnimatePresence mode="wait">
              {sidebarOpen ? (
                <motion.div
                  key="footer-expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {user?.full_name || 'Admin'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="footer-collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div
        style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
        className="transition-all duration-300"
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
          <div className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <motion.button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 sm:p-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <IconX className="w-5 h-5" /> : <IconMenu className="w-5 h-5" />}
              </motion.button>
              {!sidebarOpen && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSidebarOpen(true)}
                  className="hidden lg:flex p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors touch-manipulation min-w-[44px] min-h-[44px] items-center justify-center"
                  whileTap={{ scale: 0.95 }}
                >
                  <IconChevronRight className="w-5 h-5" />
                </motion.button>
              )}
              <h2 className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-slate-900 dark:text-slate-100 truncate">
                {getPageTitle()}
              </h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="p-2 sm:p-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
              >
                {isDark ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
              </motion.button>

              {/* Role Badge */}
              <span className="hidden sm:inline-flex px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                ADMIN
              </span>

              {/* Profile Dropdown */}
              <div className="relative">
                <motion.button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors touch-manipulation min-w-[44px] min-h-[44px]"
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                    {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <IconChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400 hidden sm:block" />
                </motion.button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {user?.full_name || 'Admin'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <IconLogout className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* Click outside to close dropdown */}
      {profileDropdownOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminLayout;
