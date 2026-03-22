import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api/axios';

/**
 * StudentsListPage Component — Shows all students in a table.
 * 
 * Features:
 *  - Fetches all students from GET /api/students
 *  - Search by name (GET /api/students/search?name=xxx)
 *  - Edit button → navigates to edit form (shown to ADMIN only)
 *  - Delete button → removes student (ADMIN only, with confirmation)
 *  - Inline edit form within the table row
 */
function StudentsListPage() {
    // ─── State ───────────────────────────────────────────────────────────────────
    const [students, setStudents] = useState([]);          // All/filtered students
    const [loading, setLoading] = useState(true);           // Loading indicator
    const [error, setError] = useState('');                 // Error message
    const [searchName, setSearchName] = useState('');       // Search input value
    const [editingId, setEditingId] = useState(null);       // ID of student being edited
    const [editForm, setEditForm] = useState({              // Edit form data
        name: '', email: '', course: '', department: ''
    });
    const [successMsg, setSuccessMsg] = useState('');       // Success message
    
    // Custom Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    const navigate = useNavigate();
    const role = localStorage.getItem('role');              // 'ADMIN' or 'USER'
    const isAdmin = role === 'ADMIN';

    // ─── Fetch All Students ───────────────────────────────────────────────────────
    const fetchStudents = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/students');
            setStudents(response.data);
        } catch (err) {
            setError('Failed to load students. Make sure the backend is running.');
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch students when component mounts
    useEffect(() => {
        fetchStudents();
    }, []);

    // ─── Search Handler ───────────────────────────────────────────────────────────
    const handleSearch = async () => {
        if (!searchName.trim()) {
            // If search is empty, show all students
            fetchStudents();
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/students/search?name=${encodeURIComponent(searchName)}`);
            setStudents(response.data);
            if (response.data.length === 0) {
                setError(`No students found with name containing "${searchName}"`);
            }
        } catch (err) {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Allow pressing Enter to search
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    // Clear search and reload all students
    const clearSearch = () => {
        setSearchName('');
        fetchStudents();
        setError('');
    };

    // ─── Edit Handlers ────────────────────────────────────────────────────────────
    const startEdit = (student) => {
        setEditingId(student.id);
        setEditForm({
            name: student.name,
            email: student.email,
            course: student.course,
            department: student.department,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ name: '', email: '', course: '', department: '' });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const saveEdit = async (id) => {
        if (!editForm.name || !editForm.email || !editForm.course || !editForm.department) {
            setError('All fields are required for update.');
            return;
        }
        try {
            await api.put(`/students/${id}`, editForm);
            setSuccessMsg('✅ Student updated successfully!');
            setEditingId(null);
            fetchStudents(); // Reload list
            setTimeout(() => setSuccessMsg(''), 3000); // Hide after 3s
        } catch (err) {
            setError('Failed to update student. Please try again.');
        }
    };

    // ─── Delete Handler ───────────────────────────────────────────────────────────
    const triggerDelete = (id, name) => {
        setStudentToDelete({ id, name });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!studentToDelete) return;
        try {
            await api.delete(`/students/${studentToDelete.id}`);
            setSuccessMsg(`✅ Student "${studentToDelete.name}" deleted successfully!`);
            fetchStudents(); // Reload list
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError('Failed to delete student. Please try again.');
        } finally {
            setShowDeleteModal(false);
            setStudentToDelete(null);
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="page-wrapper">
            <Navbar />

            <main className="main-content">
                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">👥 Students</h1>
                        <p className="page-subtitle">
                            {students.length} student{students.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                    {/* Add Student button for ADMIN */}
                    {isAdmin && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/add-student')}
                            id="btn-goto-add-student"
                        >
                            ➕ Add Student
                        </button>
                    )}
                </div>

                {/* Success Message */}
                {successMsg && <div className="alert alert-success">{successMsg}</div>}

                {/* Error Message */}
                {error && <div className="alert alert-error">⚠️ {error}</div>}

                {/* Search Bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="🔍 Search students by name..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        id="search-name-input"
                    />
                    <button
                        className="btn btn-primary search-btn"
                        onClick={handleSearch}
                        id="btn-search"
                    >
                        Search
                    </button>
                    {searchName && (
                        <button
                            className="btn btn-secondary"
                            onClick={clearSearch}
                            id="btn-clear-search"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Students Table */}
                <div className="table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading students...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📭</span>
                            <h3>No Students Found</h3>
                            <p>
                                {isAdmin
                                    ? 'Get started by adding a new student.'
                                    : 'No student records available.'}
                            </p>
                            {isAdmin && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/add-student')}
                                >
                                    ➕ Add First Student
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Course</th>
                                    <th>Department</th>
                                    {/* Show Actions column only for ADMIN */}
                                    {isAdmin && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.id} className={editingId === student.id ? 'editing-row' : ''}>
                                        {editingId === student.id ? (
                                            /* ── Edit Mode Row ── */
                                            <>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <input
                                                        className="table-input"
                                                        name="name"
                                                        value={editForm.name}
                                                        onChange={handleEditChange}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        className="table-input"
                                                        name="email"
                                                        value={editForm.email}
                                                        onChange={handleEditChange}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        className="table-input"
                                                        name="course"
                                                        value={editForm.course}
                                                        onChange={handleEditChange}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        className="table-input"
                                                        name="department"
                                                        value={editForm.department}
                                                        onChange={handleEditChange}
                                                    />
                                                </td>
                                                <td className="action-btns">
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => saveEdit(student.id)}
                                                        id={`btn-save-${student.id}`}
                                                    >
                                                        💾 Save
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={cancelEdit}
                                                    >
                                                        ✖ Cancel
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            /* ── View Mode Row ── */
                                            <>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <span className="student-name">{student.name}</span>
                                                </td>
                                                <td>
                                                    <span className="student-email">{student.email}</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-course">{student.course}</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-dept">{student.department}</span>
                                                </td>
                                                {/* Show Edit/Delete only for ADMIN */}
                                                {isAdmin && (
                                                    <td className="action-btns">
                                                        <button
                                                            className="btn btn-warning btn-sm"
                                                            onClick={() => startEdit(student)}
                                                            id={`btn-edit-${student.id}`}
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => triggerDelete(student.id, student.name)}
                                                            id={`btn-delete-${student.id}`}
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </td>
                                                )}
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            <ConfirmModal 
                isOpen={showDeleteModal}
                title="⚠️ Delete Confirmation"
                message={`Are you sure you want to delete student <strong>"${studentToDelete?.name}"</strong>?<br/><br/><span style="color:red;font-size:0.85rem">This action cannot be undone.</span>`}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
                confirmText="Yes, Delete Student"
            />
        </div>
    );
}

export default StudentsListPage;
