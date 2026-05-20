import { useState, useEffect, useCallback } from 'react';

// ══════════════════════════════════════
// IMPORTS - MODELS (API Layer)
// ══════════════════════════════════════
import { 
    authAPI, 
    expenseAPI, 
    budgetAPI, 
    summaryAPI 
} from './models/api';

// ══════════════════════════════════════
// IMPORTS - VIEWS (UI Components)
// ══════════════════════════════════════
import DashboardView from './views/Dashboard';
import ExpenseListView from './views/ExpenseList';
import AddExpenseView from './views/AddExpense';
import BudgetSettingsView from './views/BudgetSettings';
import AccountPageView from './views/AccountPage';

import './App.css';

const TABS = ['Dashboard', 'Expenses', 'Add Expense', 'Budget', 'Account'];

// ══════════════════════════════════════
// MAIN APP CONTROLLER
// ══════════════════════════════════════
export default function App() {
    // ── UI State ──
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [toast, setToast] = useState(null);

    // ── Data State ──
    const [user, setUser] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(null);
    const [filter, setFilter] = useState({ category: 'All', month: '' });

    // ── Loading State ──
    const [authLoading, setAuthLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    // ══════════════════════════════════════
    // HELPER: Toast Notification
    // ══════════════════════════════════════
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ══════════════════════════════════════
    // CONTROLLER: Fetch Data
    // ══════════════════════════════════════
    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const data = await expenseAPI.getExpenses(filter.category, filter.month);
            setExpenses(data);
        } catch {
            showToast('Failed to load expenses', 'error');
        }
        setLoading(false);
    }, [filter]);

    const fetchSummary = useCallback(async () => {
        try {
            const data = await summaryAPI.getSummary();
            setSummary(data);
        } catch {}
    }, []);

    const fetchCurrentUser = useCallback(async () => {
        setAuthLoading(true);
        try {
            const data = await authAPI.getCurrentUser();
            setUser(data.user);
        } catch {
            setUser(null);
        }
        setAuthLoading(false);
    }, []);

    // ══════════════════════════════════════
    // CONTROLLER: Handle Google OAuth
    // ══════════════════════════════════════
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromURL = urlParams.get('token');
        
        if (tokenFromURL) {
            localStorage.setItem('token', tokenFromURL);
            window.history.replaceState({}, '', '/');
            fetchCurrentUser();
        }
    }, [fetchCurrentUser]);

    // ══════════════════════════════════════
    // CONTROLLER: Initial Data Load
    // ══════════════════════════════════════
    useEffect(() => {
        fetchExpenses();
        fetchSummary();
        fetchCurrentUser();
    }, [fetchExpenses, fetchSummary, fetchCurrentUser]);

    // ══════════════════════════════════════
    // CONTROLLER: Add Expense
    // ══════════════════════════════════════
    const handleAdd = async (expense) => {
        try {
            await expenseAPI.addExpense(
                expense.title,
                expense.amount,
                expense.category,
                expense.date,
                expense.note
            );
            showToast('Expense added!');
            fetchExpenses();
            fetchSummary();
            setActiveTab('Expenses');
        } catch {
            showToast('Failed to add expense', 'error');
        }
    };

    // ══════════════════════════════════════
    // CONTROLLER: Delete Expense
    // ══════════════════════════════════════
    const handleDelete = async (id) => {
        try {
            await expenseAPI.deleteExpense(id);
            showToast('Expense deleted');
            fetchExpenses();
            fetchSummary();
        } catch {
            showToast('Failed to delete', 'error');
        }
    };

    // ══════════════════════════════════════
    // CONTROLLER: Update Budget
    // ══════════════════════════════════════
    const handleBudget = async (monthly) => {
        try {
            await budgetAPI.updateBudget(monthly);
            showToast('Budget updated!');
            fetchSummary();
        } catch {
            showToast('Failed to update budget', 'error');
        }
    };

    // ══════════════════════════════════════
    // CONTROLLER: Login
    // ══════════════════════════════════════
    const handleLogin = async (credentials) => {
        try {
            const result = await authAPI.login(credentials.email, credentials.password);
            localStorage.setItem('token', result.token);
            setUser(result.user);
            showToast(`Welcome back, ${result.user.name}!`);
            return true;
        } catch (error) {
            showToast(
                error.response?.data?.error || 'Login failed', 
                'error'
            );
            return false;
        }
    };

    // ══════════════════════════════════════
    // CONTROLLER: Signup
    // ══════════════════════════════════════
    const handleSignup = async (formData) => {
        try {
            let email, password, name, profilePic;
            
            // Extract values from FormData
            if (formData instanceof FormData) {
                email = formData.get('email');
                password = formData.get('password');
                name = formData.get('name');
                profilePic = formData.get('profilePic');
            } else {
                ({ email, password, name } = formData);
            }

            const result = await authAPI.signup(name, email, password, profilePic);
            localStorage.setItem('token', result.token);
            setUser(result.user);
            showToast(`Account created for ${result.user.name}`);
            return true;
        } catch (error) {
            showToast(
                error.response?.data?.error || 'Signup failed', 
                'error'
            );
            return false;
        }
    };

    // ══════════════════════════════════════
    // CONTROLLER: Logout
    // ══════════════════════════════════════
    const handleLogout = async () => {
        try {
            await authAPI.logout();
            localStorage.removeItem('token');
            setUser(null);
            showToast('Logged out successfully');
        } catch {
            showToast('Logout failed', 'error');
        }
    };

    // ══════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════
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
                    <DashboardView summary={summary} expenses={expenses} />
                )}
                {activeTab === 'Expenses' && (
                    <ExpenseListView
                        expenses={expenses}
                        filter={filter}
                        setFilter={setFilter}
                        onDelete={handleDelete}
                        loading={loading}
                    />
                )}
                {activeTab === 'Add Expense' && (
                    <AddExpenseView onAdd={handleAdd} />
                )}
                {activeTab === 'Budget' && (
                    <BudgetSettingsView summary={summary} onSave={handleBudget} />
                )}
                {activeTab === 'Account' && (
                    <AccountPageView
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