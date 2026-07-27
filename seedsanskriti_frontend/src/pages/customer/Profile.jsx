import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { userStatusVariant } from '../../utils/constants';
import StatusBadge from '../../components/common/StatusBadge';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  const rows = [
    { label: 'Full Name', value: user.name, icon: 'bi-person' },
    { label: 'Email Address', value: user.email, icon: 'bi-envelope' },
    { label: 'Phone Number', value: user.phoneNumber, icon: 'bi-telephone' },
    { label: 'Address', value: user.address || '—', icon: 'bi-geo-alt' },
    { label: 'City', value: user.city, icon: 'bi-building' },
    { label: 'Pincode', value: user.pincode, icon: 'bi-mailbox' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h2 className="font-display mb-1">My Profile</h2>
          <p className="text-soft mb-0">View and manage your account details.</p>
        </div>
        <Link to="/customer/profile/edit" className="btn btn-primary">
          <i className="bi bi-pencil me-2" />Edit Profile
        </Link>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="rounded-circle bg-green-100 d-flex align-items-center justify-content-center text-primary fw-bold"
              style={{ width: 64, height: 64, fontSize: '1.5rem' }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h5 className="mb-1">{user.name}</h5>
              <StatusBadge status={user.status} variant={userStatusVariant(user.status)} />
            </div>
          </div>

          <div className="row g-4">
            {rows.map((row) => (
              <div className="col-md-6" key={row.label}>
                <div className="text-soft small"><i className={`bi ${row.icon} me-2`} />{row.label}</div>
                <div className="fw-semibold">{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
