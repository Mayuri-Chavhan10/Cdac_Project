import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from '../common/Loader';

export default function RoleRoute({ allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <Loader fullPage label="Checking access…" />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
