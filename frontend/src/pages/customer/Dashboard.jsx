import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import cartService from '../../services/cartService';
import wishlistService from '../../services/wishlistService';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import StatusBadge from '../../components/common/StatusBadge';
import useAuth from '../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { orderStatusVariant } from '../../utils/constants';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([orderService.getMyOrders(), cartService.getMyCart(), wishlistService.getMyWishlist()])
      .then(([orderData, cartData, wishlistData]) => {
        if (!active) return;
        setOrders(orderData);
        setCartCount((cartData.items || []).reduce((s, i) => s + i.quantity, 0));
        setWishlistCount(wishlistData.length);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loader label="Loading your dashboard…" />;

  const totalSpent = orders
    .filter((o) => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const recentOrders = [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 5);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: 'bi-bag-check', bg: 'bg-green-100', color: 'text-primary' },
    { label: 'Items in Cart', value: cartCount, icon: 'bi-cart3', bg: 'bg-warning-subtle', color: 'text-warning' },
    { label: 'Wishlist Items', value: wishlistCount, icon: 'bi-heart', bg: 'bg-danger-subtle', color: 'text-danger' },
    { label: 'Total Spent', value: formatCurrency(totalSpent), icon: 'bi-wallet2', bg: 'bg-info-subtle', color: 'text-info' },
  ];

  return (
    <div>
      <h2 className="font-display mb-1">Welcome back, {user?.name?.split(' ')[0]} 🌱</h2>
      <p className="text-soft mb-4">Here's what's happening with your account.</p>

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
          <h6 className="mb-0">Recent Orders</h6>
          <Link to="/customer/orders" className="btn btn-sm btn-outline-primary">View All</Link>
        </div>
        <div className="table-responsive">
          <table className="table table-ss mb-0 align-middle">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="text-center text-soft py-4">No orders yet — <Link to="/products">start shopping</Link>.</td></tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.orderId}>
                  <td>#{order.orderId}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td><StatusBadge status={order.orderStatus} variant={orderStatusVariant(order.orderStatus)} /></td>
                  <td className="text-end">
                    <Link to={`/customer/orders/${order.orderId}`} className="btn btn-sm btn-link">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
