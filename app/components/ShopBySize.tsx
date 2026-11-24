import {Link} from '~/components/Link';
import {useState, useRef, useEffect} from 'react';

const roomAreas = [
  {
    id: 'living-area',
    name: 'Living Area',
    sqft: '200 sq ft',
    description: 'Cozy seating arrangements',
    layout: 'living',
  },
  {
    id: 'dining-area',
    name: 'Dining Area',
    sqft: '150 sq ft',
    description: 'Perfect for family meals',
    layout: 'dining',
  },
  {
    id: 'bathroom-area',
    name: 'Bathroom Area',
    sqft: '80 sq ft',
    description: 'Compact and functional',
    layout: 'bathroom',
  },
  {
    id: 'bedroom-area',
    name: 'Bedroom Area',
    sqft: '180 sq ft',
    description: 'Restful retreat space',
    layout: 'bedroom',
  },
  {
    id: 'porch-area',
    name: 'Porch Area',
    sqft: '120 sq ft',
    description: 'Outdoor living space',
    layout: 'porch',
  },
];

// Floor plan layout component
function FloorPlanLayout({ layout }: { layout: string }) {
  const baseClasses = "w-full h-full";
  
  switch (layout) {
    case 'living':
      return (
        <svg viewBox="0 0 120 120" className={baseClasses}>
          {/* Room outline */}
          <rect x="10" y="10" width="100" height="100" fill="#f5f5f0" stroke="#d4c5a9" strokeWidth="2"/>
          {/* Sofa */}
          <rect x="20" y="70" width="40" height="15" fill="#8b7355" rx="2"/>
          {/* Coffee table */}
          <rect x="30" y="50" width="20" height="15" fill="#a68b5b" rx="1"/>
          {/* TV stand */}
          <rect x="75" y="20" width="25" height="8" fill="#8b7355"/>
          {/* Rug area */}
          <rect x="25" y="45" width="50" height="35" fill="#d4a574" fillOpacity="0.6" rx="2"/>
          {/* Chair */}
          <circle cx="85" cy="75" r="8" fill="#8b7355"/>
        </svg>
      );
    case 'dining':
      return (
        <svg viewBox="0 0 120 120" className={baseClasses}>
          {/* Room outline */}
          <rect x="10" y="10" width="100" height="100" fill="#f5f5f0" stroke="#d4c5a9" strokeWidth="2"/>
          {/* Dining table (circle) */}
          <circle cx="60" cy="60" r="20" fill="#8b7355"/>
          {/* Chairs around table */}
          <circle cx="60" cy="35" r="6" fill="#a68b5b"/>
          <circle cx="60" cy="85" r="6" fill="#a68b5b"/>
          <circle cx="35" cy="60" r="6" fill="#a68b5b"/>
          <circle cx="85" cy="60" r="6" fill="#a68b5b"/>
          {/* Rug under table */}
          <circle cx="60" cy="60" r="28" fill="#d4a574" fillOpacity="0.6"/>
        </svg>
      );
    case 'bathroom':
      return (
        <svg viewBox="0 0 120 120" className={baseClasses}>
          {/* Room outline */}
          <rect x="10" y="10" width="100" height="100" fill="#f5f5f0" stroke="#d4c5a9" strokeWidth="2"/>
          {/* Bathtub */}
          <rect x="15" y="15" width="35" height="20" fill="#8b7355" rx="3"/>
          {/* Toilet */}
          <rect x="75" y="15" width="15" height="20" fill="#a68b5b" rx="2"/>
          {/* Sink */}
          <rect x="15" y="80" width="25" height="15" fill="#8b7355" rx="2"/>
          {/* Bath mat */}
          <rect x="20" y="50" width="25" height="15" fill="#d4a574" fillOpacity="0.8" rx="2"/>
        </svg>
      );
    case 'bedroom':
      return (
        <svg viewBox="0 0 120 120" className={baseClasses}>
          {/* Room outline */}
          <rect x="10" y="10" width="100" height="100" fill="#f5f5f0" stroke="#d4c5a9" strokeWidth="2"/>
          {/* Bed */}
          <rect x="30" y="25" width="50" height="35" fill="#8b7355" rx="3"/>
          {/* Nightstands */}
          <rect x="20" y="35" width="8" height="15" fill="#a68b5b"/>
          <rect x="82" y="35" width="8" height="15" fill="#a68b5b"/>
          {/* Dresser */}
          <rect x="20" y="80" width="30" height="12" fill="#8b7355"/>
          {/* Area rug */}
          <rect x="35" y="65" width="40" height="25" fill="#d4a574" fillOpacity="0.6" rx="2"/>
        </svg>
      );
    case 'porch':
      return (
        <svg viewBox="0 0 120 120" className={baseClasses}>
          {/* Room outline with open side */}
          <path d="M10 10 L110 10 L110 110 L10 110 L10 80 L30 80 L30 40 L10 40 Z" fill="#f5f5f0" stroke="#d4c5a9" strokeWidth="2"/>
          {/* Outdoor furniture */}
          <rect x="40" y="30" width="40" height="20" fill="#8b7355" rx="2"/>
          {/* Chairs */}
          <rect x="25" y="60" width="15" height="15" fill="#a68b5b" rx="2"/>
          <rect x="80" y="60" width="15" height="15" fill="#a68b5b" rx="2"/>
          {/* Outdoor rug */}
          <rect x="30" y="35" width="50" height="40" fill="#d4a574" fillOpacity="0.5" rx="3"/>
          {/* Plants */}
          <circle cx="20" cy="25" r="5" fill="#7a9471"/>
          <circle cx="100" cy="25" r="5" fill="#7a9471"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 120 120" className={baseClasses}>
          <rect x="10" y="10" width="100" height="100" fill="#f5f5f0" stroke="#d4c5a9" strokeWidth="2"/>
        </svg>
      );
  }
}

