import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Await, useLoaderData, useLocation, Form, useParams} from '@remix-run/react';
import {Suspense, useState, useEffect, useMemo} from 'react';
import {
  Pagination,
  getPaginationVariables,
  Analytics,
  getSeoMeta,
} from '@shopify/hydrogen';
import type {
  Filter,
  ProductFilter,
  SearchSortKeys,
} from '@shopify/hydrogen/storefront-api-types';

import {Section, Text} from '~/components/Text';
import {Grid} from '~/components/Grid';
import {ProductCard} from '~/components/ProductCard';
import {FILTER_URL_PREFIX, SortFilter, type SortParam} from '~/components/SortFilter';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority, PAGINATION_SIZE} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';
import {ShopInspiredStyles} from '~/components/ShopInspiredStyles';
import {Link} from '~/components/Link';
import {IconSearch, IconClose} from '~/components/Icon';

// Smart synonym and concept mapping tailored to Haniesta's authentic catalog
const KEYWORD_SYNONYMS: Record<string, string[]> = {
  persian: ['persian', 'gabbeh', 'kashan', 'herat', 'karavan', 'tribalis', 'nomada', 'dhurrie', 'kilim', 'heritage', 'hand-tufted'],
  gabbeh: ['gabbeh', 'wool', 'velour', 'plush', 'handloom', 'red gabbeh', 'gold gabbeh', 'rust gabbeh'],
  'casa blanc': ['casa blanc', 'casa', 'kilim', 'flatweave', 'cream', 'ivory', 'stone grey', 'frost grey', 'sand beige'],
  casa: ['casa blanc', 'casa', 'kilim'],
  boho: ['bohemian', 'braided', 'jute', 'kashbah', 'sahara', 'bazar', 'souk'],
  bohemian: ['bohemian', 'braided', 'jute', 'kashbah', 'sahara', 'bazar', 'souk'],
  solana: ['solana', 'terra', 'mosaic', 'axis', 'ripple', 'ring', 'halo'],
  wool: ['wool', 'gabbeh', 'tufted', 'sumak', 'hand-tufted', 'archeo', 'orion', 'plaino', 'luma', 'azara', 'kashan', 'herat', 'serena', 'striata'],
  jute: ['jute', 'solana', 'bohemian', 'braided', 'spiral', 'drift', 'petal', 'open weave', 'shadow edge', 'linear frame', 'natural coil', 'bengal'],
  runner: ['runner', 'runners', 'hallway', '70x200', '70x300', '60x100', '80x150', 'narrow'],
  runners: ['runner', 'runners', 'hallway', '70x200', '70x300', '60x100', '80x150', 'narrow'],
  hallway: ['runner', 'runners', 'hallway', '70x200', '70x300', '60x100', '80x150'],
  'living room': ['living', 'living room', '200x300', '170x240', '160x230', 'large', 'area rug', 'gabbeh', 'tufted'],
  bedroom: ['bedroom', 'plush', 'gabbeh', 'soft', 'wool', '130x190', '160x230', 'casa blanc'],
  dining: ['dining', 'flatweave', 'kilim', 'jute', 'casa blanc', 'dhurrie', 'sumak'],
  entryway: ['entryway', 'entrance', '40x60', '60x90', '60x100', '70x140', 'door'],
  kitchen: ['kitchen', 'washable', 'jute', 'runner', '60x90', '60x100', '70x140'],
  sumak: ['sumak', 'handwoven', 'flatweave', 'geometric', 'beige sumak', 'grey sumak', 'white sumak'],
  round: ['round', 'circle', 'souk', 'orbit', 'ring', 'halo', 'solana'],
  oval: ['oval', 'bazar', 'drift', 'petal', 'soft horizon'],
  large: ['200x300', '200x290', '250x300', '250x350', '240x340', 'large', 'area'],
  '200x300': ['200x300', '200 Ã— 300', 'size_200x300', 'large'],
  '160x230': ['160x230', '160 Ã— 230', 'size_160x230'],
  '60x90': ['60x90', '60x90cm', 'size_60x90', 'size_60x90cm'],
  '70x140': ['70x140', 'size_70x140'],
};

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const {storefront, env} = context as any;
  const searchParams = new URL(request.url).searchParams;
  const searchTerm = searchParams.get('q') ?? '';
  const variables = getPaginationVariables(request, {pageBy: 12});

  const {sortKey, reverse} = getSortValuesFromParam(
    searchParams.get('sort') as SortParam,
  );

  const coerceNumber = (v: any) => {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const requestedPriceBounds = (() => {
    const raw = searchParams.get(`${FILTER_URL_PREFIX}price`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as any;
      let min = coerceNumber(parsed?.min);
      let max = coerceNumber(parsed?.max);
      if (
        typeof min === 'number' &&
        typeof max === 'number' &&
        Number.isFinite(min) &&
        Number.isFinite(max) &&
        min > max
      ) {
        const tmp = min;
        min = max;
        max = tmp;
      }
      if (min === undefined && max === undefined) return null;
      return {min, max};
    } catch {
      return null;
    }
  })();

  const useAnyVariantPriceFiltering = !!requestedPriceBounds;

  // Check if search term looks like an SKU
  const isLikelySKU = /^[A-Z0-9]+(-[A-Z0-9]+)+(-[\dx]+)*$/i.test(searchTerm.trim());
  const searchQuery = isLikelySKU ? `"${searchTerm.trim()}"` : searchTerm.trim();

  const filters = [...searchParams.entries()].reduce(
    (filters, [key, value]) => {
      if (key.startsWith(FILTER_URL_PREFIX)) {
        const filterKey = key.substring(FILTER_URL_PREFIX.length);
        if (filterKey === 'price') {
          if (!useAnyVariantPriceFiltering) {
            try {
              filters.push({price: JSON.parse(value)} as ProductFilter);
            } catch {
              // ignore invalid price filter
            }
          }
        } else {
          try {
            filters.push({
              [filterKey]: JSON.parse(value),
            });
          } catch {
            // ignore invalid filter
          }
        }
      }
      return filters;
    },
    [] as ProductFilter[],
  );

  const normalizedFilters = filters.map((filter) => {
    const variantOption = (filter as any)?.variantOption;
    const price = (filter as any)?.price;

    const next: any = {...filter};

    if (price && typeof price === 'object' && 'currencyCode' in price) {
      const {currencyCode: _currencyCode, ...rest} = price as any;
      next.price = rest;
    }

    if (variantOption?.name) {
      next.variantOption = {
        ...variantOption,
        name: normalizeVariantOptionName(variantOption.name),
      };
    }

    return next as ProductFilter;
  });

  const anyVariantVariables = useAnyVariantPriceFiltering
    ? {
        first: 50,
        last: undefined,
        startCursor: undefined,
        endCursor: undefined,
      }
    : {};

  // 1. Primary Storefront Search Query
  const {search: rawSearch, colorSwatches} = await storefront.query(SEARCH_QUERY, {
    variables: {
      searchTerm: searchQuery,
      ...variables,
      ...anyVariantVariables,
      filters: normalizedFilters,
      sortKey,
      reverse,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  // 2. Intelligent Catalog Matching (for synonyms, collections, tags, sizes, rooms)
  let catalogMatchedSearch = null;
  const searchClean = searchTerm.toLowerCase().trim();

  if (searchClean.length > 0 && !isLikelySKU) {
    try {
      const {products: allProducts} = await storefront.query(ALL_PRODUCTS_QUERY, {
        variables: {
          first: 100, // covers all store products
          country: storefront.i18n.country,
          language: storefront.i18n.language,
        },
      });

      const expandedTerms = KEYWORD_SYNONYMS[searchClean] || [searchClean];

      const matchedProducts = (allProducts?.nodes || []).filter((product: any) => {
        const title = (product?.title || '').toLowerCase();
        const vendor = (product?.vendor || '').toLowerCase();
        const handle = (product?.handle || '').toLowerCase();
        const tags = Array.isArray(product?.tags)
          ? product.tags.map((t: string) => String(t).toLowerCase())
          : [];
        const collections = Array.isArray(product?.collections?.nodes)
          ? product.collections.nodes.map((c: any) => String(c?.title || '').toLowerCase())
          : [];

        // Direct token or substring match
        const matchesDirect =
          title.includes(searchClean) ||
          vendor.includes(searchClean) ||
          handle.includes(searchClean) ||
          tags.some((t: string) => t.includes(searchClean) || searchClean.includes(t)) ||
          collections.some((c: string) => c.includes(searchClean) || searchClean.includes(c));

        if (matchesDirect) return true;

        // Expanded synonym match
        const matchesSynonyms = expandedTerms.some((term: string) => {
          return (
            title.includes(term) ||
            tags.some((t: string) => t.includes(term) || term.includes(t)) ||
            collections.some((c: string) => c.includes(term) || term.includes(c))
          );
        });

        return matchesSynonyms;
      });

      if (matchedProducts.length > 0) {
        catalogMatchedSearch = {
          nodes: matchedProducts,
          pageInfo: {
            startCursor: null,
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
          productFilters: rawSearch?.productFilters || [],
        };
      }
    } catch (err) {
      console.error('[Search] Catalog search error:', err);
    }
  }

  // Merge raw search results with catalog matched results
  const baseSearch = (() => {
    const rawNodes = rawSearch?.nodes || [];
    const catalogNodes = catalogMatchedSearch?.nodes || [];

    if (!searchClean) {
      return rawSearch || {nodes: [], pageInfo: {}, productFilters: []};
    }

    // Combine and deduplicate
    const map = new Map<string, any>();
    for (const p of rawNodes) {
      if (p?.id) map.set(p.id, p);
    }
    for (const p of catalogNodes) {
      if (p?.id && !map.has(p.id)) map.set(p.id, p);
    }

    const mergedNodes = Array.from(map.values());

    return {
      nodes: mergedNodes,
      pageInfo: rawSearch?.pageInfo || {
        startCursor: null,
        endCursor: null,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      productFilters: rawSearch?.productFilters || [],
    };
  })();

  // SKU exact match filtering
  const finalSearch = (() => {
    let current = baseSearch as any;

    if (isLikelySKU && current?.nodes?.length) {
      const term = searchClean;
      const exactMatch = current.nodes.filter((product: any) => {
        const variants = product?.variants?.nodes ?? [];
        return variants.some((v: any) => (v?.sku || '').toLowerCase().trim() === term);
      });
      current = {...current, nodes: exactMatch};
    }

    // Price bounds filtering if active
    if (useAnyVariantPriceFiltering && requestedPriceBounds && current?.nodes?.length) {
      const {min, max} = requestedPriceBounds;
      const filtered = current.nodes.filter((p: any) => {
        const vars = p?.variants?.nodes ?? [];
        return vars.some((v: any) => {
          const amt = Number(v?.price?.amount);
          if (!Number.isFinite(amt)) return false;
          if (typeof min === 'number' && amt < min) return false;
          if (typeof max === 'number' && amt > max) return false;
          return true;
        });
      });
      current = {...current, nodes: filtered.slice(0, variables.first || 12)};
    }

    return current;
  })();

  const allFilterValues =
    finalSearch?.productFilters?.flatMap((filter: any) => filter.values) ?? [];

  const appliedFilters = normalizedFilters
    .map((filter) => {
      const foundValue = allFilterValues.find((value: any) => {
        const valueInput = JSON.parse(value.input as string) as ProductFilter;
        if (valueInput.price && (filter as any).price) return true;
        return JSON.stringify(valueInput) === JSON.stringify(filter);
      });

      if (!foundValue) return null;

      if (foundValue.id === 'filter.v.price') {
        const input = JSON.parse(foundValue.input as string) as ProductFilter;
        const min = input.price?.min;
        const max = input.price?.max;
        const label =
          typeof min === 'number' && typeof max === 'number'
            ? `Â£${min} - Â£${max}`
            : 'Price';

        return {filter, label};
      }

      return {filter, label: foundValue.label};
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
      id: 'search',
      title: 'Search Luxury Rugs',
      handle: 'search',
      descriptionHtml: 'Handcrafted luxury artisan rugs search catalog',
      description: 'Search results for Haniesta handcrafted artisan rugs',
      seo: {
        title: searchTerm ? `Search: ${searchTerm} | Haniesta Atelier` : 'Search Rugs | Haniesta',
        description: `Explore ${finalSearch?.nodes?.length ?? 0} artisan rugs for "${searchTerm}"`,
      },
      metafields: [],
      products: finalSearch,
      updatedAt: new Date().toISOString(),
    },
  });

  // Fetch real curated collections for the recommendation and zero-results state
  const curatedCollections = getSearchCuratedCollections(storefront);

  return defer({
    seo,
    searchTerm,
    products: finalSearch,
    colorSwatches,
    appliedFilters,
    curatedCollections,
    storeDomain: env?.PUBLIC_STORE_DOMAIN,
  });
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  const seoEntries = (matches || [])
    .map((m) => (m.data as any)?.seo)
    .filter(Boolean) as any[];
  if (seoEntries.length > 0) return getSeoMeta(...seoEntries);
  return [
    {title: 'Search Luxury Rugs | Haniesta'},
    {name: 'description', content: 'Search artisan handcrafted wool, jute, and kilim rugs.'},
  ];
};

export default function Search() {
  const {
    searchTerm,
    products,
    colorSwatches,
    appliedFilters,
    curatedCollections,
    storeDomain,
  } = useLoaderData<typeof loader>();

  const productCount = products?.nodes?.length ?? 0;
  const noResults = productCount === 0;

  const location = useLocation();
  const params = useParams();

  const activePriceRange = useMemo(() => {
    try {
      const p = new URLSearchParams(location.search);
      const raw = p.get(`${FILTER_URL_PREFIX}price`);
      if (!raw) return {min: undefined, max: undefined};
      const parsed = JSON.parse(raw) as any;
      const min = parseFloat(String(parsed?.min ?? ''));
      const max = parseFloat(String(parsed?.max ?? ''));
      return {
        min: Number.isFinite(min) ? min : undefined,
        max: Number.isFinite(max) ? max : undefined,
      };
    } catch {
      return {min: undefined, max: undefined};
    }
  }, [location.search]);

  const [inputValue, setInputValue] = useState(searchTerm);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'collections' | 'rooms' | 'materials' | 'sizes'>('collections');

  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // Curated Luxury Taxonomy
  const taxonomyTabs = {
    collections: {
      label: 'Atelier Collections',
      items: [
        {name: 'Gabbeh Collection', query: 'Gabbeh', badge: 'Artisan Wool'},
        {name: 'Casa Blanc Kilims', query: 'Casa Blanc', badge: 'Minimalist'},
        {name: 'Bohemian Braided', query: 'Bohemian', badge: 'Jute'},
        {name: 'Solana Collection', query: 'Solana', badge: 'Textured'},
        {name: 'Persian Heritage', query: 'Persian', badge: 'Timeless'},
        {name: 'Sumak Flatweaves', query: 'Sumak', badge: 'Handwoven'},
      ],
    },
    rooms: {
      label: 'By Room',
      items: [
        {name: 'Living Room Rugs', query: 'Living Room', badge: 'Spacious'},
        {name: 'Hallway Runners', query: 'Runner', badge: 'Narrow'},
        {name: 'Bedroom Sanctuary', query: 'Bedroom', badge: 'Plush'},
        {name: 'Dining Room', query: 'Dining', badge: 'Durable'},
        {name: 'Entryway & Kitchen', query: 'Entryway', badge: 'Compact'},
      ],
    },
    materials: {
      label: 'By Material',
      items: [
        {name: '100% Pure Wool', query: 'Wool', badge: 'New Zealand'},
        {name: 'Natural Organic Jute', query: 'Jute', badge: 'Eco-Friendly'},
        {name: 'Handloom Kilims', query: 'Kilim', badge: 'Flatweave'},
        {name: 'Hand-Tufted Plush', query: 'Hand-Tufted', badge: 'Heavy Pile'},
      ],
    },
    sizes: {
      label: 'By Size & Shape',
      items: [
        {name: 'Large Area (200Ã—300)', query: '200x300', badge: '6x9 ft'},
        {name: 'Medium (160Ã—230)', query: '160x230', badge: '5x7 ft'},
        {name: 'Narrow Runners', query: 'Runner', badge: 'Hallway'},
        {name: 'Round & Oval Rugs', query: 'Round', badge: 'Organic'},
        {name: 'Accent (60Ã—90)', query: '60x90', badge: 'Entryway'},
      ],
    },
  };

  const isCurrentQuery = (q: string) => {
    return searchTerm.toLowerCase().trim() === q.toLowerCase().trim();
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-20">
      {/* 1. When Search Term is Active and Has Results: Render Compact Luxury Header */}
      {searchTerm && !noResults ? (
        <div className="border-b border-[#E8E3DA] bg-[#FAF7F2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Title & Count */}
              <div>
                <div className="flex items-center gap-2 text-xs font-jost text-[#8A7259] uppercase tracking-wider mb-1">
                  <Link to="/" className="hover:text-[#2E1D14] transition-colors">Home</Link>
                  <span>/</span>
                  <Link to="/search" className="hover:text-[#2E1D14] transition-colors">Search</Link>
                </div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h1 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl text-[#2E1D14] font-normal tracking-wide capitalize">
                    "{searchTerm}"
                  </h1>
                  <span className="font-jost text-sm text-[#8A7259] font-light tracking-wide">
                    {productCount} {productCount === 1 ? 'artisan piece' : 'artisan pieces'} found
                  </span>
                </div>
              </div>

              {/* Compact Sleek Search Input */}
              <div className="w-full md:w-auto md:min-w-[340px] max-w-md">
                <Form
                  method="get"
                  action={params.locale ? `/${params.locale}/search` : '/search'}
                  className="relative flex items-center bg-white border border-[#D9C7A8] hover:border-[#8A7259] focus-within:border-[#2E1D14] rounded-full shadow-xs pl-4 pr-1.5 py-1.5 transition-all duration-200"
                >
                  <IconSearch className="w-4 h-4 text-[#8A7259] flex-shrink-0 mr-2.5" />
                  <input
                    type="search"
                    name="q"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search another rug style, color, size..."
                    className="bg-transparent outline-none border-none text-[13px] text-[#2E1D14] placeholder-[#8A7259]/60 w-full focus:ring-0 p-0 font-jost"
                  />
                  {inputValue && (
                    <button
                      type="button"
                      onClick={() => setInputValue('')}
                      className="text-[#8A7259] hover:text-[#2E1D14] p-1 mr-1 text-xs transition-colors"
                      aria-label="Clear search input"
                    >
                      <IconClose className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-[#2E1D14] hover:bg-[#4A3222] text-[#F5EDE0] text-[11px] uppercase tracking-wider font-jost font-medium px-4 py-2 rounded-full transition-colors flex-shrink-0"
                  >
                    Search
                  </button>
                </Form>
              </div>
            </div>

            {/* Quick Related Keyword Pills (Clean Single Line) */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#E8E3DA]/60 overflow-x-auto no-scrollbar text-xs font-jost">
              <span className="text-[#8A7259] uppercase tracking-wider text-[11px] font-medium flex-shrink-0">Related:</span>
              {[
                {name: 'Gabbeh', query: 'Gabbeh'},
                {name: 'Casa Blanc', query: 'Casa Blanc'},
                {name: 'Bohemian Jute', query: 'Bohemian'},
                {name: 'Solana', query: 'Solana'},
                {name: 'Living Room', query: 'Living Room'},
                {name: 'Runners', query: 'Runner'},
                {name: 'Pure Wool', query: 'Wool'},
                {name: '200Ã—300 Area', query: '200x300'},
                {name: 'Round Rugs', query: 'Round'},
              ].map((pill) => {
                const isSelected = isCurrentQuery(pill.query);
                return (
                  <Link
                    key={pill.name}
                    to={`${params.locale ? `/${params.locale}` : ''}/search?q=${encodeURIComponent(pill.query)}`}
                    className={`flex-shrink-0 px-3 py-1 rounded-full transition-all duration-200 border ${
                      isSelected
                        ? 'bg-[#2E1D14] text-[#FAF7F2] border-[#2E1D14] font-medium'
                        : 'bg-white hover:bg-[#F2ECE1] text-[#4A3A2C] border-[#D9C7A8]/70 hover:border-[#8A7259]'
                    }`}
                  >
                    {pill.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* 2. When No Search Term or 0 Results: Compact Clean Centered Discovery Hero */
        <section className="relative pt-7 pb-6 sm:pt-9 sm:pb-8 border-b border-[#E8E3DA] bg-gradient-to-b from-[#F2ECE1] via-[#FAF7F2] to-[#FAF7F2]">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <span className="font-jost text-[10px] tracking-[0.25em] text-[#8A7259] uppercase font-semibold block mb-1">
              HANIESTA ATELIER SEARCH
            </span>
            <h1 className="font-cinzel text-2xl sm:text-3xl text-[#2E1D14] tracking-wide font-normal mb-2">
              {searchTerm && noResults
                ? `No Pieces Found for "${searchTerm}"`
                : 'Search the Collection'}
            </h1>
            <p className="font-jost text-xs sm:text-sm text-[#7A6450] max-w-md mx-auto mb-5 font-light leading-relaxed">
              {searchTerm && noResults
                ? 'We could not find an exact match. Explore our new signature collections below or search by keyword.' 
                : 'Discover bespoke handmade wool, natural jute, and heritage flatweave rugs.'}
            </p>

            {/* Centered Search Bar */}
            <div className="max-w-lg mx-auto mb-4">
              <Form
                method="get"
                action={params.locale ? `/${params.locale}/search` : '/search'}
                className="relative flex items-center bg-white border border-[#D9C7A8] hover:border-[#8A7259] focus-within:border-[#2E1D14] rounded-full shadow-[0_4px_16px_rgba(46,29,20,0.05)] pl-4 pr-1.5 py-1.5 transition-all duration-200"
              >
                <IconSearch className="w-4 h-4 text-[#8A7259] flex-shrink-0 mr-2.5" />
                <input
                  type="search"
                  name="q"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Search rugs by style, color, size, collection..."
                  className="bg-transparent outline-none border-none text-[13px] sm:text-[14px] text-[#2E1D14] placeholder-[#8A7259]/60 w-full focus:ring-0 p-0 font-jost"
                  autoFocus={!searchTerm}
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={() => setInputValue('')}
                    className="text-[#8A7259] hover:text-[#2E1D14] p-1 mr-1 text-sm transition-colors"
                    aria-label="Clear search input"
                  >
                    <IconClose className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-[#2E1D14] hover:bg-[#4A3222] text-[#F5EDE0] text-[11px] uppercase tracking-wider font-jost font-medium px-4 py-2 rounded-full transition-colors flex-shrink-0 shadow-xs"
                >
                  Search
                </button>
              </Form>
            </div>

            {/* Popular Quick Suggestions */}
            <div className="flex items-center justify-center flex-wrap gap-1.5 text-xs font-jost text-[#8A7259]">
              <span className="font-medium text-[#5A4635] uppercase tracking-wider text-[10px] mr-1">Popular:</span>
              {[
                {name: 'Vista Collection', query: 'Vista'},
                {name: 'Persian Heritage', query: 'Persian'},
                {name: 'Sierra Collection', query: 'Sierra'},
                {name: 'Sumak Flatweaves', query: 'Sumak'},
                {name: 'Gabbeh Wool', query: 'Gabbeh'},
                {name: 'Natural Jute', query: 'Jute'},
                {name: 'Runners', query: 'Runner'},
              ].map((pill) => (
                <Link
                  key={pill.name}
                  to={`${params.locale ? `/${params.locale}` : ''}/search?q=${encodeURIComponent(pill.query)}`}
                  className="bg-white hover:bg-[#2E1D14] hover:text-[#FAF7F2] text-[#3A2A1D] border border-[#D9C7A8] px-3 py-1 rounded-full transition-all duration-200 text-[11px] shadow-2xs font-medium"
                >
                  {pill.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Results or Empty State */}
      {!searchTerm || noResults ? (
        <NoResultsView
          noResults={noResults}
          searchTerm={searchTerm}
          curatedCollections={curatedCollections}
        />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <SortFilter
            filters={((products as any)?.productFilters ?? []) as Filter[]}
            appliedFilters={appliedFilters as any}
            collections={[]}
          >
            <Pagination connection={products}>
              {({nodes, isLoading, NextLink, PreviousLink, hasNextPage, hasPreviousPage}) => {
                const itemsMarkup = nodes.map((product, i) => (
                  <ProductCard
                    key={(product as any).id}
                    product={product as any}
                    loading={getImageLoadingPriority(i)}
                    colorSwatchData={colorSwatches}
                    storeDomain={storeDomain}
                    activePriceRange={activePriceRange}
                    quickAdd
                  />
                ));

                return (
                  <>
                    {hasPreviousPage && (
                      <div className="flex items-center justify-center mt-6 mb-8">
                        <PreviousLink className="inline-block rounded-full font-jost font-medium text-xs uppercase tracking-widest text-center py-3 px-8 border border-[#2E1D14] bg-white text-[#2E1D14] hover:bg-[#2E1D14] hover:text-[#FAF7F2] transition-colors shadow-sm">
                          {isLoading ? 'Loading...' : 'Previous Page'}
                        </PreviousLink>
                      </div>
                    )}
                    <Grid data-test="product-grid">{itemsMarkup}</Grid>
                    {hasNextPage && (
                      <div className="flex items-center justify-center mt-10">
                        <NextLink className="inline-block rounded-full font-jost font-medium text-xs uppercase tracking-widest text-center py-3.5 px-10 border border-[#2E1D14] bg-[#2E1D14] text-[#FAF7F2] hover:bg-[#4A3222] transition-colors shadow-md">
                          {isLoading ? 'Loading...' : 'Load More Rugs'}
                        </NextLink>
                      </div>
                    )}
                  </>
                );
              }}
            </Pagination>
          </SortFilter>
        </div>
      )}

      <Analytics.SearchView data={{searchTerm, searchResults: products}} />
    </div>
  );
}


function getSortValuesFromParam(sortParam?: SortParam | null): {
  sortKey: SearchSortKeys;
  reverse: boolean;
} {
  switch (sortParam) {
    case 'price-low-high':
      return {sortKey: 'PRICE', reverse: false};
    case 'price-high-low':
      return {sortKey: 'PRICE', reverse: true};
    case 'best-selling':
      return {sortKey: 'RELEVANCE', reverse: false};
    case 'newest':
      return {sortKey: 'RELEVANCE', reverse: false};
    case 'featured':
    default:
      return {sortKey: 'RELEVANCE', reverse: false};
  }
}

function normalizeVariantOptionName(name: string) {
  const n = String(name).trim();
  const lower = n.toLowerCase();
  if (lower === 'size') return 'Size';
  if (lower === 'color' || lower === 'colour') return 'Color';
  return n;
}

type CollectionData = {
  id: string;
  title: string;
  handle: string;
  image?: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  } | null | undefined;
};

function NoResultsView({
  noResults,
  searchTerm,
  curatedCollections,
}: {
  noResults: boolean;
  searchTerm: string;
  curatedCollections: Promise<CollectionData[]>;
}) {
  const params = useParams();

  const curatedStaticCards = [
    {
      title: 'The Vista Collection',
      subtitle: 'Modern Geometric Flatweaves',
      handle: 'vista-collection',
      image: '/images/hero-collection-vista.webp',
      badge: 'Indoor & Terrace',
    },
    {
      title: 'The Persian Collection',
      subtitle: 'Heritage Medallion Kilims',
      handle: 'persian-collection',
      image: '/images/hero-collection-persian.webp',
      badge: 'Artisan Medallions',
    },
    {
      title: 'The Sierra Collection',
      subtitle: 'Organic Wool & Jute',
      handle: 'sierra-collection',
      image: '/images/hero-collection-sierra.webp',
      badge: 'Handwoven Earth Weave',
    },
    {
      title: 'The Sumak Collection',
      subtitle: 'Textured Soumak Weaves',
      handle: 'sumak-collection',
      image: '/images/hero-collection-sumak.webp',
      badge: 'Pure Undyed Wool',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {noResults && searchTerm && (
        <div className="max-w-2xl mx-auto text-center mb-10 p-6 sm:p-8 bg-white border border-[#E8E3DA] rounded-2xl shadow-[0_4px_20px_rgba(46,29,20,0.04)]">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#D9C7A8] flex items-center justify-center mx-auto mb-4 text-[#8A7259]">
            <IconSearch className="w-6 h-6" />
          </div>
          <h2 className="font-cinzel text-xl text-[#2E1D14] mb-2 font-medium">
            No exact matches for "{searchTerm}"
          </h2>
          <p className="font-jost text-sm text-[#7A6450] mb-6 leading-relaxed">
            Our atelier artisans handcraft custom rugs in varied weaves. Try searching by collection or explore our signature collections below.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              {name: 'The Vista Collection', query: 'Vista'},
              {name: 'Persian Medallions', query: 'Persian'},
              {name: 'Sierra Earth Weaves', query: 'Sierra'},
              {name: 'Sumak Flatweaves', query: 'Sumak'},
              {name: 'Natural Jute Rugs', query: 'Jute'},
            ].map((shortcut) => (
              <Link
                key={shortcut.name}
                to={`${params.locale ? `/${params.locale}` : ''}/search?q=${encodeURIComponent(shortcut.query)}`}
                className="text-xs font-jost bg-[#FAF7F2] hover:bg-[#2E1D14] text-[#3A2A1D] hover:text-[#FAF7F2] border border-[#D9C7A8] px-3.5 py-1.5 rounded-full transition-all duration-200 font-medium"
              >
                {shortcut.name} →
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Editorial Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <span className="font-jost text-[10px] uppercase tracking-[0.25em] text-[#8A7259] font-medium block mb-1.5">
          EXPLORE THE ATELIER
        </span>
        <h2 className="font-cinzel text-xl sm:text-2xl text-[#2E1D14] tracking-wide font-normal mb-2">
          New Signature Collections
        </h2>
        <p className="font-jost text-xs sm:text-sm text-[#7A6450] font-light leading-relaxed">
          Discover our newest handcrafted weaves, designed to bring architectural texture and heritage artistry to your home.
        </p>
      </div>

      {/* Luxury Curated Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {curatedStaticCards.map((card) => (
          <Link
            key={card.handle}
            to={`${params.locale ? `/${params.locale}` : ''}/collections/${card.handle}`}
            className="group relative overflow-hidden rounded-xl aspect-[3/4] bg-[#2E1D14] shadow-[0_6px_24px_rgba(46,29,20,0.06)] border border-[#E8E3DA] transition-all duration-500 hover:shadow-[0_12px_32px_rgba(46,29,20,0.16)] hover:-translate-y-1 block"
          >
            {/* Background Image with Zoom */}
            <img
              src={card.image}
              alt={card.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C120C]/90 via-[#1C120C]/30 to-transparent transition-opacity duration-300 group-hover:from-[#1C120C]/95" />

            {/* Top Pill Badge */}
            <div className="absolute top-3.5 left-3.5 z-10">
              <span className="inline-block bg-white/90 backdrop-blur-md text-[#2E1D14] text-[9px] sm:text-[10px] uppercase font-jost font-medium tracking-wider px-2.5 py-0.5 rounded-full border border-white/40 shadow-xs">
                {card.badge}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10">
              <p className="font-jost text-[10px] sm:text-[11px] uppercase tracking-widest text-[#E8DCC8] mb-1">
                {card.subtitle}
              </p>
              <h3 className="font-cormorant text-xl sm:text-2xl text-white font-medium tracking-wide mb-2 leading-tight">
                {card.title}
              </h3>
              <div className="flex items-center text-xs font-jost font-medium text-white/90 group-hover:text-amber-200 transition-colors gap-1.5">
                <span>Explore Collection</span>
                <span className="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const SEARCH_CURATED_COLLECTIONS_QUERY = `#graphql
  query SearchCuratedCollections(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    gabbeh: collection(handle: "gabbeh") {
      id
      title
      handle
      image {
        altText
        width
        height
        url
      }
    }
    casaBlanc: collection(handle: "casa-blanc-collection") {
      id
      title
      handle
      image {
        altText
        width
        height
        url
      }
    }
    boho: collection(handle: "bohemian-braided") {
      id
      title
      handle
      image {
        altText
        width
        height
        url
      }
    }
    runners: collection(handle: "runners") {
      id
      title
      handle
      image {
        altText
        width
        height
        url
      }
    }
    livingRoom: collection(handle: "living-room-rugs") {
      id
      title
      handle
      image {
        altText
        width
        height
        url
      }
    }
  }
` as const;

async function getSearchCuratedCollections(
  storefront: LoaderFunctionArgs['context']['storefront'],
) {
  try {
    const data = await storefront.query(SEARCH_CURATED_COLLECTIONS_QUERY, {
      variables: {
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    });

    const collections: CollectionData[] = [];
    if (data?.gabbeh) collections.push(data.gabbeh as CollectionData);
    if (data?.casaBlanc) collections.push(data.casaBlanc as CollectionData);
    if (data?.boho) collections.push(data.boho as CollectionData);
    if (data?.runners) collections.push(data.runners as CollectionData);
    if (data?.livingRoom) collections.push(data.livingRoom as CollectionData);

    return collections;
  } catch (error) {
    console.error('[Search] Failed to fetch curated collections:', error);
    return [];
  }
}

const SEARCH_QUERY = `#graphql
  query PaginatedProductsSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $filters: [ProductFilter!]
    $sortKey: SearchSortKeys
    $reverse: Boolean
    $searchTerm: String!
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    search(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      sortKey: $sortKey
      reverse: $reverse
      query: $searchTerm
      types: [PRODUCT]
      productFilters: $filters
    ) {
      productFilters {
        id
        label
        type
        values {
          id
          label
          count
          input
        }
      }
      nodes {
        ... on Product {
          ...ProductCard
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
    colorSwatches: metaobjects(type: "shopify--color-pattern", first: 50) {
      nodes {
        id
        handle
        fields {
          key
          value
          type
          reference {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }

  ${PRODUCT_CARD_FRAGMENT}
` as const;

const ALL_PRODUCTS_QUERY = `#graphql
  query SearchAllProducts(
    $country: CountryCode
    $first: Int
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first) {
      nodes {
        ...ProductCard
      }
    }
  }

  ${PRODUCT_CARD_FRAGMENT}
` as const;
