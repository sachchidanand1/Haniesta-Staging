import {useEffect, useRef, useState} from 'react';
import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {
  Link,
  useFetcher,
  useLoaderData,
  useLocation,
  useSearchParams,
} from '@remix-run/react';
import type {
  Filter,
  ProductCollectionSortKeys,
  ProductFilter,
} from '@shopify/hydrogen/storefront-api-types';
import {
  flattenConnection,
  Analytics,
  getSeoMeta,
} from '@shopify/hydrogen';
import {Image} from '~/components/Image';
import invariant from 'tiny-invariant';
import {getFeaturedMetaobjectById, type FeaturedCollection} from '~/lib/metafields';

import {PageHeader, Section, Text} from '~/components/Text';
import {Grid} from '~/components/Grid';
import {ProductCard} from '~/components/ProductCard';
import {SortFilter, type SortParam} from '~/components/SortFilter';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {htmlCacheHeaders, routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {FILTER_URL_PREFIX} from '~/components/SortFilter';
import {getImageLoadingPriority} from '~/lib/const';
import {parseAsCurrency} from '~/lib/utils';
import {
  getOrGenerateSeed,
  shuffleArray,
  prioritizeGroupsThenUngroupedThenRemainder,
  normalizeGroupFamilyKey,
} from '~/lib/shuffle';

export const headers = routeHeaders;

export const meta = ({data, matches}: MetaArgs<typeof loader>) => {
  const seoEntries = (matches || [])
    .map((m) => (m.data as any)?.seo)
    .filter(Boolean) as any[];
  if (seoEntries.length > 0) return getSeoMeta(...seoEntries);
  return getSeoMeta((data as any)?.seo);
};

function renderShopifyRichTextNode(node: any, key: React.Key): JSX.Element | null {
  if (!node || typeof node !== 'object') return null;

  const children = Array.isArray(node.children)
    ? node.children
        .map((c: any, idx: number) => renderShopifyRichTextNode(c, `${key}-${idx}`))
        .filter(Boolean)
    : null;

  switch (node.type) {
    case 'root':
      return <>{children}</>;
    case 'paragraph':
      return <p key={key}>{children}</p>;
    case 'heading': {
      const level = Number(node.level);
      if (level === 1)
        return (
          <h1 key={key} className="text-2xl md:text-3xl text-[#1f1911] font-normal">
            {children}
          </h1>
        );
      if (level === 2)
        return (
          <h2 key={key} className="text-xl md:text-2xl text-[#1f1911] font-normal">
            {children}
          </h2>
        );
      if (level === 3)
        return (
          <h3 key={key} className="text-lg md:text-xl text-[#1f1911] font-normal">
            {children}
          </h3>
        );
      if (level === 4)
        return (
          <h4 key={key} className="text-base md:text-lg text-[#1f1911] font-normal">
            {children}
          </h4>
        );
      if (level === 5)
        return (
          <h5 key={key} className="text-base text-[#1f1911] font-normal">
            {children}
          </h5>
        );
      if (level === 6)
        return (
          <h6 key={key} className="text-sm text-[#1f1911] font-normal">
            {children}
          </h6>
        );
      return (
        <h2 key={key} className="text-xl md:text-2xl text-[#1f1911] font-normal">
          {children}
        </h2>
      );
    }
    case 'list': {
      const isOrdered = node.listType === 'ordered';
      const Tag = isOrdered ? 'ol' : 'ul';
      return <Tag key={key}>{children}</Tag>;
    }
    case 'list-item':
      return <li key={key}>{children}</li>;
    case 'text': {
      let el: React.ReactNode = node.value ?? '';
      if (node.bold) el = <strong key={key}>{el}</strong>;
      if (node.italic) el = <em key={key}>{el}</em>;
      if (node.underline) el = <u key={key}>{el}</u>;
      return <span key={key}>{el}</span>;
    }
    case 'link': {
      const url = typeof node.url === 'string' ? node.url : '#';
      return (
        <a key={key} href={url}>
          {children}
        </a>
      );
    }
    default:
      return children ? <span key={key}>{children}</span> : null;
  }
}

function renderShopifyRichTextDocument(doc: any): JSX.Element | null {
  const node = renderShopifyRichTextNode(doc, 'rt');
  return node ? <div className="space-y-4">{node}</div> : null;
}

function renderIntroContent(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown as {
        type?: unknown;
        children?: unknown;
      };
      if (parsed?.type === 'root' && Array.isArray(parsed?.children)) {
        const rendered = renderShopifyRichTextDocument(parsed as any);
        if (rendered) return rendered;
      }
    } catch {}
  }

  const looksLikeHtml = /<\s*[a-z][\s\S]*>/i.test(trimmed);
  if (looksLikeHtml) {
    return <div dangerouslySetInnerHTML={{__html: trimmed}} />;
  }

  return <div className="whitespace-pre-line">{trimmed}</div>;
}

