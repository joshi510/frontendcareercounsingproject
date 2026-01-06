import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import CareerMatches from '../../components/CareerMatches';
import Toast from '../../components/admin/Toast';

// Premium Icons
const IconArrowLeft = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const IconSave = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const IconFileText = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconClock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function AdminStudentResult() {
  const { studentId: rawStudentId, resultId: rawResultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [testAttempts, setTestAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  useEffect(() => {
    if (rawStudentId && rawResultId) {
      loadResult();
    }
  }, [rawStudentId, rawResultId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate both studentId and resultId are present
      if (!rawStudentId || !rawResultId) {
        setError('Missing student ID or result ID');
        return;
      }
      
      // Clean both IDs - remove any colons, slashes, or invalid characters
      // This fixes the bug where resultId might contain ":1" from URL
      const cleanStudentIdString = String(rawStudentId).trim().split(':')[0].split('/')[0].split(' ')[0];
      const cleanResultIdString = String(rawResultId).trim().split(':')[0].split('/')[0].split(' ')[0];
      
      const parsedStudentId = parseInt(cleanStudentIdString, 10);
      const parsedResultId = parseInt(cleanResultIdString, 10);
      
      if (isNaN(parsedStudentId) || isNaN(parsedResultId)) {
        setError('Invalid student ID or result ID');
        return;
      }
      
      // Ensure both are valid numbers before API call
      const finalStudentId = Number(parsedStudentId);
      const finalResultId = Number(parsedResultId);
      
      if (isNaN(finalStudentId) || isNaN(finalResultId)) {
        setError('Invalid student ID or result ID format');
        return;
      }
      
      console.log('🔵 API call - StudentId:', finalStudentId, 'ResultId:', finalResultId);
      const data = await adminAPI.getStudentResult(finalStudentId, finalResultId);
      setResult(data);
      // Set initial note text if there are existing notes
      if (data.counsellor_notes && data.counsellor_notes.length > 0) {
        setNoteText(data.counsellor_notes[0].notes);
      }
      
      // Load test attempts for timeline (if available)
      loadTestAttempts(finalStudentId);
    } catch (err) {
      setError(err.message || 'Failed to load student result');
    } finally {
      setLoading(false);
    }
  };

  const loadTestAttempts = async (studentId) => {
    try {
      setLoadingAttempts(true);
      // Get student data which includes test attempts info
      const studentsData = await adminAPI.getStudents(1, 100);
      const student = studentsData.students?.find(s => s.id === studentId);
      if (student && student.test_attempts) {
        // Filter completed attempts and sort by date
        const attempts = student.test_attempts
          .filter(attempt => attempt.status === 'COMPLETED')
          .sort((a, b) => new Date(b.completed_at || b.created_at) - new Date(a.completed_at || a.created_at));
        setTestAttempts(attempts);
      }
    } catch (err) {
      console.error('Failed to load test attempts:', err);
      // Don't show error, just don't display timeline
      setTestAttempts([]);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      setToast({
        visible: true,
        message: 'Please enter a note before saving',
        type: 'warning'
      });
      return;
    }

    try {
      setSavingNote(true);
      // Clean studentId from params before using
      const cleanStudentId = String(rawStudentId || '').trim().split(':')[0].split('/')[0];
      const parsedStudentIdForNote = parseInt(cleanStudentId, 10);
      
      if (isNaN(parsedStudentIdForNote)) {
        setToast({
          visible: true,
          message: 'Invalid student ID',
          type: 'error'
        });
        return;
      }
      
      await adminAPI.addCounsellorNote(
        parsedStudentIdForNote,
        result.test_attempt_id,
        noteText.trim()
      );
      setToast({
        visible: true,
        message: 'Counsellor note saved successfully',
        type: 'success'
      });
      // Reload result to get updated notes
      loadResult();
    } catch (err) {
      setToast({
        visible: true,
        message: `Failed to save note: ${err.message}`,
        type: 'error'
      });
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading message="Loading student result..." />
      </AdminLayout>
    );
  }

  if (error && !result) {
    return (
      <AdminLayout>
        <Error message={error} onRetry={loadResult} />
      </AdminLayout>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 py-3 sm:py-4 -mx-3 sm:-mx-6 px-3 sm:px-6 border-b border-slate-200 dark:border-slate-700 mb-4 sm:mb-6">
          <div className="flex items-start sm:items-center gap-2 sm:gap-4">
            <motion.button
              onClick={() => navigate('/admin/students')}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconArrowLeft className="w-5 h-5" />
            </motion.button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Student Test Result
                </h1>
                <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Admin View
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                {result.student.full_name} • {result.student.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1.5 sm:mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Test Attempt ID: <span className="font-medium text-slate-700 dark:text-slate-300">{result.test_attempt_id}</span></span>
                {result.created_at && (
                  <span className="hidden sm:inline">Test Date: <span className="font-medium text-slate-700 dark:text-slate-300">
                    {new Date(result.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span></span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Test Attempts Timeline */}
        {testAttempts.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-4">
              <IconClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Test Attempts Timeline
              </h2>
            </div>
            <div className="space-y-3">
              {testAttempts.map((attempt, index) => {
                const isCurrent = attempt.id === result?.test_attempt_id;
                return (
                  <div
                    key={attempt.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
                      isCurrent ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-400 dark:bg-slate-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Attempt #{attempt.id}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {attempt.completed_at
                          ? new Date(attempt.completed_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : attempt.created_at
                          ? new Date(attempt.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Date not available'}
                      </p>
                    </div>
                    {!isCurrent && (
                      <motion.button
                        onClick={() => navigate(`/admin/students/${rawStudentId}/result/${attempt.id}`)}
                        className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors touch-manipulation min-h-[44px] min-w-[60px] flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View
                      </motion.button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* AI Interpretation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IconFileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
              AI Interpretation
            </h2>
          </div>
          <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {result.interpretation_text}
            </p>
          </div>
        </motion.div>

        {/* Strengths and Areas for Improvement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
              Strengths
            </h2>
            <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {result.strengths || 'No strengths data available'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
              Areas for Improvement
            </h2>
            <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {result.areas_for_improvement || 'No improvement areas data available'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Career Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
            Career Recommendations
          </h2>
          {result.careers && result.careers.length > 0 ? (
            <CareerMatches careers={result.careers} />
          ) : (
            <div className="py-8 text-center">
              <p className="text-slate-500 dark:text-slate-400 italic">
                No career recommendations available for this assessment.
              </p>
            </div>
          )}
        </motion.div>

        {/* Counsellor Notes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
            Counsellor Notes
          </h2>

          {/* Existing Notes */}
          {result.counsellor_notes && result.counsellor_notes.length > 0 ? (
            <div className="mb-6 space-y-4">
              {result.counsellor_notes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {note.counsellor ? note.counsellor.full_name : 'Admin'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mt-2">
                    {note.notes}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mb-6 py-4 text-center">
              <p className="text-slate-500 dark:text-slate-400 italic">
                No counsellor notes have been added for this student yet.
              </p>
            </div>
          )}

          {/* Add/Edit Note */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Add or Update Note
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter counsellor notes for this student. This will be visible to counsellors and can help guide student support..."
                rows={6}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base leading-relaxed transition-all"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <motion.button
                onClick={handleSaveNote}
                disabled={savingNote || !noteText.trim()}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md touch-manipulation min-h-[44px]"
                whileHover={{ scale: savingNote ? 1 : 1.02 }}
                whileTap={{ scale: savingNote ? 1 : 0.98 }}
              >
                <IconSave className="w-4 h-4" />
                {savingNote ? 'Saving...' : 'Save Note'}
              </motion.button>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Notes are saved permanently and visible to all counsellors
              </p>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        {result.disclaimer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6"
          >
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
              Disclaimer
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              {result.disclaimer}
            </p>
          </motion.div>
        )}
      </div>

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

export default AdminStudentResult;
