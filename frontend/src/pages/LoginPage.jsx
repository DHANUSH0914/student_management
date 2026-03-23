import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ForgotModal from '../components/ForgotModal';

/**
 * LoginPage Component — The entry point of the application.
 * 
 * Features:
 *  - Username and password form
 *  - Calls POST /api/auth/login
 *  - On success: stores username and role in localStorage
 *  - Redirects to /dashboard after login
 *  - Shows error message if login fails
 * 
 * Credentials (for testing):
 *   ADMIN: admin / admin123
 *   USER:  user1 / user123
 */
function LoginPage() {
    // ─── State ────
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');       
    const [loading, setLoading] = useState(false); 
    const [showForgotModal, setShowForgotModal] = useState(false);

    const navigate = useNavigate();

    // ─── Login Handler ────────
    const handleLogin = async (e) => {
        e.preventDefault(); 

        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { username, password });
            const data = response.data;

            localStorage.setItem('username', data.username);
            localStorage.setItem('role', data.role);

            navigate('/dashboard');

        } catch (err) {

            if (err.response && err.response.status === 401) {
                setError('Invalid username or password. Please try again.');
            } else {
                setError('Cannot connect to server. Make sure the backend is running.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ─── Quick Login Helper (for demo) ────
    const quickLogin = (role) => {
        if (role === 'admin') {
            setUsername('admin');
            setPassword('admin123');
        } else {
            setUsername('user1');
            setPassword('user123');
        }
        setError('');
    };

    // ─── Render ──────────
    return (
        <div className="login-page">
            {/* Background decorative elements */}
            <div className="login-bg-circle login-bg-circle-1"></div>
            <div className="login-bg-circle login-bg-circle-2"></div>
            <div className="login-bg-circle login-bg-circle-3"></div>

            <div className="login-container">
                {/* Header */}
                <div className="login-header">
                    <div className="login-logo">🎓</div>
                    <h1 className="login-title">Student Management</h1>
                    <p className="login-subtitle">Sign in to your account</p>
                </div>

                {/* Login Form */}
                <form className="login-form" onSubmit={handleLogin}>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Username Field */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            className="form-input"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <span>⏳ Signing in...</span>
                        ) : (
                            <span>🔐 Sign In</span>
                        )}
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button 
                            type="button" 
                            onClick={() => setShowForgotModal(true)} 
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                        >
                            Forgot Password?
                        </button>
                    </div>
                </form>

                {/* Quick Login Hints */}
                <div className="login-hints">
                    <p className="hints-title"></p>
                    <div className="hints-buttons">
                        <button
                            type="button"
                            className="hint-btn hint-admin"
                            onClick={() => quickLogin('admin')}
                        >
                            👑 Admin Login
                        </button>
                        <button
                            type="button"
                            className="hint-btn hint-user"
                            onClick={() => quickLogin('user')}
                        >
                            👤 User Login
                        </button>
                    </div>
                </div>
            </div>

            <ForgotModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />
        </div>
    );
}

export default LoginPage;
