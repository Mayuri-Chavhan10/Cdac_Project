import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import AlertMessage from '../../components/common/AlertMessage';
import Spinner from '../../components/common/Spinner';
import { ROLES } from '../../utils/constants';

const homeForRole = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.SUPPLIER:
      return '/supplier/dashboard';
    default:
      return '/customer/dashboard';
  }
};

export default function Login() {
  const { login, authMessage, clearAuthMessage } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const profile = await login(form);
      showSuccess(`Welcome back, ${profile.name?.split(' ')[0] || 'there'}!`);
      const redirectTo = location.state?.from?.pathname || homeForRole(profile.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div className="auth-card shadow-sm p-4 p-md-5">
              <div className="text-center mb-4">
                <i className="bi bi-flower2 text-terracotta" style={{ fontSize: '2rem' }} />
                <h2 className="font-display mt-2 mb-0">Welcome back</h2>
                <p className="text-soft">Log in to your SeedSanskriti account</p>
              </div>

              <AlertMessage message={authMessage} variant="warning" onClose={clearAuthMessage} />
              <AlertMessage message={error} onClose={() => setError(null)} />

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="text-end mb-3">
                  <Link to="/forgot-password" className="small">Forgot password?</Link>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? (<><Spinner className="me-2" />Logging in…</>) : 'Log In'}
                </button>
              </form>

              <p className="text-center mt-4 mb-0 text-soft">
                Don't have an account? <Link to="/register">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
