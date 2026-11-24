import {useMemo, useState, useEffect, useRef} from 'react';
import StarRating from '~/components/StarRating';
import {parseJudgemeWidgetHTML} from '~/utils/judgeme';

function truncate(text: string, max = 260): string {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + '…';
}

function maskEmail(email: string): string {
  const [u, d] = String(email).split('@');
  if (!u || !d) return String(email || '');
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

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('');
}

// Deterministic avatar colour from name
const AVATAR_PALETTES = [
  {bg: '#EAD8BB', text: '#2C2420'},
  {bg: '#D9C7A8', text: '#3D2E22'},
  {bg: '#C4A882', text: '#fff'},
  {bg: '#B5704F', text: '#fff'},
  {bg: '#2C2420', text: '#EAD8BB'},
  {bg: '#8A7560', text: '#FAF7F2'},
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_PALETTES[Math.abs(h) % AVATAR_PALETTES.length];
}

function QuoteIcon({className}: {className?: string}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 24"
      fill="currentColor"
      className={className}
    >
      <path d="M0 24V14.4C0 6.84 4.56 2.04 13.68 0l1.44 2.52C10.32 3.72 7.8 6.12 7.08 9.6H13.2V24H0zm18.8 0V14.4C18.8 6.84 23.36 2.04 32.48 0l1.44 2.52c-4.8 1.2-7.32 3.6-8.04 7.08H32V24H18.8z" />
    </svg>
  );
}

export function JudgeMeFiveUpCarousel({
  reviews = [] as any[],
  summaryHtml,
  heading = 'Let customers speak for us',
}: {
  reviews?: any[];
  summaryHtml?: string;
  heading?: string;
}) {
  const summary = useMemo(() => {
    try {
      return parseJudgemeWidgetHTML(summaryHtml || '');
    } catch {
      return {averageRating: 0, totalReviews: 0};
    }
  }, [summaryHtml]);

  const items = useMemo(() => {
    return Array.isArray(reviews)
      ? (reviews as any[]).map((r: any) => ({
          id: r?.id ?? r?._id ?? r?.created_at ?? Math.random().toString(36).slice(2),
          title: (r?.title ?? '').toString(),
          body: (r?.body ?? '').toString(),
          rating: Number(r?.rating ?? 0),
          reviewer: r?.reviewer || {},
          created_at: r?.created_at,
        }))
      : [];
  }, [reviews]);

  const top6 = useMemo(() => items.slice(0, 6), [items]);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) { setScrollProgress(0); return; }
      const progress = el.scrollLeft / max;
      setScrollProgress(progress);
      const cardWidth = el.scrollWidth / top6.length;
      setActiveIndex(Math.round(el.scrollLeft / cardWidth));
    };
    el.addEventListener('scroll', onScroll, {passive: true});
    return () => el.removeEventListener('scroll', onScroll);
  }, [top6.length]);

  const scrollTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / top6.length;
    el.scrollTo({left: cardWidth * index, behavior: 'smooth'});
  };

  if (!top6.length) return null;

  const avg = Number(summary?.averageRating || 5);
  const total = Number(summary?.totalReviews || 0);

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden bg-[#FAF7F2]">
      {/* Subtle decorative texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232C2420' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative px-6 sm:px-12 lg:px-16 xl:px-24 max-w-[90rem] mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-10 sm:mb-12">
          {/* 
            NOTE: The "Verified Reviews" eyebrow originally rendered above the title 
            has been removed per minimal redesign styling guidelines.
          */}

          <h2 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl text-[#2C2420] font-light tracking-wide leading-tight mb-6">
            {heading}
          </h2>

          {/* Stars + count summary */}
          {avg > 0 && (
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill={s <= Math.round(avg) ? '#C4A882' : 'none'}
                    stroke="#C4A882"
                    strokeWidth="1.5"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              <span className="font-jost text-sm text-[#8A7560] tracking-wide">
                <strong className="text-[#2C2420] font-semibold">{avg.toFixed(1)}</strong>
                {total > 0 && <> &nbsp;·&nbsp; {total.toLocaleString()} reviews</>}
              </span>
            </div>
          )}
        </div>

        {/* ── Cards Carousel ── */}
        <div
          ref={trackRef}
          className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4"
          style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        >
          {top6.map((t, idx) => {
            const who = getReviewerDisplay(t);
            const pal = avatarColor(who.name);
            const initials = getInitials(who.name);

            return (
              <article
                key={t.id}
                className="relative flex-none w-[85vw] sm:w-[46%] md:w-[calc(33.333%-1rem)] lg:w-[calc(33.333%-1.5rem)] snap-start flex flex-col bg-white border border-[#E8E1D6] rounded-lg p-7 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* Large decorative quote */}
                <QuoteIcon className="absolute top-6 right-7 h-8 w-8 text-[#EAD8BB]/80" />

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill={s <= t.rating ? '#C4A882' : 'none'}
                      stroke="#C4A882"
                      strokeWidth="1.5"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>

                {/* Review title */}
                {t.title ? (
                  <p className="font-cormorant text-lg text-[#2C2420] font-semibold mb-2 leading-snug pr-10">
                    {truncate(t.title, 80)}
                  </p>
                ) : null}

                {/* Review body */}
                <p className="font-jost text-sm text-[#5A504A] leading-relaxed flex-grow mb-6"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  } as any}
                >
                  {truncate(t.body, 280)}
                </p>

                {/* Divider */}
                <div className="h-[1px] bg-[#EAD8BB]/60 mb-5" />

                {/* Author row */}
                <div className="flex items-center gap-3">
                  {/* Avatar circle */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold font-jost"
                    style={{backgroundColor: pal.bg, color: pal.text}}
                  >
                    {initials || '?'}
                  </div>
                  <div>
                    <p className="font-jost text-sm font-semibold text-[#2C2420] leading-none mb-0.5">
                      {who.name}
                    </p>
                    {/* 
                      NOTE: The "Verified Buyer" badge originally rendered below the buyer name
                      has been removed to simplify the card footprint.
                    */}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ── Scroll Progress ── */}
        <div className="mt-8 mx-auto max-w-xs">
          {/* Thin progress line */}
          <div className="h-[1.5px] bg-[#E8E1D6] rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-[#C4A882] rounded-full transition-all duration-200 ease-out"
              style={{
                width: `${Math.round(
                  (1 / top6.length) * 100 +
                    scrollProgress * (100 - (1 / top6.length) * 100),
                )}%`,
              }}
            />
          </div>

          {/* Dot navigation */}
          <div className="flex items-center justify-center gap-2">
            {top6.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to review ${i + 1}`}
                onClick={() => scrollTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'bg-[#C4A882] w-6 h-2'
                    : 'bg-[#DDD4C4] w-2 h-2 hover:bg-[#C4A882]/60'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default JudgeMeFiveUpCarousel;
