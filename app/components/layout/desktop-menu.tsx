import { useState, useEffect, useRef } from "react";
import { useLocation } from "@remix-run/react";
import { createPortal } from "react-dom";
import { Image } from "@shopify/hydrogen";
import { Link } from "~/components/Link";
import { useShopMenu } from "~/hooks/use-shop-menu";
import type { SingleMenuItem } from "~/types/menu";
import { toSingleMenuItem } from "~/types/menu";
import { cn } from "~/lib/utils";
import { IconCaret } from "~/components/Icon";
import ShopTheLookJpg from "~/assets/shop_the_look.jpg";
import EntrywayRugPng from "~/assets/roommenu/entryway_rug.png";
import KitchenRugPng from "~/assets/roommenu/kitchen_rug.png";
import LivingRoomRugPng from "~/assets/roommenu/living_room_rug.png";
import DiningRoomRugPng from "~/assets/roommenu/dining_room_rug.png";
import BedroomRugPng from "~/assets/roommenu/bedroom_rug.png";
import KidsRoomRugPng from "~/assets/roommenu/kids_room_rug.png";
import OutdoorRugPng from "~/assets/roommenu/outdoor_rug.png";
import HallwayRugJpg from "~/assets/roommenu/hallway_rug.jpg";
import BathroomRugPng from "~/assets/roommenu/bathroom_rug.png";
import OfficeRugPng from "~/assets/roommenu/office_rug.png";
import PetCornerRugPng from "~/assets/roommenu/pet_corner_rug.png";
import TrendingRugSvg from "~/assets/trendmenu/rug.svg";

/**
 * Portal component to render content at document body level
 * This escapes stacking context issues
 */
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}

/**
 * DesktopMenu component - renders a horizontal navigation menu for desktop
 * Features mega menu with images and dropdown submenus
 */
export function DesktopMenu({ isTransparent = false }: { isTransparent?: boolean }) {
  const { headerMenu } = useShopMenu();
  const location = useLocation();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [headerOffset, setHeaderOffset] = useState(0);

  // Close menu immediately on route change
  useEffect(() => {
    setOpenMenuId(null);
  }, [location.pathname, location.search]);

  // Click-outside and Escape key listener to close menu
  useEffect(() => {
    if (!openMenuId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenuId(null);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('header') && !target.closest('.fixed')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  // Track header position for submenu positioning
  useEffect(() => {
    const updateHeaderOffset = () => {
      const header = document.querySelector('header[role="banner"]');
      if (header) {
        const rect = header.getBoundingClientRect();
        setHeaderOffset(rect.bottom);
      }
    };

    updateHeaderOffset();
    window.addEventListener('scroll', updateHeaderOffset);
    window.addEventListener('resize', updateHeaderOffset);

    return () => {
      window.removeEventListener('scroll', updateHeaderOffset);
      window.removeEventListener('resize', updateHeaderOffset);
    };
  }, []);

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setOpenMenuId(null);
    }, 250);
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  if (!headerMenu?.items?.length) {
    return null;
  }

  const items = headerMenu.items.map(toSingleMenuItem);

  return (
    <nav
      className="hidden lg:flex items-center gap-1 xl:gap-2"
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {items.map((item) => {
        const hasSubmenu = item.items && item.items.length > 0;
        const isOpen = openMenuId === item.id;
        const isSale = item.title?.toLowerCase() === 'sale';

        return (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => {
              handleMouseEnter();
              if (hasSubmenu) setOpenMenuId(item.id);
            }}
          >
            {hasSubmenu ? (
              <button
                type="button"
                onClick={() => setOpenMenuId((prev) => (prev === item.id ? null : item.id))}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 xl:px-3.5 py-2 text-[14px] xl:text-[15px] tracking-[0.16em] uppercase font-jost whitespace-nowrap transition-colors",
                  isTransparent
                    ? "text-white hover:text-white/85 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] font-medium"
                    : "text-[#3A2A1D] hover:text-[#8A7259]",
                  isSale && (isTransparent ? "text-amber-300" : "text-[#8A7259]")
                )}
              >
                <span className="relative">
                  {item.title}
                  <span
                    className={cn(
                      "absolute left-0 -bottom-1 h-[1.5px] transition-all duration-300",
                      isTransparent ? "bg-white" : "bg-[#8A7259]"
                    )}
                    style={{ width: isOpen ? "100%" : "0%" }}
                  />
                </span>
                <IconCaret direction={isOpen ? "up" : "down"} className={cn("w-3.5 h-3.5 transition-transform duration-300", isTransparent ? "text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]" : "text-[#3A2A1D]")} />
              </button>
            ) : (
              <Link
                to={item.to}
                prefetch="intent"
                onClick={() => setOpenMenuId(null)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 xl:px-3.5 py-2 text-[14px] xl:text-[15px] tracking-[0.16em] uppercase font-jost whitespace-nowrap transition-colors",
                  isTransparent
                    ? "text-white hover:text-white/85 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] font-medium"
                    : "text-[#3A2A1D] hover:text-[#8A7259]",
                  isSale && (isTransparent ? "text-amber-300" : "text-[#8A7259]")
                )}
              >
                <span className="relative group">
                  {item.title}
                  <span
                    className={cn(
                      "absolute left-0 -bottom-1 h-[1.5px] w-0 group-hover:w-full transition-all duration-300",
                      isTransparent ? "bg-white" : "bg-[#8A7259]"
                    )}
                  />
                </span>
              </Link>
            )}

            {hasSubmenu && isOpen && (
              <Portal>
                <div
                  className="fixed left-0 right-0 w-full"
                  style={{ top: `${headerOffset}px`, zIndex: 90 }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div
                    className={cn(
                      "shadow-[0_20px_50px_rgba(44,36,32,0.15)] border-b border-x border-[#E8E3DA] rounded-b-2xl backdrop-blur-xl transition-all duration-300",
                      (item.title.toLowerCase() === 'room' || item.title.toLowerCase() === 'trending')
                        ? "py-0 px-0 w-full"
                        : "py-10 px-16 w-full",
                    )}
                    style={{ backgroundColor: '#FAF7F2' }}
                    onClick={(e) => {
                      // Close menu automatically whenever any link inside is clicked
                      if ((e.target as HTMLElement).closest('a')) {
                        setOpenMenuId(null);
                      }
                    }}
                  >
                    {item.title.toLowerCase() === 'room' ? (
                      <RoomMenu />
                    ) : item.title.toLowerCase() === 'trending' ? (
                      <TrendingMenu items={item.items} />
                    ) : (
                      <MegaMenu items={item.items} />
                    )}
                  </div>
                </div>
              </Portal>
            )}
          </div>
        );
      })}
    </nav>
  );
}



