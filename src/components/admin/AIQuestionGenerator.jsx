import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../services/api';
import Toast from './Toast';

// Icons
const IconSparkles = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const IconX = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconCheck = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const IconXCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function AIQuestionGenerator({ sections, onQuestionsGenerated, onClose }) {
  const [sectionId, setSectionId] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('Medium');
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const handleGenerate = async () => {
    if (!sectionId) {
      setToast({
        visible: true,
        message: 'Please select a section',
        type: 'error'
      });
      return;
    }

    try {
      setGenerating(true);
      setGeneratedQuestions([]);
      
      const response = await adminAPI.generateAIQuestions(
        parseInt(sectionId),
        difficultyLevel,
        count
      );
      
      if (response.questions && response.questions.length > 0) {
        setGeneratedQuestions(response.questions);
        setToast({
          visible: true,
          message: `Successfully generated ${response.questions.length} question(s). Please review and approve.`,
          type: 'success'
        });
      } else {
        setToast({
          visible: true,
          message: 'No questions were generated. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        visible: true,
        message: error.message || 'Failed to generate questions. Please try again.',
        type: 'error'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (question) => {
    try {
      await adminAPI.approveQuestion(question.id, 'Approved AI-generated question');
      setToast({
        visible: true,
        message: 'Question approved successfully',
        type: 'success'
      });
      setGeneratedQuestions(prev => prev.filter(q => q.id !== question.id));
      if (onQuestionsGenerated) {
        onQuestionsGenerated();
      }
    } catch (error) {
      setToast({
        visible: true,
        message: `Failed to approve question: ${error.message}`,
        type: 'error'
      });
    }
  };

  const handleReject = async (question) => {
    const comment = prompt('Please provide a reason for rejection:');
    if (!comment || !comment.trim()) {
      setToast({
        visible: true,
        message: 'Rejection comment is required',
        type: 'warning'
      });
      return;
    }

    try {
      await adminAPI.rejectQuestion(question.id, comment);
      setToast({
        visible: true,
        message: 'Question rejected successfully',
        type: 'success'
      });
      setGeneratedQuestions(prev => prev.filter(q => q.id !== question.id));
      if (onQuestionsGenerated) {
        onQuestionsGenerated();
      }
    } catch (error) {
      setToast({
        visible: true,
        message: `Failed to reject question: ${error.message}`,
        type: 'error'
      });
    }
  };

  const handleEdit = (question) => {
    // Navigate to edit page - this will be handled by parent
    window.location.href = `/admin/questions/${question.id}/edit`;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <IconSparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI Question Generator</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Generate questions using AI (requires approval)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Generation Form */}
            {generatedQuestions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select a section</option>
                      {sections.map(section => (
                        <option key={section.id} value={section.id}>{section.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={difficultyLevel}
                      onChange={(e) => setDifficultyLevel(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={count}
                      onChange={(e) => setCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">1-10 questions</p>
                  </div>
                </div>

                <motion.button
                  onClick={handleGenerate}
                  disabled={generating || !sectionId}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: generating ? 1 : 1.02 }}
                  whileTap={{ scale: generating ? 1 : 0.98 }}
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <IconSparkles className="w-5 h-5" />
                      Generate Questions
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* Generated Questions Review */}
            {generatedQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Review Generated Questions ({generatedQuestions.length})
                  </h3>
                  <button
                    onClick={() => {
                      setGeneratedQuestions([]);
                      setSectionId('');
                    }}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                  >
                    Generate More
                  </button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {generatedQuestions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                                AI Generated
                              </span>
                              <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">
                                Pending Approval
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                              {question.question_text}
                            </p>
                            {question.options && question.options.length > 0 && (
                              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                {question.options.map((opt, idx) => (
                                  <div key={idx}>
                                    <span className="font-medium">{opt.label})</span> {opt.text}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => handleEdit(question)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </motion.button>
                            <motion.button
                              onClick={() => handleApprove(question)}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Approve"
                            >
                              <IconCheck className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleReject(question)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Reject"
                            >
                              <IconXCircle className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {generatedQuestions.length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p>All questions have been reviewed.</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </>
  );
}

export default AIQuestionGenerator;

