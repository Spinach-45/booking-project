import { Star } from 'lucide-react';

export default function StarRating({ rating, max = 5, size = 14, interactive = false, onChange }) {
  return (
    <div className="star-rating">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <Star
            key={i}
            size={size}
            fill={filled ? '#f59e0b' : 'none'}
            color={filled || half ? '#f59e0b' : '#d1d5db'}
            style={interactive ? { cursor: 'pointer' } : {}}
            onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
          />
        );
      })}
    </div>
  );
}
