import React, {useState, useMemo} from 'react';
import {Link, useNavigate} from '@remix-run/react';
import {clsx} from 'clsx';
import {type MappedProductOptions} from '@shopify/hydrogen';
import {Money} from '@shopify/hydrogen';

export type RugShapeType =
  | 'rectangular'
  | 'square'
  | 'runner'
  | 'round'
  | 'oval'
  | 'special';

export interface RugShapeDefinition {
  id: RugShapeType;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
}

// Visual geometric SVGs with woven texture styling
export function ShapeIcon({shape, className = 'w-10 h-10'}: {shape: RugShapeType; className?: string}) {
  switch (shape) {
    case 'round':
      return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="40" cy="40" r="34" fill="#F4EFE6" stroke="#463925" strokeWidth="2.5" />
          <circle cx="40" cy="40" r="26" stroke="#CBB494" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="40" cy="40" r="18" stroke="#CBB494" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="40" cy="40" r="6" fill="#463925" fillOpacity="0.2" />
        </svg>
      );
    case 'oval':
      return (
        <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <ellipse cx="50" cy="30" rx="44" ry="24" fill="#F4EFE6" stroke="#463925" strokeWidth="2.5" />
          <ellipse cx="50" cy="30" rx="34" ry="17" stroke="#CBB494" strokeWidth="1" strokeDasharray="3 3" />
          <ellipse cx="50" cy="30" rx="22" ry="10" stroke="#CBB494" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );
    case 'runner':
      return (
        <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="6" y="8" width="88" height="24" rx="3" fill="#F4EFE6" stroke="#463925" strokeWidth="2" />
          <line x1="16" y1="8" x2="16" y2="32" stroke="#CBB494" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="84" y1="8" x2="84" y2="32" stroke="#CBB494" strokeWidth="1" strokeDasharray="2 2" />
          {/* Fringe accents */}
          <line x1="3" y1="11" x2="6" y2="11" stroke="#8C7A60" strokeWidth="1.5" />
          <line x1="3" y1="16" x2="6" y2="16" stroke="#8C7A60" strokeWidth="1.5" />
          <line x1="3" y1="21" x2="6" y2="21" stroke="#8C7A60" strokeWidth="1.5" />
          <line x1="3" y1="26" x2="6" y2="26" stroke="#8C7A60" strokeWidth="1.5" />
          <line x1="94" y1="11" x2="97" y2="11" stroke="#8C7A60" strokeWidth="1.5" />
          <line x1="94" y1="16" x2="97" y2="16" stroke="#8C7A60" strokeWidth="1.5" />
          <line x1="94" y1="21" x2="97" y2="21" stroke="#8C7A60" strokeWidth="1.5" />
          <line x1="94" y1="26" x2="97" y2="26" stroke="#8C7A60" strokeWidth="1.5" />
        </svg>
      );
    case 'square':
      return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="10" y="10" width="60" height="60" rx="4" fill="#F4EFE6" stroke="#463925" strokeWidth="2.5" />
          <rect x="18" y="18" width="44" height="44" rx="2" stroke="#CBB494" strokeWidth="1" strokeDasharray="3 3" />
          <rect x="28" y="28" width="24" height="24" fill="#463925" fillOpacity="0.1" />
        </svg>
      );
    case 'special':
      return (
        <svg viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Scalloped / Petal Organic Silhouette */}
          <path
            d="M20 35C15 25 25 10 45 12C65 14 75 22 70 38C65 52 50 60 35 56C20 52 25 45 20 35Z"
            fill="#F4EFE6"
            stroke="#463925"
            strokeWidth="2.5"
          />
          <path
            d="M28 35C24 28 32 18 45 19C58 20 64 26 60 37C56 46 46 51 37 48C28 45 31 41 28 35Z"
            stroke="#CBB494"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        </svg>
      );
    case 'rectangular':
    default:
      return (
        <svg viewBox="0 0 90 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="8" y="8" width="74" height="44" rx="3" fill="#F4EFE6" stroke="#463925" strokeWidth="2.5" />
          <rect x="16" y="14" width="58" height="32" rx="2" stroke="#CBB494" strokeWidth="1" strokeDasharray="3 3" />
          <rect x="26" y="20" width="38" height="20" fill="#463925" fillOpacity="0.08" />
        </svg>
      );
  }
}

