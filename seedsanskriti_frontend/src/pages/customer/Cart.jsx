import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cartService from '../../services/cartService';
import useCart from '../../hooks/useCart';
import useToast from '../../hooks/useToast';
import useConfirm from '../../hooks/useConfirm';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatCurrency } from '../../utils/formatters';

export default function Cart() {
  const { cart, loading, refreshCart } = useCart();
  const { showSuccess, showError } = useToast();
  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuantityChange = async (item, quantity) => {
    if (quantity < 1) return;
    setBusyId(item.productId);
    try {
      await cartService.updateCartItem({ cartItemId: item.id, quantity });
      await refreshCart();
    } catch (err) {
      showError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (item) => {
    const ok = await requestConfirm({
      title: 'Remove item?',
      message: `Remove ${item.productName} from your cart?`,
    });
    if (!ok) return;
    setBusyId(item.productId);
    try {
      await cartService.removeCartItem(item.id);
      await refreshCart();
      showSuccess('Item removed from cart');
    } catch (err) {
      showError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleClear = async () => {
    const ok = await requestConfirm({ title: 'Clear cart?', message: 'This will remove all items from your cart.' });
    if (!ok) return;
    try {
      await cartService.clearCart();
      await refreshCart();
      showSuccess('Cart cleared');
    } catch (err) {
      showError(err.message);
    }
  };

  if (loading) return <Loader label="Loading your cart…" />;

  const items = cart?.items || [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="font-display mb-0">My Cart</h2>
        {items.length > 0 && (
          <button className="btn btn-outline-danger btn-sm" onClick={handleClear}>
            <i className="bi bi-trash me-1" /> Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="bi-cart3"
          title="Your cart is empty"
          message="Browse our marketplace and add some seeds or saplings to get started."
          action={<Link to="/products" className="btn btn-primary">Shop Products</Link>}
        />
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table table-ss align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th style={{ width: 160 }}>Quantity</th>
                      <th>Subtotal</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.productId}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={item.imageUrl || 'https://images.unsplash.com/photo-1524598171353-e5638f34e6c0?w=100&auto=format&fit=crop&q=60'}
                              alt={item.productName}
                              width={48}
                              height={48}
                              className="rounded"
                              style={{ objectFit: 'cover' }}
                            />
                            <Link to={`/products/${item.productId}`} className="text-decoration-none">{item.productName}</Link>
                          </div>
                        </td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>
                          <div className="input-group input-group-sm" style={{ width: 120 }}>
                            <button
                              className="btn btn-outline-secondary"
                              disabled={busyId === item.productId}
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            >-</button>
                            <input type="text" className="form-control text-center" readOnly value={item.quantity} />
                            <button
                              className="btn btn-outline-secondary"
                              disabled={busyId === item.productId}
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            >+</button>
                          </div>
                        </td>
                        <td className="fw-semibold">{formatCurrency(item.subtotal)}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-link text-danger" onClick={() => handleRemove(item)}>
                            <i className="bi bi-trash" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-4">
              <h6 className="mb-3">Order Summary</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-soft">Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                <span>{formatCurrency(cart.totalAmount)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3 fw-bold fs-5">
                <span>Total</span>
                <span className="text-terracotta">{formatCurrency(cart.totalAmount)}</span>
              </div>
              <button className="btn btn-primary w-100" onClick={() => navigate('/customer/checkout')}>
                Proceed to Checkout <i className="bi bi-arrow-right ms-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog state={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
