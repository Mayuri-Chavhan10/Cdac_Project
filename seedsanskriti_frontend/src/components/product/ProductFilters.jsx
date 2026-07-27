import { CATEGORY_OPTIONS, CATEGORY_LABELS } from '../../utils/constants';

export default function ProductFilters({ filters, onChange, onReset }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="card border-0 shadow-sm p-3">
      <h6 className="font-display mb-3">Filters</h6>

      <div className="mb-3">
        <label className="form-label small">Category</label>
        <select
          className="form-select form-select-sm"
          value={filters.category || ''}
          onChange={(e) => update('category', e.target.value || undefined)}
        >
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label small">Price Range (₹)</label>
        <div className="d-flex gap-2">
          <input
            type="number"
            min="0"
            className="form-control form-control-sm"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) => update('minPrice', e.target.value ? Number(e.target.value) : undefined)}
          />
          <input
            type="number"
            min="0"
            className="form-control form-control-sm"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) => update('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="inStock"
          checked={!!filters.inStock}
          onChange={(e) => update('inStock', e.target.checked ? true : undefined)}
        />
        <label className="form-check-label small" htmlFor="inStock">In stock only</label>
      </div>

      <div className="mb-3">
        <label className="form-label small">Sort By</label>
        <select
          className="form-select form-select-sm"
          value={`${filters.sortBy || 'id'}:${filters.sortDir || 'asc'}`}
          onChange={(e) => {
            const [sortBy, sortDir] = e.target.value.split(':');
            onChange({ ...filters, sortBy, sortDir });
          }}
        >
          <option value="id:desc">Newest first</option>
          <option value="price:asc">Price: Low to High</option>
          <option value="price:desc">Price: High to Low</option>
          <option value="productName:asc">Name: A to Z</option>
        </select>
      </div>

      <button className="btn btn-outline-secondary btn-sm" onClick={onReset}>
        <i className="bi bi-arrow-counterclockwise me-1" /> Reset Filters
      </button>
    </div>
  );
}
