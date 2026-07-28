import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import { ROLES } from '../../utils/constants';

const dashboardPath = {
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.SUPPLIER]: '/supplier/dashboard',
  [ROLES.CUSTOMER]: '/customer/dashboard',
};

export default function Navbar() {
  const { isAuthenticated, user, role, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg app-navbar sticky-top py-2">
      <div className="container">
        <NavLink to="/" className="navbar-brand d-flex align-items-center gap-2">
          <i className="bi bi-flower2 text-terracotta" />
          SeedSanskriti
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" end className="nav-link">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/products" className="nav-link">Products</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/about" className="nav-link">About</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/contact" className="nav-link">Contact</NavLink>
            </li>
            {isAuthenticated && role && (
              <li className="nav-item">
                <NavLink to={dashboardPath[role]} className="nav-link">Dashboard</NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {isAuthenticated && role === ROLES.CUSTOMER && (
              <>
                <NavLink to="/customer/wishlist" className="btn btn-outline-secondary btn-sm position-relative">
                  <i className="bi bi-heart" />
                </NavLink>
                <NavLink to="/customer/cart" className="btn btn-outline-primary btn-sm position-relative">
                  <i className="bi bi-cart3" />
                  {itemCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary">
                      {itemCount}
                    </span>
                  )}
                </NavLink>
              </>
            )}

            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-light border dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle" />
                  <span className="d-none d-md-inline">{user?.name?.split(' ')[0] || 'Account'}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <span className="dropdown-item-text text-soft small">
                      Signed in as <strong>{user?.name}</strong>
                      <br />
                      {role && <span className="badge text-bg-light border">{role}</span>}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <NavLink className="dropdown-item" to={role === ROLES.CUSTOMER ? '/customer/profile' : role === ROLES.SUPPLIER ? '/supplier/dashboard' : '/admin/dashboard'}>
                      <i className="bi bi-speedometer2 me-2" />Dashboard
                    </NavLink>
                  </li>
                  {role === ROLES.CUSTOMER && (
                    <li>
                      <NavLink className="dropdown-item" to="/customer/profile">
                        <i className="bi bi-person me-2" />My Profile
                      </NavLink>
                    </li>
                  )}
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2" />Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-outline-primary btn-sm">Login</NavLink>
                <NavLink to="/register" className="btn btn-primary btn-sm">Sign Up</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
