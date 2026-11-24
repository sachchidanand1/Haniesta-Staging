import React, {useId} from 'react';

function Star({filled = false, className = ''}: {filled?: boolean; className?: string}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.802-2.035a1 1 0 00-1.175 0l-2.802 2.035c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  );
}

function HalfStar({className = ''}: {className?: string}) {
  const gid = useId();
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <defs>
        <linearGradient id={`half-${gid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.802-2.035a1 1 0 00-1.175 0l-2.802 2.035c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        fill={`url(#half-${gid})`}
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarRating({
  rating = 0,
  className = '',
  size = 20,
  colorClass = 'text-emerald-600',
  style,
}: {
  rating?: number;
  className?: string;
  size?: number;
  colorClass?: string;
  style?: React.CSSProperties;
}) {
  // Round to nearest 0.5 for half-star visuals
  const rounded = Math.round(Math.max(0, Math.min(5, Number(rating))) * 2) / 2;
  const full = Math.floor(rounded);
  const hasHalf = rounded - full === 0.5;
  const starSizeClass = 'h-5 w-5'; // size kept for backward-compat; adjust if needed

  return (
    <div className={`inline-flex items-center ${colorClass} ${className}`} style={style}>
      {Array.from({length: 5}).map((_, i) => {
        if (i < full) return <Star key={i} filled className={starSizeClass} />;
        if (i === full && hasHalf) return <HalfStar key={i} className={starSizeClass} />;
        return <Star key={i} filled={false} className={starSizeClass} />;
      })}
    </div>
  );
}

export default StarRating;