function MegaMenu({ items }: { items: SingleMenuItem[] }) {
  return (
    <div className="relative mx-auto flex max-w-[1400px] gap-8 justify-between items-start">
      {items.map(({ id, title, to, items: children, resource }, idx) => {
        return resource?.image && children.length === 0 ? (
          <SlideIn
            key={id}
            className="group/item relative aspect-square w-64 max-w-64 overflow-hidden bg-gray-100 rounded-lg"
            style={{ "--idx": idx } as React.CSSProperties}
          >
            <Image
              data={resource.image}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-105"
              sizes="256px"
            />
            <Link
              to={to}
              prefetch="intent"
              className={cn(
                "absolute inset-0 flex items-center justify-center p-4 text-center",
                "bg-black/20 group-hover/item:bg-black/40",
                "text-white font-medium text-lg transition-all duration-300"
              )}
            >
              {title}
            </Link>
          </SlideIn>
        ) : (
          <SlideIn
            key={id}
            className={cn(
              "min-w-[160px] max-w-[200px] space-y-3 flex-1",
              (children.length > 14 || title.toLowerCase() === 'size') && "max-w-[260px]",
            )}
            style={{ "--idx": idx } as React.CSSProperties}
          >
            <span
              className="block font-jost text-[#8A7259] text-[11px] uppercase tracking-[0.14em] mb-3 cursor-default select-none"
            >
              {title}
            </span>
            {children.length > 0 && (
              <div
                className={cn(
                  "!bg-transparent !p-0 !shadow-none",
                  (children.length > 14 || title.toLowerCase() === 'size')
                    ? "grid grid-cols-2 gap-x-6 gap-y-2.5"
                    : "flex flex-col gap-2.5",
                )}
              >
                {children.map((cItem) => (
                  <Link
                    key={cItem.id}
                    to={cItem.to}
                    prefetch="intent"
                    className="block text-[14px] text-[#3A2A1D] hover:text-[#8A7259] transition-colors font-jost whitespace-nowrap"
                  >
                    {cItem.title}
                  </Link>
                ))}
              </div>
            )}
          </SlideIn>
        );
      })}
      
      {/* Featured Card - Clean, Sharp Edges, High Text Contrast */}
      <SlideIn
        className="relative w-[370px] h-[360px] overflow-hidden flex-shrink-0 rounded-none group border border-[#2C2420]/10"
        style={{ "--idx": items.length } as React.CSSProperties}
      >
        {/* Photo */}
        <img 
          src={ShopTheLookJpg} 
          alt="Shop All Rugs"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Dark Vignette Gradient for High Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Clean Content Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 text-center items-center">
          <h3 className="font-cormorant text-4xl text-white font-medium tracking-wide mb-4 drop-shadow-md">
            SHOP ALL RUGS
          </h3>
          <Link
            to="/collections/all"
            prefetch="intent"
            aria-label="Explore and shop all handcrafted rugs"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#EAD8BB] text-[#2C2420] font-sans font-bold text-xs tracking-[0.15em] uppercase rounded-none transition-colors duration-300 hover:bg-white hover:text-[#2C2420]"
          >
            Explore More
            <span className="text-sm">→</span>
          </Link>
        </div>
      </SlideIn>
    </div>
  );
}

