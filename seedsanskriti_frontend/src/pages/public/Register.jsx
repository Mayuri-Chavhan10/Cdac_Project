import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/authService';
import AlertMessage from '../../components/common/AlertMessage';
import Spinner from '../../components/common/Spinner';
import useToast from '../../hooks/useToast';
import useAuth from '../../hooks/useAuth';

const initialForm = {
  name: '',
  email: '',
  password: '',
  phoneNumber: '',
  address: '',
  city: '',
  pincode: '',
  businessName: '',
  gstNumber: '',
};

/**
 * Also used, in "upgrade" mode, as the Supplier Registration/Upgrade page
 * for a customer who is already logged in (see /register/supplier-upgrade
 * in AppRoutes.jsx). In that mode the account-type toggle is hidden (the
 * customer is always applying as a supplier), their known profile details
 * are pre-filled, and a fresh submit still goes through the existing
 * POST /api/auth/register/supplier endpoint - supplier accounts require
 * their own login (the backend keys accounts by unique email), so the
 * customer is asked for a business email/password for the new supplier
 * account rather than having their existing account's role changed.
 */
export default function Register({ upgrade = false }) {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const preselectSupplier = upgrade || searchParams.get('type') === 'supplier';

  const [accountType, setAccountType] = useState(preselectSupplier ? 'supplier' : 'customer');
  const [form, setForm] = useState(() =>
    upgrade && user
      ? {
          ...initialForm,
          name: user.name || '',
          phoneNumber: user.phoneNumber || '',
          address: user.address || '',
          city: user.city || '',
          pincode: user.pincode || '',
        }
      : initialForm,
  );
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      if (accountType === 'customer') {
        await authService.registerCustomer(form);
        showSuccess('Account created! Please log in.');
        navigate('/login');
      } else {
        await authService.registerSupplier(form);
        if (upgrade) {
          showSuccess('Supplier application submitted! Our team will review it shortly.');
          navigate('/customer/dashboard');
        } else {
          showSuccess('Supplier account submitted for approval. Please log in.');
          navigate('/login');
        }
      }
    } catch (err) {
      setError(err.message);
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-7">
            <div className="auth-card shadow-sm p-4 p-md-5">
              <div className="text-center mb-4">
                <i className="bi bi-flower2 text-terracotta" style={{ fontSize: '2rem' }} />
                <h2 className="font-display mt-2 mb-0">
                  {upgrade ? 'Apply as a Supplier' : 'Create your account'}
                </h2>
                <p className="text-soft">
                  {upgrade
                    ? "We've pre-filled what we already know about you - just add your business details."
                    : 'Join SeedSanskriti as a customer or supplier'}
                </p>
              </div>

              {!upgrade && (
                <ul className="nav nav-pills nav-justified mb-4">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${accountType === 'customer' ? 'active' : ''}`}
                      onClick={() => setAccountType('customer')}
                    >
                      <i className="bi bi-person me-1" /> I'm a Customer
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${accountType === 'supplier' ? 'active' : ''}`}
                      onClick={() => setAccountType('supplier')}
                    >
                      <i className="bi bi-shop me-1" /> I'm a Supplier
                    </button>
                  </li>
                </ul>
              )}

              {upgrade && (
                <div className="alert alert-info small">
                  <i className="bi bi-info-circle me-1" />
                  Supplier accounts are kept separate from customer accounts, so please use a
                  different email and password below for your supplier login.
                </div>
              )}

              <AlertMessage message={error} onClose={() => setError(null)} />

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Full Name</label>
                    <input className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`} name="name" value={form.name} onChange={handleChange} required />
                    {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email Address</label>
                    <input type="email" className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`} name="email" value={form.email} onChange={handleChange} required />
                    {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`} name="password" value={form.password} onChange={handleChange} required minLength={8} />
                    {fieldErrors.password ? <div className="invalid-feedback">{fieldErrors.password}</div> : <div className="form-text">At least 8 characters</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input className={`form-control ${fieldErrors.phoneNumber ? 'is-invalid' : ''}`} name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
                    {fieldErrors.phoneNumber && <div className="invalid-feedback">{fieldErrors.phoneNumber}</div>}
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Address</label>
                    <input className="form-control" name="address" value={form.address} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">City</label>
                    <input className={`form-control ${fieldErrors.city ? 'is-invalid' : ''}`} name="city" value={form.city} onChange={handleChange} required />
                    {fieldErrors.city && <div className="invalid-feedback">{fieldErrors.city}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Pincode</label>
                    <input className={`form-control ${fieldErrors.pincode ? 'is-invalid' : ''}`} name="pincode" value={form.pincode} onChange={handleChange} required />
                    {fieldErrors.pincode && <div className="invalid-feedback">{fieldErrors.pincode}</div>}
                  </div>

                  {accountType === 'supplier' && (
                    <>
                      <div className="col-12"><hr className="sow-line my-2" /></div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Business Name</label>
                        <input className={`form-control ${fieldErrors.businessName ? 'is-invalid' : ''}`} name="businessName" value={form.businessName} onChange={handleChange} required={accountType === 'supplier'} />
                        {fieldErrors.businessName && <div className="invalid-feedback">{fieldErrors.businessName}</div>}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">GST Number</label>
                        <input className={`form-control ${fieldErrors.gstNumber ? 'is-invalid' : ''}`} name="gstNumber" value={form.gstNumber} onChange={handleChange} required={accountType === 'supplier'} />
                        {fieldErrors.gstNumber && <div className="invalid-feedback">{fieldErrors.gstNumber}</div>}
                      </div>
                      <div className="col-12">
                        <p className="text-soft small">
                          <i className="bi bi-info-circle me-1" />
                          Supplier accounts require admin approval before you can list products.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
                  {loading
                    ? (<><Spinner className="me-2" />{upgrade ? 'Submitting…' : 'Creating account…'}</>)
                    : (upgrade ? 'Submit Supplier Application' : 'Create Account')}
                </button>
              </form>

              {!upgrade && (
                <p className="text-center mt-4 mb-0 text-soft">
                  Already have an account? <Link to="/login">Log in</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
