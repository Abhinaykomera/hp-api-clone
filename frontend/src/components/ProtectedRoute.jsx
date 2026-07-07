import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route and redirects unauthenticated users to /login.
 * Preserves the originally requested path so we can redirect back after login.
 */
export default function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location  = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
