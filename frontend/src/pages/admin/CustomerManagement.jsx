import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import useToast from '../../hooks/useToast';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { ROLES, USER_STATUS, userStatusVariant } from '../../utils/constants';

export default function CustomerManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadUsers = () => {
    setLoading(true);
    adminService
      .getAllUsers()
      .then((data) => setUsers(data.filter((u) => u.role === ROLES.CUSTOMER)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openStatusModal = (user) => {
    setStatusTarget(user);
    setNewStatus(user.status);
  };

  const handleUpdateStatus = async () => {
    if (!statusTarget) return;
    setSaving(true);
    try {
      await adminService.updateUserStatus({ userId: statusTarget.userId, status: newStatus });
      showSuccess(`${statusTarget.name}'s status updated to ${newStatus}`);
      setStatusTarget(null);
      loadUsers();
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading customers…" />;

  const columns = [
    { key: 'userId', label: 'ID', sortable: true, render: (u) => `#${u.userId}` },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'city', label: 'City', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (u) => <StatusBadge status={u.status} variant={userStatusVariant(u.status)} />,
    },
  ];

  return (
    <div>
      <h2 className="font-display mb-1">Customer Management</h2>
      <p className="text-soft mb-4">View customer accounts and manage their access status.</p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="card border-0 shadow-sm p-3">
        <DataTable
          columns={columns}
          rows={users}
          rowKey="userId"
          searchKeys={['name', 'email', 'city']}
          searchPlaceholder="Search customers…"
          emptyTitle="No customers found"
          renderActions={(user) => (
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-sm btn-outline-primary" onClick={() => setViewUser(user)}>View</button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => openStatusModal(user)}>Update Status</button>
            </div>
          )}
        />
      </div>

      <Modal show={!!viewUser} title="Customer Details" onClose={() => setViewUser(null)}>
        {viewUser && (
          <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
            <li><strong>Name:</strong> {viewUser.name}</li>
            <li><strong>Email:</strong> {viewUser.email}</li>
            <li><strong>Phone:</strong> {viewUser.phoneNumber}</li>
            <li><strong>Address:</strong> {viewUser.address || '—'}</li>
            <li><strong>City:</strong> {viewUser.city}</li>
            <li><strong>Pincode:</strong> {viewUser.pincode}</li>
            <li><strong>Status:</strong> <StatusBadge status={viewUser.status} variant={userStatusVariant(viewUser.status)} /></li>
          </ul>
        )}
      </Modal>

      <Modal
        show={!!statusTarget}
        title="Update Customer Status"
        onClose={() => setStatusTarget(null)}
        footer={(
          <>
            <button className="btn btn-outline-secondary" onClick={() => setStatusTarget(null)}>Cancel</button>
            <button className="btn btn-primary" disabled={saving} onClick={handleUpdateStatus}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        )}
      >
        {statusTarget && (
          <div>
            <p className="text-soft">Update account status for <strong>{statusTarget.name}</strong>.</p>
            <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {Object.values(USER_STATUS).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </Modal>
    </div>
  );
}
