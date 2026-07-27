import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDateTime, titleCase } from '../../utils/formatters';
import { paymentStatusVariant } from '../../utils/constants';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    paymentService
      .getMyPayments()
      .then(setPayments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading payment history…" />;

  const columns = [
    { key: 'paymentId', label: 'Payment #', sortable: true, render: (p) => `#${p.paymentId}` },
    { key: 'orderId', label: 'Order #', sortable: true, render: (p) => (
      <Link to={`/customer/orders/${p.orderId}`}>#{p.orderId}</Link>
    ) },
    { key: 'amount', label: 'Amount', sortable: true, render: (p) => formatCurrency(p.amount) },
    { key: 'paymentMethod', label: 'Method', sortable: true, render: (p) => titleCase(p.paymentMethod) },
    { key: 'paymentDate', label: 'Date', sortable: true, render: (p) => formatDateTime(p.paymentDate) },
    {
      key: 'paymentStatus',
      label: 'Status',
      sortable: true,
      render: (p) => <StatusBadge status={p.paymentStatus} variant={paymentStatusVariant(p.paymentStatus)} />,
    },
  ];

  return (
    <div>
      <h2 className="font-display mb-1">Payment History</h2>
      <p className="text-soft mb-4">All payments made toward your orders.</p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="card border-0 shadow-sm p-3">
        <DataTable
          columns={columns}
          rows={payments}
          rowKey="paymentId"
          searchKeys={['paymentId', 'orderId', 'paymentStatus', 'paymentMethod']}
          searchPlaceholder="Search payments…"
          emptyTitle="No payments yet"
          emptyMessage="Payments will appear here once you place and pay for an order."
        />
      </div>
    </div>
  );
}
