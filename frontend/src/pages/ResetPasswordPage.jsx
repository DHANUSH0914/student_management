import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../App.css';

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await api.post('/auth/resetpassword', { token, newPassword });
            setMessage(res.data.message || 'Password reset successfully.');
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="login-page">
                <div className="login-container">
                    <h3 style={{ color: 'red' }}>Invalid Link</h3>
                    <p>No reset token found in the URL. Please use the exact link sent to your email.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-container" style={{maxWidth: '400px'}}>
                <div className="login-header">
                    <h1 className="login-title" style={{fontSize: '1.4rem'}}>Set New Password</h1>
                    <p className="login-subtitle">Enter a secure new password.</p>
                </div>

                {message && <div className="alert alert-success">{message} <br/>Redirecting to login...</div>}
                {error && <div className="alert alert-error">⚠️ {error}</div>}

                {!message && (
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Saving...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ResetPasswordPage;
