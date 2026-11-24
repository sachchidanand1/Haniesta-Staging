import { Link } from '~/components/Link';
import { useState, useRef, useEffect } from 'react';
import type { ShopBySizeItem, ShopByFabricItem, ShopByColorItem, ShopByCollaboratorItem } from '~/lib/metafields';

type ShopByNeedProps = {
  shopBySizeData?: ShopBySizeItem[] | null;
  shopByFabricData?: ShopByFabricItem[] | null;
  shopByColorData?: ShopByColorItem[] | null;
  shopByCollaboratorData?: ShopByCollaboratorItem[] | null;
};

export function ShopByNeed({ shopBySizeData, shopByFabricData, shopByColorData, shopByCollaboratorData }: ShopByNeedProps) {
  const [activeTab, setActiveTab] = useState('Size');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const tabs = ['Size', 'Fabric', 'Color'];

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

  // Debug log to see the data structure
  // console.log('shopBySizeData:', shopBySizeData);
  // console.log('shopByFabricData:', shopByFabricData);
  // console.log('shopByColorData:', shopByColorData);
  // console.log('shopByCollaboratorData:', shopByCollaboratorData);

  // Transform metaobject data to match the expected format
  const transformedSizeData = shopBySizeData?.map((item) => ({
    id: item.areaId?.value || item.handle,
    name: item.name?.value || 'Unknown Area',
    sqft: item.sqft?.value || '',
    sizeLabel: item.sizeLabel?.value || '',
    description: item.description?.value || '',
    layout: item.areaId?.value || 'default',
    image: item.image?.reference?.image,
  }));

  const transformedFabricData = shopByFabricData?.map((item) => ({
    id: item.fabricId?.value || item.handle,
    name: item.name?.value || 'Unknown Fabric',
    description: item.description?.value || '',
    texture: item.fabricId?.value || 'default',
    image: item.image?.reference?.image,
  }));

  const transformedColorData = shopByColorData?.map((item) => ({
    id: item.areaId?.value || item.handle,
    name: item.name?.value || 'Unknown Color',
    description: item.description?.value || '',
    image: item.image?.reference?.image || item.imageLower?.reference?.image,
    imageUrl: item.image?.reference?.url || item.imageLower?.reference?.url,
    colors: [
      item.color1?.value || '#000000',
      item.color2?.value || '#808080',
      item.color3?.value || '#FFFFFF'
    ].filter(Boolean),
  }));

  const transformedCollaboratorData = shopByCollaboratorData?.map((item) => ({
    id: item.areaId?.value || item.handle,
    name: item.name?.value || 'Unknown Designer',
    specialty: item.specialty?.value || '',
    description: item.description?.value || '',
  }));

  // Get data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'Size':
        return transformedSizeData?.map(item => ({
          id: item.id,
          name: item.name,
          link: `/collections/${item.id}`,
          image: item.image,
          subtitle: item.sizeLabel,
          colors: null,
        }));

      case 'Fabric':
        return transformedFabricData?.map(item => ({
          id: item.id,
          name: item.name,
          link: `/collections/fabric-${item.id}`,
          image: item.image,
          subtitle: null,
          colors: null,
        }));

      case 'Color':
        return transformedColorData?.map(item => ({
          id: item.id,
          name: item.name,
          link: `/collections/${item.id}`,
          image: item.image,
          subtitle: null,
          colors: item.colors,
        }));

      default:
        return [];
    }
  };

  /**
   * Eyebrow header text displayed above the main category title.
   * Originally returned sub-titles like "Crafted with care" or "Earthy Color Stories".
   * Kept empty per layout redesign requests.
   */
  const getEyebrow = () => {
    return '';
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'Size':
        return 'Shop by Room';
      case 'Fabric':
        return 'Shop by Fabric';
      case 'Color':
        return 'Shop by Color';
      default:
        return `Shop by ${activeTab}`;
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'Size':
        return 'Find the perfect rug size and shape for every room in your home.';
      case 'Fabric':
        return 'Discover premium textures and materials crafted for comfort and durability.';
      case 'Color':
        return 'Explore rich, organic palettes woven to harmonize with your home decor.';
      default:
        return 'Explore our curated collections.';
    }
  };

  const data = getCurrentData() || [];
  const lgCols = data.length >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4';

  return (
    <div className="relative left-1/2 -translate-x-1/2 w-screen md:overflow-x-clip overflow-visible bg-[#FBF8F3]">
      <div className="flex flex-col pb-10 sm:pb-12 pt-6 sm:pt-8 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        
        {/* Navigation Tabs Row */}
        <div className="flex justify-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1 bg-[#2C2420]/5 backdrop-blur-sm p-1 rounded-full border border-[#2C2420]/10 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 sm:px-8 py-2 text-xs sm:text-sm font-sans font-medium tracking-wider uppercase rounded-full transition-all duration-300 ${
                  activeTab === tab
                    ? 'text-[#FBF8F3] bg-[#2C2420] shadow-md scale-105'
                    : 'text-[#2C2420]/70 hover:text-[#2C2420] hover:bg-white/30'
                }`}
              >
                {/* Simplified 'Room / Size' tab label to a single clean word: 'Room' */}
                {tab === 'Size' ? 'Room' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          {/* Eyebrow */}
          {getEyebrow() ? (
            <div className="mb-4 select-none">
              <span className="relative inline-block font-sans text-[11px] font-semibold tracking-[0.25em] text-[#B5704F] uppercase pl-8">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-[1px] bg-[#B5704F]" />
                {getEyebrow()}
              </span>
            </div>
          ) : null}
          {/* Main Title */}
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-[#2C2420] tracking-wide mb-4 leading-tight">
            {getTitle()}
          </h2>
          {/* Subtitle */}
          <p className="font-sans text-sm sm:text-base text-[#5A504A] font-light max-w-xl mx-auto leading-relaxed">
            {getSubtitle()}
          </p>
        </div>

        {/* Content Section */}
        {/* Mobile Swipeable Carousel */}
        <div className="md:hidden mb-6 relative px-4">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {data.map((item) => {
              const imageUrl = item.image?.url;
              const hasImage = !!imageUrl;

              return (
                <Link
                  key={item.id}
                  to={item.link}
                  className="relative flex-none w-[72%] aspect-[3/4] rounded-lg overflow-hidden group shadow-md snap-center border border-[#2C2420]/10"
                >
                  {/* Background Image / Colors */}
                  <div className="absolute inset-0 z-0 bg-gray-100">
                    {hasImage ? (
                      <img
                        src={imageUrl}
                        alt={item.image?.altText || item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : item.colors && item.colors.length > 0 ? (
                      <div className="flex h-full w-full">
                        {item.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="flex-1 h-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-[#EAD8BB]/10 flex items-center justify-center">
                        <span className="text-gray-300 font-serif italic text-xs">Haniesta</span>
                      </div>
                    )}
                  </div>

                  {/* Gradient Overlay for normal state text visibility */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-black/5 to-transparent transition-opacity duration-300 group-hover:opacity-0" />

                  {/* Bottom Text Panel Strip */}
                  <div className="absolute inset-x-0 bottom-0 z-20 p-3 pb-4 text-center flex items-end justify-center w-full">
                    <div className="inline-flex flex-col items-center justify-center transition-all duration-300 bg-transparent group-hover:bg-[#EAD8BB] border border-transparent group-hover:border-[#2C2420]/10 px-4 py-2 rounded-lg w-[90%] sm:w-auto">
                      <h3 className="font-serif text-[16px] font-medium tracking-wide w-full transition-colors duration-300 text-[#FAF8F5] group-hover:text-[#2C2420]">
                        {item.name}
                      </h3>
                      {item.subtitle && (
                        <p className="font-sans text-[9px] font-medium tracking-[0.08em] uppercase mt-0.5 w-full transition-colors duration-300 text-[#FAF8F5]/85 group-hover:text-[#8c836d]">
                          {item.subtitle}
                        </p>
                      )}
                      <span className="font-sans text-[8px] font-bold tracking-[0.15em] uppercase mt-1 inline-flex items-center gap-0.5 transition-colors duration-300 text-[#FAF8F5] group-hover:text-[#2C2420]">
                        Explore
                        <span className="text-[7px]">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Nav Buttons for Mobile Swipe */}
          <button
            onClick={scrollLeft}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-800 shadow-sm active:bg-white"
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-800 shadow-sm active:bg-white"
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>

        {/* Desktop Grid Layout */}
        <div className={`hidden md:grid justify-center ${lgCols} gap-6 max-w-6xl mx-auto w-full`}>
          {data.map((item) => {
            const imageUrl = item.image?.url;
            const hasImage = !!imageUrl;

            return (
              <Link
                key={item.id}
                to={item.link}
                className="relative w-full aspect-[3/4] rounded-lg overflow-hidden group shadow-md hover:shadow-xl transition-all duration-500 justify-self-center border border-[#2C2420]/10"
              >
                {/* Background Image / Color bands */}
                <div className="absolute inset-0 z-0 bg-gray-100">
                  {hasImage ? (
                    <img
                      src={imageUrl}
                      alt={item.image?.altText || item.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : item.colors && item.colors.length > 0 ? (
                    <div className="flex h-full w-full transition-transform duration-700 ease-out group-hover:scale-105">
                      {item.colors.map((color, idx) => (
                        <div
                          key={idx}
                          className="flex-1 h-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-[#EAD8BB]/10 flex items-center justify-center">
                      <span className="text-gray-400 font-serif italic text-xs">Haniesta</span>
                    </div>
                  )}
                </div>

                {/* Gradient Overlay for normal state text visibility */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-black/5 to-transparent transition-opacity duration-300 group-hover:opacity-0" />

                {/* Bottom Text Panel Strip */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-4 pb-6 text-center flex items-end justify-center w-full">
                  <div className="inline-flex flex-col items-center justify-center transition-all duration-300 bg-transparent group-hover:bg-[#EAD8BB] border border-transparent group-hover:border-[#2C2420]/10 px-6 py-3 rounded-lg w-[90%] sm:w-auto">
                    <h3 className="font-serif text-[17px] sm:text-[19px] font-medium tracking-wide transition-colors duration-300 text-[#FAF8F5] group-hover:text-[#2C2420]">
                      {item.name}
                    </h3>
                    {item.subtitle && (
                      <p className="font-sans text-[10px] sm:text-[11px] font-medium tracking-[0.08em] uppercase mt-0.5 transition-colors duration-300 text-[#FAF8F5]/85 group-hover:text-[#8c836d]">
                        {item.subtitle}
                      </p>
                    )}
                    <span className="font-sans text-[9px] sm:text-[10px] font-bold tracking-[0.15em] uppercase mt-1.5 inline-flex items-center gap-1 transition-all duration-300 text-[#FAF8F5] group-hover:text-[#2C2420] group-hover:translate-x-0.5">
                      Explore
                      <span className="text-[8px]">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Global Shop Now Button at the Bottom */}
        <div className="text-center mt-8 sm:mt-10">
          <Link
            to="/collections/all"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent text-[#2C2420] border border-[#2C2420] font-sans font-bold text-xs sm:text-sm tracking-[0.15em] uppercase rounded-full transition-all duration-300 hover:bg-[#EAD8BB] hover:border-[#EAD8BB] hover:text-[#2C2420]"
          >
            Shop All Rugs
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
    </div>
  );
}
