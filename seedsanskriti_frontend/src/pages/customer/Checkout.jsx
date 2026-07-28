import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';
import { openRazorpayCheckout } from '../../services/razorpayService';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import AlertMessage from '../../components/common/AlertMessage';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';

const PAYMENT_OPTION = {
  ONLINE: 'ONLINE',
  COD: 'COD',
};

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
  const [paymentOption, setPaymentOption] = useState(PAYMENT_OPTION.ONLINE);
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

  // Cash on Delivery keeps using the existing, unchanged /payments/pay flow.
  const payCashOnDelivery = async (orderId) => {
    await paymentService.pay({ orderId, paymentMethod: 'CASH_ON_DELIVERY' });
  };

  // Online payments: create a Razorpay order server-side, open the real
  // Razorpay Checkout modal, then verify the signature server-side.
  const payWithRazorpay = async (orderId) => {
    const razorpayOrder = await paymentService.createRazorpayOrder(orderId);

    const result = await openRazorpayCheckout({
      keyId: razorpayOrder.keyId || import.meta.env.VITE_RAZORPAY_KEY,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      razorpayOrderId: razorpayOrder.razorpayOrderId,
      description: `SeedSanskriti Order #${orderId}`,
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phoneNumber,
      },
    });

    await paymentService.verifyRazorpayPayment({
      orderId,
      razorpayOrderId: result.razorpayOrderId,
      razorpayPaymentId: result.razorpayPaymentId,
      razorpaySignature: result.razorpaySignature,
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);
    setPlacing(true);
    try {
      const orderPayload = useProfileAddress ? null : form;
      const orderResponse = await orderService.placeOrder(orderPayload);

      try {
        if (paymentOption === PAYMENT_OPTION.COD) {
          await payCashOnDelivery(orderResponse.orderId);
        } else {
          await payWithRazorpay(orderResponse.orderId);
        }
      } catch (payErr) {
        showError(`Order placed, but payment was not completed: ${payErr.message}`);
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
                <label
                  className={`d-flex align-items-center gap-2 border rounded-3 p-3 cursor-pointer ${paymentOption === PAYMENT_OPTION.ONLINE ? 'border-primary bg-green-100' : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentOption"
                    className="form-check-input mt-0"
                    checked={paymentOption === PAYMENT_OPTION.ONLINE}
                    onChange={() => setPaymentOption(PAYMENT_OPTION.ONLINE)}
                  />
                  <span>
                    <i className="bi bi-shield-check me-2 text-primary" />
                    Pay Online — UPI, Card or Net Banking
                    <span className="d-block text-soft small">Secured by Razorpay</span>
                  </span>
                </label>

                <label
                  className={`d-flex align-items-center gap-2 border rounded-3 p-3 cursor-pointer ${paymentOption === PAYMENT_OPTION.COD ? 'border-primary bg-green-100' : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentOption"
                    className="form-check-input mt-0"
                    checked={paymentOption === PAYMENT_OPTION.COD}
                    onChange={() => setPaymentOption(PAYMENT_OPTION.COD)}
                  />
                  <span>
                    <i className="bi bi-cash-coin me-2 text-primary" />
                    Cash on Delivery
                  </span>
                </label>
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
                {placing ? (<><Spinner className="me-2" />{paymentOption === PAYMENT_OPTION.ONLINE ? 'Opening payment…' : 'Placing order…'}</>) : 'Place Order & Pay'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
