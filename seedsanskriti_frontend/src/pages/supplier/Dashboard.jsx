import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import supplierService from '../../services/supplierService';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import StatusBadge from '../../components/common/StatusBadge';
import useAuth from '../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { orderStatusVariant } from '../../utils/constants';

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([supplierService.getMyProducts(), supplierService.getSupplierOrders()])
      .then(([productData, orderData]) => {
        if (!active) return;
        setProducts(productData);
        setOrders(orderData);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loader label="Loading your dashboard…" />;

  const pendingOrders = orders.filter((o) => ['PENDING', 'PLACED'].includes(o.orderStatus)).length;
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStock = products.filter((p) => (p.stock ?? 0) <= 5).length;
  const recentOrders = [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 5);

  const stats = [
    { label: 'My Products', value: products.length, icon: 'bi-seedling', bg: 'bg-green-100', color: 'text-primary' },
    { label: 'Orders to Fulfil', value: pendingOrders, icon: 'bi-bag-check', bg: 'bg-warning-subtle', color: 'text-warning' },
    { label: 'Low Stock Items', value: lowStock, icon: 'bi-exclamation-triangle', bg: 'bg-danger-subtle', color: 'text-danger' },
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: 'bi-graph-up-arrow', bg: 'bg-info-subtle', color: 'text-info' },
  ];

  return (
    <div>
      <h2 className="font-display mb-1">Welcome, {user?.name?.split(' ')[0]} 🌾</h2>
      <p className="text-soft mb-4">Here's how your storefront is doing.</p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="row g-3 mb-4">
        {stats.map((s) => (
          <div className="col-6 col-lg-3" key={s.label}>
            <div className="stat-card p-3 h-100">
              <div className={`stat-icon ${s.bg} ${s.color} mb-2`}>
                <i className={`bi ${s.icon}`} />
              </div>
              <div className="fs-4 fw-bold">{s.value}</div>
              <div className="text-soft small">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Recent Orders Received</h6>
          <Link to="/supplier/orders" className="btn btn-sm btn-outline-primary">View All</Link>
        </div>
        <div className="table-responsive">
          <table className="table table-ss mb-0 align-middle">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="text-center text-soft py-4">No orders received yet.</td></tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.orderId}>
                  <td>#{order.orderId}</td>
                  <td>{order.customerName}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td><StatusBadge status={order.orderStatus} variant={orderStatusVariant(order.orderStatus)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
