import { ROLES } from './constants';

/**
 * Central place that decides where the "Become a Supplier" CTA (Home hero +
 * Footer) should send the user, based on their current auth state.
 *
 *  - Guest (not logged in)      -> Register page, supplier tab pre-selected
 *  - Logged in as CUSTOMER      -> Supplier upgrade/application page
 *  - Logged in as SUPPLIER      -> straight to their Supplier Dashboard
 *  - Logged in as ADMIN         -> straight to the Admin Dashboard
 */
export function getBecomeSupplierRoute({ isAuthenticated, role }) {
  if (!isAuthenticated) return '/register?type=supplier';

  switch (role) {
    case ROLES.SUPPLIER:
      return '/supplier/dashboard';
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.CUSTOMER:
      return '/register/supplier-upgrade';
    default:
      return '/register?type=supplier';
  }
}

export function getBecomeSupplierLabel({ isAuthenticated, role }) {
  if (isAuthenticated && role === ROLES.SUPPLIER) return 'Go to Supplier Dashboard';
  if (isAuthenticated && role === ROLES.ADMIN) return 'Go to Admin Dashboard';
  if (isAuthenticated && role === ROLES.CUSTOMER) return 'Apply as a Supplier';
  return 'Become a Supplier';
}
