import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/authService';
import AlertMessage from '../../components/common/AlertMessage';
import Spinner from '../../components/common/Spinner';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ token: searchParams.get('token') || '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token: form.token, newPassword: form.newPassword });
      navigate('/login');
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
                <i className="bi bi-shield-lock text-terracotta" style={{ fontSize: '2rem' }} />
                <h2 className="font-display mt-2 mb-0">Reset your password</h2>
                <p className="text-soft">Choose a new password for your account</p>
              </div>

              <AlertMessage message={error} onClose={() => setError(null)} />

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Reset Token</label>
                  <input
                    className="form-control"
                    value={form.token}
                    onChange={(e) => setForm({ ...form, token: e.target.value })}
                    required
                  />
                  <div className="form-text">Pasted automatically from your reset link, if you opened one.</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    minLength={8}
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    minLength={8}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? (<><Spinner className="me-2" />Resetting…</>) : 'Reset Password'}
                </button>
              </form>

              <p className="text-center mt-4 mb-0 text-soft">
                <Link to="/login">Back to login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
