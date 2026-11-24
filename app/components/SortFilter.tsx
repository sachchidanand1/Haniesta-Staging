import type {SyntheticEvent} from 'react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Disclosure} from '@headlessui/react';
import type {Location} from '@remix-run/react';
import {
  Link,
  useLocation,
  useSearchParams,
  useNavigate,
} from '@remix-run/react';
import useDebounce from 'react-use/esm/useDebounce';
import type {
  Filter,
  ProductFilter,
} from '@shopify/hydrogen/storefront-api-types';

import {Heading, Text} from '~/components/Text';
import {IconCaret, IconXMark} from '~/components/Icon';
import {useRouteLoaderData} from '@remix-run/react';
import type {RootLoader} from '~/root';
import {DEFAULT_LOCALE} from '~/lib/utils';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CAD: '$',
  AUD: '$',
  NZD: '$',
  SGD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  IDR: 'Rp',
  KRW: '₩',
  VND: '₫',
  THB: '฿',
};

const COLOR_MAP: Record<string, string> = {
  black: '#1A1A1A',
  charcoal: '#434343',
  grey: '#8E8E93',
  gray: '#8E8E93',
  white: '#FFFFFF',
  beige: '#E8DFD1',
  cream: '#FFFEE0',
  brown: '#6E473B',
  rust: '#B5704F',
  green: '#4E6151',
  blue: '#3F5D7D',
  silver: '#C0C0C0',
  gold: '#D4AF37',
  sand: '#D2B48C',
  multi: 'linear-gradient(45deg, #B5704F, #EAD8BB, #4E6151)',
};

export type AppliedFilter = {
  label: string;
  filter: ProductFilter;
};

export type SortParam =
  | 'price-low-high'
  | 'price-high-low'
  | 'best-selling'
  | 'newest'
  | 'featured';

type Props = {
  filters: Filter[];
  appliedFilters?: AppliedFilter[];
  children: React.ReactNode;
  collections?: Array<{handle: string; title: string}>;
  resultsCount?: number;
  colorSwatches?: any;
};
export const FILTER_URL_PREFIX = 'filter.';

