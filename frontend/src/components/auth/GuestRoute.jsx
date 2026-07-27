import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const homeForRole = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.SUPPLIER:
      return '/supplier/dashboard';
    case ROLES.CUSTOMER:
      return '/customer/dashboard';
    default:
      return '/';
  }
};

// Redirects already-logged-in users away from Login/Register pages.
export default function GuestRoute() {
  const { isAuthenticated, role, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Navigate to={homeForRole(role)} replace />;
  }

  return <Outlet />;
}
