import { Star } from 'lucide-react';

export default function StarRating({ rating, maxStars = 5, size = 16, interactive = false, onChange }) {
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    const filled = i <= Math.floor(rating);
    const half = !filled && i === Math.ceil(rating) && rating % 1 >= 0.5;
    stars.push(
      <span
        key={i}
        className={`star ${filled ? 'star-filled' : half ? 'star-half' : 'star-empty'} ${interactive ? 'star-interactive' : ''}`}
        onClick={() => interactive && onChange && onChange(i)}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      >
        <Star
          size={size}
          fill={filled || half ? '#f59e0b' : 'none'}
          stroke={filled || half ? '#f59e0b' : '#d1d5db'}
        />
      </span>
    );
  }
  return <span className="star-rating">{stars}</span>;
}
