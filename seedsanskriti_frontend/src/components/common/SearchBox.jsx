export default function SearchBox({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`input-group ${className}`}>
      <span className="input-group-text bg-white border-end-0">
        <i className="bi bi-search text-soft" />
      </span>
      <input
        type="search"
        className="form-control border-start-0"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
