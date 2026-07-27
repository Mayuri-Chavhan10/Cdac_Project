import { CATEGORY_OPTIONS, CATEGORY_LABELS } from '../../utils/constants';

export default function ProductForm({ form, onChange, fieldErrors = {}, isEdit = false }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...form, [name]: name === 'price' || name === 'stock' ? value : value });
  };

  return (
    <div className="row">
      <div className="col-12 mb-3">
        <label className="form-label">Product Name</label>
        <input
          className={`form-control ${fieldErrors.productName ? 'is-invalid' : ''}`}
          name="productName"
          value={form.productName}
          onChange={handleChange}
          required
        />
        {fieldErrors.productName && <div className="invalid-feedback">{fieldErrors.productName}</div>}
      </div>

      <div className="col-12 mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          name="description"
          rows="4"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe growing conditions, germination time, ideal season…"
        />
      </div>

      <div className="col-md-4 mb-3">
        <label className="form-label">Price (₹)</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          className={`form-control ${fieldErrors.price ? 'is-invalid' : ''}`}
          name="price"
          value={form.price}
          onChange={handleChange}
          required
        />
        {fieldErrors.price && <div className="invalid-feedback">{fieldErrors.price}</div>}
      </div>

      <div className="col-md-4 mb-3">
        <label className="form-label">Stock Quantity</label>
        <input
          type="number"
          min="0"
          className={`form-control ${fieldErrors.stock ? 'is-invalid' : ''}`}
          name="stock"
          value={form.stock}
          onChange={handleChange}
          required
        />
        {fieldErrors.stock && <div className="invalid-feedback">{fieldErrors.stock}</div>}
      </div>

      <div className="col-md-4 mb-3">
        <label className="form-label">Category {isEdit && <span className="text-soft small">(locked after listing)</span>}</label>
        <select
          className={`form-select ${fieldErrors.category ? 'is-invalid' : ''}`}
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          disabled={isEdit}
        >
          <option value="">Select category</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
          ))}
        </select>
        {fieldErrors.category && <div className="invalid-feedback">{fieldErrors.category}</div>}
      </div>

      <div className="col-12 mb-3">
        <label className="form-label">Image URL</label>
        <input
          className="form-control"
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="https://…"
        />
      </div>

      {form.imageUrl && (
        <div className="col-12 mb-3">
          <img src={form.imageUrl} alt="Preview" className="rounded-3 border" style={{ maxHeight: 160 }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
      )}
    </div>
  );
}
