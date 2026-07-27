import { titleCase } from '../../utils/formatters';

export default function StatusBadge({ status, variant = 'secondary' }) {
  if (!status) return null;
  return <span className={`badge badge-status text-bg-${variant}`}>{titleCase(status)}</span>;
}
