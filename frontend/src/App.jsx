import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import StudentsListPage from './pages/StudentsListPage';
import AddStudentPage from './pages/AddStudentPage';
import UsersPage from './pages/UsersPage';


function PrivateRoute({ children }) {
    const username = localStorage.getItem('username');
    if (!username) {
        // Not logged in → redirect to login
        return <Navigate to="/" replace />;
    }
    return children;
}

// ─── Admin Route ──────────────────────────────────────────────────────────────
// Checks if user is ADMIN
function AdminRoute({ children }) {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (!username) return <Navigate to="/" replace />;
    if (role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

    return children;
}

// ─── App Component ────────────────────────────────────────────────────────────
function App() {
    return (
        <Router>
            <Routes>
                {/* Public Route - Login */}
                <Route path="/" element={<LoginPage />} />

                {/* Public Route - Reset Password */}
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Protected Route - Dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DashboardPage />
                        </PrivateRoute>
                    }
                />

                {/* Protected Route - Students List (all logged-in users) */}
                <Route
                    path="/students"
                    element={
                        <PrivateRoute>
                            <StudentsListPage />
                        </PrivateRoute>
                    }
                />

                {/* Admin Only Route - Add Student */}
                <Route
                    path="/add-student"
                    element={
                        <AdminRoute>
                            <AddStudentPage />
                        </AdminRoute>
                    }
                />

                {/* Admin Only Route - User Management */}
                <Route
                    path="/users"
                    element={
                        <AdminRoute>
                            <UsersPage />
                        </AdminRoute>
                    }
                />

                {/* Catch-all: redirect unknown URLs to login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
