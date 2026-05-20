import { useState } from 'react';

const INITIAL_LOGIN = { email: '', password: '' };
const INITIAL_SIGNUP = { name: '', email: '', password: '' };

export default function AccountPageView({ 
    user, 
    onLogin, 
    onSignup, 
    onLogout, 
    loading 
}) {
    const [authTab, setAuthTab] = useState('Login');
    const [loginForm, setLoginForm] = useState(INITIAL_LOGIN);
    const [signupForm, setSignupForm] = useState(INITIAL_SIGNUP);
    const [profilePic, setProfilePic] = useState(null);
    const [profilePicPreview, setProfilePicPreview] = useState(null);
    const [authLoading, setAuthLoading] = useState(false);

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(file);
            const previewURL = URL.createObjectURL(file);
            setProfilePicPreview(previewURL);
        }
    };

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
        
        const formData = new FormData();
        formData.append('name', signupForm.name);
        formData.append('email', signupForm.email);
        formData.append('password', signupForm.password);
        
        if (profilePic) {
            formData.append('profilePic', profilePic);
        }
        
        const ok = await onSignup(formData);
        setAuthLoading(false);
        if (ok) {
            setSignupForm(INITIAL_SIGNUP);
            setProfilePic(null);
            setProfilePicPreview(null);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5001/auth/google';
    };

    if (loading) {
        return (
            <div className="account-wrap">
                <h1 className="page-title">Account</h1>
                <p className="page-sub">Checking your login status</p>
                <div className="card account-card">
                    Loading account...
                </div>
            </div>
        );
    }

    if (user) {
        return (
            <div className="account-wrap">
                <h1 className="page-title">Account</h1>
                <p className="page-sub">
                    Manage your profile and logout from here
                </p>

                <div className="card account-card">
                    <div className="account-profile">
                        
                        {user.profilePic ? (
                            <img
                                src={`http://localhost:5001/${user.profilePic}`}
                                alt="Profile"
                                className="account-avatar-img"
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid var(--accent)'
                                }}
                            />
                        ) : (
                            <div className="account-avatar">
                                {user.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}
                        
                        <div>
                            <h2 className="account-name">{user.name}</h2>
                            <p className="account-email">{user.email}</p>
                            {user.authMethod === 'google' && (
                                <span style={{
                                    fontSize: '0.7rem',
                                    background: 'rgba(66,133,244,0.15)',
                                    color: '#4285f4',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    marginTop: '0.3rem',
                                    display: 'inline-block'
                                }}>
                                    🔵 Google Account
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="account-detail-grid">
                        <div className="account-detail">
                            <span className="account-detail-label">Name</span>
                            <span className="account-detail-value">
                                {user.name}
                            </span>
                        </div>
                        <div className="account-detail">
                            <span className="account-detail-label">Email</span>
                            <span className="account-detail-value">
                                {user.email}
                            </span>
                        </div>
                        <div className="account-detail">
                            <span className="account-detail-label">Joined</span>
                            <span className="account-detail-value">
                                {new Date(user.createdAt).toLocaleDateString(
                                    'en-IN',
                                    { day: '2-digit', month: 'short', year: 'numeric' }
                                )}
                            </span>
                        </div>
                        <div className="account-detail">
                            <span className="account-detail-label">Login Method</span>
                            <span className="account-detail-value account-status">
                                {user.authMethod === 'google' ? '🔵 Google' : '🔐 Password'}
                            </span>
                        </div>
                    </div>

                    <button 
                        className="submit-btn logout-btn" 
                        onClick={onLogout}
                    >
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
                    <div className="card-title">Login to SpendWise</div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="google-btn"
                    >
                        <svg width="18" height="18" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        Continue with Google
                    </button>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Email</label>
                        <input
                            className="form-input"
                            type="email"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({ 
                                ...loginForm, email: e.target.value 
                            })}
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
                            onChange={(e) => setLoginForm({ 
                                ...loginForm, password: e.target.value 
                            })}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button 
                        className="submit-btn" 
                        type="submit" 
                        disabled={authLoading}
                    >
                        {authLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

            ) : (
                <form className="card account-card" onSubmit={handleSignup}>
                    <div className="card-title">Create Account</div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="google-btn"
                    >
                        <svg width="18" height="18" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        Sign up with Google
                    </button>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Profile Picture</label>
                        
                        {profilePicPreview && (
                            <img
                                src={profilePicPreview}
                                alt="Preview"
                                style={{
                                    width: '70px',
                                    height: '70px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    marginBottom: '0.5rem',
                                    border: '2px solid var(--accent)',
                                    display: 'block'
                                }}
                            />
                        )}
                        
                        <input
                            className="form-input"
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePicChange}
                            style={{ 
                                padding: '0.5rem',
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{ 
                            fontSize: '0.7rem', 
                            color: 'var(--text3)' 
                        }}>
                            Optional — JPG, PNG up to 5MB
                        </span>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Full Name</label>
                        <input
                            className="form-input"
                            type="text"
                            value={signupForm.name}
                            onChange={(e) => setSignupForm({ 
                                ...signupForm, name: e.target.value 
                            })}
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
                            onChange={(e) => setSignupForm({ 
                                ...signupForm, email: e.target.value 
                            })}
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
                            onChange={(e) => setSignupForm({ 
                                ...signupForm, password: e.target.value 
                            })}
                            placeholder="Create a password"
                            required
                        />
                    </div>
                    <button 
                        className="submit-btn" 
                        type="submit" 
                        disabled={authLoading}
                    >
                        {authLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
            )}
        </div>
    );
}