function CollapsibleIntroContent({
  value,
  maxCollapsedHeight = 420,
}: {
  value: string;
  maxCollapsedHeight?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [canCollapse, setCanCollapse] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const nextCanCollapse = el.scrollHeight > maxCollapsedHeight + 8;
    setCanCollapse(nextCanCollapse);
    if (!nextCanCollapse) {
      setExpanded(true);
    }
  }, [value, maxCollapsedHeight]);

  return (
    <div>
      <div
        ref={contentRef}
        className={
          (expanded ? '' : 'overflow-hidden relative ') +
          'transition-[max-height] duration-300'
        }
        style={expanded ? undefined : {maxHeight: maxCollapsedHeight}}
      >
        {renderIntroContent(value)}
        {!expanded && canCollapse ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />
        ) : null}
      </div>

      {canCollapse ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[#463925] underline underline-offset-4 hover:opacity-80"
          >
            {expanded ? 'Read Less' : 'Read More'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

const collectionsCursorCache = new Map<string, Map<number, string | null>>();

function normalizePageParam(raw: string | null) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function buildCollectionsCacheKey(url: URL, handle: string) {
  const params = new URLSearchParams(url.searchParams);
  params.delete('page');
  return `${handle}::${params.toString()}`;
}

async function getAfterCursorForCollectionPage({
  storefront,
  url,
  page,
  pageBy,
  handle,
  filters,
  sortKey,
  reverse,
  country,
  language,
}: {
  storefront: any;
  url: URL;
  page: number;
  pageBy: number;
  handle: string;
  filters: ProductFilter[];
  sortKey: ProductCollectionSortKeys;
  reverse: boolean;
  country: string;
  language: string;
}) {
  if (page <= 1) return null;

  const cacheKey = buildCollectionsCacheKey(url, handle);
  const pageMap =
    collectionsCursorCache.get(cacheKey) ?? new Map<number, string | null>();
  collectionsCursorCache.set(cacheKey, pageMap);

  if (pageMap.has(page)) return pageMap.get(page) ?? null;
  if (!pageMap.has(1)) pageMap.set(1, null);

  let currentPage = 1;
  let after: string | null = null;

  for (const [p, c] of pageMap.entries()) {
    if (p < page && p >= currentPage) {
      currentPage = p;
      after = c ?? null;
    }
  }

  while (currentPage < page) {
    const res = await storefront.query(COLLECTION_PAGEINFO_QUERY, {
      variables: {
        handle,
        first: pageBy,
        after,
        filters,
        sortKey,
        reverse,
        country,
        language,
      },
    });

    const endCursor = res?.collection?.products?.pageInfo?.endCursor ?? null;
    const hasNextPage = !!res?.collection?.products?.pageInfo?.hasNextPage;

    const nextPage = currentPage + 1;
    pageMap.set(nextPage, endCursor);

    if (!hasNextPage) break;

    after = endCursor;
    currentPage = nextPage;
  }

  return pageMap.get(page) ?? null;
}

function buildFiltersFromProductNodes(nodes: any[], nodesForPrice?: any[]) {
  const optionMap: Record<string, Map<string, number>> = {};

  for (const product of nodes) {
    const variants = product?.variants?.nodes ?? [];
    for (const v of variants) {
      const selectedOptions = v?.selectedOptions ?? [];
      for (const opt of selectedOptions) {
        const name = String(opt?.name ?? '').trim();
        const value = String(opt?.value ?? '').trim();
        if (!name || !value) continue;
        const key = name.toLowerCase();
        optionMap[key] = optionMap[key] ?? new Map();
        const count = optionMap[key].get(value) ?? 0;
        optionMap[key].set(value, count + 1);
      }
    }
  }

  const filters: any[] = [];
  for (const [key, map] of Object.entries(optionMap)) {
    const values = Array.from(map.entries()).map(([value, count]) => {
      const input = JSON.stringify({variantOption: {name: key.charAt(0).toUpperCase() + key.slice(1), value}});
      const id = `filter.v.option.${key}.${value.replace(/\s+/g, '-').toLowerCase()}`;
      return {
        id,
        input,
        label: value,
        count,
      };
    });

    filters.push({
      id: `filter.v.option.${key}`,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      type: 'ENUM',
      values,
    });
  }

  // Calculate price limits dynamically and add PRICE_RANGE filter category
  const priceNodes = nodesForPrice || nodes;
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  for (const product of priceNodes) {
    const variants = product?.variants?.nodes ?? [];
    for (const v of variants) {
      const priceAmount = Number(v?.price?.amount);
      if (!isNaN(priceAmount)) {
        if (priceAmount < minPrice) minPrice = priceAmount;
        if (priceAmount > maxPrice) maxPrice = priceAmount;
      }
    }
  }

  if (minPrice === Infinity) minPrice = 0;
  if (maxPrice === -Infinity) maxPrice = 1000;

  minPrice = Math.floor(minPrice);
  maxPrice = Math.ceil(maxPrice);

  filters.push({
    id: 'filter.v.price',
    label: 'Price',
    type: 'PRICE_RANGE',
    values: [
      {
        id: 'filter.v.price',
        label: 'Price',
        count: 0,
        input: JSON.stringify({ price: { min: minPrice, max: maxPrice } })
      }
    ]
  });

  // Sort filters consistently to prevent the Price section from jumping to the bottom:
  // 1. Availability, 2. Price, 3. Size, 4. Color/Colour, 5. Others
  filters.sort((a, b) => {
    const idA = String(a.id || '').toLowerCase();
    const idB = String(b.id || '').toLowerCase();
    const labelA = String(a.label || '').toLowerCase();
    const labelB = String(b.label || '').toLowerCase();

    const getRank = (id: string, label: string) => {
      if (id.includes('availability') || label.includes('availability')) return 0;
      if (id.includes('price') || label.includes('price')) return 1;
      if (id.includes('size') || label.includes('size')) return 2;
      if (id.includes('color') || id.includes('colour') || label.includes('color') || label.includes('colour')) return 3;
      return 4;
    };

    return getRank(idA, labelA) - getRank(idB, labelB);
  });

  return filters;
}

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const pageBy = 24;
  const {collectionHandle} = params;
  const locale = context.storefront.i18n;

  invariant(collectionHandle, 'Missing collectionHandle param');

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = normalizePageParam(searchParams.get('page'));
  const cursor = searchParams.get('cursor');

  const {sortKey, reverse} = getSortValuesFromParam(
    searchParams.get('sort') as SortParam,
  );
  const rawPriceParam = searchParams.get(`${FILTER_URL_PREFIX}price`);
  const parsedPriceParam = (() => {
    if (!rawPriceParam) return null as any;
    try {
      return JSON.parse(rawPriceParam) as any;
    } catch {
      return null as any;
    }
  })();

  const coerceNumber = (v: unknown) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  };

  const requestedPriceBounds = (() => {
    const min = coerceNumber(parsedPriceParam?.min);
    const max = coerceNumber(parsedPriceParam?.max);
    if (
      typeof min === 'number' &&
      typeof max === 'number' &&
      Number.isFinite(min) &&
      Number.isFinite(max)
    ) {
      return min <= max ? {min, max} : {min: max, max: min};
    }
    if (typeof min === 'number' && Number.isFinite(min)) return {min};
    if (typeof max === 'number' && Number.isFinite(max)) return {max};
    return null;
  })();

  const useAnyVariantPriceFiltering = !!requestedPriceBounds;
  const filters = [...searchParams.entries()].reduce(
    (filters, [key, value]) => {
      if (key.startsWith(FILTER_URL_PREFIX)) {
        const filterKey = key.substring(FILTER_URL_PREFIX.length);
        if (filterKey === 'price') {
          try {
            const parsed = JSON.parse(value) as any;
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
            const price = {
              ...(min === undefined ? {} : {min}),
              ...(max === undefined ? {} : {max}),
            };
            // For custom any-variant price filtering we do NOT send Storefront price filter
            // because Storefront uses product minVariantPrice semantics.
            if (!useAnyVariantPriceFiltering) {
              filters.push({price} as ProductFilter);
            }
          } catch {
            // ignore invalid price filter
          }
        } else {
          filters.push({
            [filterKey]: JSON.parse(value),
          });
        }
      }
      return filters;
    },
    [] as ProductFilter[],
  );

  const storefrontFilters = filters;

  // Backward-compat/alias: accept Color/Colours query params like ?Color=Burnt+Gold or ?colour=Beige
  // and convert them into proper ProductFilter.variantOption entries.
  // Supports multiple values via repeated params or comma-separated list.
  const colorAliasKeys = [
    'Color', 'Colors', 'Colour', 'Colours',
    'color', 'colors', 'colour', 'colours',
  ];
  const canonicalMap: Record<string, string> = {
    color: 'Color', colors: 'Color', colour: 'Color', colours: 'Color',
    Color: 'Color', Colors: 'Color', Colour: 'Color', Colours: 'Color',
  };

  const dedupeHas = (arr: ProductFilter[], cand: ProductFilter) =>
    arr.some((f) => JSON.stringify(f) === JSON.stringify(cand));

  for (const k of colorAliasKeys) {
    const values = searchParams.getAll(k);
    if (!values || values.length === 0) continue;
    const name = canonicalMap[k] || 'Color';
    for (const raw of values) {
      if (!raw) continue;
      const expanded = raw
        .split(',')
        .map((s) => s.replace(/\+/g, ' ').trim())
        .filter(Boolean);
      for (const v of expanded) {
        const candidate = {variantOption: {name, value: v}} as unknown as ProductFilter;
        if (!dedupeHas(filters, candidate)) {
          filters.push(candidate);
        }
      }
    }
  }

  const COLLECTION_FETCH_CAP = 250;
  const seed = getOrGenerateSeed(request, url);

  const {collection, collections, colorSwatches} =
    await context.storefront.query(COLLECTION_QUERY, {
      variables: {
        first: COLLECTION_FETCH_CAP,
        after: null,
        handle: collectionHandle,
        filters: useAnyVariantPriceFiltering ? filters : storefrontFilters,
        sortKey,
        reverse,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
      cache: context.storefront.CacheNone(),
    });

  if (!collection) {
    throw new Response('collection', {status: 404});
  }

  const allNodes = collection.products?.nodes ?? [];
  let filteredNodes = allNodes;

  if (useAnyVariantPriceFiltering) {
    const {min, max} = requestedPriceBounds ?? {};
    const EPS = 0.000001;

    filteredNodes = allNodes.filter((product: any) => {
      const variantNodes = product?.variants?.nodes;
      if (!Array.isArray(variantNodes) || variantNodes.length === 0) return false;

      return variantNodes.some((v: any) => {
        const amt = Number(v?.price?.amount);
        if (!Number.isFinite(amt)) return false;
        if (typeof min === 'number' && amt + EPS < min) return false;
        if (typeof max === 'number' && amt - EPS > max) return false;
        return true;
      });
    });
  }

  // Check if explicit sort was requested by shopper
  const sortParam = searchParams.get('sort');
  const hasExplicitSort = Boolean(
    sortParam &&
    sortParam !== 'featured' &&
    sortParam !== 'best-selling' &&
    sortParam !== 'manual'
  );

  let processedNodes = filteredNodes;
  if (!hasExplicitSort) {
    // Default browsing: shuffle products so customers see different items on every visit/refresh
    const shuffled = shuffleArray(filteredNodes, seed);
    processedNodes = prioritizeGroupsThenUngroupedThenRemainder(
      shuffled,
      (p: any) => normalizeGroupFamilyKey(p),
      seed ^ 0x2f6e2b1,
    );
  }

  const computedTotalPages = Math.max(1, Math.ceil(processedNodes.length / pageBy));
  const effectivePage = Math.max(1, Math.min(page, computedTotalPages));
  const start = (effectivePage - 1) * pageBy;
  const end = start + pageBy;
  const pagedNodes = processedNodes.slice(start, end);

  const patchedCollection = {
    ...collection,
    products: {
      ...collection.products,
      nodes: pagedNodes,
      pageInfo: {
        ...collection.products.pageInfo,
        hasPreviousPage: effectivePage > 1,
        hasNextPage: effectivePage < computedTotalPages,
        endCursor: null,
      },
    },
  };

  try {
    const recomputed = buildFiltersFromProductNodes(pagedNodes, allNodes);
    (patchedCollection as any).products.filters = recomputed;
  } catch (e) {
    // If recompute fails, keep original filters as fallback
  }

  const seo = seoPayload.collection({collection: patchedCollection as any, url: request.url});

  const moId = new URL(request.url).searchParams.get('mo');
  const heroMeta: FeaturedCollection | null = moId
    ? await getFeaturedMetaobjectById(
        context.storefront,
        decodeURIComponent(moId),
      )
    : null;

  const allFilterValues = patchedCollection.products.filters.flatMap(
    (filter: any) => filter.values,
  );

  const appliedFilters = filters
    .map((filter) => {
      const foundValue = allFilterValues.find((value: any) => {
        const valueInput = JSON.parse(value.input as string) as ProductFilter;
        if (valueInput.price && filter.price) {
          return true;
        }
        return JSON.stringify(valueInput) === JSON.stringify(filter);
      });
      if (!foundValue) {
        return null;
      }

      if (foundValue.id === 'filter.v.price') {
        const input = JSON.parse(foundValue.input as string) as ProductFilter;
        const minLabel = parseAsCurrency(input.price?.min ?? 0, locale);
        const maxLabel = input.price?.max
          ? parseAsCurrency(input.price.max, locale)
          : '';
        const label = minLabel && maxLabel ? `${minLabel} - ${maxLabel}` : 'Price';
        return {filter, label};
      }
      return {filter, label: foundValue.label};
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);

  return json({
    collection: patchedCollection as any,
    appliedFilters,
    collections: flattenConnection(collections),
    heroMeta,
    colorSwatches,
    seo,
    storeDomain: (context as any)?.env?.PUBLIC_STORE_DOMAIN,
    totalPages: computedTotalPages,
    page: effectivePage,
    seed,
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Oxygen-Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

export default function Collection() {
  const {
    collection,
    appliedFilters,
    collections,
    heroMeta,
    colorSwatches,
    storeDomain,
    totalPages,
    page,
    seed,
  } = useLoaderData<typeof loader>();

  const introHeader = (collection as any)?.collectionIntroHeader?.value as
    | string
    | undefined;
  const introFooter = (collection as any)?.collectionIntroFooter?.value as
    | string
    | undefined;

  const fetcher = useFetcher<typeof loader>();
  const location = useLocation();
  const [items, setItems] = useState<any[]>(() => collection.products?.nodes ?? []);
  const [pageInfo, setPageInfo] = useState<any>(() => collection.products?.pageInfo);
  const [currentPage, setCurrentPage] = useState<number>(() => Number(page || 1) || 1);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const lastLoadKeyRef = useRef<string | null>(null);

  const activePriceRange = (() => {
    try {
      const sp = new URLSearchParams(location.search);
      const raw = sp.get(`${FILTER_URL_PREFIX}price`);
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
  })();

  useEffect(() => {
    setItems(collection.products?.nodes ?? []);
    setPageInfo(collection.products?.pageInfo);
    setCurrentPage(Number(page || 1) || 1);
    lastLoadKeyRef.current = null;
  }, [collection]);

  useEffect(() => {
    const nextNodes = (fetcher.data as any)?.collection?.products?.nodes;
    const nextPageInfo = (fetcher.data as any)?.collection?.products?.pageInfo;
    const nextPage = Number((fetcher.data as any)?.page);
    if (!Array.isArray(nextNodes) || nextNodes.length === 0) return;

    setItems((prev) => {
      const seen = new Set(prev.map((p: any) => p.id));
      const merged = [...prev];
      for (const p of nextNodes as any[]) {
        if (!seen.has(p.id)) merged.push(p);
      }
      return merged;
    });
    if (nextPageInfo) setPageInfo(nextPageInfo);
    if (Number.isFinite(nextPage) && nextPage > 0) setCurrentPage(nextPage);
  }, [fetcher.data]);

  const [params] = useSearchParams();
  const fromFeatured = params.get('from') === 'featured';

  const hasNextPage = Boolean(pageInfo?.hasNextPage);
  const endCursor = pageInfo?.endCursor as string | null | undefined;
  const isLoadingMore = fetcher.state !== 'idle';

  const loadMore = () => {
    if (!hasNextPage) return;
    if (isLoadingMore) return;

    const nextPage = (Number(currentPage) || 1) + 1;
    const loadKey = endCursor
      ? `cursor:${endCursor}`
      : `page:${String(nextPage)}:seed:${String(seed ?? '')}`;
    if (lastLoadKeyRef.current === loadKey) return;
    lastLoadKeyRef.current = loadKey;

    const sp = new URLSearchParams(location.search);

    if (endCursor) {
      sp.delete('page');
      sp.set('cursor', endCursor);
    } else {
      sp.delete('cursor');
      // Fallback for modes that don't provide cursors (e.g. custom price filtering)
      sp.set('page', String(nextPage));
    }
    if (seed) {
      sp.set('seed', String(seed));
    }

    fetcher.load(`${location.pathname}?${sp.toString()}`);
  };

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    if (!hasNextPage) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (fetcher.state !== 'idle') return;
        loadMore();
      },
      {
        root: null,
        rootMargin: '600px 0px',
        threshold: 0,
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, endCursor, isLoadingMore, location.search, location.pathname]);

  return (
    <>
      {/* Title */}
      <section className="py-8">
        <h1 className="text-center font-serif tracking-wide text-stone-800 text-3xl md:text-4xl">
          {collection.title?.toUpperCase()}
        </h1>
      </section>

      {introHeader ? (
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-8">
          <div className="text-[#463925] text-center">{renderIntroContent(introHeader)}</div>
        </section>
      ) : null}

      {/* Hero banner (only when coming from /featured) */}
      {fromFeatured && (
      <section className="px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto pb-6">
        <div className="grid md:grid-cols-[0.55fr_0.45fr] items-center gap-0 relative">
          {/* Left green text slab */}
          <div className="relative bg-[#2F4F3E] text-white p-8 md:p-12 lg:p-14 md:pr-32 lg:pr-[17rem] flex items-center h-[380px] md:h-[480px] z-10">
            {/* top notch */}
            <div className="relative z-50 space-y-6 max-w-prose pl-16">
              {heroMeta?.description ? (
                <p className="text-base md:text-lg leading-relaxed opacity-95 italic">{heroMeta.description}</p>
              ) : collection?.description ? (
                <p className="text-base md:text-lg leading-relaxed opacity-95 italic">{collection.description}</p>
              ) : null}
            </div>
          </div>

          {/* Right image with vertical green seam stripe and bottom notch */}
          <div className="relative h-[320px] md:h-[420px] overflow-hidden z-30">
            {heroMeta?.image ? (
              <Image
                data={heroMeta.image}
                alt={heroMeta.image.altText || heroMeta.name || collection.title}
                className="w-full h-full object-cover"
                sizes="(min-width: 1024px) 55vw, 100vw"
                loading="eager"
              />
            ) : heroMeta?.imageUrl ? (
              <img
                src={heroMeta.imageUrl}
                alt={heroMeta.name || collection.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : collection?.image ? (
              <Image
                data={collection.image}
                alt={collection.image.altText || collection.title}
                className="w-full h-full object-cover"
                sizes="(min-width: 1024px) 55vw, 100vw"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full bg-stone-200" />
            )}

            {/* overlay heading */}
            <div className="absolute inset-0 flex items-end md:items-center justify-end p-6 md:p-10">
              <h2 className="font-serif uppercase text-white text-3xl md:text-5xl lg:text-6xl leading-tight tracking-wide text-right drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                <span className="block">BEST</span>
                <span className="block">SELLERS OF</span>
                <span className="block">THE SEASON</span>
              </h2>
            </div>
          </div>
        </div>
      </section>
      )}

      <Section id="products">
        <SortFilter
            filters={collection.products.filters as Filter[]}
            appliedFilters={appliedFilters as any}
            collections={collections as any}
            resultsCount={(collection?.products?.nodes?.length) ?? 0}
            colorSwatches={colorSwatches}
        >
          <>
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-[#463925] text-xl font-medium">
                  No Products Are Available for selected filter
                </div>
                <div className="mt-4">
                  <Link
                    to={location.pathname}
                    className="inline-flex items-center px-6 py-2 border border-[#EAD8BB] bg-white text-[#463925] hover:bg-[#F7F1E8]"
                  >
                    Clear filters
                  </Link>
                </div>
              </div>
            ) : (
              <Grid layout="products" data-test="product-grid">
                {items.map((product: any, i: number) => (
                  <ProductCard
                    key={product.id}
                    product={product as any}
                    loading={getImageLoadingPriority(i)}
                    showDetailsButton={false}
                    colorSwatchData={colorSwatches}
                    storeDomain={storeDomain}
                    activePriceRange={activePriceRange}
                    collectionHandle={collection?.handle}
                    quickAdd
                  />
                ))}
              </Grid>
            )}

            {hasNextPage && items.length > 0 && (
              <div className="mt-10 sm:mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className={
                    `px-8 py-3 border border-[#EAD8BB] bg-white text-[#463925] ` +
                    (isLoadingMore ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#F7F1E8]')
                  }
                >
                  {isLoadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}

            {hasNextPage ? <div ref={loadMoreRef} /> : null}
          </>
        </SortFilter>
      </Section>

      {introFooter ? (
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-10">
          <div className="text-[#463925]">
            <CollapsibleIntroContent value={introFooter} />
          </div>
        </section>
      ) : null}

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </>
  );
}

function NumberedPagination({
  currentPage,
  hasPreviousPage,
  hasNextPage,
  totalPages,
}: {
  currentPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  totalPages: number | null;
}) {
  const location = useLocation();

  const createPageUrl = (page: number) => {
    const searchParams = new URLSearchParams(location.search);
    if (page <= 1) searchParams.delete('page');
    else searchParams.set('page', String(page));
    const qs = searchParams.toString();
    return `${location.pathname}${qs ? `?${qs}` : ''}`;
  };

  const basePages = [1, 2, 3, 4];
  const aroundCurrent = [currentPage - 1, currentPage, currentPage + 1].filter(
    (p) => p >= 1,
  );
  const lastPage = typeof totalPages === 'number' ? totalPages : null;

  const withLast = lastPage
    ? [...basePages, ...aroundCurrent, lastPage]
    : [...basePages, ...aroundCurrent];
  const pages = Array.from(new Set(withLast))
    .filter((p) => (lastPage ? p <= lastPage : true))
    .sort((a, b) => a - b);

  if (!hasPreviousPage && !hasNextPage && currentPage === 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-10 sm:mt-12">
      <Link
        to={createPageUrl(Math.max(1, currentPage - 1))}
        prefetch="intent"
        aria-label="Previous page"
        title="Previous page"
        aria-disabled={!hasPreviousPage}
        className={
          `h-10 w-10 border border-[#EAD8BB] bg-white text-[#463925] flex items-center justify-center ` +
          (!hasPreviousPage
            ? 'opacity-40 pointer-events-none'
            : 'hover:bg-[#F7F1E8]')
        }
      >
        ‹
      </Link>

      {pages.map((p, idx) => {
        const prev = pages[idx - 1];
        const needsEllipsis =
          idx > 0 && typeof prev === 'number' && p - prev > 1;
        const isActive = p === currentPage;
        return (
          <span key={p} className="flex items-center gap-2">
            {needsEllipsis && <span className="px-2 text-[#B7A58A]">…</span>}
            <Link
              to={createPageUrl(p)}
              prefetch="intent"
              aria-label={`Page ${p}`}
              className={
                `h-10 w-10 border flex items-center justify-center text-sm ` +
                (isActive
                  ? 'border-[#463925] text-[#463925] bg-white'
                  : 'border-[#EAD8BB] bg-white text-[#463925] hover:bg-[#F7F1E8]')
              }
            >
              {p}
            </Link>
          </span>
        );
      })}

      <Link
        to={createPageUrl(currentPage + 1)}
        prefetch="intent"
        aria-label="Next page"
        title="Next page"
        aria-disabled={!hasNextPage}
        className={
          `h-10 w-10 border border-[#EAD8BB] bg-white text-[#463925] flex items-center justify-center ` +
          (!hasNextPage
            ? 'opacity-40 pointer-events-none'
            : 'hover:bg-[#F7F1E8]')
        }
      >
        ›
      </Link>
    </div>
  );
}

const COLLECTION_QUERY = `#graphql
  query CollectionDetails(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
    $first: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      collectionIntroHeader: metafield(namespace: "custom", key: "collectionintroheader") {
        value
      }
      collectionIntroFooter: metafield(namespace: "custom", key: "collectionintrofooter") {
        value
      }
      seo {
        description
        title
      }
      image {
        id
        url
        width
        height
        altText
      }
      products(
        first: $first
        after: $after
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        filters {
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
          ...ProductCard
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    collections(first: 100) {
      edges {
        node {
          title
          handle
        }
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

const COLLECTION_PAGEINFO_QUERY = `#graphql
  query CollectionPageInfo(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
    $first: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(
        first: $first
        after: $after
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
` as const;

function getSortValuesFromParam(sortParam: SortParam | null): {
  sortKey: ProductCollectionSortKeys;
  reverse: boolean;
} {
  switch (sortParam) {
    case 'price-high-low':
      return {
        sortKey: 'PRICE',
        reverse: true,
      };
    case 'price-low-high':
      return {
        sortKey: 'PRICE',
        reverse: false,
      };
    case 'best-selling':
      return {
        sortKey: 'BEST_SELLING',
        reverse: false,
      };
    case 'newest':
      return {
        sortKey: 'CREATED',
        reverse: true,
      };
    case 'featured':
      return {
        sortKey: 'MANUAL',
        reverse: false,
      };
    default:
      return {
        sortKey: 'RELEVANCE',
        reverse: false,
      };
  }
}
