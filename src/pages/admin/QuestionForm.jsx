import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import Toast from '../../components/admin/Toast';

// Icons
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

const IconPlus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const IconTrash = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

function QuestionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sections, setSections] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'MULTIPLE_CHOICE',
    options: [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }, { label: 'E', text: '' }],
    correct_answer: '',
    section_id: '',
    difficulty_level: 'Medium',
    status: 'Active',
  });

  useEffect(() => {
    loadSections();
    if (isEdit) {
      loadQuestion();
    }
  }, [id]);

  const loadSections = async () => {
    try {
      const data = await adminAPI.getSections();
      setSections(data);
      if (!isEdit && data.length > 0) {
        setFormData(prev => ({ ...prev, section_id: data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load sections:', err);
    }
  };

  const loadQuestion = async () => {
    try {
      setLoading(true);
      setError('');
      const question = await adminAPI.getQuestion(parseInt(id));
      
      setFormData({
        question_text: question.question_text || '',
        question_type: question.question_type || 'MULTIPLE_CHOICE',
        options: question.options && question.options.length > 0 
          ? question.options.map((opt, idx) => ({
              label: opt.label || String.fromCharCode(65 + idx),
              text: opt.text || opt
            }))
          : [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }, { label: 'E', text: '' }],
        correct_answer: question.correct_answer || '',
        section_id: question.section_id || '',
        difficulty_level: question.difficulty_level || 'Medium',
        status: question.status || (question.is_active ? 'Active' : 'Inactive')
      });
    } catch (err) {
      setError(err.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Special handling for question_type changes
    if (field === 'question_type') {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        
        // When switching to LIKERT_SCALE: reset options and correct_answer
        if (value === 'LIKERT_SCALE') {
          newData.options = [];
          newData.correct_answer = '';
        }
        // When switching to MULTIPLE_CHOICE: reinitialize default MCQ options
        else if (value === 'MULTIPLE_CHOICE') {
          newData.options = [
            { label: 'A', text: '' },
            { label: 'B', text: '' },
            { label: 'C', text: '' },
            { label: 'D', text: '' },
            { label: 'E', text: '' }
          ];
          newData.correct_answer = '';
        }
        
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    const nextLabel = String.fromCharCode(65 + formData.options.length);
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { label: nextLabel, text: '' }]
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      setToast({
        visible: true,
        message: 'At least 2 options are required',
        type: 'warning'
      });
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const validateForm = () => {
    if (!formData.question_text.trim()) {
      return 'Question text is required';
    }
    if (!formData.section_id) {
      return 'Section is required';
    }
    if (formData.question_type === 'MULTIPLE_CHOICE') {
      const validOptions = formData.options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        return 'At least 2 options are required for multiple choice questions';
      }
      if (!formData.correct_answer) {
        return 'Correct answer is required for multiple choice questions';
      }
    }
    // Scale value is auto-calculated by backend, no validation needed
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setToast({
        visible: true,
        message: validationError,
        type: 'error'
      });
      return;
    }

    try {
      setSaving(true);
      setError('');

      // Build payload conditionally based on question_type
      const submitData = {
        question_text: formData.question_text.trim(),
        question_type: formData.question_type,
        section_id: parseInt(formData.section_id),
        difficulty_level: formData.difficulty_level,
        status: formData.status,
      };

      // For MULTIPLE_CHOICE: send options and correct_answer
      if (formData.question_type === 'MULTIPLE_CHOICE') {
        submitData.options = formData.options.filter(opt => opt.text.trim());
        submitData.correct_answer = formData.correct_answer;
      }
      // For LIKERT_SCALE: do NOT send options or correct_answer
      // Backend will automatically set default Likert options
      // scale_value is also auto-calculated by backend, do NOT send it

      if (isEdit) {
        await adminAPI.updateQuestion(parseInt(id), submitData);
        setToast({
          visible: true,
          message: 'Question updated successfully',
          type: 'success'
        });
      } else {
        await adminAPI.createQuestion(submitData);
        setToast({
          visible: true,
          message: 'Question created successfully',
          type: 'success'
        });
      }

      setTimeout(() => {
        navigate('/admin/questions');
      }, 1000);
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} question`);
      setToast({
        visible: true,
        message: err.message || `Failed to ${isEdit ? 'update' : 'create'} question`,
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  if (error && isEdit) {
    return (
      <AdminLayout>
        <Error message={error} onRetry={loadQuestion} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate('/admin/questions')}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isEdit ? 'Edit Question' : 'Add New Question'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {isEdit ? 'Update question details' : 'Create a new test question'}
            </p>
          </div>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6"
        >
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Question Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.question_text}
              onChange={(e) => handleInputChange('question_text', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter the question text..."
              required
            />
          </div>

          {/* Question Type & Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Question Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.question_type}
                onChange={(e) => handleInputChange('question_type', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="LIKERT_SCALE">Likert Scale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Section <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.section_id}
                onChange={(e) => handleInputChange('section_id', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a section</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Options (for Multiple Choice) */}
          {formData.question_type === 'MULTIPLE_CHOICE' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Options <span className="text-red-500">*</span>
                </label>
                <motion.button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconPlus className="w-4 h-4" />
                  Add Option
                </motion.button>
              </div>
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-300">
                      {option.label}
                    </div>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Option ${option.label} text...`}
                    />
                    {formData.options.length > 2 && (
                      <motion.button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <IconTrash className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Correct Answer <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.correct_answer}
                  onChange={(e) => handleInputChange('correct_answer', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={formData.question_type === 'MULTIPLE_CHOICE'}
                >
                  <option value="">Select correct answer</option>
                  {formData.options.filter(opt => opt.text.trim()).map(opt => (
                    <option key={opt.label} value={opt.label}>{opt.label}) {opt.text}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Scale Value is auto-calculated by backend based on question text keywords */}
          {formData.question_type === 'LIKERT_SCALE' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Scale value is automatically calculated by the system based on keywords in your question text.
              </p>
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                Likert scale questions use standard options: Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree
              </p>
            </div>
          )}

          {/* Order Index */}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <motion.button
              type="button"
              onClick={() => navigate('/admin/questions')}
              className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <IconSave className="w-5 h-5" />
                  {isEdit ? 'Update Question' : 'Create Question'}
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
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

export default QuestionForm;

