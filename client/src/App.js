import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import AddExpense from './components/AddExpense';
import BudgetSettings from './components/BudgetSettings';
import AccountPage from './components/AccountPage';
import './App.css';

const API = 'http://localhost:5001';
const TABS = ['Dashboard', 'Expenses', 'Add Expense', 'Budget', 'Account'];

// ── Setup axios to send JWT token automatically ──
axios.defaults.baseURL = API;
axios.defaults.withCredentials = true;

// This interceptor runs before EVERY axios request
// It automatically adds the JWT token to the header
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default function App() {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(null);
    const [filter, setFilter] = useState({ category: 'All', month: '' });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter.category !== 'All') params.category = filter.category;
            if (filter.month) params.month = filter.month;
            const res = await axios.get('/api/expenses', { params });
            setExpenses(res.data);
        } catch {
            showToast('Failed to load expenses', 'error');
        }
        setLoading(false);
    }, [filter]);

    const fetchSummary = useCallback(async () => {
        try {
            const res = await axios.get('/api/summary');
            setSummary(res.data);
        } catch {}
    }, []);

    const fetchCurrentUser = useCallback(async () => {
        setAuthLoading(true);
        try {
            const res = await axios.get('/api/auth/me');
            setUser(res.data.user);
        } catch {
            setUser(null);
        }
        setAuthLoading(false);
    }, []);

    // Check for Google OAuth redirect token in URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromURL = urlParams.get('token');
        
        if (tokenFromURL) {
            // Save token from Google OAuth redirect
            localStorage.setItem('token', tokenFromURL);
            // Clean URL
            window.history.replaceState({}, '', '/');
            // Fetch user with this token
            fetchCurrentUser();
        }
    }, [fetchCurrentUser]);

    useEffect(() => {
        fetchExpenses();
        fetchSummary();
        fetchCurrentUser();
    }, [fetchExpenses, fetchSummary, fetchCurrentUser]);

    const handleAdd = async (expense) => {
        try {
            await axios.post('/api/expenses', expense);
            showToast('Expense added!');
            fetchExpenses();
            fetchSummary();
            setActiveTab('Expenses');
        } catch {
            showToast('Failed to add expense', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/expenses/${id}`);
            showToast('Expense deleted');
            fetchExpenses();
            fetchSummary();
        } catch {
            showToast('Failed to delete', 'error');
        }
    };

    const handleBudget = async (monthly) => {
        try {
            await axios.put('/api/budget', { monthly });
            showToast('Budget updated!');
            fetchSummary();
        } catch {
            showToast('Failed to update budget', 'error');
        }
    };

    const handleLogin = async (credentials) => {
        try {
            const res = await axios.post('/api/auth/login', credentials);
            
            // ── Save JWT token to localStorage ──
            localStorage.setItem('token', res.data.token);
            
            setUser(res.data.user);
            showToast(`Welcome back, ${res.data.user.name}!`);
            return true;
        } catch (error) {
            showToast(
                error.response?.data?.error || 'Login failed', 
                'error'
            );
            return false;
        }
    };

    // ── UPDATED: Signup accepts FormData now ──
    const handleSignup = async (formData) => {
        try {
            const res = await axios.post('/api/auth/signup', formData, {
                headers: {
                    // Let browser set Content-Type automatically
                    // for FormData (includes boundary)
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // ── Save JWT token ──
            localStorage.setItem('token', res.data.token);
            
            setUser(res.data.user);
            showToast(`Account created for ${res.data.user.name}`);
            return true;
        } catch (error) {
            showToast(
                error.response?.data?.error || 'Signup failed', 
                'error'
            );
            return false;
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
            
            // ── Remove JWT token from localStorage ──
            localStorage.removeItem('token');
            
            setUser(null);
            showToast('Logged out successfully');
        } catch {
            showToast('Logout failed', 'error');
        }
    };

    return (
        <div className="app">
            <header className="header">
                <div className="header-inner">
                    <div className="logo">
                        <span className="logo-icon">◈</span>
                        <span className="logo-text">SPENDWISE</span>
                    </div>
                    <nav className="nav">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="main">
                {activeTab === 'Dashboard' && (
                    <Dashboard summary={summary} expenses={expenses} />
                )}
                {activeTab === 'Expenses' && (
                    <ExpenseList
                        expenses={expenses}
                        filter={filter}
                        setFilter={setFilter}
                        onDelete={handleDelete}
                        loading={loading}
                    />
                )}
                {activeTab === 'Add Expense' && (
                    <AddExpense onAdd={handleAdd} />
                )}
                {activeTab === 'Budget' && (
                    <BudgetSettings summary={summary} onSave={handleBudget} />
                )}
                {activeTab === 'Account' && (
                    <AccountPage
                        user={user}
                        onLogin={handleLogin}
                        onSignup={handleSignup}
                        onLogout={handleLogout}
                        loading={authLoading}
                    />
                )}
            </main>

            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
                </div>
            )}
        </div>
    );
}