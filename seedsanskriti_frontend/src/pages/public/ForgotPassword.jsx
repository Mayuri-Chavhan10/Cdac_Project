import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import AlertMessage from '../../components/common/AlertMessage';
import Spinner from '../../components/common/Spinner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const response = await authService.forgotPassword({ email });
      setMessage(response);
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
                <i className="bi bi-key text-terracotta" style={{ fontSize: '2rem' }} />
                <h2 className="font-display mt-2 mb-0">Forgot your password?</h2>
                <p className="text-soft">Enter your email and we'll send you a reset link</p>
              </div>

              <AlertMessage variant="success" message={message} onClose={() => setMessage(null)} />
              <AlertMessage message={error} onClose={() => setError(null)} />

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email address</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? (<><Spinner className="me-2" />Sending…</>) : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center mt-4 mb-0 text-soft">
                Remembered your password? <Link to="/login">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
