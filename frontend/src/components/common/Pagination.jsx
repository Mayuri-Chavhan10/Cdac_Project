export default function Pagination({ page, totalPages, onPageChange, size = '' }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);
  for (let p = start; p <= end; p += 1) pages.push(p);

  return (
    <nav aria-label="Pagination">
      <ul className={`pagination ${size} justify-content-center mb-0`}>
        <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page - 1)} aria-label="Previous">
            <i className="bi bi-chevron-left" />
          </button>
        </li>

        {start > 0 && (
          <>
            <li className="page-item">
              <button className="page-link" onClick={() => onPageChange(0)}>1</button>
            </li>
            {start > 1 && <li className="page-item disabled"><span className="page-link">…</span></li>}
          </>
        )}

        {pages.map((p) => (
          <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(p)}>{p + 1}</button>
          </li>
        ))}

        {end < totalPages - 1 && (
          <>
            {end < totalPages - 2 && <li className="page-item disabled"><span className="page-link">…</span></li>}
            <li className="page-item">
              <button className="page-link" onClick={() => onPageChange(totalPages - 1)}>{totalPages}</button>
            </li>
          </>
        )}

        <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page + 1)} aria-label="Next">
            <i className="bi bi-chevron-right" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
