import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import useToast from '../../hooks/useToast';
import useConfirm from '../../hooks/useConfirm';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { CATEGORY_LABELS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useToast();
  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();

  const loadProducts = () => {
    setLoading(true);
    adminService
      .getAllProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (product) => {
    const ok = await requestConfirm({
      title: 'Remove product?',
      message: `This will permanently remove "${product.productName}" from the marketplace.`,
    });
    if (!ok) return;
    try {
      await adminService.deleteProduct(product.id);
      showSuccess('Product removed');
      loadProducts();
    } catch (err) {
      showError(err.message);
    }
  };

  if (loading) return <Loader label="Loading products…" />;

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
    { key: 'supplierName', label: 'Supplier', sortable: true },
    { key: 'category', label: 'Category', sortable: true, render: (p) => CATEGORY_LABELS[p.category] || p.category },
    { key: 'price', label: 'Price', sortable: true, render: (p) => formatCurrency(p.price) },
    { key: 'stock', label: 'Stock', sortable: true },
  ];

  return (
    <div>
      <h2 className="font-display mb-1">Product Management</h2>
      <p className="text-soft mb-4">Oversee every product listed across all suppliers.</p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="card border-0 shadow-sm p-3">
        <DataTable
          columns={columns}
          rows={products}
          rowKey="id"
          searchKeys={['productName', 'supplierName', 'category']}
          searchPlaceholder="Search products or suppliers…"
          emptyTitle="No products found"
          renderActions={(product) => (
            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(product)}>
              <i className="bi bi-trash me-1" /> Remove
            </button>
          )}
        />
      </div>

      <ConfirmDialog state={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
