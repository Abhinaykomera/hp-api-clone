import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';

import Home        from './pages/Home';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Houses      from './pages/Houses';
import Submissions from './pages/Submissions';
import Characters from './pages/Characters';
import Students   from './pages/Students';
import Staff      from './pages/Staff';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0d]">
      <Navbar />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ─────────────────────────────── */}
          <Route path="/" element={
            <Layout><Home /></Layout>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Protected routes ──────────────────────────── */}
          <Route path="/houses" element={
            <ProtectedRoute>
              <Layout><Houses /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/characters" element={
            <ProtectedRoute>
              <Layout><Characters /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/students" element={
            <ProtectedRoute>
              <Layout><Students /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/staff" element={
            <ProtectedRoute>
              <Layout><Staff /></Layout>
            </ProtectedRoute>
          } />

          {/* ── Admin routes ──────────────────────────────── */}
          <Route path="/submissions" element={
            <AdminRoute>
              <Layout><Submissions /></Layout>
            </AdminRoute>
          } />

          {/* ── Fallback ──────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
