import {useEffect, useMemo, useState} from 'react';
import {Heading, Text} from '~/components/Text';
import {parseJudgemeWidgetHTML, stripStructuredDataScripts} from '~/utils/judgeme';
import StarRating from '~/components/StarRating';
import JudgeMeReviewForm from '~/components/JudgeMeReviewForm';

export function JudgeMeSection({
  handle,
  html,
  heading = 'Customer Reviews',
  subtext = 'Read what our customers are saying about this product.',
}: {
  handle?: string;
  html?: string;
  heading?: string;
  subtext?: string;
}) {
  const [widgetHtml, setWidgetHtml] = useState<string>(
    stripStructuredDataScripts(html || ''),
  );
  const [reviews, setReviews] = useState<any[]>([]);
  const [loaded, setLoaded] = useState<boolean>(!!html);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>(
    'idle',
  );
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(5);
  const [totalPage, setTotalPage] = useState<number>(1);
  const summary = useMemo(() => {
    try {
      return parseJudgemeWidgetHTML(widgetHtml || '');
    } catch {
      return {averageRating: 0, totalReviews: 0, ratingDistribution: []};
    }
  }, [widgetHtml]);

  useEffect(() => {
    if (!handle) return;
    let aborted = false;
    (async () => {
      try {
        setStatus('loading');
        const res = await fetch(
          `/api/product/${encodeURIComponent(
            handle,
          )}/reviews?per_page=${perPage}&page=${page}`,
        );
        if (!res.ok) {
          setStatus('error');
          setLoaded(true);
          return;
        }
        const data: any = await res.json();
        if (aborted) return;
        setWidgetHtml((prev) =>
          stripStructuredDataScripts(prev || data?.widget || ''),
        );
        setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
        setTotalPage(Number(data?.totalPage || 1));
        setPerPage(Number(data?.perPage || perPage));
        setStatus('ok');
        setLoaded(true);
      } catch {
        if (!aborted) {
          setStatus('error');
          setLoaded(true);
        }
      }
    })();
    return () => {
      aborted = true;
    };
  }, [handle, page, perPage]);

  useEffect(() => {
    const container = document.getElementById('judgeme-reviews-widget');
    if (!container) return;
    container
      .querySelectorAll('script[type="application/ld+json"]')
      .forEach((node) => node.remove());
  }, [widgetHtml]);

  const [showForm, setShowForm] = useState(false);

  const colorVar = 'var(--color-product-reviews)';

  // Helpers to derive display name and masked email, handling placeholder names like "Customer"
  function maskEmail(email: string): string {
    const [u, d] = String(email).split('@');
    if (!u || !d) return String(email);
    const visible = Math.min(3, Math.max(1, u.length - 1));
    return `${u.slice(0, visible)}***@${d}`;
  }

  function deriveNameFromEmail(email?: string): string {
    const local = String(email || '').split('@')[0] || '';
    if (!local) return 'Anonymous';
    return local.charAt(0).toUpperCase() + local.slice(1);
  }

  function getReviewerDisplay(rev: any): {name: string; maskedEmail: string} {
    const email = rev?.reviewer?.email ? String(rev.reviewer.email) : '';
    const rawName = rev?.reviewer?.name ? String(rev.reviewer.name) : '';
    const generic = new Set(['customer', 'anonymous', 'guest', 'shopper', 'unknown', 'n/a', 'na']);
    let name = rawName.trim();
    if (!name || generic.has(name.toLowerCase())) {
      name = deriveNameFromEmail(email);
    }
    return {name, maskedEmail: email ? maskEmail(email) : ''};
  }

  function getVisiblePages(currentPage: number, lastPage: number): (number | string)[] {
    const DELTA = 1;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    for (let i = Math.max(2, currentPage - DELTA); i <= Math.min(lastPage - 1, currentPage + DELTA); i++) {
      range.push(i);
    }
    if (currentPage - DELTA > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }
    rangeWithDots.push(...range);
    if (currentPage + DELTA < lastPage - 1) {
      rangeWithDots.push('...', lastPage);
    } else if (lastPage > 1) {
      rangeWithDots.push(lastPage);
    }
    return rangeWithDots;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <Heading as="h2">{heading}</Heading>
        <Text className="opacity-80">{subtext}</Text>
      </div>
      {/* Summary + Histogram + Write button */}
      {status === 'loading' || !loaded ? (
        <div className="space-y-12" aria-busy="true" aria-live="polite">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_2fr_1fr]">
            {/* Column 1 - Main Summary Skeleton */}
            <div className="flex flex-col items-center justify-center space-y-3 animate-pulse">
              <div className="flex items-center gap-2">
                {Array.from({length: 5}).map((_, i) => (
                  <span key={i} className="h-10 w-10 rounded bg-gray-200" />
                ))}
              </div>
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="h-3 w-48 rounded bg-gray-200" />
            </div>

            {/* Column 2 - Ratings Breakdown Skeleton */}
            <div className="border-gray-200 md:border-x px-8 md:px-12 py-2">
              <div className="w-full space-y-2 animate-pulse">
                {Array.from({length: 5}).map((_, i) => (
                  <div key={i} className="grid grid-cols-[30px_1fr_80px] gap-4 py-1 items-center">
                    <div className="flex items-center gap-1">
                      <span className="h-4 w-4 rounded bg-gray-200" />
                      <span className="h-4 w-4 rounded bg-gray-200" />
                    </div>
                    <div className="h-2.5 w-full overflow-hidden bg-gray-200" />
                    <div className="h-3 w-10 rounded bg-gray-200 justify-self-end" />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3 - Button Skeleton */}
            <div className="flex items-center justify-center px-8">
              <div className="w-full md:w-64 h-10 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      ) : summary ? (
        <div className="space-y-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_2fr_1fr]">
            {/* Column 1 - Main Summary */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="flex flex-col items-center gap-2">
                <StarRating
                  rating={summary.averageRating}
                  className="[&>svg]:h-10 [&>svg]:w-10"
                  // eslint-disable-next-line react/style-prop-object
                  style={{color: colorVar} as any}
                />
                <span className="font-semibold text-gray-900 text-xl">
                  {Number(summary.averageRating).toFixed(2)} out of 5
                </span>
              </div>
              <div className="text-gray-600 text-sm">
                Based on {summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            {/* Column 2 - Ratings Breakdown */}
            <div className="border-gray-200 md:border-x px-8 md:px-12 py-2">
              <div className="w-full space-y-2">
                {summary.ratingDistribution?.map(({rating, frequency, percentage}: any) => (
                  <div key={rating} className="grid grid-cols-[30px_1fr_80px] gap-4 py-1">
                    <div className="flex items-center flex-shrink-0 gap-1">
                      <span className="text-gray-700">{rating}</span>
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden style={{color: colorVar}}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.802-2.035a1 1 0 00-1.175 0l-2.802 2.035c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2.5 w-full overflow-hidden bg-gray-200">
                        <div className="h-full transition-all duration-300 ease-out" style={{width: `${percentage}%`, backgroundColor: colorVar}} />
                      </div>
                    </div>
                    <div className="min-w-[3rem] flex-shrink-0 text-gray-600 text-sm text-right">
                      {frequency} {frequency === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3 - Write Review Button */}
            <div className="flex items-center justify-center px-8">
              <button
                type="button"
                onClick={() => setShowForm((v) => !v)}
                className="w-full md:w-64 h-10 bg-contrast text-primary px-4 rounded hover:opacity-90 transition border border-primary/10"
              >
                {showForm ? 'Hide Form' : 'Write a Review'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Custom Review Form (Projects-Hydrogen-Dummy style) */}
      <JudgeMeReviewForm showForm={showForm} setShowForm={setShowForm} />

      {/* Embedded Judge.me widget (kept for full details/form). We hide its title in CSS. */}
      {widgetHtml ? (
        <div
          id="judgeme-reviews-widget"
          className={`mt-8 ${showForm ? 'opacity-60' : ''}`}
          style={{pointerEvents: showForm ? ('none' as const) : ('auto' as const)}}
          aria-hidden={showForm || undefined}
          dangerouslySetInnerHTML={{__html: stripStructuredDataScripts(widgetHtml)}}
        />
      ) : null}
      {reviews?.length ? (
        <div className="mt-8 grid gap-6">
          {reviews.map((rev: any) => (
            <div key={rev?.id || rev?.created_at} className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="font-medium" style={{color: colorVar}}>
                  <StarRating rating={rev?.rating} className="[&>svg]:h-4 [&>svg]:w-4" />
                </div>
                <div className="mt-2 space-y-0.5">
                  {(() => {
                    const r = getReviewerDisplay(rev);
                    return (
                      <>
                        <div className="font-semibold text-gray-900">{r.name}</div>
                        {r.maskedEmail ? (
                          <div className="font-medium text-gray-500 text-sm">{r.maskedEmail}</div>
                        ) : null}
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="font-medium mb-1">{rev?.title}</div>
                <div className="opacity-90">{rev?.body}</div>
                {rev?.created_at && (
                  <div className="mt-2 text-xs opacity-60">{new Date(rev.created_at).toLocaleString()}</div>
                )}
              </div>
            </div>
          ))}
          {/* Pagination controls */}
          {totalPage > 1 ? (
            <div className="flex items-center justify-center gap-1.5 mt-6">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="py-2 px-1 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="First page"
              >
                «
              </button>
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="py-2 px-1 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                ‹
              </button>
              {getVisiblePages(page, totalPage).map((p, idx) =>
                p === '...' ? (
                  <span key={`dots-${idx}`} className="p-2 text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={`p-${p}`}
                    type="button"
                    onClick={() => setPage(p as number)}
                    className={`p-2 underline-offset-4 leading-4 ${
                      page === p ? 'underline font-semibold' : 'hover:underline'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPage, page + 1))}
                disabled={page === totalPage}
                className="py-2 px-1 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPage)}
                disabled={page === totalPage}
                className="py-2 px-1 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Last page"
              >
                »
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default JudgeMeSection;
