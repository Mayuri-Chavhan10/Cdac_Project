import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import deliveryService from '../../services/deliveryService';
import useToast from '../../hooks/useToast';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { DELIVERY_STATUS_OPTIONS, deliveryStatusVariant } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const emptyForm = { deliveryPartner: '', trackingNumber: '', estimatedDeliveryDate: '', deliveryStatus: '' };

export default function DeliveryManagement() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const { showSuccess, showError } = useToast();

  const loadDeliveries = () => {
    setLoading(true);
    adminService
      .getAllDeliveries()
      .then(setDeliveries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const openEdit = (delivery) => {
    setEditTarget(delivery);
    setForm({
      deliveryPartner: delivery.deliveryPartner || '',
      trackingNumber: delivery.trackingNumber || '',
      estimatedDeliveryDate: delivery.estimatedDeliveryDate || '',
      deliveryStatus: delivery.deliveryStatus || '',
    });
    setFormError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await deliveryService.updateDelivery({
        deliveryId: editTarget.deliveryId,
        ...form,
      });
      showSuccess(`Delivery for Order #${editTarget.orderId} updated`);
      setEditTarget(null);
      loadDeliveries();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading deliveries…" />;

  const columns = [
    { key: 'deliveryId', label: 'Delivery #', sortable: true, render: (d) => `#${d.deliveryId}` },
    { key: 'orderId', label: 'Order #', sortable: true, render: (d) => `#${d.orderId}` },
    { key: 'deliveryPartner', label: 'Courier', sortable: true, render: (d) => d.deliveryPartner || '—' },
    { key: 'trackingNumber', label: 'Tracking #', sortable: true, render: (d) => d.trackingNumber || '—' },
    { key: 'estimatedDeliveryDate', label: 'Est. Delivery', sortable: true, render: (d) => formatDate(d.estimatedDeliveryDate) },
    {
      key: 'deliveryStatus',
      label: 'Status',
      sortable: true,
      render: (d) => <StatusBadge status={d.deliveryStatus} variant={deliveryStatusVariant(d.deliveryStatus)} />,
    },
  ];

  return (
    <div>
      <h2 className="font-display mb-1">Delivery Management</h2>
      <p className="text-soft mb-4">Assign couriers, set tracking numbers, and update delivery status.</p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="card border-0 shadow-sm p-3">
        <DataTable
          columns={columns}
          rows={deliveries}
          rowKey="deliveryId"
          searchKeys={['orderId', 'deliveryPartner', 'trackingNumber', 'deliveryStatus']}
          searchPlaceholder="Search deliveries…"
          emptyTitle="No deliveries found"
          renderActions={(delivery) => (
            <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(delivery)}>
              Update
            </button>
          )}
        />
      </div>

      <Modal
        show={!!editTarget}
        title={`Update Delivery for Order #${editTarget?.orderId}`}
        onClose={() => setEditTarget(null)}
        footer={(
          <>
            <button className="btn btn-outline-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
            <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        )}
      >
        {editTarget && (
          <div>
            <AlertMessage message={formError} onClose={() => setFormError(null)} />
            <div className="mb-3">
              <label className="form-label">Delivery Partner</label>
              <input
                className="form-control"
                value={form.deliveryPartner}
                onChange={(e) => setForm({ ...form, deliveryPartner: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Tracking Number</label>
              <input
                className="form-control"
                value={form.trackingNumber}
                onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Estimated Delivery Date</label>
              <input
                type="date"
                className="form-control"
                value={form.estimatedDeliveryDate}
                onChange={(e) => setForm({ ...form, estimatedDeliveryDate: e.target.value })}
                required
              />
            </div>
            <div className="mb-1">
              <label className="form-label">Delivery Status</label>
              <select
                className="form-select"
                value={form.deliveryStatus}
                onChange={(e) => setForm({ ...form, deliveryStatus: e.target.value })}
              >
                {DELIVERY_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
