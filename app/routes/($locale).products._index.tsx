import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useFetcher, useLoaderData} from '@remix-run/react';
import {useEffect, useRef, useState} from 'react';
import invariant from 'tiny-invariant';
import {
  getSeoMeta,
} from '@shopify/hydrogen';

import {ProductCard} from '~/components/ProductCard';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {
  getOrGenerateSeed,
  shuffleArray,
  prioritizeGroupsThenUngroupedThenRemainder,
  normalizeGroupFamilyKey,
} from '~/lib/shuffle';

const PAGE_BY = 32;

export const headers = routeHeaders;

export async function loader({request, context}: LoaderFunctionArgs) {
  const {storefront, env} = context;
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');
  const seed = getOrGenerateSeed(request, url);

  const page = cursor?.startsWith('page:') ? Math.max(1, Number(cursor.replace('page:', '')) || 1) : 1;

  // Fetch all products across the catalog in one fast query (catalog has 77 products total)
  const data = await storefront.query(ALL_PRODUCTS_QUERY, {
    variables: {
      country: storefront.i18n.country,
      language: storefront.i18n.language,
      first: 250,
      after: null,
    },
    cache: storefront.CacheNone(),
  });

  invariant(data, 'No data returned from Shopify API');

  const allNodes = data.products?.nodes ?? [];
  const shuffledNodes = shuffleArray(allNodes, seed);
  const rearrangedNodes = prioritizeGroupsThenUngroupedThenRemainder(
    shuffledNodes,
    (p: any) => normalizeGroupFamilyKey(p),
    seed ^ 0x2f6e2b1,
  );

  const start = (page - 1) * PAGE_BY;
  const end = start + PAGE_BY;
  const pagedNodes = rearrangedNodes.slice(start, end);
  const hasNextPage = end < rearrangedNodes.length;
  const nextCursor = hasNextPage ? `page:${page + 1}` : null;

  const products = {
    ...data.products,
    nodes: pagedNodes,
    pageInfo: {
      ...data.products.pageInfo,
      hasNextPage,
      hasPreviousPage: page > 1,
      endCursor: nextCursor,
    },
  };

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
      id: 'all-products',
      title: 'All Products',
      handle: 'products',
      descriptionHtml: 'All the store products',
      description: 'All the store products',
      seo: {
        title: 'All Products',
        description: 'All the store products',
      },
      metafields: [],
      products,
      updatedAt: '',
    },
  });

  return json({
    products,
    colorSwatches: data.colorSwatches,
    seo,
    storeDomain: env?.PUBLIC_STORE_DOMAIN,
    seed,
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Oxygen-Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  const seoEntries = (matches || [])
    .map((m) => (m.data as any)?.seo)
    .filter(Boolean) as any[];
  if (seoEntries.length > 0) return getSeoMeta(...seoEntries);
  return [
    {title: 'All Products'},
    {name: 'description', content: 'All the store products'},
  ];
};

export default function AllProducts() {
  const {products, colorSwatches, storeDomain, seed} = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof loader>();
  const [items, setItems] = useState<any[]>(() => products?.nodes ?? []);
  const [pageInfo, setPageInfo] = useState(() => products?.pageInfo);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setItems(products?.nodes ?? []);
    setPageInfo(products?.pageInfo);
  }, [products]);

  useEffect(() => {
    const next = fetcher.data?.products;
    if (!next?.nodes?.length) return;
    setItems((prev) => {
      const seen = new Set(prev.map((p: any) => p.id));
      const merged = [...prev];
      for (const p of next.nodes as any[]) {
        if (!seen.has(p.id)) merged.push(p);
      }
      return merged;
    });
    setPageInfo(next.pageInfo);
  }, [fetcher.data]);

  const hasNextPage = Boolean(pageInfo?.hasNextPage);
  const endCursor = pageInfo?.endCursor as string | null | undefined;
  const isLoadingMore = fetcher.state !== 'idle';

  const loadMore = () => {
    if (!hasNextPage || !endCursor) return;
    if (isLoadingMore) return;
    const params = new URLSearchParams();
    params.set('cursor', endCursor);
    params.set('seed', String(seed));
    fetcher.load(`?${params.toString()}`);
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
        loadMore();
      },
      {
        // Start loading before user hits absolute bottom
        root: null,
        rootMargin: '600px 0px',
        threshold: 0,
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, endCursor, seed, isLoadingMore]);

  return (
    <div className="bg-white">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-800 mb-2">
          All Products
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Explore our complete collection of premium rugs
        </p>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10" data-test="product-grid">
          {items.map((product: any, i: number) => (
            <ProductCard
              key={(product as any).id}
              product={product as any}
              loading={getImageLoadingPriority(i)}
              colorSwatchData={colorSwatches}
              storeDomain={storeDomain}
              quickAdd
            />
          ))}
        </div>

        {hasNextPage && (
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

        {/* Infinite scroll sentinel */}
        {hasNextPage ? <div ref={loadMoreRef} /> : null}
      </div>
    </div>
  );
}

const ALL_PRODUCTS_QUERY = `#graphql
  query IndexAllProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $after: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $after) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
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

const ALL_PRODUCTS_PAGEINFO_QUERY = `#graphql
  query AllProductsPageInfo(
    $country: CountryCode
    $language: LanguageCode
    $first: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
` as const;

const ALL_PRODUCTS_TOTAL_COUNT_QUERY = `#graphql
  query AllProductsTotalCount(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    search(query: "", types: [PRODUCT], first: 1) {
      totalCount
    }
  }
` as const;
