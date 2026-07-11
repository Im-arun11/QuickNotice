import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to attach Supabase access token to headers
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

// API Endpoint Collections
export const authAPI = {
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await API.get('/auth/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    // Check if profileData contains a file upload (multipart/form-data)
    const headers = profileData instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };

    const response = await API.put('/auth/profile', profileData, { headers });
    return response.data;
  }
};

export const noticesAPI = {
  getNotices: async (filters = {}) => {
    const response = await API.get('/notices', { params: filters });
    return response.data;
  },
  getNotice: async (id) => {
    const response = await API.get(`/notices/${id}`);
    return response.data;
  },
  createNotice: async (noticeData) => {
    const response = await API.post('/notices', noticeData);
    return response.data;
  },
  updateNotice: async (id, noticeData) => {
    const response = await API.put(`/notices/${id}`, noticeData);
    return response.data;
  },
  deleteNotice: async (id) => {
    const response = await API.delete(`/notices/${id}`);
    return response.data;
  },
  closeNotice: async (id) => {
    const response = await API.post(`/notices/${id}/close`);
    return response.data;
  }
};

export const applicationsAPI = {
  apply: async (noticeId) => {
    const response = await API.post(`/applications/apply/${noticeId}`);
    return response.data;
  },
  getMyApplications: async () => {
    const response = await API.get('/applications/my-applications');
    return response.data;
  },
  getNoticeApplicants: async (noticeId) => {
    const response = await API.get(`/applications/notice/${noticeId}`);
    return response.data;
  },
  updateStatus: async (appId, status) => {
    const response = await API.put(`/applications/${appId}/status`, { status });
    return response.data;
  }
};

export default API;
