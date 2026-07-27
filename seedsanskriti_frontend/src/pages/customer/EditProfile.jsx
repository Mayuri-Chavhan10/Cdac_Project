import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import AlertMessage from '../../components/common/AlertMessage';
import Spinner from '../../components/common/Spinner';

export default function EditProfile() {
  const { user, refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
  });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState(null);
  const [pwSaving, setPwSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaving(true);
    try {
      await userService.updateMyProfile(form);
      await refreshProfile();
      showSuccess('Profile updated successfully');
      navigate('/customer/profile');
    } catch (err) {
      setError(err.message);
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError(null);

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwSaving(true);
    try {
      await userService.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      showSuccess('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div>
      <h2 className="font-display mb-1">Edit Profile</h2>
      <p className="text-soft mb-4">Keep your details up to date for smooth deliveries.</p>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="mb-3">Personal Details</h6>
            <AlertMessage message={error} onClose={() => setError(null)} />
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`} name="name" value={form.name} onChange={handleChange} required />
                {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input className={`form-control ${fieldErrors.phoneNumber ? 'is-invalid' : ''}`} name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
                {fieldErrors.phoneNumber && <div className="invalid-feedback">{fieldErrors.phoneNumber}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <input className="form-control" name="address" value={form.address} onChange={handleChange} />
              </div>
              <div className="row">
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
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (<><Spinner className="me-2" />Saving…</>) : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="mb-3">Change Password</h6>
            <AlertMessage message={pwError} onClose={() => setPwError(null)} />
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  minLength={8}
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  minLength={8}
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-outline-primary" disabled={pwSaving}>
                {pwSaving ? (<><Spinner className="me-2" />Updating…</>) : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
