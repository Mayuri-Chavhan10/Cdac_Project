import { useEffect, useState } from 'react';
import supplierService from '../../services/supplierService';
import useToast from '../../hooks/useToast';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { orderStatusVariant } from '../../utils/constants';

const nextAction = {
  PENDING: { label: 'Accept', fn: 'acceptOrder', variant: 'primary' },
  PLACED: { label: 'Accept', fn: 'acceptOrder', variant: 'primary' },
  ACCEPTED: { label: 'Ship', fn: 'shipOrder', variant: 'info' },
  CONFIRMED: { label: 'Ship', fn: 'shipOrder', variant: 'info' },
  SHIPPED: { label: 'Mark Delivered', fn: 'deliverOrder', variant: 'success' },
};

export default function OrdersReceived() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const { showSuccess, showError } = useToast();

  const loadOrders = () => {
    setLoading(true);
    supplierService
      .getSupplierOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleAction = async (order) => {
    const action = nextAction[order.orderStatus];
    if (!action) return;
    setBusyId(order.orderId);
    try {
      await supplierService[action.fn](order.orderId);
      showSuccess(`Order #${order.orderId} updated`);
      loadOrders();
    } catch (err) {
      showError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader label="Loading orders…" />;

  const columns = [
    { key: 'orderId', label: 'Order #', sortable: true, render: (o) => `#${o.orderId}` },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'orderDate', label: 'Date', sortable: true, render: (o) => formatDate(o.orderDate) },
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
      <h2 className="font-display mb-1">Orders Received</h2>
      <p className="text-soft mb-4">Accept, ship, and mark orders delivered.</p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="card border-0 shadow-sm p-3">
        <DataTable
          columns={columns}
          rows={orders}
          rowKey="orderId"
          searchKeys={['orderId', 'customerName', 'orderStatus']}
          searchPlaceholder="Search by order #, customer or status…"
          emptyTitle="No orders received yet"
          emptyMessage="Orders placed for your products will show up here."
          renderActions={(order) => {
            const action = nextAction[order.orderStatus];
            if (!action) return <span className="text-soft small">No action</span>;
            return (
              <button
                className={`btn btn-sm btn-${action.variant}`}
                disabled={busyId === order.orderId}
                onClick={() => handleAction(order)}
              >
                {busyId === order.orderId ? 'Updating…' : action.label}
              </button>
            );
          }}
        />
      </div>
    </div>
  );
}
