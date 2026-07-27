import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import useToast from '../../hooks/useToast';
import useConfirm from '../../hooks/useConfirm';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { orderStatusVariant } from '../../utils/constants';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useToast();
  const { confirmState, requestConfirm, handleConfirm, handleCancel: dismissConfirm } = useConfirm();
  const navigate = useNavigate();

  const loadOrders = () => {
    setLoading(true);
    orderService
      .getMyOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancelOrder = async (order) => {
    const ok = await requestConfirm({
      title: 'Cancel order?',
      message: `Are you sure you want to cancel order #${order.orderId}?`,
    });
    if (!ok) return;
    try {
      await orderService.cancelOrder(order.orderId);
      showSuccess('Order cancelled');
      loadOrders();
    } catch (err) {
      showError(err.message);
    }
  };

  if (loading) return <Loader label="Loading your orders…" />;

  const columns = [
    { key: 'orderId', label: 'Order #', sortable: true, render: (o) => `#${o.orderId}` },
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
      <h2 className="font-display mb-1">My Orders</h2>
      <p className="text-soft mb-4">Track and manage all the orders you've placed.</p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="card border-0 shadow-sm p-3">
        <DataTable
          columns={columns}
          rows={orders}
          rowKey="orderId"
          searchKeys={['orderId', 'orderStatus']}
          searchPlaceholder="Search by order # or status…"
          emptyTitle="No orders yet"
          emptyMessage="Once you place an order, it will show up here."
          renderActions={(order) => (
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/customer/orders/${order.orderId}`)}>
                View
              </button>
              {['PENDING', 'PLACED', 'ACCEPTED', 'CONFIRMED'].includes(order.orderStatus) && (
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancelOrder(order)}>
                  Cancel
                </button>
              )}
            </div>
          )}
        />
      </div>

      <ConfirmDialog state={confirmState} onConfirm={handleConfirm} onCancel={dismissConfirm} />
    </div>
  );
}
