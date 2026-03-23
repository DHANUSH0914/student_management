import { useState, useEffect } from 'react';
import './ConfirmModal.css'; 
import api from '../api/axios';

function ForgotModal({ isOpen, onClose }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Reset state whenever the modal opens
    useEffect(() => {
        if (isOpen) {
            setUsername('');
            setEmail('');
            setMessage('');
            setError('');
            setLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await api.post('/auth/forgotpassword', { username, email });
            setMessage(res.data.message || 'Password reset link generated.');
        } catch (err) {
            setError(err.response?.data?.message || 'Error requesting password reset.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h3>Reset Your Password</h3>
                </div>
                <div className="modal-body">
                    {message && <div className="alert alert-success">{message}</div>}
                    {error && <div className="alert alert-error" style={{marginBottom: '1rem'}}>⚠️ {error}</div>}
                    {!message && (
                        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                            <p style={{marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem'}}>Enter your username and the email address associated with your account to receive a reset link.</p>
                            <div className="form-group">
                                <label className="form-label">Username <span className="required">*</span></label>
                                <input className="form-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Email Address <span className="required">*</span></label>
                                <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </div>
                        </form>
                    )}
                    {message && (
                        <div className="modal-footer" style={{marginTop: '1.5rem'}}>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ForgotModal;
