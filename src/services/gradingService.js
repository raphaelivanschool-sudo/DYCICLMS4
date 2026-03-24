import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with auth interceptor
const gradingApi = axios.create({
  baseURL: `${API}/api/grading`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
gradingApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const gradingService = {
  getSubjects:         ()              => gradingApi.get('/subjects'),
  createSubject:       (data)          => gradingApi.post('/subjects', data),
  deleteSubject:       (id)            => gradingApi.delete(`/subjects/${id}`),
  getGradesForSubject: (subjectId)     => gradingApi.get(`/subjects/${subjectId}/grades`),
  updateGrade:         (gradeId, data) => gradingApi.put(`/grades/${gradeId}`, data),
  getMyGrades:         ()              => gradingApi.get('/my-grades'),
  // Admin enrollment methods
  searchStudents:      (search, yearSection) => gradingApi.get('/students', { params: { search, yearSection } }),
  enrollStudent:       (subjectId, studentId) => gradingApi.post(`/subjects/${subjectId}/enroll`, { studentId }),
};
