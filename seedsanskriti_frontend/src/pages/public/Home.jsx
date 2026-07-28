import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import ProductCard from '../../components/product/ProductCard';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import useToast from '../../hooks/useToast';
import cartService from '../../services/cartService';
import { CATEGORY_OPTIONS, CATEGORY_LABELS, ROLES } from '../../utils/constants';
import { getBecomeSupplierRoute, getBecomeSupplierLabel } from '../../utils/supplierCta';

const categoryIcon = {
  VEGETABLE_SEEDS: 'bi-basket',
  FRUIT_SEEDS: 'bi-apple',
  FLOWER_SEEDS: 'bi-flower1',
  GRAIN_SEEDS: 'bi-flower3',
  BUDS: 'bi-flower2',
  SAPLINGS: 'bi-tree',
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { refreshCart } = useCart();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    let active = true;
    productService
      .searchProducts({ page: 0, size: 8, sortBy: 'id', sortDir: 'desc' })
      .then((data) => {
        if (active) setProducts(data.content || []);
      })
      .catch(() => active && setError('Could not load featured products right now.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated || role !== ROLES.CUSTOMER) {
      navigate('/login');
      return;
    }
    try {
      await cartService.addToCart({ productId: product.id, quantity: 1 });
      await refreshCart();
      showSuccess(`${product.productName} added to cart`);
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div>
      <section className="hero-section py-5 py-lg-6">
        <div className="container py-4 py-lg-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge text-bg-light bg-opacity-25 mb-3">🌱 From soil to sanskriti</span>
              <h1 className="display-5 fw-bold mb-3">
                Seeds, saplings &amp; buds — sourced from growers who know the land.
              </h1>
              <p className="lead mb-4" style={{ opacity: 0.9 }}>
                SeedSanskriti connects home gardeners and farmers directly with verified suppliers
                of vegetable, fruit, flower and grain seeds, plus saplings and buds ready to plant.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/products" className="btn btn-secondary btn-lg">
                  <i className="bi bi-shop me-2" /> Shop Products
                </Link>
                <Link
                  to={getBecomeSupplierRoute({ isAuthenticated, role })}
                  className="btn btn-outline-light btn-lg"
                >
                  {getBecomeSupplierLabel({ isAuthenticated, role })}
                </Link>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block text-center">
              <i className="bi bi-flower1" style={{ fontSize: '14rem', opacity: 0.18 }} />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="text-center mb-4">
          <span className="section-eyebrow">Browse</span>
          <h2 className="font-display">Shop by Category</h2>
        </div>
        <div className="row g-3">
          {CATEGORY_OPTIONS.map((cat) => (
            <div className="col-6 col-md-4 col-lg-2" key={cat}>
              <Link
                to={`/products?category=${cat}`}
                className="card text-center border-0 shadow-sm h-100 text-decoration-none py-4 bg-green-100"
              >
                <i className={`bi ${categoryIcon[cat]} text-primary mb-2`} style={{ fontSize: '1.75rem' }} />
                <div className="small fw-semibold text-body">{CATEGORY_LABELS[cat]}</div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <hr className="sow-line container" />

      <section className="container py-4 pb-5">
        <div className="d-flex align-items-end justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <span className="section-eyebrow">Fresh in</span>
            <h2 className="font-display mb-0">Newly Listed</h2>
          </div>
          <Link to="/products" className="btn btn-outline-primary btn-sm">
            View all products <i className="bi bi-arrow-right ms-1" />
          </Link>
        </div>

        {loading && <Loader label="Loading products…" />}
        <AlertMessage message={error} />

        {!loading && !error && (
          <div className="row g-4">
            {products.map((product) => (
              <div className="col-6 col-md-4 col-lg-3" key={product.id}>
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            ))}
            {products.length === 0 && <p className="text-soft">No products listed yet — check back soon.</p>}
          </div>
        )}
      </section>

      <section className="bg-green-100 py-5">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <i className="bi bi-patch-check text-primary" style={{ fontSize: '2rem' }} />
              <h5 className="mt-3">Verified Suppliers</h5>
              <p className="text-soft mb-0">Every supplier is reviewed and approved before listing.</p>
            </div>
            <div className="col-md-4">
              <i className="bi bi-truck text-primary" style={{ fontSize: '2rem' }} />
              <h5 className="mt-3">Tracked Delivery</h5>
              <p className="text-soft mb-0">Follow your order from packing to your doorstep.</p>
            </div>
            <div className="col-md-4">
              <i className="bi bi-star text-primary" style={{ fontSize: '2rem' }} />
              <h5 className="mt-3">Community Reviewed</h5>
              <p className="text-soft mb-0">Real ratings from growers who've planted before you.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
