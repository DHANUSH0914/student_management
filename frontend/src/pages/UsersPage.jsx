import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api/axios';

/**
 * UsersPage — ADMIN only page to manage system users.
 *
 * Features:
 *  - View all users (id, username, role)
 *  - Create new USER or ADMIN account
 *  - Delete existing users (cannot delete yourself)
 */
function UsersPage() {
    // ─── State ────────────────────────────────────────────────────────────────
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Create user form
    const [form, setForm] = useState({ username: '', password: '', role: 'USER' });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Custom Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const currentUser = localStorage.getItem('username');

    // ─── Fetch Users ───────────────────────────────────────────────────────────
    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch {
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // ─── Form Handlers ─────────────────────────────────────────────────────────
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setFormErrors({ ...formErrors, [e.target.name]: '' });
    };

    const validate = () => {
        const errs = {};
        if (!form.username.trim()) errs.username = 'Username is required.';
        else if (form.username.length < 3) errs.username = 'Min 3 characters.';
        if (!form.password.trim()) errs.password = 'Password is required.';
        else if (form.password.length < 4) errs.password = 'Min 4 characters.';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

        setSubmitting(true);
        setError('');
        try {
            const res = await api.post('/users', form);
            setSuccessMsg(`✅ User "${res.data.username}" (${res.data.role}) created successfully!`);
            setForm({ username: '', password: '', role: 'USER' });
            setShowForm(false);
            fetchUsers();
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create user.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Delete User ───────────────────────────────────────────────────────────
    const triggerDelete = (id, username) => {
        if (username === currentUser) {
            setError("⚠️ You cannot delete your own account.");
            return;
        }
        setUserToDelete({ id, username });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/users/${userToDelete.id}`);
            setSuccessMsg(`✅ User "${userToDelete.username}" deleted.`);
            fetchUsers();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch {
            setError('Failed to delete user.');
        } finally {
            setShowDeleteModal(false);
            setUserToDelete(null);
        }
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="main-content">

                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">👤 User Management</h1>
                        <p className="page-subtitle">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => { setShowForm(!showForm); setError(''); setFormErrors({}); }}
                        id="btn-toggle-create-user"
                    >
                        {showForm ? '✖ Cancel' : '➕ Create User'}
                    </button>
                </div>

                {/* Alerts */}
                {successMsg && <div className="alert alert-success">{successMsg}</div>}
                {error && <div className="alert alert-error">⚠️ {error}</div>}

                {/* ── Create User Form ── */}
                {showForm && (
                    <div className="form-card" style={{ marginBottom: '1.5rem' }}>
                        <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>
                            ➕ New User Account
                        </h2>
                        <form onSubmit={handleSubmit} id="create-user-form">
                            <div className="form-grid">

                                {/* Username */}
                                <div className="form-group">
                                    <label className="form-label" htmlFor="cu-username">
                                        Username <span className="required">*</span>
                                    </label>
                                    <input
                                        id="cu-username"
                                        type="text"
                                        name="username"
                                        className={`form-input ${formErrors.username ? 'input-error' : ''}`}
                                        placeholder="e.g., john_doe"
                                        value={form.username}
                                        onChange={handleChange}
                                        autoComplete="off"
                                    />
                                    {formErrors.username && <span className="field-error">{formErrors.username}</span>}
                                </div>

                                {/* Password */}
                                <div className="form-group">
                                    <label className="form-label" htmlFor="cu-password">
                                        Password <span className="required">*</span>
                                    </label>
                                    <input
                                        id="cu-password"
                                        type="password"
                                        name="password"
                                        className={`form-input ${formErrors.password ? 'input-error' : ''}`}
                                        placeholder="Min. 4 characters"
                                        value={form.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                    />
                                    {formErrors.password && <span className="field-error">{formErrors.password}</span>}
                                </div>

                                {/* Role Selector */}
                                <div className="form-group">
                                    <label className="form-label" htmlFor="cu-role">Role</label>
                                    <div className="role-selector">
                                        <label className={`role-option ${form.role === 'USER' ? 'role-option-active-user' : ''}`}>
                                            <input
                                                type="radio" name="role" value="USER"
                                                checked={form.role === 'USER'}
                                                onChange={handleChange}
                                                id="role-user"
                                            />
                                            👤 User
                                            <span className="role-option-desc">Can view & search students</span>
                                        </label>
                                        <label className={`role-option ${form.role === 'ADMIN' ? 'role-option-active-admin' : ''}`}>
                                            <input
                                                type="radio" name="role" value="ADMIN"
                                                checked={form.role === 'ADMIN'}
                                                onChange={handleChange}
                                                id="role-admin"
                                            />
                                            👑 Admin
                                            <span className="role-option-desc">Full access — add, edit, delete</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-footer">
                                <button type="button" className="btn btn-secondary"
                                    onClick={() => { setShowForm(false); setFormErrors({}); setError(''); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary"
                                    disabled={submitting} id="btn-submit-user">
                                    {submitting ? '⏳ Creating...' : '✅ Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Users Table ── */}
                <div className="table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading users...</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <span className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.8rem' }}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </span>
                                                <span className="student-name">{user.username}</span>
                                                {user.username === currentUser && (
                                                    <span style={{
                                                        fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af',
                                                        padding: '1px 7px', borderRadius: '999px', fontWeight: 600
                                                    }}>You</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin-role' : 'badge-user-role'}`}>
                                                {user.role === 'ADMIN' ? '👑 ADMIN' : '👤 USER'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => triggerDelete(user.id, user.username)}
                                                disabled={user.username === currentUser}
                                                id={`btn-delete-user-${user.id}`}
                                                title={user.username === currentUser ? "Can't delete yourself" : 'Delete user'}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </main>

            <ConfirmModal 
                isOpen={showDeleteModal}
                title="⚠️ Delete User Confirmation"
                message={`Are you sure you want to delete user <strong>"${userToDelete?.username}"</strong>?<br/><br/><span style="color:red;font-size:0.85rem">This action cannot be undone.</span>`}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
                confirmText="Yes, Delete User"
            />
        </div>
    );
}

export default UsersPage;