function SlideIn(props: {
  className?: string;
  children: React.ReactNode;
  style: React.CSSProperties;
}) {
  const { className, children, style } = props;
  return (
    <div
      className={cn(
        "opacity-0 animate-fade-in",
        "[animation-delay:calc(var(--idx)*0.05s)]",
        className,
      )}
      style={
        {
          "--fade-in-duration": "300ms",
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

// ── ROOM SELECTIONS & MEGA-MENU DATA ──
// Holds category names, matching image assets, collection urls, and object-fit utility configurations
// for the primary navigation dropdown megamenu.
const roomData = [
  { name: "Entryway", image: EntrywayRugPng, link: "/collections/entryway-rugs" },
  { name: "Kitchen", image: KitchenRugPng, link: "/collections/kitchen-rugs" },
  { name: "Living Room", image: LivingRoomRugPng, link: "/collections/living-room-rugs" },
  { name: "Dining Room", image: DiningRoomRugPng, link: "/collections/dining-room-rugs" },
  { name: "Bedroom", image: BedroomRugPng, link: "/collections/bedroom-rugs" },
  { name: "Kids Room", image: KidsRoomRugPng, link: "/collections/kids-room-rugs" },
  { name: "Outdoor", image: OutdoorRugPng, link: "/collections/outdoor-rugs" },
  { name: "Hallway", image: HallwayRugJpg, link: "/collections/hallway-rugs-runners" },
  { name: "Bathroom", image: BathroomRugPng, link: "/collections/bathroom-rugs" },
  { name: "Office", image: OfficeRugPng, link: "/collections/office-rugs" },
  { name: "Pet's Corner", image: PetCornerRugPng, link: "/collections/pet-rugs" },
  { name: "View All", image: LivingRoomRugPng, link: "/collections/all" },
];


function RoomMenu() {
  return (
    <div className="w-full py-8 px-8 lg:px-14">
      {/* Refined Header - Matching Luxury Editorial Aesthetic */}
      <div className="w-full text-center pb-6">
        <h2 className="text-3xl lg:text-4xl font-cormorant text-[#2C2420] mb-2 font-medium tracking-wide">
          SHOP BY ROOM
        </h2>
        <p className="text-sm text-[#705E51] font-jost max-w-2xl mx-auto">
          Find the perfect handcrafted rug for every space in your home, curated by room to match function, mood, and lifestyle.
        </p>
      </div>
      
      {/* Room Grid */}
      <div className="mx-auto max-w-[1300px] max-h-[460px] pr-2 overflow-y-auto scrollbar-thin scrollbar-thumb-[#D9C7A8] scrollbar-track-transparent">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {roomData.map((room, idx) => (
            <SlideIn
              key={room.name}
              className="relative group cursor-pointer overflow-hidden rounded-lg aspect-[2/1] shadow-sm hover:shadow-md transition-shadow"
              style={{ "--idx": idx } as React.CSSProperties}
            >
              <Link 
                to={room.link} 
                prefetch="intent" 
                aria-label={`Shop ${room.name} rugs collection`}
                className="block w-full h-full"
              >
                <img 
                  src={room.image} 
                  alt={`${room.name} rugs collection`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent group-hover:from-black/70 transition-colors flex items-end p-3.5">
                  <h3 className="text-white text-base lg:text-lg font-cormorant font-medium tracking-wide drop-shadow-sm">
                    {room.name}
                  </h3>
                </div>
              </Link>
            </SlideIn>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendingMenu({ items }: { items: SingleMenuItem[] }) {
  return (
    <div className="w-full">
      {/* Categories section */}
      <div className="w-full py-8 px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex gap-16 justify-start">
            {items.map((category, idx) => (
              <SlideIn
                key={category.id}
                className="min-w-[180px]"
                style={{ "--idx": idx } as React.CSSProperties}
              >
                {/* Category Header — non-clickable label */}
                <h3 className="text-[11px] font-medium text-[#8A7259] tracking-[0.14em] uppercase mb-4 font-jost cursor-default select-none">
                  {category.title}
                </h3>
                
                {/* Subcategories - Vertical list */}
                <div className="space-y-2.5">
                  {category.items.map((sub) => (
                    <Link
                      key={sub.id}
                      to={sub.to}
                      prefetch="intent"
                      className="block text-[14px] text-[#3A2A1D] hover:text-[#8A7259] transition-colors leading-relaxed font-jost whitespace-nowrap"
                    >
                      {sub.title}
                    </Link>
                  ))}
                </div>
              </SlideIn>
            ))}
          </div>
        </div>
      </div>

      {/* Image section below - matching the screenshot */}
      <div className="w-full">
        <div className="relative w-full h-[300px] overflow-hidden">
          <img 
            src={TrendingRugSvg} 
            alt="Shop Trending"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-start justify-center p-12">
            <div className="max-w-lg">
              <h2 className="text-5xl font-cormorant text-white mb-4 leading-tight tracking-wide font-medium">
                Shop Trending
              </h2>
              <p className="text-lg text-white/90 mb-6 leading-relaxed">
                Check out the new arrivals & label collections
              </p>
              <Link
                to="/collections/trending"
                prefetch="intent"
                className="bg-white text-haniesta-brown px-6 py-3 text-sm font-medium hover:bg-haniesta-brown hover:text-white transition-colors rounded"
              >
                Shop All
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