export function SortFilter({
  filters,
  appliedFilters = [],
  children,
  collections = [],
  resultsCount,
  colorSwatches,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);
  const [params] = useSearchParams();
  const location = useLocation();
  const filterBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isSortOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortOpen]);

  const activeSortKey = (params.get('sort') as SortParam | null) || 'featured';
  const sortItems: {label: string; key: SortParam}[] = [
    {label: 'Best Selling', key: 'best-selling'},
    {label: 'Newest', key: 'newest'},
    {label: 'Price: Low to High', key: 'price-low-high'},
    {label: 'Price: High to Low', key: 'price-high-low'},
    {label: 'Featured', key: 'featured'},
  ];
  const activeSortLabel = sortItems.find(item => item.key === activeSortKey)?.label || 'Featured';

  useEffect(() => {
    // Debug incoming filters from Shopify
    // eslint-disable-next-line no-console
    //  console.log('SortFilter filters debug', JSON.stringify(filters));
  }, [filters]);

  const availabilityFilter = filters.find((filter) => {
    const label = filter.label?.toLowerCase() || '';
    const id = filter.id?.toLowerCase?.() || '';
    return (
      label.includes('availability') ||
      id.includes('filter.v.availability') ||
      id.includes('availability')
    );
  });

  const sizeFilters = filters.filter((filter) => {
    const label = filter.label?.toLowerCase() || '';
    const id = filter.id?.toLowerCase?.() || '';
    return (
      label.includes('size') ||
      id.includes('filter.v.option.size') ||
      id.includes('size')
    );
  });

  const colorFilters = filters.filter((filter) => {
    const label = filter.label?.toLowerCase() || '';
    const id = filter.id?.toLowerCase?.() || '';
    return (
      label.includes('color') ||
      label.includes('colour') ||
      id.includes('filter.v.option.color') ||
      id.includes('color') ||
      id.includes('colour')
    );
  });
  const priceRangeFilter = filters.find(
    (filter) => filter.type === 'PRICE_RANGE',
  );

  let priceMin: number | undefined;
  let priceMax: number | undefined;
  const priceFilterParam = params.get(`${FILTER_URL_PREFIX}price`);
  if (priceFilterParam) {
    try {
      const price = JSON.parse(priceFilterParam) as ProductFilter['price'];
      const parsedMin = Number(price?.min);
      const parsedMax = Number(price?.max);
      priceMin = Number.isNaN(parsedMin) ? undefined : parsedMin;
      priceMax = Number.isNaN(parsedMax) ? undefined : parsedMax;
    } catch {
      priceMin = undefined;
      priceMax = undefined;
    }
  }

  const hasAnyFiltersApplied = appliedFilters.length > 0;
  const hasAnyFilterParamsApplied =
    Array.from(params.keys()).some((k) => k.startsWith(FILTER_URL_PREFIX)) ||
    hasAnyFiltersApplied;

  const appliedFilterChips = useMemo(() => {
    const chips = [...appliedFilters];

    if (priceFilterParam && !chips.some((c) => 'price' in c.filter)) {
      let currencyCode: string | undefined;
      try {
        const price = JSON.parse(priceFilterParam) as any;
        currencyCode = price?.currencyCode;
      } catch {
        currencyCode = undefined;
      }
      const currencySymbol =
        (currencyCode && CURRENCY_SYMBOLS[currencyCode]) ||
        (currencyCode ? currencyCode : '');

      const formatPricePart = (value: number | undefined) =>
        typeof value === 'number' && Number.isFinite(value)
          ? String(value)
          : undefined;

      const formattedMin = formatPricePart(priceMin);
      const formattedMax = formatPricePart(priceMax);

      const rangeLabel =
        formattedMin && formattedMax
          ? `${currencySymbol}${formattedMin} - ${currencySymbol}${formattedMax}`
          : formattedMin
            ? `${currencySymbol}${formattedMin}+`
            : formattedMax
              ? `Up to ${currencySymbol}${formattedMax}`
              : null;

      if (rangeLabel) {
        chips.push({
          label: `Price: ${rangeLabel}`,
          filter: {
            price: {
              ...(typeof priceMin === 'number' ? {min: priceMin} : {}),
              ...(typeof priceMax === 'number' ? {max: priceMax} : {}),
              ...(currencyCode ? {currencyCode} : {}),
            } as any,
          },
        });
      }
    }

    return chips;
  }, [appliedFilters, priceFilterParam, priceMin, priceMax]);

  const hasActiveAvailability =
    !!availabilityFilter &&
    !!availabilityFilter.values?.some((option) =>
      isFilterOptionActive(option.input as string, params),
    );

  useEffect(() => {
    if (!activeFilterId) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!filterBarRef.current) return;
      if (!filterBarRef.current.contains(event.target as Node)) {
        setActiveFilterId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeFilterId]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (activeFilterId) {
      document.body.dataset.filterOpen = 'true';
    } else {
      delete document.body.dataset.filterOpen;
    }
  }, [activeFilterId]);
  return (
    <>
      {/* Mobile modal when filters are open */}
      {isOpen && (
        <div className="fixed inset-0 z-[1050] md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full h-full bg-white overflow-hidden flex flex-col md:mx-auto md:my-6 md:max-h-[90vh] md:max-w-2xl md:rounded-lg md:shadow-lg">
            <header className="flex items-center justify-between px-6 py-4 border-b pt-8 md:pt-4">
              <div className="flex items-center gap-3">
                {/* Simplified header title from 'Filter and sorting' to 'Filters' */}
                <h3 className="text-lg font-semibold text-[#463925]">Filters</h3>
              </div>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 text-stone-500 hover:text-stone-700"
              >
                <IconXMark className="w-5 h-5" />
              </button>
            </header>

            <div className="overflow-auto p-4">
              {/* 
                NOTE: The duplicate mobile 'Sort by' list originally rendered here has been
                removed to avoid duplication, as the sort select dropdown is already fully functional
                on the control bar at the top of the collection lists.
              */}
              <FiltersDrawer filters={filters} appliedFilters={appliedFilters} colorSwatches={colorSwatches} close={() => setIsOpen(false)} />
            </div>

            <footer className="p-6 border-t pb-8 md:pb-6">
              <div className="flex flex-col gap-3">
                <Link
                  preventScrollReset
                  to={getClearAllLink(new URLSearchParams(params), location)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-full text-center text-sm font-semibold text-[#463925] bg-white"
                  onClick={() => setIsOpen(false)}
                >
                  Reset
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-3 bg-[#1F1F1F] text-white rounded-full text-sm font-semibold"
                >
                  {resultsCount ? `${resultsCount} products found` : 'Show results'}
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
      {/* Refined control bar */}
      <div className="w-full mb-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          
          {/* Filters Toggle Button */}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className={`flex items-center gap-2 px-5 py-2.5 bg-white border transition-all duration-300 rounded-md text-sm font-medium tracking-wide uppercase ${
              isOpen ? 'border-[#463925] text-[#463925] bg-stone-50' : 'border-stone-200 text-[#463925] hover:bg-stone-50'
            }`}
          >
            <svg
              className="w-4 h-4 text-[#463925]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
              />
            </svg>
            <span>Filters</span>
            {appliedFilterChips.length > 0 && (
              /*
                Renders a circular count badge showing the number of active filters.
                Background styled in dark chocolate brown bg-[#463925] to match the core brand system.
              */
              <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-[#463925] text-white rounded-full">
                {appliedFilterChips.length}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen((open) => !open)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 text-[#463925] hover:bg-stone-50 transition-colors rounded-md text-sm font-medium tracking-wide"
            >
              <span>Sort by: <span className="font-semibold">{activeSortLabel}</span></span>
              <svg
                className={`w-4 h-4 text-[#836E4C] transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {isSortOpen && (
              <div className="absolute right-0 z-50 mt-1.5 w-52 bg-white border border-stone-200 rounded-md shadow-lg py-1 animate-fadeIn">
                {sortItems.map((item) => {
                  const isActive = item.key === activeSortKey;
                  return (
                    <Link
                      key={item.key}
                      preventScrollReset
                      to={getSortLink(item.key, new URLSearchParams(params), location)}
                      onClick={() => setIsSortOpen(false)}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm text-left font-sans ${
                        isActive
                          ? 'bg-[#FBF8F3] text-[#463925] font-semibold'
                          : 'text-[#836E4C] hover:bg-stone-50 hover:text-[#463925]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <svg className="w-4 h-4 text-[#B5704F]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Applied Filter Pills */}
        {(appliedFilterChips.length > 0 || hasAnyFilterParamsApplied) && (
          <div className="mt-4 space-y-3">
            <div className="text-sm font-medium text-[#6F6356]">
              {hasAnyFilterParamsApplied
                ? `Showing ${typeof resultsCount === 'number' ? resultsCount : 0} results for selected filters`
                : `Showing ${typeof resultsCount === 'number' ? resultsCount : 0} results`}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8A7259]">
                Refine
              </span>
              {/* Active filter pills allowing users to see and dismiss applied filters */}
              {appliedFilterChips.map((filter) => (
                <Link
                  key={`${filter.label}-${JSON.stringify(filter.filter)}`}
                  prefetch="intent"
                  preventScrollReset
                  to={getAppliedFilterLink(filter, new URLSearchParams(params), location)}
                  /* Hover border/dismiss text colors aligned with the dark chocolate branding color (#463925) */
                  className="inline-flex items-center gap-2 bg-[#FBF8F3] border border-[#E8E1D6] hover:border-[#463925] text-[#463925] px-3.5 py-1.5 rounded-full text-xs font-sans transition-colors animate-fadeIn"
                >
                  <span>{filter.label}</span>
                  <span className="text-stone-400 hover:text-[#463925] font-bold text-sm">×</span>
                </Link>
              ))}
              {/* Clear all link displayed only when filters are active */}
              {hasAnyFilterParamsApplied && (
                <Link
                  prefetch="intent"
                  preventScrollReset
                  to={getClearAllLink(new URLSearchParams(params), location)}
                  /* Link color set to dark chocolate (#463925) with a softer hover state (#6F5D44) */
                  className="ml-2 text-[#463925] hover:text-[#6F5D44] text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Clear all
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div
          className={`transition-all duration-300 ease-in-out ${
            isOpen
              ? 'opacity-100 min-w-full md:min-w-[260px] md:w-[260px] md:pr-4 mb-8 md:mb-0 max-h-full'
              : 'opacity-0 md:min-w-[0px] md:w-[0px] pr-0 max-h-0 md:max-h-0 pointer-events-none hidden md:block overflow-hidden'
          }`}
        >
          <FiltersDrawer filters={filters} appliedFilters={appliedFilters} colorSwatches={colorSwatches} />
        </div>
        <div className="flex-grow">{children}</div>
      </div>
    </>
  );
}

function normalizeColorKey(str?: string) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function getSwatchStyle(label: string, colorSwatches?: any) {
  const key = label.toLowerCase().trim();

  // 1. Check in hardcoded map first
  if (COLOR_MAP[key]) {
    return { bg: COLOR_MAP[key], isLight: key === 'white' || key === 'cream' || key === 'beige' };
  }

  // Support for split/slashed colors like Nature/White
  const getSingleColorStyle = (colorName: string): string => {
    const sKey = colorName.toLowerCase().trim();
    if (COLOR_MAP[sKey]) return COLOR_MAP[sKey];

    if (colorSwatches?.nodes) {
      const normalizedKey = normalizeColorKey(colorName);
      const foundNode = colorSwatches.nodes.find((node: any) => {
        const labelField = node?.fields?.find(
          (f: any) => f.key === 'label' || f.key === 'name' || f.key === 'title'
        );
        const metaLabel = labelField?.value || node?.handle || '';
        const nodeHandleNormalized = normalizeColorKey(node?.handle);
        const nodeLabelNormalized = normalizeColorKey(metaLabel);
        
        return (
          nodeHandleNormalized === normalizedKey ||
          nodeLabelNormalized === normalizedKey ||
          nodeHandleNormalized.includes(normalizedKey) ||
          normalizedKey.includes(nodeHandleNormalized)
        );
      });

      if (foundNode) {
        const colorField = foundNode.fields?.find((f: any) => f.key === 'color');
        const imageField = foundNode.fields?.find((f: any) => f.key === 'image' || f.key === 'swatch_image');
        
        const swatchUrl = imageField?.reference?.image?.url;
        const swatchColor = colorField?.value;

        if (swatchUrl) {
          return `url("${swatchUrl}") center/cover no-repeat`;
        }
        if (swatchColor) {
          return swatchColor;
        }
      }
    }

    const fallbackColors: Record<string, string> = {
      'velour red': '#b80f0a',
      'rich crimson': '#dc143c',
      'fiery scarlet': '#dc143c',
      'burnt gold': '#b27a04',
      'burt gold': '#b27a04',
      'honey ochre': '#c7973b',
      'sunset orange': '#ff5f1f',
      'teal blue': '#005BD3',
      'misty aqua': '#a2cbd1',
      'sapphire blue': '#005BD3',
      'saphire blue': '#005BD3',
      'graphite grey': '#383e42',
      'deep purple': '#4b0082',
      'fresh green': '#4e6151',
      'forest green': '#1e352f',
      'ivory white': '#fffff0',
      'anthracite': '#383e42',
      'vibrant multi': 'linear-gradient(45deg, #B5704F, #EAD8BB, #4E6151)',
      'orbit jute': '#bf9b70',
      'nature': '#d4d8d5',
      'white': '#ffffff',
      'black': '#000000',
      'grey': '#8e8e93',
      'gray': '#8e8e93',
      'beige': '#ead8ab',
      'almond beige': '#ead8ab',
      'pebble beige': '#ead8ab',
      'sand beige': '#ead8ab',
      'stone grey': '#808080',
      'frost grey': '#808080',
      'sage mint': '#9dc183',
      'moss olive': '#808000',
      'ivory cream': '#fffff0',
      'cream': '#fffee0',
    };

    for (const [fbKey, fbVal] of Object.entries(fallbackColors)) {
      if (sKey.includes(fbKey) || fbKey.includes(sKey)) {
        return fbVal;
      }
    }

    return sKey; // default CSS color
  };

  const isLight = 
    key.includes('white') ||
    key.includes('cream') ||
    key.includes('beige') ||
    key.includes('sand') ||
    key.includes('nature') ||
    key.includes('ivory');

  if (label.includes('/')) {
    const parts = label.split('/').map(p => p.trim());
    if (parts.length === 2) {
      const colorA = getSingleColorStyle(parts[0]);
      const colorB = getSingleColorStyle(parts[1]);
      
      const bg1 = colorA.startsWith('url') ? '#d4d8d5' : colorA;
      const bg2 = colorB.startsWith('url') ? '#ffffff' : colorB;
      
      return {
        bg: `linear-gradient(90deg, ${bg1} 50%, ${bg2} 50%)`,
        isLight
      };
    }
  }

  return {
    bg: getSingleColorStyle(label),
    isLight
  };
}

export function FiltersDrawer({
  filters = [],
  appliedFilters = [],
  colorSwatches,
  close,
}: Omit<Props, 'children'> & {close?: () => void}) {
  const [params] = useSearchParams();
  const location = useLocation();

  return (
    <>
      <nav className="py-2">
        <Heading as="h4" size="lead" className="pb-4 font-sans text-[#463925] font-semibold tracking-wide uppercase text-sm">
          Filter By
        </Heading>
        <div className="divide-y border-t border-b border-stone-200">
          {filters.map((filter: Filter) => {
            const labelLower = filter.label?.toLowerCase() || '';
            const isSizeCategory = labelLower.includes('size');
            const isColorCategory = labelLower.includes('color') || labelLower.includes('colour');

            return (
              <Disclosure as="div" key={filter.id} className="w-full py-2">
                {({open}) => (
                  <>
                    <Disclosure.Button className="flex justify-between w-full py-3 text-left">
                      <span className="font-sans text-sm font-semibold text-[#463925] tracking-wide uppercase">{filter.label}</span>
                      <IconCaret className="text-[#836E4C]" direction={open ? 'up' : 'down'} />
                    </Disclosure.Button>
                    <Disclosure.Panel key={filter.id} className="pb-4">
                      {filter.type === 'PRICE_RANGE' ? (
                        <div className="py-2 px-1">
                          <PriceRangeFilter
                            filters={filters}
                            onClose={close}
                            min={
                              (() => {
                                const priceFilter = params.get(`${FILTER_URL_PREFIX}price`);
                                const price = priceFilter ? (JSON.parse(priceFilter) as any) : null;
                                return isNaN(Number(price?.min)) ? undefined : Number(price?.min);
                              })()
                            }
                            max={
                              (() => {
                                const priceFilter = params.get(`${FILTER_URL_PREFIX}price`);
                                const price = priceFilter ? (JSON.parse(priceFilter) as any) : null;
                                return isNaN(Number(price?.max)) ? undefined : Number(price?.max);
                              })()
                            }
                          />
                        </div>
                      ) : isSizeCategory ? (
                        <div className="flex flex-wrap gap-2 py-2">
                          {filter.values?.map((option) => {
                            const isActive = isFilterOptionActive(option.input as string, params);
                            const to = getFilterLink(option.input as string, params, location);
                            return (
                              <Link
                                key={option.id}
                                prefetch="intent"
                                preventScrollReset
                                to={to}
                                onClick={() => close?.()}
                                className={`px-4 py-2 border rounded-md text-xs font-semibold font-sans tracking-wider uppercase transition-all duration-200 ${
                                  isActive
                                    ? 'bg-[#463925] border-[#463925] text-white shadow-sm'
                                    : 'bg-white border-stone-200 text-[#463925] hover:border-[#463925] hover:bg-stone-50'
                                }`}
                              >
                                {option.label}
                              </Link>
                            );
                          })}
                        </div>
                      ) : isColorCategory ? (
                        <ul key={filter.id} className="py-1 space-y-2">
                          {filter.values?.map((option) => {
                            const isActive = isFilterOptionActive(option.input as string, params);
                            const to = getFilterLink(option.input as string, params, location);
                            
                            const swatchStyle = getSwatchStyle(option.label, colorSwatches);
                            const isLightColor = swatchStyle.isLight;

                            return (
                              <li key={option.id}>
                                <Link
                                  prefetch="intent"
                                  preventScrollReset
                                  to={to}
                                  onClick={() => close?.()}
                                  className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-50 group transition-all ${
                                    isActive ? 'bg-[#FBF8F3] border border-[#E8E1D6]' : ''
                                  }`}
                                >
                                  <span
                                    className={`w-6 h-6 rounded-full border border-stone-200 shadow-sm transition-all duration-200 flex items-center justify-center ${
                                      isActive ? 'ring-2 ring-offset-2 ring-[#B5704F] border-transparent scale-105' : 'group-hover:scale-105'
                                    }`}
                                    style={{
                                      background: swatchStyle.bg,
                                      boxShadow: isLightColor ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : undefined
                                    }}
                                  >
                                    {isActive && (
                                      <svg
                                        className={`w-3.5 h-3.5 ${isLightColor ? 'text-stone-800' : 'text-white'}`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3.5"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="m4.5 12.75 6 6 9-13.5"
                                        />
                                      </svg>
                                    )}
                                  </span>
                                  <span className={`font-sans text-sm tracking-wide ${isActive ? 'font-semibold text-[#463925]' : 'text-[#836E4C] group-hover:text-[#463925]'}`}>
                                    {option.label}
                                  </span>
                                  {typeof option.count === 'number' && (
                                    <span className="text-xs text-stone-400 font-sans ml-auto">({option.count})</span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <ul key={filter.id} className="py-1 space-y-2">
                          {filter.values?.map((option) => {
                            const isActive = isFilterOptionActive(option.input as string, params);
                            const to = getFilterLink(option.input as string, params, location);
                            return (
                              <li key={option.id}>
                                <Link
                                  prefetch="intent"
                                  preventScrollReset
                                  to={to}
                                  onClick={() => close?.()}
                                  className="flex items-center gap-3 py-1.5 group transition-colors"
                                >
                                  <span
                                    className={`w-4.5 h-4.5 border rounded flex items-center justify-center transition-all duration-200 ${
                                      isActive
                                        ? 'bg-[#B5704F] border-[#B5704F] text-white shadow-sm'
                                        : 'border-stone-300 bg-white group-hover:border-[#B5704F]'
                                    }`}
                                  >
                                    {isActive && (
                                      <svg
                                        className="w-2.5 h-2.5 text-white"
                                        viewBox="0 0 12 10"
                                        aria-hidden="true"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                      >
                                        <path
                                          d="M1 5L4 8L11 1"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    )}
                                  </span>
                                  <span className={`font-sans text-sm tracking-wide ${isActive ? 'font-semibold text-[#463925]' : 'text-[#836E4C] group-hover:text-[#463925]'}`}>
                                    {option.label}
                                  </span>
                                  {typeof option.count === 'number' && (
                                    <span className="text-xs text-stone-400 font-sans ml-auto">({option.count})</span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function AppliedFilters({filters = []}: {filters: AppliedFilter[]}) {
  const [params] = useSearchParams();
  const location = useLocation();
  return (
    <>
      <Heading as="h4" size="lead" className="pb-4">
        Applied filters
      </Heading>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter: AppliedFilter) => {
          return (
            <Link
              to={getAppliedFilterLink(filter, params, location)}
              className="flex px-2 border rounded-full gap"
              key={`${filter.label}-${JSON.stringify(filter.filter)}`}
            >
              <span className="flex-grow">{filter.label}</span>
              <span>
                <IconXMark />
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function getAppliedFilterLink(
  filter: AppliedFilter,
  params: URLSearchParams,
  location: Location,
) {
  const paramsClone = new URLSearchParams(params);
  // Drop navigation-origin params
  paramsClone.delete('from');
  paramsClone.delete('mo');
  Object.entries(filter.filter).forEach(([key, value]) => {
    const fullKey = FILTER_URL_PREFIX + key;
    paramsClone.delete(fullKey, JSON.stringify(value));
  });
  paramsClone.delete('cursor');
  paramsClone.delete('direction');
  return `${location.pathname}?${paramsClone.toString()}`;
}

function getSortLink(
  sort: SortParam,
  params: URLSearchParams,
  location: Location,
) {
  params.set('sort', sort);
  params.delete('cursor');
  params.delete('direction');
  // Drop navigation-origin params
  params.delete('from');
  params.delete('mo');
  return `${location.pathname}?${params.toString()}`;
}

function getFilterLink(
  rawInput: string | ProductFilter,
  params: URLSearchParams,
  location: ReturnType<typeof useLocation>,
) {
  const paramsClone = new URLSearchParams(params);
  const newParams = filterInputToParams(rawInput, paramsClone);
  // Drop navigation-origin params
  newParams.delete('from');
  newParams.delete('mo');
  newParams.delete('cursor');
  newParams.delete('direction');
  return `${location.pathname}?${newParams.toString()}`;
}

function isFilterOptionActive(
  rawInput: string | ProductFilter,
  params: URLSearchParams,
) {
  const input =
    typeof rawInput === 'string'
      ? (JSON.parse(rawInput) as ProductFilter)
      : rawInput;

  return Object.entries(input).every(([key, value]) => {
    const fullKey = `${FILTER_URL_PREFIX}${key}`;
    const stringValue = JSON.stringify(value);
    return params.getAll(fullKey).includes(stringValue);
  });
}

function getToggledFilterLink(
  rawInput: string | ProductFilter,
  params: URLSearchParams,
  location: ReturnType<typeof useLocation>,
) {
  const paramsClone = new URLSearchParams(params);
  const input =
    typeof rawInput === 'string'
      ? (JSON.parse(rawInput) as ProductFilter)
      : rawInput;

  const entries = Object.entries(input);

  const isActive = entries.every(([key, value]) => {
    const fullKey = `${FILTER_URL_PREFIX}${key}`;
    const stringValue = JSON.stringify(value);
    return paramsClone.getAll(fullKey).includes(stringValue);
  });

  if (isActive) {
    // Remove only this specific value for each key to support true multi-select
    entries.forEach(([key, value]) => {
      const fullKey = `${FILTER_URL_PREFIX}${key}`;
      const stringValue = JSON.stringify(value);
      const existing = paramsClone.getAll(fullKey);
      paramsClone.delete(fullKey);
      existing
        .filter((v) => v !== stringValue)
        .forEach((v) => paramsClone.append(fullKey, v));
    });
  } else {
    filterInputToParams(input, paramsClone);
  }

  // Drop navigation-origin & pagination params
  paramsClone.delete('from');
  paramsClone.delete('mo');
  paramsClone.delete('cursor');
  paramsClone.delete('direction');
  return `${location.pathname}?${paramsClone.toString()}`;
}

const PRICE_RANGE_FILTER_DEBOUNCE = 500;

function PriceRangeFilter({
  max,
  min,
  filters = [],
  onClose,
}: {
  max?: number;
  min?: number;
  filters?: Filter[];
  onClose?: () => void;
}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  const shopCurrencyCode =
    (rootData as any)?.layout?.shop?.paymentSettings?.currencyCode;
  const currencyCode = shopCurrencyCode || selectedLocale.currency;
  const currencySymbol = CURRENCY_SYMBOLS[currencyCode] ?? currencyCode;

  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const navigate = useNavigate();

  // Extract absolute bounds from shopify filter values
  const priceRangeFilter = filters.find((f) => f.type === 'PRICE_RANGE');
  let storeMin = 0;
  let storeMax = 1000;
  if (priceRangeFilter?.values?.[0]?.input) {
    try {
      const input = JSON.parse(priceRangeFilter.values[0].input as string) as any;
      if (typeof input.price?.min === 'number') storeMin = input.price.min;
      if (typeof input.price?.max === 'number') storeMax = input.price.max;
    } catch {}
  }

  // Local state for the selected range bounds
  const [minPrice, setMinPrice] = useState(min ?? storeMin);
  const [maxPrice, setMaxPrice] = useState(max ?? storeMax);

  // Sync state if props change (e.g. when filters are cleared)
  useEffect(() => {
    setMinPrice(min ?? storeMin);
    setMaxPrice(max ?? storeMax);
  }, [min, max, storeMin, storeMax]);

  const roundTo2 = (value: number) => Math.round(value * 100) / 100;

  const applyPriceFilter = () => {
    const next = new URLSearchParams(location.search);

    if (minPrice === storeMin && maxPrice === storeMax) {
      next.delete(`${FILTER_URL_PREFIX}price`);
      next.delete('page');
      navigate(`${location.pathname}?${next.toString()}`, { preventScrollReset: true });
      onClose?.();
      return;
    }

    let roundedMin = roundTo2(minPrice);
    let roundedMax = roundTo2(maxPrice);

    if (roundedMin > roundedMax) {
      const tmp = roundedMin;
      roundedMin = roundedMax;
      roundedMax = tmp;
    }

    const price = {
      ...(roundedMin === storeMin ? {} : {min: roundedMin}),
      ...(roundedMax === storeMax ? {} : {max: roundedMax}),
    };

    const newParams = filterInputToParams({price}, next);
    newParams.delete('page');
    navigate(`${location.pathname}?${newParams.toString()}`, { preventScrollReset: true });
    onClose?.();
  };

  const cancelPriceFilter = () => {
    setMinPrice(storeMin);
    setMaxPrice(storeMax);
    const next = new URLSearchParams(location.search);
    next.delete(`${FILTER_URL_PREFIX}price`);
    next.delete('page');
    navigate(`${location.pathname}?${next.toString()}`, { preventScrollReset: true });
    onClose?.();
  };

  useEffect(() => {
    const priceFilterParam = params.get(`${FILTER_URL_PREFIX}price`);
    if (!priceFilterParam) return;

    try {
      const parsed = JSON.parse(priceFilterParam) as any;
      const filterCurrency = parsed?.currencyCode;
      if (filterCurrency && filterCurrency !== currencyCode) {
        params.delete(`${FILTER_URL_PREFIX}price`);
        params.delete('page');
        navigate(`${location.pathname}?${params.toString()}`, { preventScrollReset: true });
      }
    } catch {
      // If we can't parse it, clear it.
      params.delete(`${FILTER_URL_PREFIX}price`);
      params.delete('page');
      navigate(`${location.pathname}?${params.toString()}`, { preventScrollReset: true });
    }
  }, [currencyCode, location.pathname, navigate, params]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxPrice - 1);
    setMinPrice(val);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minPrice + 1);
    setMaxPrice(val);
  };

  const percentMin = ((minPrice - storeMin) / (storeMax - storeMin)) * 100;
  const percentMax = ((maxPrice - storeMin) / (storeMax - storeMin)) * 100;

  return (
    <div className="flex flex-col text-[#463925] space-y-4 pt-2">
      <style dangerouslySetInnerHTML={{__html: `
        .dual-slider-container {
          position: relative;
          width: 100%;
          height: 24px;
          display: flex;
          align-items: center;
        }
        .dual-slider-track {
          position: absolute;
          width: 100%;
          height: 4px;
          background-color: #E8E1D6;
          border-radius: 2px;
          z-index: 1;
        }
        .dual-slider-range {
          position: absolute;
          height: 4px;
          background-color: #EAD8BB;
          border-radius: 2px;
          z-index: 2;
        }
        .dual-slider-input {
          position: absolute;
          width: 100%;
          background: none;
          pointer-events: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          height: 4px;
          margin: 0;
          z-index: 3;
        }
        .dual-slider-input::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #FFFFFF;
          border: 2px solid #B5704F;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
          transition: transform 0.1s ease;
        }
        .dual-slider-input::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .dual-slider-input::-webkit-slider-thumb:active {
          background-color: #EAD8BB;
        }
        .dual-slider-input::-moz-range-thumb {
          pointer-events: auto;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: #FFFFFF;
          border: 2px solid #B5704F;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .dual-slider-input::-moz-range-thumb:active {
          background-color: #EAD8BB;
        }
      `}} />

      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-stone-500 font-sans mb-1">
        <span>Range</span>
        <span className="text-[#B5704F] font-bold text-sm">
          {currencySymbol}{minPrice} - {currencySymbol}{maxPrice}
        </span>
      </div>

      <div className="dual-slider-container">
        <div className="dual-slider-track" />
        <div 
          className="dual-slider-range" 
          style={{ 
            left: `${percentMin}%`, 
            width: `${percentMax - percentMin}%` 
          }} 
        />
        <input
          type="range"
          min={storeMin}
          max={storeMax}
          value={minPrice}
          onChange={handleMinChange}
          className="dual-slider-input"
        />
        <input
          type="range"
          min={storeMin}
          max={storeMax}
          value={maxPrice}
          onChange={handleMaxChange}
          className="dual-slider-input"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={applyPriceFilter}
          className="flex-1 px-4 py-2.5 bg-[#EAD8BB] hover:bg-[#D9B27D] text-[#463925] font-sans text-xs font-semibold uppercase tracking-wider rounded-md transition-colors shadow-sm"
        >
          Apply Now
        </button>
        <button
          type="button"
          onClick={cancelPriceFilter}
          className="flex-1 px-4 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 font-sans text-xs font-semibold uppercase tracking-wider rounded-md transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function filterInputToParams(
  rawInput: string | ProductFilter,
  params: URLSearchParams,
) {
  const input =
    typeof rawInput === 'string'
      ? (JSON.parse(rawInput) as ProductFilter)
      : rawInput;

  Object.entries(input).forEach(([key, value]) => {
    const fullKey = `${FILTER_URL_PREFIX}${key}`;
    const stringValue = JSON.stringify(value);

    if (params.getAll(fullKey).includes(stringValue)) {
      return;
    }
    if (key === 'price' || key === 'available') {
      // For price and availability, we want to overwrite existing values
      params.set(fullKey, stringValue);
    } else {
      params.append(fullKey, stringValue);
    }
  });

  // Drop navigation-origin params
  params.delete('from');
  params.delete('mo');

  // Drop pagination params so applying/changing filters always restarts results
  // from the beginning instead of keeping a deep cursor.
  params.delete('cursor');
  params.delete('direction');
  params.delete('page');

  return params;
}

function getClearFilterGroupLink(
  filter: Filter,
  params: URLSearchParams,
  location: ReturnType<typeof useLocation>,
) {
  const paramsClone = new URLSearchParams(params);
  filter.values?.forEach((option) => {
    if (!option.input) return;
    const input = JSON.parse(option.input as string) as ProductFilter;
    Object.entries(input).forEach(([key, value]) => {
      const fullKey = `${FILTER_URL_PREFIX}${key}`;
      paramsClone.delete(fullKey, JSON.stringify(value));
    });
  });

  paramsClone.delete('from');
  paramsClone.delete('mo');
  paramsClone.delete('cursor');
  paramsClone.delete('direction');
  return `${location.pathname}?${paramsClone.toString()}`;
}

function getClearAllLink(
  params: URLSearchParams,
  location: ReturnType<typeof useLocation>,
) {
  const paramsClone = new URLSearchParams(params);
  Array.from(paramsClone.keys()).forEach((key) => {
    if (key.startsWith(FILTER_URL_PREFIX)) {
      paramsClone.delete(key);
    }
  });

  paramsClone.delete('from');
  paramsClone.delete('mo');
  paramsClone.delete('cursor');
  paramsClone.delete('direction');
  return `${location.pathname}?${paramsClone.toString()}`;
}

export default function SortMenu() {
  const items: {label: string; key: SortParam}[] = [
    {label: 'Best Selling', key: 'best-selling'},
    {label: 'Newest', key: 'newest'},
    {label: 'Price Low to High', key: 'price-low-high'},
    {label: 'Price High to Low', key: 'price-high-low'},
    {label: 'Featured', key: 'featured'},
  ];

  const [params] = useSearchParams();
  const location = useLocation();
  const activeKey = (params.get('sort') as SortParam | null) || 'featured';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <Link
            key={item.key}
            to={getSortLink(item.key, new URLSearchParams(params), location)}
            className={`whitespace-nowrap ${
              isActive
                ? 'text-[#463925] font-semibold'
                : 'text-[#D2BFA0] hover:text-[#463925]'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
