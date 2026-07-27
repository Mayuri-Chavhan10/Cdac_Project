import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import wishlistService from '../../services/wishlistService';
import cartService from '../../services/cartService';
import useCart from '../../hooks/useCart';
import useToast from '../../hooks/useToast';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import ProductCard from '../../components/product/ProductCard';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshCart } = useCart();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const loadWishlist = () => {
    setLoading(true);
    wishlistService
      .getMyWishlist()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleAddToCart = async (product) => {
    try {
      await cartService.addToCart({ productId: product.id ?? product.productId, quantity: 1 });
      await refreshCart();
      showSuccess('Added to cart');
    } catch (err) {
      showError(err.message);
    }
  };

  const handleRemove = async (product) => {
    try {
      await wishlistService.removeFromWishlist(product.id ?? product.productId);
      showSuccess('Removed from wishlist');
      loadWishlist();
    } catch (err) {
      showError(err.message);
    }
  };

  if (loading) return <Loader label="Loading your wishlist…" />;

  return (
    <div>
      <h2 className="font-display mb-1">My Wishlist</h2>
      <p className="text-soft mb-4">Products you're keeping an eye on.</p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      {items.length === 0 ? (
        <EmptyState
          icon="bi-heart"
          title="Your wishlist is empty"
          message="Tap the heart icon on any product to save it here."
          action={<Link to="/products" className="btn btn-primary">Browse Products</Link>}
        />
      ) : (
        <div className="row g-4">
          {items.map((item) => (
            <div className="col-6 col-md-4 col-lg-3" key={item.productId}>
              <ProductCard
                product={{
                  id: item.productId,
                  productName: item.productName,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  category: item.category,
                  stock: item.stock,
                }}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleRemove}
                isWishlisted
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
