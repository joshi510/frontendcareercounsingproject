import authService from './auth';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = authService.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);
  
  if (response.status === 401) {
    authService.logout();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const error = await response.json();
      errorMessage = error.detail || error.message || `HTTP ${response.status}: ${response.statusText}`;
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const testAPI = {
  getQuestions: () => apiRequest('/test/questions'),
  startTest: () => apiRequest('/test/start', { method: 'POST' }),
  submitAnswers: (attemptId, answers) => apiRequest('/test/submit', {
    method: 'POST',
    body: JSON.stringify({
      attempt_id: Number(attemptId),
      answers: answers.map(ans => ({
        question_id: Number(ans.question_id),
        selected_option: String(ans.selected_option)
      }))
    })
  }),
  getInterpretation: (attemptId) => apiRequest(`/test/interpretation/${attemptId}`),
  // Section-wise endpoints
  getSections: (attemptId = null) => {
    if (attemptId) {
      return apiRequest(`/test/sections?attempt_id=${attemptId}`);
    }
    return apiRequest('/test/sections');
  },
  getCurrentSection: (attemptId) => apiRequest(`/test/${attemptId}/sections/current`),
  getSectionQuestions: (attemptId, sectionId) => apiRequest(`/test/sections/${sectionId}/questions?attempt_id=${attemptId}`),
  startSection: (attemptId, sectionId) => apiRequest(`/test/sections/${sectionId}/start?attempt_id=${attemptId}`, { method: 'POST' }),
  submitSection: (sectionId, attemptId, answers) => apiRequest(`/test/sections/${sectionId}/submit`, {
    method: 'POST',
    body: JSON.stringify({
      attempt_id: Number(attemptId),
      section_id: Number(sectionId),
      answers: answers.map(ans => ({
        question_id: Number(ans.question_id),
        selected_option: String(ans.selected_option)
      }))
    })
  }),
  pauseSection: (attemptId, sectionId) => apiRequest(`/test/sections/${sectionId}/pause?attempt_id=${attemptId}`, { method: 'POST' }),
  resumeSection: (attemptId, sectionId) => apiRequest(`/test/sections/${sectionId}/resume?attempt_id=${attemptId}`, { method: 'POST' }),
  getSectionTimer: (attemptId, sectionId) => apiRequest(`/test/sections/${sectionId}/timer?attempt_id=${attemptId}`),
  getTestStatus: (attemptId) => apiRequest(`/test/${attemptId}/status`),
  getTestProgress: (attemptId) => apiRequest(`/test/${attemptId}/progress`),
  getTestState: (attemptId) => apiRequest(`/test/${attemptId}/state`),
  updateTestState: (attemptId, questionIndex, remainingTime) => apiRequest(`/test/${attemptId}/update-state`, {
    method: 'POST',
    body: JSON.stringify({
      current_question_index: questionIndex,
      remaining_time_seconds: remainingTime
    })
  }),
  saveAnswer: (attemptId, questionId, selectedOption) => apiRequest('/test/save-answer', {
    method: 'POST',
    body: JSON.stringify({
      attempt_id: Number(attemptId),
      question_id: Number(questionId),
      selected_option: String(selectedOption)
    })
  }),
  completeTest: (attemptId, autoSubmit = false) => {
    const url = autoSubmit 
      ? `/test/${attemptId}/complete?auto_submit=true`
      : `/test/${attemptId}/complete`;
    return apiRequest(url, { method: 'POST' });
  }
};

export const studentAPI = {
  getResults: () => apiRequest('/student/result/')
};

export const adminAPI = {
  getAnalytics: () => apiRequest('/admin/analytics'),
  createCounsellor: (counsellorData) => apiRequest('/admin/counsellors', {
    method: 'POST',
    body: JSON.stringify(counsellorData)
  }),
  getStudents: (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.readiness && filters.readiness !== 'all') params.append('readiness', filters.readiness);
    return apiRequest(`/admin/students?${params.toString()}`);
  },
  getStudentResult: (studentId, resultId) => {
    // Clean both IDs to remove any colons or invalid characters
    // This prevents URLs like /admin/students/93/result/74:1
    const cleanStudentId = String(studentId).trim().split(':')[0].split('/')[0].split(' ')[0];
    const cleanResultId = String(resultId).trim().split(':')[0].split('/')[0].split(' ')[0];
    return apiRequest(`/admin/students/${cleanStudentId}/result/${cleanResultId}`);
  },
  addCounsellorNote: (studentId, testAttemptId, notes) => apiRequest(`/admin/students/${studentId}/counsellor-note`, {
    method: 'POST',
    body: JSON.stringify({
      test_attempt_id: testAttemptId,
      notes
    })
  }),
  allowRetake: (studentId) => apiRequest(`/admin/students/${studentId}/allow-retake`, {
    method: 'POST'
  }),
  // Question Management APIs
  getQuestions: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.cursor) queryParams.append('cursor', params.cursor);
    if (params.section_id) queryParams.append('section_id', params.section_id.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.question_type) queryParams.append('question_type', params.question_type);
    if (params.difficulty_level) queryParams.append('difficulty_level', params.difficulty_level);
    if (params.search) queryParams.append('search', params.search);
    if (params.only_pending) queryParams.append('only_pending', params.only_pending);
    return apiRequest(`/admin/questions?${queryParams.toString()}`);
  },
  getQuestion: (questionId) => apiRequest(`/admin/questions/${questionId}`),
  createQuestion: (questionData) => apiRequest('/admin/questions', {
    method: 'POST',
    body: JSON.stringify(questionData)
  }),
  updateQuestion: (questionId, questionData) => apiRequest(`/admin/questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify(questionData)
  }),
  deleteQuestion: (questionId) => apiRequest(`/admin/questions/${questionId}`, {
    method: 'DELETE'
  }),
  activateQuestion: (questionId) => apiRequest(`/admin/questions/${questionId}/activate`, {
    method: 'PATCH'
  }),
  deactivateQuestion: (questionId) => apiRequest(`/admin/questions/${questionId}/deactivate`, {
    method: 'PATCH'
  }),
  getSections: () => apiRequest('/admin/questions/sections/list'),
  // AI Question Generation
  generateAIQuestions: (sectionId, difficultyLevel, count) => apiRequest('/admin/questions/generate-ai', {
    method: 'POST',
    body: JSON.stringify({
      section_id: sectionId,
      difficulty_level: difficultyLevel,
      count: count
    })
  }),
  approveQuestion: (questionId, adminComment) => apiRequest(`/admin/questions/${questionId}/approve`, {
    method: 'POST',
    body: JSON.stringify({
      admin_comment: adminComment || null
    })
  }),
  bulkApproveQuestions: (questionIds, adminComment) => apiRequest('/admin/questions/bulk-approve', {
    method: 'POST',
    body: JSON.stringify({
      question_ids: questionIds,
      admin_comment: adminComment || null
    })
  }),
  rejectQuestion: (questionId, adminComment) => apiRequest(`/admin/questions/${questionId}/reject`, {
    method: 'POST',
    body: JSON.stringify({
      admin_comment: adminComment
    })
  }),
  getQuestionApprovals: (questionId) => apiRequest(`/admin/questions/${questionId}/approvals`),
  // User Management APIs
  getUsers: (role = null, page = 1, limit = 25, filters = {}) => {
    const params = new URLSearchParams();
    if (role && role !== 'all') params.append('role', role);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.center && filters.center !== 'all' && filters.center !== 'undefined') {
      params.append('center', filters.center);
    }
    return apiRequest(`/admin/users?${params.toString()}`);
  },
  createUser: (userData) => apiRequest('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  updateUser: (userId, userData) => apiRequest(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  deleteUser: (userId) => apiRequest(`/admin/users/${userId}`, {
    method: 'DELETE'
  })
};

export const counsellorAPI = {
  getNote: (attemptId) => apiRequest(`/counsellor/notes/${attemptId}`),
  saveNote: (attemptId, notes) => apiRequest('/counsellor/notes', {
    method: 'POST',
    body: JSON.stringify({
      test_attempt_id: attemptId,
      notes
    })
  }),
  getStudents: (page = 1, limit = 25, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    
    // Only add non-empty, valid filter values
    if (filters.search && filters.search.trim() !== '') {
      params.append('search', filters.search.trim());
    }
    if (filters.status && filters.status !== 'all' && filters.status !== 'undefined') {
      params.append('status', filters.status);
    }
    if (filters.readiness && filters.readiness !== 'all' && filters.readiness !== 'undefined') {
      params.append('readiness', filters.readiness);
    }
    if (filters.risk && filters.risk !== 'all' && filters.risk !== 'undefined') {
      params.append('risk', filters.risk);
    }
    
    const url = `/counsellor/students?${params.toString()}`;
    console.log('🔵 Counsellor API Request URL:', url);
    return apiRequest(url);
  }
};

export default apiRequest;
