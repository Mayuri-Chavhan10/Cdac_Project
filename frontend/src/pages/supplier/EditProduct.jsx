import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productService from '../../services/productService';
import useToast from '../../hooks/useToast';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import Spinner from '../../components/common/Spinner';
import Breadcrumb from '../../components/common/Breadcrumb';
import ProductForm from '../../components/product/ProductForm';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    productService
      .getProductById(id)
      .then((product) =>
        setForm({
          productName: product.productName,
          description: product.description || '',
          price: product.price,
          stock: product.stock ?? 0,
          imageUrl: product.imageUrl || '',
          category: product.category,
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaving(true);
    try {
      const { category, ...payload } = form;
      await productService.updateProduct(id, {
        ...payload,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      showSuccess('Product updated successfully');
      navigate('/supplier/products');
    } catch (err) {
      setError(err.message);
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullPage label="Loading product…" />;
  if (!form) return <AlertMessage message={error || 'Product not found.'} />;

  return (
    <div>
      <Breadcrumb items={[{ label: 'My Products', to: '/supplier/products' }, { label: 'Edit Product' }]} />
      <h2 className="font-display my-3">Edit Product</h2>

      <div className="card border-0 shadow-sm p-4" style={{ maxWidth: 760 }}>
        <AlertMessage message={error} onClose={() => setError(null)} />
        <form onSubmit={handleSubmit}>
          <ProductForm form={form} onChange={setForm} fieldErrors={fieldErrors} isEdit />
          <div className="d-flex gap-2 mt-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (<><Spinner className="me-2" />Saving…</>) : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/supplier/products')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
