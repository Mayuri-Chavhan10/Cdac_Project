import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDateTime, titleCase } from '../../utils/formatters';
import { paymentStatusVariant } from '../../utils/constants';

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService
      .getAllPayments()
      .then(setPayments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading payments…" />;

  const totalRevenue = payments
    .filter((p) => p.paymentStatus === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const columns = [
    { key: 'paymentId', label: 'Payment #', sortable: true, render: (p) => `#${p.paymentId}` },
    { key: 'orderId', label: 'Order #', sortable: true, render: (p) => `#${p.orderId}` },
    { key: 'amount', label: 'Amount', sortable: true, render: (p) => formatCurrency(p.amount) },
    { key: 'paymentMethod', label: 'Method', sortable: true, render: (p) => titleCase(p.paymentMethod) },
    { key: 'paymentDate', label: 'Date', sortable: true, render: (p) => formatDateTime(p.paymentDate) },
    { key: 'transactionId', label: 'Transaction ID', sortable: false, render: (p) => p.transactionId || '—' },
    {
      key: 'paymentStatus',
      label: 'Status',
      sortable: true,
      render: (p) => <StatusBadge status={p.paymentStatus} variant={paymentStatusVariant(p.paymentStatus)} />,
    },
  ];

  return (
    <div>
      <h2 className="font-display mb-1">Payment Management</h2>
      <p className="text-soft mb-4">
        All payments across the platform. Total successful revenue: <strong>{formatCurrency(totalRevenue)}</strong>.
      </p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="card border-0 shadow-sm p-3">
        <DataTable
          columns={columns}
          rows={payments}
          rowKey="paymentId"
          searchKeys={['paymentId', 'orderId', 'paymentStatus', 'paymentMethod', 'transactionId']}
          searchPlaceholder="Search payments…"
          emptyTitle="No payments found"
        />
      </div>
    </div>
  );
}
