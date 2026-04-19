import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});


// ================== INGESTION ==================
export const ingestionAPI = {
  loadMockJobs: () => api.get('/ingest/mock/jobs'),
  loadMockCandidates: () => api.get('/ingest/mock/candidates'),

  uploadCSV: (data, type, source) =>
    api.post('/ingest/upload', { data, type, source }),

  getStatus: () => api.get('/ingest/status'),
};


// ================== PROCESSING ==================
export const processingAPI = {
  normalize: (type) => api.post('/process/normalize', { type }),

  deduplicate: (type) => api.post('/process/deduplicate', { type }),

  extractSkills: (type) => api.post('/process/extract-skills', { type }),

  match: () => api.post('/process/match'),
};


// ================== EXPORT ==================
export const exportAPI = {
  exportMatchesJSON: () => api.get('/export/matches/json'),

  exportMatchesCSV: () => {
    window.location.href = `${API_URL}/export/matches/csv`;
  },

  exportJobsCSV: () => {
    window.location.href = `${API_URL}/export/jobs/csv`;
  },

  exportCandidatesCSV: () => {
    window.location.href = `${API_URL}/export/candidates/csv`;
  },
};


// ================== 🚀 RESUME UPLOAD ==================
export const resumeAPI = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append("resume", file);

    return axios.post("http://localhost:5000/api/resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  }
};


export default api;