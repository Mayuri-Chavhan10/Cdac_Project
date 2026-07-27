import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import AlertMessage from '../../components/common/AlertMessage';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { PAYMENT_METHOD, PAYMENT_METHOD_LABELS } from '../../utils/constants';

export default function Checkout() {
  const { cart, loading, refreshCart } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shippingAddress: '',
    shippingCity: '',
    shippingPincode: '',
    contactPhone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD.CASH_ON_DELIVERY);
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [error, setError] = useState(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        shippingAddress: user.address || '',
        shippingCity: user.city || '',
        shippingPincode: user.pincode || '',
        contactPhone: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);
    setPlacing(true);
    try {
      const orderPayload = useProfileAddress ? null : form;
      const orderResponse = await orderService.placeOrder(orderPayload);
      try {
        await paymentService.pay({ orderId: orderResponse.orderId, paymentMethod });
      } catch (payErr) {
        showError(`Order placed, but payment failed: ${payErr.message}`);
        await refreshCart();
        navigate(`/customer/orders/${orderResponse.orderId}`);
        return;
      }
      await refreshCart();
      showSuccess('Order placed and paid successfully!');
      navigate(`/customer/orders/${orderResponse.orderId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return null;

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon="bi-cart-x"
        title="Your cart is empty"
        message="Add some products before checking out."
        action={<button className="btn btn-primary" onClick={() => navigate('/products')}>Shop Products</button>}
      />
    );
  }

  return (
    <div>
      <h2 className="font-display mb-1">Checkout</h2>
      <p className="text-soft mb-4">Confirm your shipping details and payment method.</p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <form onSubmit={handlePlaceOrder}>
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h6 className="mb-3">Shipping Details</h6>
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="useProfileAddress"
                  checked={useProfileAddress}
                  onChange={(e) => setUseProfileAddress(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="useProfileAddress">
                  Ship to my profile address
                </label>
              </div>

              {!useProfileAddress && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Shipping Address</label>
                    <textarea className="form-control" name="shippingAddress" rows="2" value={form.shippingAddress} onChange={handleChange} required />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">City</label>
                      <input className="form-control" name="shippingCity" value={form.shippingCity} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Pincode</label>
                      <input className="form-control" name="shippingPincode" value={form.shippingPincode} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="mb-1">
                    <label className="form-label">Contact Phone</label>
                    <input className="form-control" name="contactPhone" value={form.contactPhone} onChange={handleChange} required />
                  </div>
                </>
              )}

              {useProfileAddress && (
                <div className="bg-cream-deep rounded-3 p-3 small text-soft">
                  {user?.address ? `${user.address}, ` : ''}{user?.city}, {user?.pincode} · {user?.phoneNumber}
                </div>
              )}
            </div>

            <div className="card border-0 shadow-sm p-4">
              <h6 className="mb-3">Payment Method</h6>
              <div className="d-flex flex-column gap-2">
                {Object.values(PAYMENT_METHOD).map((method) => (
                  <label
                    key={method}
                    className={`d-flex align-items-center gap-2 border rounded-3 p-3 cursor-pointer ${paymentMethod === method ? 'border-primary bg-green-100' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="form-check-input mt-0"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    {PAYMENT_METHOD_LABELS[method]}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4">
              <h6 className="mb-3">Order Summary</h6>
              <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: 260, overflowY: 'auto' }}>
                {items.map((item) => (
                  <div className="d-flex justify-content-between small" key={item.productId}>
                    <span>{item.productName} × {item.quantity}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                <span>Total</span>
                <span className="text-terracotta">{formatCurrency(cart.totalAmount)}</span>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={placing}>
                {placing ? (<><Spinner className="me-2" />Placing order…</>) : 'Place Order & Pay'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
