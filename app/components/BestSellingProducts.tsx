import type {HomepageFeaturedProductsQuery} from 'storefrontapi.generated';
import {useRef, useState, useEffect} from 'react';
import {ProductCard} from '~/components/ProductCard';
import {getImageLoadingPriority} from '~/lib/const';
import {Link} from '~/components/Link';

type BestSellingProductsProps = {
  products: HomepageFeaturedProductsQuery['products'];
  colorSwatches?: any;
  storeDomain?: string;
  title?: string;
};

export function BestSellingProducts({
  products,
  colorSwatches,
  storeDomain,
  title = 'Shop the Best Selling Products',
}: BestSellingProductsProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const scrollByAmount = (direction: 'prev' | 'next') => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth;
    el.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress(el.scrollLeft / max);
    };

    el.addEventListener('scroll', onScroll, {passive: true});
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  if (!products?.nodes?.length) return null;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-12 lg:px-16 xl:px-24 bg-white">
      <div className="max-w-[85rem] mx-auto">

        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-[10px] tracking-[0.25em] text-accent-gold font-semibold uppercase block mb-3 font-jost">
            Haniesta Curated
          </span>
          <h2 className="font-cormorant text-4xl sm:text-5xl font-light text-haniesta-brown mb-4">
            {title}
          </h2>
          <div className="w-24 h-[1px] bg-accent-gold mx-auto" />
        </div>

        <div className="relative">

          {/* Mobile arrows */}
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByAmount('prev')}
            className="flex sm:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-50 h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-900 border border-[#E8E3DA] shadow-md hover:bg-[#EAD8BB] transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByAmount('next')}
            className="flex sm:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-50 h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-900 border border-[#E8E3DA] shadow-md hover:bg-[#EAD8BB] transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Desktop arrows */}
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByAmount('prev')}
            className="hidden sm:flex absolute -left-6 md:-left-8 lg:-left-12 top-1/2 -translate-y-1/2 z-50 h-12 w-12 items-center justify-center rounded-full bg-white/95 text-gray-900 border border-[#E8E3DA] shadow-md hover:bg-[#EAD8BB] hover:text-haniesta-brown transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByAmount('next')}
            className="hidden sm:flex absolute -right-6 md:-right-8 lg:-right-12 top-1/2 -translate-y-1/2 z-50 h-12 w-12 items-center justify-center rounded-full bg-white/95 text-gray-900 border border-[#E8E3DA] shadow-md hover:bg-[#EAD8BB] hover:text-haniesta-brown transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Products Carousel */}
          <div
            ref={trackRef}
            className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 px-2 sm:px-4"
            style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
          >
            {products.nodes.slice(0, 8).map((product, i) => (
              <div
                key={product.id}
                className="flex-none w-[70%] sm:w-1/2 md:w-1/3 lg:w-1/4 snap-center"
              >
                <div className="h-full">
                  <ProductCard
                    product={product as any}
                    label="Bestseller"
                    loading={getImageLoadingPriority(i)}
                    colorSwatchData={colorSwatches}
                    storeDomain={storeDomain}
                    quickAdd
                    fixedTitleLines={2}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Thin Beige Scroll Progress Indicator */}
          <div className="mt-6 mx-auto max-w-xs h-[1.5px] bg-[#E8E1D6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C4A882] rounded-full transition-all duration-150 ease-out"
              style={{width: `${Math.round((1 / Math.min(8, products.nodes.length)) * 100 + scrollProgress * (100 - (1 / Math.min(8, products.nodes.length)) * 100))}%`}}
            />
          </div>
        </div>

        {/* 
          View All Button:
          Matches the 'Shop All Rugs' clean pill styling. Hover animations simplified (removing shadow/offsets)
          for a flatter, more professional e-commerce visual flow.
        */}
        <div className="text-center mt-8 sm:mt-10">
          <Link
            to="/collections/all"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent text-[#2C2420] border border-[#2C2420] font-jost font-bold text-xs sm:text-sm tracking-[0.15em] uppercase rounded-full transition-all duration-300 hover:bg-[#EAD8BB] hover:border-[#EAD8BB] hover:text-[#2C2420]"
          >
            View All Products
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}

export default BestSellingProducts;
