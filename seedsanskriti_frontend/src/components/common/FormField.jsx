export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required,
  as = 'input',
  children,
  className = '',
  ...rest
}) {
  const Component = as;
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      {as === 'select' ? (
        <select
          id={name}
          name={name}
          className={`form-select ${error ? 'is-invalid' : ''}`}
          value={value}
          onChange={onChange}
          {...rest}
        >
          {children}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          value={value}
          onChange={onChange}
          {...rest}
        />
      ) : (
        <Component
          id={name}
          name={name}
          type={type}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          value={value}
          onChange={onChange}
          {...rest}
        />
      )}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}