export function ShopBySize() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({left: -300, behavior: 'smooth'});
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({left: 300, behavior: 'smooth'});
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons();
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  return (
    <section className="py-16 px-6 sm:px-12 lg:px-16 xl:px-24 bg-white">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-light text-gray-800 mb-6">
          Shop By Size
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Find the perfect rug size for your space. From cozy corners to grand statements.
        </p>
      </div>

      {/* Mobile Carousel with Navigation */}
      <div className="relative md:hidden mb-16">
        {/* Left Navigation Button */}
        <button
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-stone-200 flex items-center justify-center transition-all duration-200 ${
            canScrollLeft ? 'opacity-100 hover:bg-stone-50' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll left"
        >
          <svg
            className="w-5 h-5 text-stone-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth px-12 py-2 scrollbar-hide"
          style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        >
          {roomAreas.map((area) => (
            <Link
              key={area.id}
              to={`/collections/${area.id}`}
              className="group text-center flex-shrink-0 w-[160px]"
            >
              <div className="bg-stone-50 border border-stone-200 hover:border-stone-400 transition-all duration-300 hover:shadow-lg rounded-lg overflow-hidden">
                {/* Floor Plan Visual */}
                <div className="aspect-square p-4 bg-gradient-to-br from-stone-100 to-stone-50">
                  <FloorPlanLayout layout={area.layout} />
                </div>
                
                {/* Room Info */}
                <div className="p-3 bg-white">
                  <h3 className="font-medium text-gray-800 mb-1 group-hover:text-stone-600 transition-colors text-sm">
                    {area.name}
                  </h3>
                  <p className="text-xs text-stone-500 mb-1">{area.sqft}</p>
                  <p className="text-[10px] text-gray-400">{area.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Navigation Button */}
        <button
          onClick={scrollRight}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-stone-200 flex items-center justify-center transition-all duration-200 ${
            canScrollRight ? 'opacity-100 hover:bg-stone-50' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll right"
        >
          <svg
            className="w-5 h-5 text-stone-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Desktop/Tablet Grid */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
        {roomAreas.map((area) => (
          <Link
            key={area.id}
            to={`/collections/${area.id}`}
            className="group text-center"
          >
            <div className="bg-stone-50 border border-stone-200 hover:border-stone-400 transition-all duration-300 hover:shadow-lg rounded-lg overflow-hidden">
              {/* Floor Plan Visual */}
              <div className="aspect-square p-4 bg-gradient-to-br from-stone-100 to-stone-50">
                <FloorPlanLayout layout={area.layout} />
              </div>
              
              {/* Room Info */}
              <div className="p-4 bg-white">
                <h3 className="font-medium text-gray-800 mb-1 group-hover:text-stone-600 transition-colors">
                  {area.name}
                </h3>
                <p className="text-sm text-stone-500 mb-1">{area.sqft}</p>
                <p className="text-xs text-gray-400">{area.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Size Guide Link */}
      <div className="text-center">
        <Link
          to="/pages/size-guide"
          className="inline-flex items-center text-stone-700 font-medium hover:text-stone-900 transition-colors group"
        >
          View Complete Size Guide
          <svg
            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
