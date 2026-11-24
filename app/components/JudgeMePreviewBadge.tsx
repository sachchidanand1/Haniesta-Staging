import {useEffect, useState} from 'react';
import {parseJudgemeWidgetHTML} from '~/utils/judgeme';
import StarRating from '~/components/StarRating';

export function JudgeMePreviewBadge({
  handle,
  className,
  variant = 'compact',
}: {
  handle: string;
  className?: string;
  variant?: 'compact' | 'wordy';
}) {
  const [avg, setAvg] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    let aborted = false;
    const run = async () => {
      try {
        const res = await fetch(
          `/api/product/${encodeURIComponent(handle)}/reviews?per_page=1`,
        );
        if (!res.ok) {
          if (!aborted) setLoaded(true);
          return;
        }
        const data: any = await res.json();
        const summary = parseJudgemeWidgetHTML(data?.widget || '');
        if (!aborted) {
          setAvg(Number(summary.averageRating || 0));
          setTotal(Number(summary.totalReviews || 0));
          setLoaded(true);
        }
      } catch {
        if (!aborted) setLoaded(true);
      }
    };
    run();
    return () => {
      aborted = true;
    };
  }, [handle]);

  const colorVar = 'var(--color-product-reviews)';
  const label = variant === 'wordy'
    ? total > 0
      ? `${total} ${total === 1 ? 'review' : 'reviews'}`
      : 'No reviews'
    : `(${total})`;

  const containerClass = `${className ? className + ' ' : ''}inline-flex items-center gap-2 align-middle leading-none`;

  if (!loaded) {
    return (
      <span className={containerClass} aria-busy="true">
        <span className="mr-1 flex items-center" aria-hidden>
          <span className="h-4 w-16 rounded bg-primary/10 animate-pulse" />
        </span>
        <span className="h-3 w-8 rounded bg-primary/10 animate-pulse" />
      </span>
    );
  }

  return (
    <span className={containerClass} aria-label={`${avg} out of 5 stars, ${total} reviews`}>
      <span className="mr-1 flex items-center" aria-hidden style={{color: colorVar}}>
        <StarRating rating={avg} className="[&>svg]:h-4 [&>svg]:w-4" colorClass="" />
      </span>
      <span className="opacity-70 leading-none">{label}</span>
    </span>
  );
}

export default JudgeMePreviewBadge;
