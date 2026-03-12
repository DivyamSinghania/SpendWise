import { useState } from 'react';

const INITIAL_LOGIN = { email: '', password: '' };
const INITIAL_SIGNUP = { name: '', email: '', password: '' };

export default function AccountPage({ user, onLogin, onSignup, onLogout, loading }) {
  const [authTab, setAuthTab] = useState('Login');
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN);
  const [signupForm, setSignupForm] = useState(INITIAL_SIGNUP);
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    const ok = await onLogin(loginForm);
    setAuthLoading(false);
    if (ok) setLoginForm(INITIAL_LOGIN);
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    const ok = await onSignup(signupForm);
    setAuthLoading(false);
    if (ok) setSignupForm(INITIAL_SIGNUP);
  };

  if (loading) {
    return (
      <div className="account-wrap">
        <h1 className="page-title">Account</h1>
        <p className="page-sub">Checking your login status</p>
        <div className="card account-card">Loading account...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="account-wrap">
        <h1 className="page-title">Account</h1>
        <p className="page-sub">Manage your profile and logout from here</p>

        <div className="card account-card">
          <div className="account-profile">
            <div className="account-avatar">
              {user.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="account-name">{user.name}</h2>
              <p className="account-email">{user.email}</p>
            </div>
          </div>

          <div className="account-detail-grid">
            <div className="account-detail">
              <span className="account-detail-label">Name</span>
              <span className="account-detail-value">{user.name}</span>
            </div>
            <div className="account-detail">
              <span className="account-detail-label">Email</span>
              <span className="account-detail-value">{user.email}</span>
            </div>
            <div className="account-detail">
              <span className="account-detail-label">Joined</span>
              <span className="account-detail-value">
                {new Date(user.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="account-detail">
              <span className="account-detail-label">Status</span>
              <span className="account-detail-value account-status">Logged in</span>
            </div>
          </div>

          <button className="submit-btn logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-wrap">
      <h1 className="page-title">Account</h1>
      <p className="page-sub">Login or create a new account</p>

      <div className="account-tabs">
        {['Login', 'Signup'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`account-tab-btn ${authTab === tab ? 'active' : ''}`}
            onClick={() => setAuthTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {authTab === 'Login' ? (
        <form className="card account-card" onSubmit={handleLogin}>
          <div className="card-title">Login</div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
              placeholder="Enter your password"
              required
            />
          </div>
          <button className="submit-btn" type="submit" disabled={authLoading}>
            {authLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      ) : (
        <form className="card account-card" onSubmit={handleSignup}>
          <div className="card-title">Signup</div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              value={signupForm.name}
              onChange={(event) => setSignupForm({ ...signupForm, name: event.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={signupForm.email}
              onChange={(event) => setSignupForm({ ...signupForm, email: event.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={signupForm.password}
              onChange={(event) => setSignupForm({ ...signupForm, password: event.target.value })}
              placeholder="Create a password"
              required
            />
          </div>
          <button className="submit-btn" type="submit" disabled={authLoading}>
            {authLoading ? 'Creating account...' : 'Signup'}
          </button>
        </form>
      )}
    </div>
  );
}
