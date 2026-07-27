import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import useToast from '../../hooks/useToast';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { SUPPLIER_STATUS, supplierStatusVariant } from '../../utils/constants';

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewSupplier, setViewSupplier] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadSuppliers = () => {
    setLoading(true);
    adminService
      .getAllSuppliers()
      .then(setSuppliers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openStatusModal = (supplier) => {
    setStatusTarget(supplier);
    setNewStatus(supplier.supplierStatus);
  };

  const quickAction = async (supplier, status) => {
    try {
      await adminService.updateSupplierStatus({ supplierId: supplier.supplierId, supplierStatus: status });
      showSuccess(`${supplier.businessName} ${status.toLowerCase()}`);
      loadSuppliers();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusTarget) return;
    setSaving(true);
    try {
      await adminService.updateSupplierStatus({ supplierId: statusTarget.supplierId, supplierStatus: newStatus });
      showSuccess(`${statusTarget.businessName}'s status updated to ${newStatus}`);
      setStatusTarget(null);
      loadSuppliers();
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading suppliers…" />;

  const columns = [
    { key: 'supplierId', label: 'ID', sortable: true, render: (s) => `#${s.supplierId}` },
    { key: 'businessName', label: 'Business Name', sortable: true },
    { key: 'ownerName', label: 'Owner', sortable: true },
    { key: 'city', label: 'City', sortable: true },
    {
      key: 'supplierStatus',
      label: 'Status',
      sortable: true,
      render: (s) => <StatusBadge status={s.supplierStatus} variant={supplierStatusVariant(s.supplierStatus)} />,
    },
  ];

  return (
    <div>
      <h2 className="font-display mb-1">Supplier Management</h2>
      <p className="text-soft mb-4">Review supplier applications and manage their approval status.</p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="card border-0 shadow-sm p-3">
        <DataTable
          columns={columns}
          rows={suppliers}
          rowKey="supplierId"
          searchKeys={['businessName', 'ownerName', 'city']}
          searchPlaceholder="Search suppliers…"
          emptyTitle="No suppliers found"
          renderActions={(supplier) => (
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-sm btn-outline-primary" onClick={() => setViewSupplier(supplier)}>View</button>
              {supplier.supplierStatus === 'PENDING' ? (
                <>
                  <button className="btn btn-sm btn-success" onClick={() => quickAction(supplier, 'APPROVED')}>Approve</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => quickAction(supplier, 'REJECTED')}>Reject</button>
                </>
              ) : (
                <button className="btn btn-sm btn-outline-secondary" onClick={() => openStatusModal(supplier)}>Update Status</button>
              )}
            </div>
          )}
        />
      </div>

      <Modal show={!!viewSupplier} title="Supplier Details" onClose={() => setViewSupplier(null)}>
        {viewSupplier && (
          <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
            <li><strong>Business Name:</strong> {viewSupplier.businessName}</li>
            <li><strong>Owner:</strong> {viewSupplier.ownerName}</li>
            <li><strong>Email:</strong> {viewSupplier.email}</li>
            <li><strong>Phone:</strong> {viewSupplier.phoneNumber}</li>
            <li><strong>GST Number:</strong> {viewSupplier.gstNumber}</li>
            <li><strong>Address:</strong> {viewSupplier.address}, {viewSupplier.city}</li>
            <li><strong>Status:</strong> <StatusBadge status={viewSupplier.supplierStatus} variant={supplierStatusVariant(viewSupplier.supplierStatus)} /></li>
          </ul>
        )}
      </Modal>

      <Modal
        show={!!statusTarget}
        title="Update Supplier Status"
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
            <p className="text-soft">Update approval status for <strong>{statusTarget.businessName}</strong>.</p>
            <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {Object.values(SUPPLIER_STATUS).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </Modal>
    </div>
  );
}
