export default function Spinner({ size = 'sm', className = '' }) {
  return (
    <span
      className={`spinner-border spinner-border-${size} ${className}`}
      role="status"
      aria-hidden="true"
    />
  );
}
