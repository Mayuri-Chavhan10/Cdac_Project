import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import productService from '../../services/productService';
import reviewService from '../../services/reviewService';
import cartService from '../../services/cartService';
import wishlistService from '../../services/wishlistService';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import Breadcrumb from '../../components/common/Breadcrumb';
import StarRating from '../../components/common/StarRating';
import { CATEGORY_LABELS, ROLES } from '../../utils/constants';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import useToast from '../../hooks/useToast';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role, user } = useAuth();
  const { refreshCart } = useCart();
  const { showSuccess, showError } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productData, reviewData] = await Promise.all([
        productService.getProductById(id),
        reviewService.getProductReviews(id),
      ]);
      setProduct(productData);
      setReviews(reviewData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    setQuantity(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && role === ROLES.CUSTOMER) {
      wishlistService
        .getMyWishlist()
        .then((items) => setIsWishlisted(items.some((i) => i.productId === Number(id))))
        .catch(() => {});
    }
  }, [id, isAuthenticated, role]);

  const handleAddToCart = async () => {
    if (!isAuthenticated || role !== ROLES.CUSTOMER) {
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await cartService.addToCart({ productId: product.id, quantity });
      await refreshCart();
      showSuccess(`${product.productName} added to cart`);
    } catch (err) {
      showError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated || role !== ROLES.CUSTOMER) {
      navigate('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(product.id);
        showSuccess('Removed from wishlist');
      } else {
        await wishlistService.addToWishlist(product.id);
        showSuccess('Added to wishlist');
      }
      setIsWishlisted((v) => !v);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || role !== ROLES.CUSTOMER) {
      navigate('/login');
      return;
    }
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      await reviewService.addOrUpdateReview({
        productId: Number(id),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      showSuccess('Thanks for your review!');
      setReviewForm({ rating: 5, comment: '' });
      loadProduct();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewService.deleteReview(reviewId);
      showSuccess('Review removed');
      loadProduct();
    } catch (err) {
      showError(err.message);
    }
  };

  if (loading) return <Loader fullPage label="Loading product…" />;
  if (error || !product) {
    return (
      <div className="container py-5">
        <AlertMessage message={error || 'Product not found.'} />
        <Link to="/products" className="btn btn-outline-primary mt-3">Back to Products</Link>
      </div>
    );
  }

  const outOfStock = !product.stock || product.stock <= 0;

  return (
    <div className="container py-4">
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Products', to: '/products' },
          { label: product.productName },
        ]}
      />

      <div className="row g-5 mt-1">
        <div className="col-lg-5">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1524598171353-e5638f34e6c0?w=800&auto=format&fit=crop&q=60'}
            alt={product.productName}
            className="img-fluid rounded-3 shadow-sm w-100"
            style={{ maxHeight: 420, objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1524598171353-e5638f34e6c0?w=800&auto=format&fit=crop&q=60';
            }}
          />
        </div>

        <div className="col-lg-7">
          <span className="category-chip mb-2">{CATEGORY_LABELS[product.category] || product.category}</span>
          <h1 className="font-display mb-2">{product.productName}</h1>
          {product.supplierName && <p className="text-soft">Sold by {product.supplierName}</p>}

          {typeof product.averageRating === 'number' && product.reviewCount > 0 ? (
            <StarRating rating={product.averageRating} count={product.reviewCount} />
          ) : (
            <span className="text-soft small">No reviews yet</span>
          )}

          <h2 className="text-terracotta fw-bold my-3">{formatCurrency(product.price)}</h2>

          <p className="text-soft">{product.description || 'No description provided by the supplier.'}</p>

          {outOfStock ? (
            <span className="badge text-bg-secondary mb-3">Out of stock</span>
          ) : (
            <span className="badge text-bg-success-subtle text-success-emphasis mb-3">{product.stock} in stock</span>
          )}

          <div className="d-flex align-items-center gap-3 mt-2 flex-wrap">
            <div className="input-group" style={{ width: 130 }}>
              <button className="btn btn-outline-secondary" type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
              <input
                type="number"
                className="form-control text-center"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
              <button className="btn btn-outline-secondary" type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>
            <button className="btn btn-primary" disabled={outOfStock || adding} onClick={handleAddToCart}>
              {adding ? 'Adding…' : (<><i className="bi bi-cart-plus me-2" />Add to Cart</>)}
            </button>
            <button className={`btn ${isWishlisted ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={handleToggleWishlist}>
              <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'} me-2`} />
              {isWishlisted ? 'Wishlisted' : 'Wishlist'}
            </button>
          </div>
        </div>
      </div>

      <hr className="sow-line" />

      <div className="row">
        <div className="col-lg-8">
          <h4 className="font-display mb-3">Customer Reviews ({reviews.length})</h4>

          {reviews.length === 0 && <p className="text-soft">Be the first to review this product.</p>}

          <div className="d-flex flex-column gap-3 mb-4">
            {reviews.map((review) => (
              <div className="card border-0 shadow-sm p-3" key={review.reviewId}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{review.customerName}</strong>
                    <div><StarRating rating={review.rating} size="small" /></div>
                  </div>
                  <div className="text-end">
                    <span className="text-soft small d-block">{formatDateTime(review.createdAt)}</span>
                    {role === ROLES.CUSTOMER && user?.name === review.customerName && (
                      <button className="btn btn-sm btn-link text-danger p-0" onClick={() => handleDeleteReview(review.reviewId)}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                {review.comment && <p className="mb-0 mt-2">{review.comment}</p>}
              </div>
            ))}
          </div>

          {isAuthenticated && role === ROLES.CUSTOMER && (
            <div className="card border-0 shadow-sm p-4">
              <h6 className="mb-3">Write a review</h6>
              <AlertMessage message={reviewError} onClose={() => setReviewError(null)} />
              <form onSubmit={handleSubmitReview}>
                <div className="mb-3">
                  <label className="form-label">Rating</label>
                  <select
                    className="form-select"
                    style={{ maxWidth: 160 }}
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Comment</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    maxLength={1000}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="How did this product grow for you?"
                  />
                </div>
                <button className="btn btn-primary" disabled={reviewSubmitting} type="submit">
                  {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {!isAuthenticated && (
            <p className="text-soft">
              <Link to="/login">Log in</Link> as a customer to write a review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
