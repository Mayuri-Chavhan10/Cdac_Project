import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import useToast from '../../hooks/useToast';
import AlertMessage from '../../components/common/AlertMessage';
import Spinner from '../../components/common/Spinner';
import Breadcrumb from '../../components/common/Breadcrumb';
import ProductForm from '../../components/product/ProductForm';

const initialForm = { productName: '', description: '', price: '', stock: '', imageUrl: '', category: '' };

export default function AddProduct() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaving(true);
    try {
      await productService.addProduct({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      showSuccess('Product listed successfully');
      navigate('/supplier/products');
    } catch (err) {
      setError(err.message);
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'My Products', to: '/supplier/products' }, { label: 'Add Product' }]} />
      <h2 className="font-display my-3">Add a New Product</h2>

      <div className="card border-0 shadow-sm p-4" style={{ maxWidth: 760 }}>
        <AlertMessage message={error} onClose={() => setError(null)} />
        <form onSubmit={handleSubmit}>
          <ProductForm form={form} onChange={setForm} fieldErrors={fieldErrors} />
          <div className="d-flex gap-2 mt-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (<><Spinner className="me-2" />Listing…</>) : 'List Product'}
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
