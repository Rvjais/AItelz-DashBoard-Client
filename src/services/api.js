import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Remove /api if it's already in the URL, then add it back
const cleanURL = API_BASE_URL.replace(/\/api\/?$/, '');
const API_URL = `${cleanURL}/api`;

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Authentication API
export const authAPI = {
    register: async (name, email, password) => {
        const response = await api.post('/auth/register', { name, email, password });
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.client));
        }
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};

// Agents API
export const agentsAPI = {
    getAll: async () => {
        const response = await api.get('/agents');
        return response.data;
    },

    getById: async (agentId) => {
        const response = await api.get(`/agents/${agentId}`);
        return response.data;
    },

    create: async (agentData) => {
        const response = await api.post('/agents', agentData);
        return response.data;
    },

    update: async (agentId, agentData) => {
        const response = await api.put(`/agents/${agentId}`, agentData);
        return response.data;
    },

    delete: async (agentId) => {
        const response = await api.delete(`/agents/${agentId}`);
        return response.data;
    },
};

// Executions API
export const executionsAPI = {
    getAll: async (filters = {}) => {
        const response = await api.get('/executions', { params: filters });
        return response.data;
    },

    getById: async (executionId) => {
        const response = await api.get(`/executions/${executionId}`);
        return response.data;
    },

    getStats: async (filters = {}) => {
        const response = await api.get('/executions/stats', { params: filters });
        return response.data;
    },

    syncNow: async () => {
        const response = await api.post('/executions/sync');
        return response.data;
    },
};

export default api;
