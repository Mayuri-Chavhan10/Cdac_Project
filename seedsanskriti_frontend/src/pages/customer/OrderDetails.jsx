import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import orderService from '../../services/orderService';
import deliveryService from '../../services/deliveryService';
import useToast from '../../hooks/useToast';
import useConfirm from '../../hooks/useConfirm';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import Breadcrumb from '../../components/common/Breadcrumb';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { orderStatusVariant, deliveryStatusVariant } from '../../utils/constants';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();

  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
      try {
        const deliveryData = await deliveryService.trackDelivery(id);
        setDelivery(deliveryData);
      } catch {
        setDelivery(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancelOrder = async () => {
    const ok = await requestConfirm({
      title: 'Cancel order?',
      message: `Are you sure you want to cancel order #${order.orderId}?`,
    });
    if (!ok) return;
    try {
      await orderService.cancelOrder(order.orderId);
      showSuccess('Order cancelled');
      loadOrder();
    } catch (err) {
      showError(err.message);
    }
  };

  if (loading) return <Loader fullPage label="Loading order…" />;
  if (error || !order) {
    return (
      <div>
        <AlertMessage message={error || 'Order not found.'} />
        <Link to="/customer/orders" className="btn btn-outline-primary mt-3">Back to Orders</Link>
      </div>
    );
  }

  const canCancel = ['PENDING', 'PLACED', 'ACCEPTED', 'CONFIRMED'].includes(order.orderStatus);

  return (
    <div>
      <Breadcrumb items={[{ label: 'My Orders', to: '/customer/orders' }, { label: `Order #${order.orderId}` }]} />

      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 my-3">
        <div>
          <h2 className="font-display mb-1">Order #{order.orderId}</h2>
          <p className="text-soft mb-0">Placed on {formatDateTime(order.orderDate)}</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <StatusBadge status={order.orderStatus} variant={orderStatusVariant(order.orderStatus)} />
          {canCancel && (
            <button className="btn btn-outline-danger btn-sm" onClick={handleCancelOrder}>Cancel Order</button>
          )}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white"><h6 className="mb-0">Items</h6></div>
            <div className="table-responsive">
              <table className="table table-ss align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item) => (
                    <tr key={item.productId}>
                      <td>
                        <Link to={`/products/${item.productId}`} className="text-decoration-none">{item.productName}</Link>
                      </td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td className="fw-semibold">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {delivery && (
            <div className="card border-0 shadow-sm p-4">
              <h6 className="mb-3">Delivery Tracking</h6>
              <div className="d-flex align-items-center gap-3 mb-2">
                <StatusBadge status={delivery.deliveryStatus} variant={deliveryStatusVariant(delivery.deliveryStatus)} />
                {delivery.trackingNumber && <span className="text-soft small">Tracking #: {delivery.trackingNumber}</span>}
              </div>
              {delivery.deliveryPartner && (
                <p className="text-soft small mb-1">Courier: {delivery.deliveryPartner}</p>
              )}
              {delivery.estimatedDeliveryDate && (
                <p className="text-soft small mb-0">Expected delivery: {formatDate(delivery.estimatedDeliveryDate)}</p>
              )}
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h6 className="mb-3">Order Summary</h6>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-soft">Subtotal</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span className="text-terracotta">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="card border-0 shadow-sm p-4">
              <h6 className="mb-3">Shipping To</h6>
              <p className="text-soft mb-0 small">
                {order.shippingAddress}<br />
                {order.shippingCity} {order.shippingPincode}
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog state={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
