import type {HomepageFeaturedProductsQuery} from 'storefrontapi.generated';
import {useRef} from 'react';
import {Section} from '~/components/Text';
import {ProductCard} from '~/components/ProductCard';

const mockProducts = {
  nodes: new Array(12).fill(''),
};

type ProductSwimlaneProps = HomepageFeaturedProductsQuery & {
  title?: string;
  count?: number;
  colorSwatchData?: any;
  storeDomain?: string;
};

export function ProductSwimlane({
  title = 'Featured Products',
  products = mockProducts,
  count = 12,
  colorSwatchData,
  storeDomain,
  ...props
}: ProductSwimlaneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const amount = Math.max(320, Math.floor(el.clientWidth * 0.85));
    el.scrollBy({left: direction === 'left' ? -amount : amount, behavior: 'smooth'});
  };

  return (
    <Section heading={title} padding="y" {...props}>
      <div className="max-w-full">
        <div className="relative w-full mx-auto lg:max-w-[83rem]">
          <div
            ref={containerRef}
            className="swimlane hiddenScroll md:pb-8 md:scroll-px-8 lg:scroll-px-12"
          >
            {products.nodes.map((product) => (
              <ProductCard
                product={product}
                key={product.id}
                className="snap-start shrink-0 w-80"
                colorSwatchData={colorSwatchData}
                storeDomain={storeDomain}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByAmount('left')}
            className="hidden md:flex items-center justify-center absolute -left-5 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/95 border border-stone-200/80 shadow-lg hover:bg-[#EAD8BB] hover:text-[#2C2420] hover:scale-105 active:scale-95 transition-all duration-300 z-30"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5 text-gray-900">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByAmount('right')}
            className="hidden md:flex items-center justify-center absolute -right-5 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/95 border border-stone-200/80 shadow-lg hover:bg-[#EAD8BB] hover:text-[#2C2420] hover:scale-105 active:scale-95 transition-all duration-300 z-30"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5 text-gray-900">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </Section>
  );
}
