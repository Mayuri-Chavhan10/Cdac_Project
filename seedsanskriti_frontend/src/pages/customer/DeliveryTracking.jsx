import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import deliveryService from '../../services/deliveryService';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { deliveryStatusVariant } from '../../utils/constants';

export default function DeliveryTracking() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const orders = await orderService.getMyOrders();
        const trackable = orders.filter((o) => o.orderStatus !== 'CANCELLED');
        const results = await Promise.allSettled(
          trackable.map((o) => deliveryService.trackDelivery(o.orderId)),
        );
        if (!active) return;
        setDeliveries(
          results
            .map((r, idx) => (r.status === 'fulfilled' ? { ...r.value, order: trackable[idx] } : null))
            .filter(Boolean),
        );
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loader label="Loading delivery status…" />;

  return (
    <div>
      <h2 className="font-display mb-1">Delivery Tracking</h2>
      <p className="text-soft mb-4">Follow every order from packing to your doorstep.</p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      {deliveries.length === 0 ? (
        <EmptyState icon="bi-truck" title="No deliveries in progress" message="Once you place an order, its delivery status will show up here." />
      ) : (
        <div className="row g-3">
          {deliveries.map((d) => (
            <div className="col-12" key={d.deliveryId || d.order.orderId}>
              <div className="card border-0 shadow-sm p-3">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div>
                    <Link to={`/customer/orders/${d.order.orderId}`} className="fw-semibold text-decoration-none">
                      Order #{d.order.orderId}
                    </Link>
                    {d.trackingNumber && <div className="text-soft small">Tracking #: {d.trackingNumber}</div>}
                  </div>
                  <div className="text-md-end">
                    <StatusBadge status={d.deliveryStatus} variant={deliveryStatusVariant(d.deliveryStatus)} />
                    {d.estimatedDeliveryDate && (
                      <div className="text-soft small mt-1">Expected {formatDate(d.estimatedDeliveryDate)}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
