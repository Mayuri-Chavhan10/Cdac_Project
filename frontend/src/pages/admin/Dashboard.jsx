import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { orderStatusVariant, paymentStatusVariant, deliveryStatusVariant } from '../../utils/constants';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      adminService.getDashboardStats(),
      adminService.getAllOrders(),
      adminService.getAllPayments(),
      adminService.getAllDeliveries(),
    ])
      .then(([statsData, orders, payments, deliveries]) => {
        if (!active) return;
        setStats(statsData);
        setRecentOrders([...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 5));
        setRecentPayments([...payments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)).slice(0, 5));
        setRecentDeliveries(deliveries.slice(-5).reverse());
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loader label="Loading platform overview…" />;
  if (!stats) return <AlertMessage message={error || 'Could not load dashboard.'} />;

  const cards = [
    { label: 'Total Customers', value: stats.totalCustomers, icon: 'bi-people', bg: 'bg-green-100', color: 'text-primary' },
    { label: 'Total Suppliers', value: stats.totalSuppliers, icon: 'bi-shop', bg: 'bg-info-subtle', color: 'text-info' },
    { label: 'Pending Approvals', value: stats.pendingSupplierApprovals, icon: 'bi-hourglass-split', bg: 'bg-warning-subtle', color: 'text-warning' },
    { label: 'Total Products', value: stats.totalProducts, icon: 'bi-seedling', bg: 'bg-green-100', color: 'text-primary' },
    { label: 'Total Orders', value: stats.totalOrders, icon: 'bi-bag-check', bg: 'bg-info-subtle', color: 'text-info' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: 'bi-cash-stack', bg: 'bg-success-subtle', color: 'text-success' },
  ];

  return (
    <div>
      <h2 className="font-display mb-1">Platform Overview</h2>
      <p className="text-soft mb-4">A snapshot of everything happening on SeedSanskriti right now.</p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="row g-3 mb-4">
        {cards.map((c) => (
          <div className="col-6 col-lg-4 col-xl-2" key={c.label}>
            <div className="stat-card p-3 h-100">
              <div className={`stat-icon ${c.bg} ${c.color} mb-2`}>
                <i className={`bi ${c.icon}`} />
              </div>
              <div className="fs-5 fw-bold">{c.value}</div>
              <div className="text-soft small">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {stats.ordersByStatus && (
        <div className="card border-0 shadow-sm p-4 mb-4">
          <h6 className="mb-3">Orders by Status</h6>
          <div className="row g-3">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div className="col-6 col-md-3" key={status}>
                <div className="d-flex align-items-center justify-content-between border rounded-3 p-2">
                  <StatusBadge status={status} variant={orderStatusVariant(status)} />
                  <span className="fw-bold">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Recent Orders</h6>
              <Link to="/admin/orders" className="btn btn-sm btn-link">View All</Link>
            </div>
            <ul className="list-group list-group-flush">
              {recentOrders.length === 0 && <li className="list-group-item text-soft small">No orders yet.</li>}
              {recentOrders.map((o) => (
                <li className="list-group-item d-flex justify-content-between align-items-center" key={o.orderId}>
                  <span>#{o.orderId} · {formatCurrency(o.totalAmount)}</span>
                  <StatusBadge status={o.orderStatus} variant={orderStatusVariant(o.orderStatus)} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Recent Payments</h6>
              <Link to="/admin/payments" className="btn btn-sm btn-link">View All</Link>
            </div>
            <ul className="list-group list-group-flush">
              {recentPayments.length === 0 && <li className="list-group-item text-soft small">No payments yet.</li>}
              {recentPayments.map((p) => (
                <li className="list-group-item d-flex justify-content-between align-items-center" key={p.paymentId}>
                  <span>#{p.paymentId} · {formatCurrency(p.amount)}</span>
                  <StatusBadge status={p.paymentStatus} variant={paymentStatusVariant(p.paymentStatus)} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Recent Deliveries</h6>
              <Link to="/admin/deliveries" className="btn btn-sm btn-link">View All</Link>
            </div>
            <ul className="list-group list-group-flush">
              {recentDeliveries.length === 0 && <li className="list-group-item text-soft small">No deliveries yet.</li>}
              {recentDeliveries.map((d) => (
                <li className="list-group-item d-flex justify-content-between align-items-center" key={d.deliveryId}>
                  <span>Order #{d.orderId}</span>
                  <StatusBadge status={d.deliveryStatus} variant={deliveryStatusVariant(d.deliveryStatus)} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
