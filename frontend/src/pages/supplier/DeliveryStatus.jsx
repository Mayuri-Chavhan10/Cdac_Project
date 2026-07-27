import { useEffect, useState } from 'react';
import supplierService from '../../services/supplierService';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { orderStatusVariant } from '../../utils/constants';

export default function DeliveryStatus() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    supplierService
      .getSupplierOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading delivery status…" />;

  const columns = [
    { key: 'orderId', label: 'Order #', sortable: true, render: (o) => `#${o.orderId}` },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'orderDate', label: 'Order Date', sortable: true, render: (o) => formatDate(o.orderDate) },
    { key: 'totalAmount', label: 'Amount', sortable: true, render: (o) => formatCurrency(o.totalAmount) },
    {
      key: 'orderStatus',
      label: 'Fulfilment Status',
      sortable: true,
      render: (o) => <StatusBadge status={o.orderStatus} variant={orderStatusVariant(o.orderStatus)} />,
    },
  ];

  return (
    <div>
      <h2 className="font-display mb-1">Delivery Status</h2>
      <p className="text-soft mb-4">
        Track fulfilment progress for every order containing your products. Use{' '}
        <strong>Orders Received</strong> to accept, ship, or mark orders delivered.
      </p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="card border-0 shadow-sm p-3">
        <DataTable
          columns={columns}
          rows={orders}
          rowKey="orderId"
          searchKeys={['orderId', 'customerName', 'orderStatus']}
          searchPlaceholder="Search orders…"
          emptyTitle="No orders yet"
        />
      </div>
    </div>
  );
}
