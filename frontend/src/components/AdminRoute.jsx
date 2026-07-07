import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route and redirects to / if the logged-in user is not an admin.
 * Falls back to /login if not authenticated at all.
 */
export default function AdminRoute({ children }) {
  const { token, user } = useAuth();
  const location        = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
