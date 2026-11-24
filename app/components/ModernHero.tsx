import {useState, useEffect, useCallback, useRef} from 'react';
import clsx from 'clsx';
import {Link} from '~/components/Link';
import type {CollectionContentFragment} from 'storefrontapi.generated';
import type {HeroMetaobject} from '~/lib/metafields';

type ModernHeroProps = {
  heroData?: CollectionContentFragment | HeroMetaobject;
  height?: 'full';
  top?: boolean;
  loading?: HTMLImageElement['loading'];
};

/* ─── Slide Data ─── */
interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageSrc: string;
  imageAlt: string;
}

const SLIDES: HeroSlide[] = [
  {
    id: 'home',
    eyebrow: 'THE ART OF WEAVING',
    title: 'Woven with Soul',
    ctaText: 'SHOP NOW',
    ctaLink: '/collections/all',
    secondaryCtaText: 'EXPLORE THE CRAFT',
    secondaryCtaLink: '/lifestyle',
    imageSrc: '/images/hero-primary-sanctuary.webp',
    imageAlt:
      'Handcrafted Natural Fibre Rugs — Haniesta Luxury Rug Collection',
  },
  {
    id: 'vista',
    eyebrow: 'NEW COLLECTION',
    title: 'The Vista Collection',
    ctaText: 'Explore Vista',
    ctaLink: '/collections/vista-collection',
    imageSrc: '/images/hero-collection-vista.webp',
    imageAlt:
      'The Vista Collection — Bold Geometric Outdoor Rug on a Modernist Terrace',
  },
  {
    id: 'persian',
    eyebrow: 'NEW COLLECTION',
    title: 'The Persian Collection',
    ctaText: 'Explore Persian',
    ctaLink: '/collections/persian-collection',
    imageSrc: '/images/hero-collection-persian.webp',
    imageAlt:
      'The Persian Collection — Heritage Medallion Kilims and Floral Flatweaves',
  },
  {
    id: 'sierra',
    eyebrow: 'NEW COLLECTION',
    title: 'The Sierra Collection',
    ctaText: 'Explore Sierra',
    ctaLink: '/collections/sierra-collection',
    imageSrc: '/images/hero-collection-sierra.webp',
    imageAlt:
      'The Sierra Collection — Handwoven Organic Wool and Jute Flatweave',
  },
  {
    id: 'sumak',
    eyebrow: 'NEW COLLECTION',
    title: 'The Sumak Collection',
    ctaText: 'Explore Sumak',
    ctaLink: '/collections/sumak-collection',
    imageSrc: '/images/hero-collection-sumak.webp',
    imageAlt:
      'The Sumak Collection — Textured Soumak Herringbone Weave Rugs',
  },
];

export function ModernHero({
  heroData,
  height,
  loading = 'eager',
  top,
}: ModernHeroProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const total = SLIDES.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-advance every 6 seconds, pause on hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    else if (diff < -50) prev();
    touchStartX.current = null;
  };

  return (
    <section
      className={clsx(
        'relative w-full overflow-hidden bg-[#1D1815]',
        top && '-mt-nav',
        height === 'full'
          ? 'h-[calc(100vh+var(--height-nav))] min-h-[620px]'
          : 'h-[calc(100vh-76px)] min-h-[580px] max-h-[860px]',
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Featured Collections"
    >
      {/* ─── Slides ─── */}
      {SLIDES.map((slide, idx) => {
        const isActive = idx === current;
        return (
          <div
            key={slide.id}
            className={clsx(
              'absolute inset-0 transition-opacity duration-[800ms] ease-in-out',
              isActive
                ? 'opacity-100 z-10'
                : 'opacity-0 z-0 pointer-events-none',
            )}
            aria-hidden={!isActive}
          >
            {/* Background Image */}
            <img
              src={slide.imageSrc}
              alt={slide.imageAlt}
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading={idx === 0 ? loading : 'lazy'}
              fetchPriority={idx === 0 ? 'high' : 'auto'}
              decoding="async"
            />
            {/* Scrim — light left + bottom gradient for text, deeper top gradient for crisp header visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/75 via-black/35 to-transparent pointer-events-none" />

            {/* Text Content — Bottom Left */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end items-start max-w-[1440px] mx-auto px-8 sm:px-14 lg:px-20 pb-20 sm:pb-24 lg:pb-28">
              {/* Eyebrow */}
              <span className="text-white/70 text-[11px] sm:text-[12px] font-sans font-medium tracking-[0.3em] uppercase mb-3 sm:mb-4 select-none">
                {slide.eyebrow}
              </span>

              {/* Heading */}
              <h1 className="font-cormorant text-[clamp(2.6rem,6vw,5rem)] font-light text-white leading-[1.08] tracking-wide select-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] mb-7 sm:mb-9">
                {slide.title}
              </h1>

              {/* CTA Buttons — Outline style with white hover fill */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  to={slide.ctaLink}
                  prefetch="intent"
                  className="group inline-flex items-center gap-2.5 px-7 py-2.5 sm:px-9 sm:py-3 border border-white/80 hover:bg-white hover:text-[#1A1614] text-white font-sans text-[11px] sm:text-[12px] font-medium tracking-[0.2em] uppercase transition-all duration-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] active:scale-[0.97] select-none"
                  aria-label={slide.ctaText}
                >
                  <span>{slide.ctaText}</span>
                </Link>
                {slide.secondaryCtaText && slide.secondaryCtaLink && (
                  <Link
                    to={slide.secondaryCtaLink}
                    prefetch="intent"
                    className="group inline-flex items-center gap-2.5 px-7 py-2.5 sm:px-9 sm:py-3 border border-white/80 hover:bg-white hover:text-[#1A1614] text-white font-sans text-[11px] sm:text-[12px] font-medium tracking-[0.2em] uppercase transition-all duration-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] active:scale-[0.97] select-none"
                    aria-label={slide.secondaryCtaText}
                  >
                    <span>{slide.secondaryCtaText}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* ─── Left / Right Arrow Buttons ─── */}
      <div className="absolute inset-y-0 left-4 sm:left-8 lg:left-12 z-30 flex items-center pointer-events-none">
        <button
          onClick={prev}
          type="button"
          aria-label="Previous slide"
          className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 hover:border-white/60 bg-black/15 hover:bg-black/40 text-white/70 hover:text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm focus:outline-none group"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
      </div>
      <div className="absolute inset-y-0 right-4 sm:right-8 lg:right-12 z-30 flex items-center pointer-events-none">
        <button
          onClick={next}
          type="button"
          aria-label="Next slide"
          className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 hover:border-white/60 bg-black/15 hover:bg-black/40 text-white/70 hover:text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm focus:outline-none group"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>

      {/* ─── Bottom Dot Indicators ─── */}
      <div className="absolute bottom-7 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === current;
          return (
            <button
              key={slide.id}
              onClick={() => setCurrent(idx)}
              type="button"
              aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
              className={clsx(
                'rounded-full transition-all duration-300 focus:outline-none cursor-pointer',
                isActive
                  ? 'w-6 h-[5px] bg-white'
                  : 'w-[6px] h-[6px] bg-white/40 hover:bg-white/70',
              )}
            />
          );
        })}
      </div>
    </section>
  );
}
