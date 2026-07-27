import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { CATEGORY_LABELS, orderStatusVariant, paymentStatusVariant } from '../../utils/constants';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([adminService.getDashboardStats(), adminService.getAllProducts(), adminService.getAllPayments()])
      .then(([statsData, productData, paymentData]) => {
        setStats(statsData);
        setProducts(productData);
        setPayments(paymentData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Building reports…" />;
  if (!stats) return <AlertMessage message={error || 'Could not load reports.'} />;

  const categoryTally = {};
  products.forEach((p) => {
    categoryTally[p.category] = (categoryTally[p.category] || 0) + 1;
  });
  const maxCategoryCount = Math.max(1, ...Object.values(categoryTally));

  const paymentStatusTally = {};
  payments.forEach((p) => {
    paymentStatusTally[p.paymentStatus] = (paymentStatusTally[p.paymentStatus] || 0) + 1;
  });

  const orderStatusEntries = Object.entries(stats.ordersByStatus || {});
  const maxOrderCount = Math.max(1, ...orderStatusEntries.map(([, c]) => c));

  return (
    <div>
      <h2 className="font-display mb-1">Reports</h2>
      <p className="text-soft mb-4">Aggregate insights across orders, products, and payments.</p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h6 className="mb-3">Orders by Status</h6>
            {orderStatusEntries.length === 0 && <p className="text-soft small">No order data yet.</p>}
            {orderStatusEntries.map(([status, count]) => (
              <div className="mb-3" key={status}>
                <div className="d-flex justify-content-between small mb-1">
                  <StatusBadge status={status} variant={orderStatusVariant(status)} />
                  <span>{count}</span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: `${(count / maxOrderCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h6 className="mb-3">Products by Category</h6>
            {Object.keys(categoryTally).length === 0 && <p className="text-soft small">No products listed yet.</p>}
            {Object.entries(categoryTally).map(([category, count]) => (
              <div className="mb-3" key={category}>
                <div className="d-flex justify-content-between small mb-1">
                  <span>{CATEGORY_LABELS[category] || category}</span>
                  <span>{count}</span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <div
                    className="progress-bar bg-secondary"
                    style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="mb-3">Payments by Status</h6>
            <div className="row g-3">
              {Object.entries(paymentStatusTally).map(([status, count]) => (
                <div className="col-6" key={status}>
                  <div className="d-flex align-items-center justify-content-between border rounded-3 p-2">
                    <StatusBadge status={status} variant={paymentStatusVariant(status)} />
                    <span className="fw-bold">{count}</span>
                  </div>
                </div>
              ))}
              {Object.keys(paymentStatusTally).length === 0 && <p className="text-soft small">No payment data yet.</p>}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="mb-3">Key Metrics</h6>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
              <li className="d-flex justify-content-between"><span className="text-soft">Total Revenue</span><strong>{formatCurrency(stats.totalRevenue)}</strong></li>
              <li className="d-flex justify-content-between"><span className="text-soft">Total Orders</span><strong>{stats.totalOrders}</strong></li>
              <li className="d-flex justify-content-between"><span className="text-soft">Total Products</span><strong>{stats.totalProducts}</strong></li>
              <li className="d-flex justify-content-between"><span className="text-soft">Total Customers</span><strong>{stats.totalCustomers}</strong></li>
              <li className="d-flex justify-content-between"><span className="text-soft">Total Suppliers</span><strong>{stats.totalSuppliers}</strong></li>
              <li className="d-flex justify-content-between"><span className="text-soft">Pending Supplier Approvals</span><strong>{stats.pendingSupplierApprovals}</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
