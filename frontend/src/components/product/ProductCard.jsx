import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { CATEGORY_LABELS } from '../../utils/constants';
import StarRating from '../common/StarRating';

export default function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted, showSupplierActions, onEdit, onDelete }) {
  const outOfStock = !product.stock || product.stock <= 0;

  return (
    <div className="card product-card h-100 shadow-sm">
      <Link to={`/products/${product.id}`}>
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1524598171353-e5638f34e6c0?w=500&auto=format&fit=crop&q=60'}
          alt={product.productName}
          className="card-img-top"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1524598171353-e5638f34e6c0?w=500&auto=format&fit=crop&q=60';
          }}
        />
      </Link>
      <div className="card-body d-flex flex-column">
        {product.category && (
          <span className="category-chip mb-2 align-self-start">{CATEGORY_LABELS[product.category] || product.category}</span>
        )}
        <Link to={`/products/${product.id}`} className="text-decoration-none">
          <h6 className="mb-1 text-truncate" title={product.productName}>{product.productName}</h6>
        </Link>
        {product.supplierName && <p className="text-soft small mb-2">by {product.supplierName}</p>}

        {typeof product.averageRating === 'number' && product.reviewCount > 0 ? (
          <StarRating rating={product.averageRating} count={product.reviewCount} size="small" />
        ) : (
          <span className="text-soft small">No reviews yet</span>
        )}

        <div className="d-flex align-items-center justify-content-between mt-3">
          <span className="fw-bold fs-5 text-terracotta">{formatCurrency(product.price)}</span>
          {outOfStock ? (
            <span className="badge text-bg-secondary">Out of stock</span>
          ) : (
            <span className="badge text-bg-success-subtle text-success-emphasis">{product.stock} in stock</span>
          )}
        </div>

        {!showSupplierActions ? (
          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-primary btn-sm flex-grow-1"
              disabled={outOfStock}
              onClick={() => onAddToCart?.(product)}
            >
              <i className="bi bi-cart-plus me-1" /> Add to Cart
            </button>
            {onToggleWishlist && (
              <button
                className={`btn btn-sm ${isWishlisted ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={() => onToggleWishlist(product)}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}`} />
              </button>
            )}
          </div>
        ) : (
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => onEdit?.(product)}>
              <i className="bi bi-pencil me-1" /> Edit
            </button>
            <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete?.(product)}>
              <i className="bi bi-trash" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
