import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import productService from '../../services/productService';
import wishlistService from '../../services/wishlistService';
import cartService from '../../services/cartService';
import ProductCard from '../../components/product/ProductCard';
import ProductFilters from '../../components/product/ProductFilters';
import SearchBox from '../../components/common/SearchBox';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import useDebounce from '../../hooks/useDebounce';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import useToast from '../../hooks/useToast';
import { ROLES } from '../../utils/constants';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { refreshCart } = useCart();
  const { showSuccess, showError } = useToast();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const debouncedKeyword = useDebounce(keyword, 400);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || undefined,
    minPrice: undefined,
    maxPrice: undefined,
    inStock: undefined,
    sortBy: 'id',
    sortDir: 'desc',
  });

  const [page, setPage] = useState(0);
  const [result, setResult] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated || role !== ROLES.CUSTOMER) return;
    try {
      const items = await wishlistService.getMyWishlist();
      setWishlistIds(new Set(items.map((i) => i.productId)));
    } catch {
      // non-critical
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    productService
      .searchProducts({
        keyword: debouncedKeyword || undefined,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        inStock: filters.inStock,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
        page,
        size: 12,
      })
      .then((data) => active && setResult(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    const params = {};
    if (debouncedKeyword) params.keyword = debouncedKeyword;
    if (filters.category) params.category = filters.category;
    setSearchParams(params, { replace: true });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword, filters, page]);

  useEffect(() => setPage(0), [debouncedKeyword, filters]);

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

  const handleToggleWishlist = async (product) => {
    if (!isAuthenticated || role !== ROLES.CUSTOMER) {
      navigate('/login');
      return;
    }
    try {
      if (wishlistIds.has(product.id)) {
        await wishlistService.removeFromWishlist(product.id);
        showSuccess('Removed from wishlist');
      } else {
        await wishlistService.addToWishlist(product.id);
        showSuccess('Added to wishlist');
      }
      loadWishlist();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <span className="section-eyebrow">Marketplace</span>
        <h1 className="font-display mb-0">Browse Products</h1>
      </div>

      <div className="row g-4">
        <div className="col-lg-3">
          <ProductFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters({ category: undefined, minPrice: undefined, maxPrice: undefined, inStock: undefined, sortBy: 'id', sortDir: 'desc' })}
          />
        </div>

        <div className="col-lg-9">
          <SearchBox value={keyword} onChange={setKeyword} placeholder="Search seeds, saplings, buds…" className="mb-3" />

          <AlertMessage message={error} onClose={() => setError(null)} />

          {loading ? (
            <Loader label="Fetching products…" />
          ) : result.content.length === 0 ? (
            <EmptyState icon="bi-flower1" title="No products match your search" message="Try adjusting your filters or search term." />
          ) : (
            <>
              <p className="text-soft small">{result.totalElements} product{result.totalElements === 1 ? '' : 's'} found</p>
              <div className="row g-4">
                {result.content.map((product) => (
                  <div className="col-6 col-md-4" key={product.id}>
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlistIds.has(product.id)}
                    />
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-center mt-4">
                <Pagination page={page} totalPages={result.totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
