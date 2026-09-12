import axios from 'axios';

// In production unified deployment, BACKEND_URL defaults to empty string so requests are same-origin.
// In local development (Vite dev on 5173), it defaults to http://127.0.0.1:8000.
// VITE_API_URL environment variable can override both if needed.
const defaultBackendUrl = import.meta.env.DEV ? 'http://127.0.0.1:8000' : '';
export const BACKEND_URL = (
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : defaultBackendUrl
).replace(/\/+$/, '');
const API_BASE_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

export const getHealthStatus = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export const submitDiagnosis = async (formData) => {
  const response = await apiClient.post('/diagnosis/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const generateAIReport = async (payload) => {
  const response = await apiClient.post('/diagnosis/generate-report', payload);
  return response.data;
};

export const getDiagnosisHistory = async (params = {}) => {
  const response = await apiClient.get('/history', { params });
  return response.data;
};

export const getDiagnosisById = async (id) => {
  const response = await apiClient.get(`/history/${id}`);
  return response.data;
};

export const deleteDiagnosis = async (id) => {
  const response = await apiClient.delete(`/history/${id}`);
  return response.data;
};

export const getPatients = async () => {
  const response = await apiClient.get('/patients');
  return response.data;
};

export default apiClient;
