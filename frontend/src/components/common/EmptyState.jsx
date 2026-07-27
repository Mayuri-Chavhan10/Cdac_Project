export default function EmptyState({ icon = 'bi-inbox', title = 'Nothing here yet', message, action }) {
  return (
    <div className="text-center py-5">
      <i className={`bi ${icon} text-soft`} style={{ fontSize: '2.75rem' }} />
      <h5 className="mt-3 mb-1">{title}</h5>
      {message && <p className="text-soft mb-3">{message}</p>}
      {action}
    </div>
  );
}
