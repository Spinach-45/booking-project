export default function StarRating({ rating, max = 5, size = 14, interactive = false, onChange }) {
  const sizeClass = size <= 13 ? 'fi-xs' : size <= 16 ? 'fi-sm' : size >= 23 ? 'fi-lg' : '';
  return (
    <div className="star-rating">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        const color = filled || half ? '#f59e0b' : '#d1d5db';
        return (
          <i
            key={i}
            className={`fi ${filled ? 'fi-sr-star' : 'fi-rr-star'} ${sizeClass}`}
            style={interactive ? { cursor: 'pointer', color } : { color }}
            onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
          />
        );
      })}
    </div>
  );
}
