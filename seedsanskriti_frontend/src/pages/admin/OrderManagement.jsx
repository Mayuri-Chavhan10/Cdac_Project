import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import useToast from '../../hooks/useToast';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ORDER_STATUS_OPTIONS, orderStatusVariant } from '../../utils/constants';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadOrders = () => {
    setLoading(true);
    adminService
      .getAllOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openStatusModal = (order) => {
    setStatusTarget(order);
    setNewStatus(order.orderStatus);
  };

  const handleUpdateStatus = async () => {
    if (!statusTarget) return;
    setSaving(true);
    try {
      await adminService.updateOrderStatus({ orderId: statusTarget.orderId, orderStatus: newStatus });
      showSuccess(`Order #${statusTarget.orderId} updated to ${newStatus}`);
      setStatusTarget(null);
      loadOrders();
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading orders…" />;

  const columns = [
    { key: 'orderId', label: 'Order #', sortable: true, render: (o) => `#${o.orderId}` },
    { key: 'orderDate', label: 'Date', sortable: true, render: (o) => formatDateTime(o.orderDate) },
    { key: 'totalAmount', label: 'Amount', sortable: true, render: (o) => formatCurrency(o.totalAmount) },
    {
      key: 'orderStatus',
      label: 'Status',
      sortable: true,
      render: (o) => <StatusBadge status={o.orderStatus} variant={orderStatusVariant(o.orderStatus)} />,
    },
  ];

  return (
    <div>
      <h2 className="font-display mb-1">Order Management</h2>
      <p className="text-soft mb-4">View every order placed on the platform and update its status.</p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="card border-0 shadow-sm p-3">
        <DataTable
          columns={columns}
          rows={orders}
          rowKey="orderId"
          searchKeys={['orderId', 'orderStatus']}
          searchPlaceholder="Search orders…"
          emptyTitle="No orders found"
          renderActions={(order) => (
            <button className="btn btn-sm btn-outline-primary" onClick={() => openStatusModal(order)}>
              Update Status
            </button>
          )}
        />
      </div>

      <Modal
        show={!!statusTarget}
        title={`Update Order #${statusTarget?.orderId} Status`}
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
          <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            {ORDER_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </Modal>
    </div>
  );
}