export const SHAPE_DEFINITIONS: Record<RugShapeType, {label: string; sublabel: string}> = {
  rectangular: {label: 'Rectangular', sublabel: 'Standard Area'},
  square: {label: 'Square', sublabel: 'Balanced Accent'},
  runner: {label: 'Runner', sublabel: 'Hallways & Bedsides'},
  round: {label: 'Round', sublabel: 'Circular Accent'},
  oval: {label: 'Oval', sublabel: 'Organic Curves'},
  special: {label: 'Special Shape', sublabel: 'Petal & Sculpted'},
};

// Helper to determine the shape of a given size string, title, and tags with strict priority
export function detectRugShape(sizeStr = '', productTitle = '', productTags: string[] = []): RugShapeType {
  const sizeLower = sizeStr.toLowerCase().trim();
  const titleLower = productTitle.toLowerCase().trim();
  const tagsLower = productTags.join(' ').toLowerCase();

  // 1. If a size string is provided, classify directly by size dimensions and size keywords
  if (sizeLower.length > 0) {
    if (/petal|daisy|scallop|flower|organic|wavy/.test(sizeLower)) {
      return 'special';
    }
    if (/oval/.test(sizeLower)) {
      return 'oval';
    }
    if (/round|circle|ø/.test(sizeLower)) {
      return 'round';
    }
    if (/runner|hallway|bedside|corridor|passage/.test(sizeLower)) {
      return 'runner';
    }

    // Dimension ratio parsing (e.g. "40 cm x 60 cm", "70 cm x 140 cm", "70 cm x 200 cm", "70 cm x 300 cm", "120x170", "160x230")
    const dimMatch = sizeLower.match(/(\d+)\s*(?:cm|m|mm|in|ft|'|")?\s*x\s*(\d+)/i);
    if (dimMatch) {
      const w = parseInt(dimMatch[1], 10);
      const l = parseInt(dimMatch[2], 10);

      // If dimensions are equal (e.g. 80x80, 100x100, 150x150, 200x200)
      if (w === l) {
        // In rug catalogs, equal dimension accents (80x80, 150x150, 200x200) are round formats unless explicitly titled square
        if (/round|circle|ø/i.test(sizeLower) || /round|circle|souk|bengal|casa blanc|kilim/i.test(titleLower)) {
          return 'round';
        }
        return 'square';
      }

      const minDim = Math.min(w, l);
      const maxDim = Math.max(w, l);
      const ratio = maxDim / minDim;

      // Elongated hallway & corridor runners (e.g. 70x200, 70x300, 60x200, 80x250, 80x300) with ratio >= 2.4
      // Note: 80x150 and 70x140 are rectangular bedside accent formats (ratio <= 2.0)
      if (ratio >= 2.4 || /runner|hallway/i.test(sizeLower)) {
        return 'runner';
      }

      // Small accent doormats (40x60, 60x90, 60x100), bedside rugs (70x140, 80x150), and area rugs (120x170, 160x230, 200x300)
      return 'rectangular';
    }

    // Single number round diameter (e.g. "120cm round" or "ø 150cm")
    if (/round|circle|ø/.test(sizeLower) || /^\d+\s*cm$/i.test(sizeLower)) {
      return 'round';
    }

    return 'rectangular';
  }

  // 2. Only when sizeStr is empty (evaluating whole product/group titles):
  if (/petal|daisy|scallop|flower|organic|wavy/.test(titleLower) || /petal|daisy|scallop|flower|organic|wavy/.test(tagsLower)) {
    return 'special';
  }
  if (/oval/.test(titleLower) || /oval/.test(tagsLower)) {
    return 'oval';
  }
  if (/round|circle|ø|souk/.test(titleLower) || /round|circle/.test(tagsLower)) {
    return 'round';
  }
  if (/runner|hallway/.test(titleLower) || /runner|hallway/.test(tagsLower)) {
    return 'runner';
  }

  return 'rectangular';
}

// Convert centimeters to approximate feet and inches
export function cmToFeetInches(sizeStr: string): string {
  const match = sizeStr.match(/(\d+)\s*(?:cm|m|mm|in|ft|'|")?\s*x\s*(\d+)/i);
  if (match) {
    const wCm = parseInt(match[1], 10);
    const lCm = parseInt(match[2], 10);
    const wFt = Math.floor(wCm / 30.48);
    const wIn = Math.round((wCm % 30.48) / 2.54);
    const lFt = Math.floor(lCm / 30.48);
    const lIn = Math.round((lCm % 30.48) / 2.54);
    return `${wFt}'${wIn}" × ${lFt}'${lIn}"`;
  }

  const roundMatch = sizeStr.match(/(\d+)\s*cm/i);
  if (roundMatch) {
    const dCm = parseInt(roundMatch[1], 10);
    const dFt = Math.floor(dCm / 30.48);
    const dIn = Math.round((dCm % 30.48) / 2.54);
    return `ø ${dFt}'${dIn}"`;
  }

  return '';
}

export interface RugSizeOptionItem {
  name: string;
  to: string;
  selected: boolean;
  available: boolean;
  shape: RugShapeType;
  feetInches?: string;
  price?: {amount: string; currencyCode: string};
  compareAtPrice?: {amount: string; currencyCode: string} | null;
  rawVariant?: any;
}

export interface RugShapeSelectorProps {
  sizeOption?: MappedProductOptions | null;
  selectedSizeValue?: string;
  productTitle?: string;
  productTags?: string[];
  variants?: any[];
  groupProducts?: any[];
  currentProductHandle?: string;
  onSelectSize?: (to: string, name: string) => void;
  isDrawerMode?: boolean;
  sizeImageMap?: Record<string, Record<string, string>>;
  onOpenDrawer?: () => void;
}

export function RugShapeSelector({
  sizeOption,
  selectedSizeValue,
  productTitle = '',
  productTags = [],
  variants = [],
  groupProducts = [],
  currentProductHandle = '',
  onSelectSize,
  isDrawerMode = false,
  sizeImageMap,
  onOpenDrawer,
}: RugShapeSelectorProps) {
  const navigate = useNavigate();

  // 1. Process and classify all available size options from current product
  const sizeItems: RugSizeOptionItem[] = useMemo(() => {
    if (!sizeOption?.optionValues) return [];

    return sizeOption.optionValues.map((val) => {
      const shape = detectRugShape(val.name, productTitle, productTags);
      const feetInches = cmToFeetInches(val.name);

      // Find matching variant to get real pricing and stock data
      const matchedVariant = variants.find((v) => {
        const opt = v.selectedOptions?.find((o: any) => /size/i.test(o.name));
        return opt?.value === val.name;
      });

      const to = val.isDifferentProduct
        ? `/products/${val.handle}?${val.variantUriQuery}`
        : `?${val.variantUriQuery}`;

      return {
        name: val.name,
        to,
        selected: selectedSizeValue === val.name || val.selected,
        available: val.available ?? true,
        shape,
        feetInches,
        price: matchedVariant?.price,
        compareAtPrice: matchedVariant?.compareAtPrice,
        rawVariant: matchedVariant,
      };
    });
  }, [sizeOption, selectedSizeValue, productTitle, productTags, variants]);

  // 2. Discover shapes across current product AND linked group products (e.g. Casa Blanc, Bohemian, Bengal)
  const availableShapes = useMemo(() => {
    const shapes = new Set<RugShapeType>();
    
    // Add shapes from current variants
    sizeItems.forEach((item) => shapes.add(item.shape));

    // Also check linked group products if present (e.g. linked Round/Oval/Rectangle handles in Casa Blanc & Bohemian & Bengal)
    if (Array.isArray(groupProducts) && groupProducts.length > 0) {
      groupProducts.forEach((gp) => {
        if (!gp?.title) return;
        const gpShape = detectRugShape('', gp.title, gp.tags || []);
        shapes.add(gpShape);
      });
    }

    // Default to standard shapes if none detected
    if (shapes.size === 0) shapes.add('rectangular');

    // Sort order for premium UX: Rectangular -> Round -> Oval -> Runner -> Square -> Special
    const order: RugShapeType[] = ['rectangular', 'round', 'oval', 'runner', 'square', 'special'];
    return order.filter((s) => shapes.has(s));
  }, [sizeItems, groupProducts]);

  // 3. Active selected shape (default to the shape of the currently selected size)
  const currentSelectedShape = useMemo(() => {
    const selectedItem = sizeItems.find((i) => i.selected);
    return selectedItem?.shape || availableShapes[0] || 'rectangular';
  }, [sizeItems, availableShapes]);

  const [activeShape, setActiveShape] = useState<RugShapeType>(currentSelectedShape);

  // Sync active shape if variant changes externally
  React.useEffect(() => {
    if (currentSelectedShape && availableShapes.includes(currentSelectedShape)) {
      setActiveShape(currentSelectedShape);
    }
  }, [currentSelectedShape, availableShapes]);

  // 4. Filter sizes belonging to the active shape
  const filteredSizes = useMemo(() => {
    const forShape = sizeItems.filter((i) => i.shape === activeShape);
    return forShape.length > 0 ? forShape : sizeItems;
  }, [sizeItems, activeShape]);

  // Selected item details for live card preview
  const activeSelectedItem = sizeItems.find((i) => i.selected) || filteredSizes[0];

  const handleSizeClick = (item: RugSizeOptionItem) => {
    if (!item.available) return;
    if (onSelectSize) {
      onSelectSize(item.to, item.name);
    } else {
      navigate(item.to, {preventScrollReset: true, replace: true});
    }
  };

  return (
    <div className={clsx("w-full font-sans", isDrawerMode ? "space-y-4" : "space-y-6")}>
      {/* ── Section 1: Choose Form / Shape Selector (Only on PDP page if multiple shapes exist) ── */}
      {!isDrawerMode && availableShapes.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold tracking-wider uppercase text-[#463925] flex items-center gap-2">
              <span>Choose Shape / Form</span>
              <span className="text-xs font-normal text-stone-500 lowercase">
                ({availableShapes.length} shapes)
              </span>
            </label>
            <span className="text-xs font-medium text-[#8C7A60] bg-[#F7F4EE] px-2.5 py-0.5 rounded-full">
              Active: {SHAPE_DEFINITIONS[activeShape]?.label}
            </span>
          </div>

          {/* Shape Cards Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {availableShapes.map((shape) => {
              const isActive = activeShape === shape;
              const def = SHAPE_DEFINITIONS[shape];
              const matchingSizes = sizeItems.filter((s) => s.shape === shape);
              const shapeCount = matchingSizes.length;

              // Find linked group product if shape is hosted on another handle
              const linkedGroupProduct =
                shapeCount === 0 && Array.isArray(groupProducts)
                  ? groupProducts.find((gp) => detectRugShape('', gp.title, gp.tags || []) === shape)
                  : undefined;

              return (
                <button
                  key={shape}
                  type="button"
                  onClick={() => {
                    if (shapeCount > 0) {
                      setActiveShape(shape);
                      const firstMatchingSize = matchingSizes.find((s) => s.available) || matchingSizes[0];
                      if (firstMatchingSize && firstMatchingSize.name !== selectedSizeValue) {
                        handleSizeClick(firstMatchingSize);
                      }
                    } else if (linkedGroupProduct?.handle) {
                      const targetUrl = `/products/${linkedGroupProduct.handle}`;
                      if (onSelectSize) {
                        onSelectSize(targetUrl, '');
                      } else {
                        navigate(targetUrl, {preventScrollReset: true, replace: true});
                      }
                    } else {
                      setActiveShape(shape);
                    }
                  }}
                  className={clsx(
                    'group relative flex flex-col items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 text-center bg-white cursor-pointer',
                    isActive
                      ? 'border-[#463925] bg-[#FDFBF7] shadow-sm ring-1 ring-[#463925]'
                      : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50/50',
                  )}
                  aria-pressed={isActive}
                >
                  {/* Visual SVG Silhouette */}
                  <div className="h-10 flex items-center justify-center mb-1.5 transition-transform duration-200 group-hover:scale-105">
                    <ShapeIcon shape={shape} className="w-12 h-9 object-contain" />
                  </div>

                  {/* Label */}
                  <span
                    className={clsx(
                      'text-xs font-medium leading-tight',
                      isActive ? 'text-[#463925] font-semibold' : 'text-stone-700',
                    )}
                  >
                    {def?.label || shape}
                  </span>

                  {/* Sizes available in this shape */}
                  <span className="text-[10px] text-stone-400 mt-0.5">
                    {shapeCount > 0 ? `${shapeCount} ${shapeCount === 1 ? 'size' : 'sizes'}` : 'View Edition'}
                  </span>

                  {/* Active Checkmark Badge */}
                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#463925] rounded-full flex items-center justify-center text-white">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Section 2: Choose a Size ── */}
      <div>
        {!isDrawerMode && (
          <div className="flex items-center justify-between mb-3">
            <label className="text-xl font-serif text-[#2C2416]">
              <span>Choose a size</span>
            </label>
            <Link
              to="/pages/rug-size"
              target="_blank"
              className="text-sm font-medium text-[#B39A77] hover:text-[#463925] underline underline-offset-4 decoration-[#B39A77]/60 transition-colors"
            >
              Size Guide
            </Link>
          </div>
        )}

        {filteredSizes.length === 0 ? (
          <div className="p-6 border border-dashed border-stone-300 rounded-lg text-center bg-stone-50/80">
            <p className="text-sm text-stone-600 font-medium">
              Looking for {SHAPE_DEFINITIONS[activeShape]?.label} rugs in this collection?
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Select another shape above or explore our bespoke custom sizing service.
            </p>
          </div>
        ) : isDrawerMode ? (
          /* ── DRAWER MODE: 2-column room illustration grid matching live site ── */
          <div className="grid grid-cols-2 gap-4 pb-2">
            {filteredSizes.map((item) => {
              const isSelected = item.name === selectedSizeValue || item.selected;
              const thumbUrl = sizeImageMap?.['Size']?.[item.name] || sizeImageMap?.['Sizes']?.[item.name];

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSizeClick(item)}
                  disabled={!item.available}
                  className={clsx(
                    'group relative flex flex-col items-center p-3 rounded-none bg-white transition-all duration-150 text-center cursor-pointer',
                    isSelected
                      ? 'ring-2 ring-[#463925] ring-offset-2'
                      : item.available
                      ? 'border border-stone-200 hover:border-stone-400'
                      : 'border border-stone-100 opacity-40 cursor-not-allowed',
                  )}
                  aria-pressed={isSelected}
                >
                  {/* Room illustration thumbnail with live double-border frame */}
                  <div
                    className={clsx(
                      'w-full aspect-square flex items-center justify-center p-2 transition-all bg-[#FAFAF8]',
                      isSelected
                        ? 'border-2 border-[#463925]'
                        : 'border border-[#CBD5E1]',
                    )}
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={`${item.name} room layout`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <ShapeIcon shape={item.shape} className="w-16 h-16 opacity-40" />
                    )}
                  </div>

                    {/* Size label & Price */}
                    <div className="mt-2.5 flex flex-col items-center">
                      <span
                        className={clsx(
                          'text-sm font-medium transition-colors text-black',
                          isSelected && 'font-semibold',
                        )}
                      >
                        {item.name}
                      </span>
                      {item.price && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-semibold text-black">
                            <Money withoutTrailingZeros data={item.price} />
                          </span>
                          {item.compareAtPrice &&
                            parseFloat(item.compareAtPrice.amount) > parseFloat(item.price.amount) && (
                              <span className="text-[11px] text-stone-400 line-through">
                                <Money withoutTrailingZeros data={item.compareAtPrice} />
                              </span>
                            )}
                        </div>
                      )}
                    </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* ── INLINE MODE: Live site collapsed trigger bar ── */
          <div>
            <button
              type="button"
              onClick={() => onOpenDrawer?.()}
              className="w-full flex items-center justify-between p-3 border border-stone-300 rounded-none bg-white hover:border-stone-500 transition-all duration-150 text-left group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Room illustration thumbnail */}
                {(() => {
                  const thumbUrl = activeSelectedItem?.name
                    ? (sizeImageMap?.['Size']?.[activeSelectedItem.name] || sizeImageMap?.['Sizes']?.[activeSelectedItem.name])
                    : undefined;
                  return (
                    <div className="w-14 h-14 border border-stone-300 p-1 flex items-center justify-center bg-white flex-shrink-0">
                      {thumbUrl ? (
                        <img src={thumbUrl} alt={`${activeSelectedItem?.name} layout`} className="w-full h-full object-contain" />
                      ) : (
                        <ShapeIcon shape={activeShape} className="w-8 h-8 opacity-40" />
                      )}
                    </div>
                  );
                })()}

                {/* Selected size label & price */}
                <div className="flex flex-col text-left">
                  <span className="text-base font-normal text-[#2C2416]">
                    {activeSelectedItem?.name || 'Select a size'}
                  </span>
                  {activeSelectedItem?.price && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-[#463925]">
                        <Money withoutTrailingZeros data={activeSelectedItem.price} />
                      </span>
                      {activeSelectedItem?.compareAtPrice &&
                        parseFloat(activeSelectedItem.compareAtPrice.amount) >
                          parseFloat(activeSelectedItem.price.amount) && (
                          <span className="text-[11px] text-stone-400 line-through">
                            <Money withoutTrailingZeros data={activeSelectedItem.compareAtPrice} />
                          </span>
                        )}
                    </div>
                  )}
                </div>
              </div>

              {/* Chevron icon */}
              <div className="pr-1 text-stone-400 group-hover:text-stone-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ── Section 3: Delivery & Trust Badges Block ── */}
      {!isDrawerMode && (
        <div className="space-y-4 pt-1">
          {/* Delivery banner */}
          <div className="rounded bg-stone-100 p-3.5">
            <div className="flex items-center gap-3">
              <span className="text-[#463925]" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7h11v10H3V7Zm11 3h4l3 3v4h-7v-7Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm12 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                  />
                </svg>
              </span>
              <div className="text-sm font-semibold font-sans text-[#463925]">
                Delivery in 5-6 days
              </div>
            </div>
          </div>

          {/* 4 Trust Badges Grid */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            {/* Secure Checkout */}
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-[#463925]" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 12 2 2 4-5"
                  />
                </svg>
              </span>
              <div className="grid gap-0.5">
                <div className="text-sm font-semibold font-sans text-[#463925]">
                  Secure Checkout
                </div>
                <div className="text-xs font-sans text-[#836E4C]">SSL encrypted payment</div>
              </div>
            </div>

            {/* Easy Returns */}
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-[#463925]" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 12a8 8 0 1 1-2.34-5.66"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 4v6h-6" />
                </svg>
              </span>
              <div className="grid gap-0.5">
                <div className="text-sm font-semibold font-sans text-[#463925]">Easy Returns</div>
                <div className="text-xs font-sans text-[#836E4C]">14-day no-fuss policy</div>
              </div>
            </div>

            {/* Price Match */}
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-[#463925]" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 13a7 7 0 0 1-7 7H6a2 2 0 0 1-2-2v-7"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 10V7a5 5 0 0 1 10 0v3"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v3" />
                </svg>
              </span>
              <div className="grid gap-0.5">
                <div className="text-sm font-semibold font-sans text-[#463925]">Price Match</div>
                <div className="text-xs font-sans text-[#836E4C]">Found it cheaper? We'll match</div>
              </div>
            </div>

            {/* Handmade Quality */}
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-[#463925]" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21s-7-4.44-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.56-7 10-7 10Z"
                  />
                </svg>
              </span>
              <div className="grid gap-0.5">
                <div className="text-sm font-semibold font-sans text-[#463925]">Handmade Quality</div>
                <div className="text-xs font-sans text-[#836E4C]">Artisan crafted, not factory made</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
