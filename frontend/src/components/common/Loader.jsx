export default function Loader({ label = 'Loading…', fullPage = false }) {
  return (
    <div
      className={
        fullPage
          ? 'd-flex flex-column align-items-center justify-content-center py-5 min-vh-content'
          : 'd-flex flex-column align-items-center justify-content-center py-5'
      }
    >
      <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">{label}</span>
      </div>
      <p className="text-soft mt-3 mb-0">{label}</p>
    </div>
  );
}
