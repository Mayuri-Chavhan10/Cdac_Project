import useToast from '../../hooks/useToast';

const iconFor = (variant) => {
  switch (variant) {
    case 'success':
      return 'bi-check-circle-fill';
    case 'danger':
      return 'bi-exclamation-triangle-fill';
    default:
      return 'bi-info-circle-fill';
  }
};

export default function ToastStack() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast show align-items-center text-bg-${t.variant} border-0 mb-2 shadow`}
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body">
              <i className={`bi ${iconFor(t.variant)} me-2`} />
              {t.message}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => removeToast(t.id)}
              aria-label="Close"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
