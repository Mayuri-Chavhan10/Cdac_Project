import { useMemo, useState } from 'react';
import Pagination from './Pagination';
import SearchBox from './SearchBox';
import EmptyState from './EmptyState';

/**
 * Reusable table: client-side search + sort + pagination + row actions.
 *
 * columns: [{ key, label, sortable, accessor?: (row)=>value, render?: (row)=>node, className? }]
 * rows: array of data objects (each needs a stable id via rowKey)
 * searchKeys: which fields participate in the SearchBox filter
 */
export default function DataTable({
  columns,
  rows,
  rowKey = 'id',
  searchKeys = [],
  searchPlaceholder = 'Search…',
  pageSize = 8,
  renderActions,
  emptyTitle = 'No records found',
  emptyMessage,
  toolbar,
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);

  const getValue = (row, col) => (col.accessor ? col.accessor(row) : row[col.key]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((row) =>
      searchKeys.some((key) => {
        const val = row[key];
        return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
      }),
    );
  }, [rows, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = getValue(a, col);
      const bv = getValue(b, col);
      if (av === bv) return 0;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      return String(av).localeCompare(String(bv));
    });
    if (sortDir === 'desc') copy.reverse();
    return copy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice(page * pageSize, page * pageSize + pageSize);

  const handleSort = (col) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const sortIcon = (col) => {
    if (sortKey !== col.key) return <i className="bi bi-arrow-down-up text-soft ms-1 small" />;
    return <i className={`bi ${sortDir === 'asc' ? 'bi-sort-up' : 'bi-sort-down'} ms-1`} />;
  };

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
        {searchKeys.length > 0 ? (
          <SearchBox
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="flex-grow-1"
          />
        ) : (
          <div />
        )}
        {toolbar && <div className="d-flex gap-2">{toolbar}</div>}
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon="bi-inbox" title={emptyTitle} message={emptyMessage} />
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-ss align-middle mb-3">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`${col.sortable ? 'sortable-th' : ''} ${col.className || ''}`}
                      onClick={() => handleSort(col)}
                    >
                      {col.label}
                      {col.sortable && sortIcon(col)}
                    </th>
                  ))}
                  {renderActions && <th className="text-end">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row[rowKey]}>
                    {columns.map((col) => (
                      <td key={col.key} className={col.className || ''}>
                        {col.render ? col.render(row) : getValue(row, col)}
                      </td>
                    ))}
                    {renderActions && <td className="text-end">{renderActions(row)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-soft small">
              Showing {page * pageSize + 1}–{Math.min(sorted.length, (page + 1) * pageSize)} of {sorted.length}
            </span>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} size="pagination-sm" />
          </div>
        </>
      )}
    </div>
  );
}
