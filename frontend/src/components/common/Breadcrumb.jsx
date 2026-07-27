import { Link } from 'react-router-dom';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb mb-0">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.label} className={`breadcrumb-item ${isLast ? 'active text-soft' : ''}`} aria-current={isLast ? 'page' : undefined}>
              {isLast || !item.to ? item.label : <Link to={item.to}>{item.label}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
