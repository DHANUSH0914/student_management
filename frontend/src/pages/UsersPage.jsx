import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api/axios';

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Create form
    const [form, setForm] = useState({ username: '', password: '', role: 'USER', email: '' });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Edit modal
    const [editingUser, setEditingUser] = useState(null); // { id, username, role, email }
    const [editForm, setEditForm] = useState({ username: '', email: '', role: 'USER', password: '' });
    const [editErrors, setEditErrors] = useState({});
    const [editSubmitting, setEditSubmitting] = useState(false);

    // Delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const currentUser = localStorage.getItem('username');

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

    // ── Create form handlers ──────────────────────────────────────────
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
        if (!form.email.trim()) errs.email = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
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
            setSuccessMsg(`✅ User "${res.data.username}" (${res.data.role}) created!`);
            setForm({ username: '', password: '', role: 'USER', email: '' });
            setShowForm(false);
            fetchUsers();
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Edit handlers ─────────────────────────────────────────────────
    const openEdit = (user) => {
        setEditingUser(user);
        setEditForm({ username: user.username, email: user.email || '', role: user.role, password: '' });
        setEditErrors({});
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
        setEditErrors({ ...editErrors, [e.target.name]: '' });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!editForm.username.trim()) errs.username = 'Username is required.';
        if (!editForm.email.trim()) errs.email = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(editForm.email)) errs.email = 'Enter a valid email.';
        if (editForm.password && editForm.password.length < 4) errs.password = 'Min 4 characters.';
        if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }

        setEditSubmitting(true);
        try {
            const payload = { username: editForm.username, email: editForm.email, role: editForm.role };
            if (editForm.password) payload.password = editForm.password;
            await api.put(`/users/${editingUser.id}`, payload);
            setSuccessMsg(`✅ User "${editForm.username}" updated!`);
            setEditingUser(null);
            fetchUsers();
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            setEditErrors({ general: err.response?.data?.message || 'Failed to update user.' });
        } finally {
            setEditSubmitting(false);
        }
    };

    // ── Delete handlers ───────────────────────────────────────────────
    const triggerDelete = (id, username) => {
        if (username === currentUser) { setError('⚠️ You cannot delete your own account.'); return; }
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

    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="main-content">

                <div className="page-header">
                    <div>
                        <h1 className="page-title">👤 User Management</h1>
                        <p className="page-subtitle">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setError(''); setFormErrors({}); }} id="btn-toggle-create-user">
                        {showForm ? '✖ Cancel' : '➕ Create User'}
                    </button>
                </div>

                {successMsg && <div className="alert alert-success">{successMsg}</div>}
                {error && <div className="alert alert-error">⚠️ {error}</div>}

                {/* ── Create User Form ── */}
                {showForm && (
                    <div className="form-card" style={{ marginBottom: '1.5rem' }}>
                        <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>➕ New User Account</h2>
                        <form onSubmit={handleSubmit} id="create-user-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="cu-username">Username <span className="required">*</span></label>
                                    <input id="cu-username" type="text" name="username" className={`form-input ${formErrors.username ? 'input-error' : ''}`} placeholder="e.g., john_doe" value={form.username} onChange={handleChange} autoComplete="off" />
                                    {formErrors.username && <span className="field-error">{formErrors.username}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="cu-email">Email <span className="required">*</span></label>
                                    <input id="cu-email" type="email" name="email" className={`form-input ${formErrors.email ? 'input-error' : ''}`} placeholder="user@example.com" value={form.email} onChange={handleChange} autoComplete="off" />
                                    {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="cu-password">Password <span className="required">*</span></label>
                                    <input id="cu-password" type="password" name="password" className={`form-input ${formErrors.password ? 'input-error' : ''}`} placeholder="Min. 4 characters" value={form.password} onChange={handleChange} autoComplete="new-password" />
                                    {formErrors.password && <span className="field-error">{formErrors.password}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <div className="role-selector">
                                        <label className={`role-option ${form.role === 'USER' ? 'role-option-active-user' : ''}`}>
                                            <input type="radio" name="role" value="USER" checked={form.role === 'USER'} onChange={handleChange} id="role-user" /> 👤 User
                                            <span className="role-option-desc">Can view &amp; search students</span>
                                        </label>
                                        <label className={`role-option ${form.role === 'ADMIN' ? 'role-option-active-admin' : ''}`}>
                                            <input type="radio" name="role" value="ADMIN" checked={form.role === 'ADMIN'} onChange={handleChange} id="role-admin" /> 👑 Admin
                                            <span className="role-option-desc">Full access — add, edit, delete</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="form-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setFormErrors({}); setError(''); }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting} id="btn-submit-user">
                                    {submitting ? '⏳ Creating...' : '✅ Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Users Table ── */}
                <div className="table-container">
                    {loading ? (
                        <div className="loading-state"><div className="spinner"></div><p>Loading users...</p></div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Username</th>
                                    <th>Email</th>
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
                                                <span className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.8rem' }}>{user.username.charAt(0).toUpperCase()}</span>
                                                <span className="student-name">{user.username}</span>
                                                {user.username === currentUser && (
                                                    <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af', padding: '1px 7px', borderRadius: '999px', fontWeight: 600 }}>You</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: '0.875rem' }}>{user.email || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                                        <td>
                                            <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin-role' : 'badge-user-role'}`}>
                                                {user.role === 'ADMIN' ? '👑 ADMIN' : '👤 USER'}
                                            </span>
                                        </td>
                                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-warning btn-sm" onClick={() => openEdit(user)} id={`btn-edit-user-${user.id}`}>✏️ Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => triggerDelete(user.id, user.username)}
                                                disabled={user.username === currentUser} id={`btn-delete-user-${user.id}`}
                                                title={user.username === currentUser ? "Can't delete yourself" : 'Delete user'}>
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

            {/* ── Edit User Modal ── */}
            {editingUser && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '480px', width: '95%' }}>
                        <div className="modal-header">
                            <h3>✏️ Edit User — {editingUser.username}</h3>
                        </div>
                        <div className="modal-body">
                            {editErrors.general && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠️ {editErrors.general}</div>}
                            <form onSubmit={handleEditSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Username <span className="required">*</span></label>
                                    <input type="text" name="username" className={`form-input ${editErrors.username ? 'input-error' : ''}`} value={editForm.username} onChange={handleEditChange} />
                                    {editErrors.username && <span className="field-error">{editErrors.username}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email <span className="required">*</span></label>
                                    <input type="email" name="email" className={`form-input ${editErrors.email ? 'input-error' : ''}`} value={editForm.email} onChange={handleEditChange} />
                                    {editErrors.email && <span className="field-error">{editErrors.email}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Password <span style={{ color: '#94a3b8', fontWeight: 400 }}>(leave blank to keep current)</span></label>
                                    <input type="password" name="password" className={`form-input ${editErrors.password ? 'input-error' : ''}`} placeholder="Min. 4 characters" value={editForm.password} onChange={handleEditChange} autoComplete="new-password" />
                                    {editErrors.password && <span className="field-error">{editErrors.password}</span>}
                                </div>
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label">Role</label>
                                    <div className="role-selector">
                                        <label className={`role-option ${editForm.role === 'USER' ? 'role-option-active-user' : ''}`}>
                                            <input type="radio" name="role" value="USER" checked={editForm.role === 'USER'} onChange={handleEditChange} /> 👤 User
                                        </label>
                                        <label className={`role-option ${editForm.role === 'ADMIN' ? 'role-option-active-admin' : ''}`}>
                                            <input type="radio" name="role" value="ADMIN" checked={editForm.role === 'ADMIN'} onChange={handleEditChange} /> 👑 Admin
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)} disabled={editSubmitting}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={editSubmitting}>
                                        {editSubmitting ? '⏳ Saving...' : '💾 Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

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
