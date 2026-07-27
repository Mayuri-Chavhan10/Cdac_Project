import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supplierService from '../../services/supplierService';
import productService from '../../services/productService';
import useToast from '../../hooks/useToast';
import useConfirm from '../../hooks/useConfirm';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { CATEGORY_LABELS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useToast();
  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();
  const navigate = useNavigate();

  const loadProducts = () => {
    setLoading(true);
    supplierService
      .getMyProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (product) => {
    const ok = await requestConfirm({
      title: 'Delete product?',
      message: `This will permanently remove "${product.productName}" from your storefront.`,
    });
    if (!ok) return;
    try {
      await productService.deleteProduct(product.id);
      showSuccess('Product deleted');
      loadProducts();
    } catch (err) {
      showError(err.message);
    }
  };

  if (loading) return <Loader label="Loading your products…" />;

  const columns = [
    {
      key: 'productName',
      label: 'Product',
      sortable: true,
      render: (p) => (
        <div className="d-flex align-items-center gap-2">
          <img
            src={p.imageUrl || 'https://images.unsplash.com/photo-1524598171353-e5638f34e6c0?w=100&auto=format&fit=crop&q=60'}
            alt={p.productName}
            width={40}
            height={40}
            className="rounded"
            style={{ objectFit: 'cover' }}
          />
          <span>{p.productName}</span>
        </div>
      ),
    },
    { key: 'category', label: 'Category', sortable: true, render: (p) => CATEGORY_LABELS[p.category] || p.category },
    { key: 'price', label: 'Price', sortable: true, render: (p) => formatCurrency(p.price) },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (p) => (
        <span className={`badge ${(p.stock ?? 0) <= 5 ? 'text-bg-warning' : 'text-bg-success-subtle text-success-emphasis'}`}>
          {p.stock ?? 0}
        </span>
      ),
    },
    {
      key: 'averageRating',
      label: 'Rating',
      sortable: true,
      render: (p) => (p.reviewCount ? `${p.averageRating?.toFixed(1)} ★ (${p.reviewCount})` : '—'),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="font-display mb-1">My Products</h2>
          <p className="text-soft mb-0">Manage everything you have listed on SeedSanskriti.</p>
        </div>
        <Link to="/supplier/products/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2" />Add Product
        </Link>
      </div>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="card border-0 shadow-sm p-3">
        <DataTable
          columns={columns}
          rows={products}
          rowKey="id"
          searchKeys={['productName', 'category']}
          searchPlaceholder="Search your products…"
          emptyTitle="You haven't listed any products yet"
          emptyMessage="Add your first product to start selling."
          renderActions={(product) => (
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/supplier/products/${product.id}/edit`)}>
                Edit
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(product)}>
                Delete
              </button>
            </div>
          )}
        />
      </div>

      <ConfirmDialog state={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
