export default function StarRating({ rating = 0, count, size = '' }) {
  const rounded = Math.round((Number(rating) || 0) * 2) / 2;
  const stars = [];

  for (let i = 1; i <= 5; i += 1) {
    if (rounded >= i) stars.push('full');
    else if (rounded >= i - 0.5) stars.push('half');
    else stars.push('empty');
  }

  return (
    <span className={`star-rating d-inline-flex align-items-center gap-1 ${size}`}>
      {stars.map((type, idx) => (
        <i
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          className={`bi ${type === 'full' ? 'bi-star-fill' : type === 'half' ? 'bi-star-half' : 'bi-star'}`}
        />
      ))}
      {typeof count === 'number' && <span className="text-soft small ms-1">({count})</span>}
    </span>
  );
}
