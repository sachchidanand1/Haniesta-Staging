import {useRef, useState, useEffect} from 'react';
import {Image} from '~/components/Image';

interface ShopInspiredStylesProps {
  collections?: Array<{
    id: string;
    title: string;
    image?: {
      url: string;
      altText?: string;
    };
    handle: string;
  }>;
  products?: Array<{
    id: string;
    title: string;
    handle: string;
    featuredImage?: {
      url: string;
      altText?: string;
    };
  }>;
  productTags?: string[];
}

export function ShopInspiredStyles({collections = [], products = [], productTags = []}: ShopInspiredStylesProps) {
  // console.log(collections, products, productTags);
  // Convert products to collection-like format for display with safety checks
  const productCollections = Array.isArray(products) 
    ? products.slice(0, 5).map(product => {
        if (!product || !product.id) return null;
        return {
          id: product.id,
          title: product.title || 'Untitled Product',
          handle: product.handle || 'product',
          image: product.featuredImage ? {
            url: product.featuredImage.url,
            altText: product.featuredImage.altText || product.title || 'Product image'
          } : undefined
        };
      }).filter(Boolean)
    : [];

  // Priority: tag-based collections > general collections > products
  const displayCollections = collections.length > 0 ? collections : 
                           productCollections.length > 0 ? productCollections : 
                           [];

  // Don't render if no data available
  if (!displayCollections || displayCollections.length === 0) {
    return null;
  }

  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    // Check scrollability
    const container = scrollRef.current;
    if (container) {
      const hasOverflow = container.scrollWidth > container.clientWidth;
      setNeedsScroll(hasOverflow);
      setCanScrollLeft(false);
      setCanScrollRight(hasOverflow);
    }
  }, [displayCollections.length]);

  const onScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    
    // Check if we can scroll left or right
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
    
    const center = container.scrollLeft + container.clientWidth / 2;
    let nearest = 0;
    let min = Number.MAX_VALUE;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const elCenter = el.offsetLeft + el.clientWidth / 2;
      const dist = Math.abs(elCenter - center);
      if (dist < min) {
        min = dist;
        nearest = i;
      }
    });
    setActiveIndex(nearest);
  };

  // Check scrollability after component renders
  useEffect(() => {
    const checkScroll = () => {
      const container = scrollRef.current;
      if (container) {
        const hasOverflow = container.scrollWidth > container.clientWidth;
        setNeedsScroll(hasOverflow);
        setCanScrollRight(hasOverflow);
      }
    };
    
    checkScroll();
    // Also check after images load
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [displayCollections]);

  const getNearestIndex = () => {
    const container = scrollRef.current;
    if (!container) return activeIndex;
    let nearest = 0;
    let min = Number.MAX_VALUE;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const dist = Math.abs(el.offsetLeft - container.scrollLeft);
      if (dist < min) {
        min = dist;
        nearest = i;
      }
    });
    return nearest;
  };

  const scrollToIndex = (i: number) => {
    const container = scrollRef.current;
    const el = itemRefs.current[i];
    if (container && el) {
      const targetLeft = el.getBoundingClientRect().left - container.getBoundingClientRect().left + container.scrollLeft;
      setActiveIndex(i);
      container.scrollTo({left: targetLeft, behavior: 'smooth'});
    }
  };

  const goPrev = () => {
    const current = getNearestIndex();
    if (current > 0) scrollToIndex(current - 1);
  };

  const goNext = () => {
    const current = getNearestIndex();
    const lastIndex = Math.min(displayCollections.length, 8) - 1;
    if (current < lastIndex) scrollToIndex(current + 1);
  };

  return (
    <div className="w-full py-16 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light text-stone-800 tracking-wide">
            Shop Inspired Styles
          </h2>
        </div>

        {/* Horizontal Scrolling Collections */}
        <div className="relative">
          <div id="inspired-carousel" ref={scrollRef} onScroll={onScroll} className={`flex gap-6 overflow-x-auto hiddenScroll pb-4 snap-x snap-mandatory scroll-smooth ${needsScroll ? 'justify-start' : 'justify-center'}`} aria-label="Shop Inspired Styles Carousel">
            {displayCollections.slice(0, 8).map((collection: any, index: number) => {
              if (!collection) return null;
              
              // Format collection title into 3 lines like the reference and avoid duplicate word "Collection"
              const formatTitle = (title: string) => {
                // Strip everything after first colon, en-dash, or hyphen (subtitle)
                const shortTitle = title.split(/[:\-–—]/)[0].trim();
                // Remove leading "The" and trailing "Collection" to get the core name
                const core = shortTitle
                  .replace(/^the\s+/i, '')
                  .replace(/\s*collections?$/i, '')
                  .trim();
                return `The\n${core}\nCollection`;
              };

              return (
                <div 
                  key={collection.id || `collection-${index}`} 
                  ref={(el) => (itemRefs.current[index] = el)}
                  className="group relative flex-none w-80 h-96 snap-start"
                >
                  {/* Outer Container with asymmetric frame */}
                  <div className="w-full h-full relative">
                    {/* Top/Right/Bottom frame - 10% white notch on the left for top/bottom */}
                    <div className="pointer-events-none absolute top-0 left-[10%] right-0 h-4 bg-[#EAD8BB] z-20"></div>
                    <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-4 bg-[#EAD8BB] z-20"></div>
                    <div className="pointer-events-none absolute bottom-0 left-[10%] right-0 h-4 bg-[#EAD8BB] z-20"></div>
                    {/* Inner Image Container */}
                    <div className="relative w-full h-full overflow-hidden z-0">
                      {/* Background Image */}
                      <div className="absolute inset-0">
                        {collection.image?.url ? (
                          <Image
                            data={{
                              url: collection.image.url,
                              altText: collection.image.altText || collection.title
                            }}
                            className="w-full h-full object-cover object-left-top"
                            sizes="320px"
                          />
                        ) : (
                          <div className="w-full h-full relative">
                            {/* Soft ambient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100"></div>
                            {/* Wall */}
                            <div className="absolute inset-x-0 top-0 h-[68%] bg-stone-100"></div>
                            {/* Floor */}
                            <div className="absolute inset-x-0 bottom-0 h-[32%] bg-amber-100/70"></div>
                            {/* Panel moldings */}
                            <div className="absolute top-[14%] left-[8%] right-[10%] h-[40%] border border-stone-300/60"></div>
                            <div className="absolute top-[30%] left-[12%] right-[14%] h-[28%] border border-stone-300/50"></div>
                            {/* Rug stripes (terracotta + beige) */}
                            <div className="absolute bottom-[10%] left-[6%] w-[88%] h-[36%] -rotate-8">
                              <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#B4603A]"></div>
                              <div className="absolute bottom-4 left-0 right-6 h-3 bg-[#C6734F]"></div>
                              <div className="absolute bottom-8 left-0 right-12 h-3 bg-[#D18C64]"></div>
                              <div className="absolute bottom-12 left-0 right-20 h-3 bg-[#E7C7A6]"></div>
                            </div>
                            {/* Concrete cubes */}
                            <div className="absolute left-10 bottom-[28%] w-16 h-16 bg-stone-300 shadow-md"></div>
                            <div className="absolute right-16 bottom-[36%] w-16 h-16 bg-stone-300 shadow-md"></div>
                            {/* Blue lamp on left cube */}
                            <div className="absolute left-[68px] bottom-[48%] w-1.5 h-8 bg-[#2E6FA3]"></div>
                            <div className="absolute left-[64px] bottom-[56%] w-5 h-5 rounded-full bg-[#2E6FA3]"></div>
                            {/* Sunlight streaks */}
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0)_35%,rgba(255,255,255,0.55)_58%,rgba(255,255,255,0)_76%)]"></div>
                          </div>
                        )}
                      </div>

                      {/* Subtle Overlay for Text Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500"></div>

                      {/* Link Overlay */}
                      <a 
                        href={`/collections/${collection.handle}`}
                        className="absolute inset-0 z-30 cursor-pointer"
                        aria-label={`Shop ${collection.title} Collection`}
                      >
                        <span className="sr-only">Shop {collection.title} Collection</span>
                      </a>

                      {/* Text Overlay - Bottom Left */}
                      <div className="absolute inset-0 z-40 flex items-end pl-5 pr-8 pb-8 pointer-events-none">
                        <div className="w-full transform group-hover:translate-y-[-2px] transition-transform duration-300">
                          <h3 className="whitespace-pre-line text-white font-cormorant text-[28px] md:text-[32px] font-light leading-[1.1] tracking-normal drop-shadow-lg">
                            {formatTitle(((collection?.title ?? '').trim() || (collection?.handle ?? '').replace(/[-_]/g, ' ')))}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Arrow Controls - side rectangles just outside the carousel */}
          <div className="pointer-events-none" aria-hidden="false">
            {canScrollLeft && (
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous slide"
                aria-controls="inspired-carousel"
                className="pointer-events-auto absolute -left-3 top-1/2 -translate-y-1/2 z-30 h-12 w-8 border border-[#EAD8BB] bg-white/95 text-stone-800 shadow-sm hover:bg-[#EAD8BB]/30 transition focus:outline-none focus:ring-2 focus:ring-[#EAD8BB]"
              >
                <span aria-hidden>‹</span>
                <span className="sr-only">Previous</span>
              </button>
            )}
            {canScrollRight && (
              <button
                type="button"
                onClick={goNext}
                aria-label="Next slide"
                aria-controls="inspired-carousel"
                className="pointer-events-auto absolute -right-3 top-1/2 -translate-y-1/2 z-30 h-12 w-8 border border-[#EAD8BB] bg-white/95 text-stone-800 shadow-sm hover:bg-[#EAD8BB]/30 transition focus:outline-none focus:ring-2 focus:ring-[#EAD8BB]"
              >
                <span aria-hidden>›</span>
                <span className="sr-only">Next</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
