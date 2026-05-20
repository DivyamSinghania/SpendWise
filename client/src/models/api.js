import axios from 'axios';

const API = 'http://localhost:5001';

// Configure axios
axios.defaults.baseURL = API;
axios.defaults.withCredentials = true;

// Automatically attach JWT token to all requests
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ══════════════════════════════════════
// AUTH API CALLS
// ══════════════════════════════════════

export const authAPI = {
    getCurrentUser: async () => {
        const res = await axios.get('/api/auth/me');
        return res.data;
    },

    signup: async (name, email, password, profilePic) => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        if (profilePic) formData.append('profilePic', profilePic);

        const res = await axios.post('/api/auth/signup', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    login: async (email, password) => {
        const res = await axios.post('/api/auth/login', { email, password });
        return res.data;
    },

    logout: async () => {
        const res = await axios.post('/api/auth/logout');
        return res.data;
    }
};

// ══════════════════════════════════════
// EXPENSE API CALLS
// ══════════════════════════════════════

export const expenseAPI = {
    getExpenses: async (category = 'All', month = '') => {
        const params = {};
        if (category !== 'All') params.category = category;
        if (month) params.month = month;

        const res = await axios.get('/api/expenses', { params });
        return res.data;
    },

    addExpense: async (title, amount, category, date, note) => {
        const res = await axios.post('/api/expenses', {
            title,
            amount,
            category,
            date,
            note
        });
        return res.data;
    },

    deleteExpense: async (id) => {
        const res = await axios.delete(`/api/expenses/${id}`);
        return res.data;
    }
};

// ══════════════════════════════════════
// BUDGET API CALLS
// ══════════════════════════════════════

export const budgetAPI = {
    getBudget: async () => {
        const res = await axios.get('/api/budget');
        return res.data;
    },

    updateBudget: async (monthly) => {
        const res = await axios.put('/api/budget', { monthly });
        return res.data;
    }
};

// ══════════════════════════════════════
// SUMMARY API CALLS
// ══════════════════════════════════════

export const summaryAPI = {
    getSummary: async () => {
        const res = await axios.get('/api/summary');
        return res.data;
    }
};
