import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import CounsellorDashboard from './pages/dashboards/CounsellorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import StudentsList from './pages/admin/StudentsList';
import AdminStudentResult from './pages/admin/StudentResult';
import Analytics from './pages/admin/Analytics';
import QuestionsList from './pages/admin/QuestionsList';
import QuestionForm from './pages/admin/QuestionForm';
import AddCounsellor from './pages/admin/AddCounsellor';
import CounselorsList from './pages/admin/CounselorsList';
import ResultPage from './pages/ResultPage';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Login />} />
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/result/:attemptId"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT', 'COUNSELLOR']}>
                    <ResultPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/counsellor"
                element={
                  <ProtectedRoute allowedRoles={['COUNSELLOR']}>
                    <CounsellorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <StudentsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students/:studentId/result/:resultId"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminStudentResult />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/questions"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <QuestionsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/questions/new"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <QuestionForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/questions/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <QuestionForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/counsellors/add"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AddCounsellor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/counselors"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <CounselorsList />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

