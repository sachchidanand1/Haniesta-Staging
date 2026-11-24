import {useEffect, useMemo, useRef} from 'react';
import StarRating from '~/components/StarRating';
import {parseJudgemeWidgetHTML} from '~/utils/judgeme';

export function JudgeMeCarousel({html}: {html: string}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const summary = useMemo(() => {
    try {
      return parseJudgemeWidgetHTML(html || '');
    } catch {
      return {averageRating: 0, totalReviews: 0};
    }
  }, [html]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Inject HTML
    container.innerHTML = html || '';

    // Execute any scripts inside the injected HTML (innerHTML doesn't run scripts)
    const scripts = Array.from(container.querySelectorAll('script'));
    for (const oldScript of scripts) {
      const newScript = document.createElement('script');
      // copy attributes
      for (const attr of oldScript.attributes) newScript.setAttribute(attr.name, attr.value);
      // copy inline content
      newScript.text = oldScript.textContent || '';
      oldScript.replaceWith(newScript);
    }

    // Ensure Judge.me preloader is present (safe to include once)
    if (!document.querySelector('script[src*="widget_preloader.js"]')) {
      const s = document.createElement('script');
      s.src = 'https://cdn.judge.me/widget_preloader.js';
      s.async = true;
      document.head.appendChild(s);
    }

    // Allow slider JS to take over after a short delay: remove fallback grid class
    // This keeps layout readable before hydration, then re-enables carousel behavior
    container.classList.add('jdgm-fallback-grid');
    const t = window.setTimeout(() => {
      container.classList.remove('jdgm-fallback-grid');
    }, 600);
    return () => window.clearTimeout(t);
  }, [html]);

  return (
    <section className="py-20 bg-white">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-5xl sm:text-6xl text-emerald-900 font-light tracking-wide">
            Let customers speak for us
          </h2>
          {/* Stars and review count - only show if we have reviews */}
          {Number(summary?.totalReviews || 0) > 0 && (
            <>
              {/* Stars row */}
              <div className="mt-4 flex items-center justify-center text-emerald-600">
                <StarRating rating={Number(summary?.averageRating || 0)} className="[&>svg]:h-5 [&>svg]:w-5" colorClass="text-emerald-600" />
              </div>
              {/* Review count row */}
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="text-gray-700 text-sm">
                  from {Number(summary?.totalReviews || 0)} reviews
                </span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-600" fill="currentColor" aria-hidden>
                  <path d="M9 16.2l-3.5-3.5L4 14.2 9 19l12-12-1.5-1.5z" />
                </svg>
              </div>
            </>
          )}
        </div>

        {/* Inject Judge.me Featured Carousel HTML */}
        <div ref={containerRef} className="jdgm-featured-carousel" />

        {/* Ensure the carousel isn't hidden if Judge.me script doesn't run */}
        <style>{`.jdgm-carousel{display:block !important}`}</style>
      </div>
    </section>
  );
}
