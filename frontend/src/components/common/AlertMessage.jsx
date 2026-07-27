export default function AlertMessage({ variant = 'danger', message, onClose, className = '' }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${variant} d-flex align-items-start justify-content-between ${className}`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button type="button" className="btn-close ms-3" aria-label="Close" onClick={onClose} />
      )}
    </div>
  );
}
