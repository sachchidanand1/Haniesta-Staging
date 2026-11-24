import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import type {ProductSortKeys} from '@shopify/hydrogen/storefront-api-types';
import {flattenConnection} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';

import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {shuffleArray} from '~/lib/shuffle';

const API_COLOR_SWATCHES_QUERY = `#graphql
  query ApiColorSwatches($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
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
` as const;

/**
 * Fetch a given set of products from the storefront API
 * Also returns color swatches so ProductCards can show swatch images (e.g. Cart "Shop Best Sellers").
 * @param count
 * @param query
 * @param reverse
 * @param sortKey
 * @returns { products, colorSwatches?, storeDomain? }
 * @see https://shopify.dev/api/storefront/current/queries/products
 */
export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const {storefront, env} = context as {storefront: any; env?: {PUBLIC_STORE_DOMAIN?: string}};
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const query = searchParams.get('query') ?? '';
  const sortKey =
    (searchParams.get('sortKey') as null | ProductSortKeys) ?? 'BEST_SELLING';

  let reverse = false;
  try {
    const _reverse = searchParams.get('reverse');
    if (_reverse === 'true') {
      reverse = true;
    }
  } catch (_) {
    // noop
  }

  let count = 4;
  try {
    const _count = searchParams.get('count');
    if (typeof _count === 'string') {
      count = parseInt(_count);
    }
  } catch (_) {
    // noop
  }


  let productsResult: any = null;
  let colorSwatchesResult: any = null;

  try {
    const results = await Promise.all([
      storefront.query(API_ALL_PRODUCTS_QUERY, {
        variables: {
          count: Math.max(count * 3, 24),
          query,
          reverse,
          sortKey,
          country: storefront.i18n.country,
          language: storefront.i18n.language,
        },
        cache: storefront.CacheNone(),
      }),
      storefront.query(API_COLOR_SWATCHES_QUERY, {
        variables: {
          country: storefront.i18n.country,
          language: storefront.i18n.language,
        },
        cache: storefront.CacheLong(),
      }).catch(() => null),
    ]);
    productsResult = results[0];
    colorSwatchesResult = results[1];
  } catch (err) {
    console.error('Error fetching API products:', err);
    return json({
      products: [],
      colorSwatches: {nodes: []},
      storeDomain: env?.PUBLIC_STORE_DOMAIN ?? undefined,
    });
  }

  const rawProducts = productsResult?.products ? flattenConnection(productsResult.products) : [];
  const shuffled = shuffleArray(rawProducts).slice(0, count);
  const colorSwatches = colorSwatchesResult?.colorSwatches ?? {nodes: []};

  return json({
    products: shuffled,
    colorSwatches,
    storeDomain: env?.PUBLIC_STORE_DOMAIN ?? undefined,
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

const API_ALL_PRODUCTS_QUERY = `#graphql
  query ApiAllProducts(
    $query: String
    $count: Int
    $reverse: Boolean
    $country: CountryCode
    $language: LanguageCode
    $sortKey: ProductSortKeys
  ) @inContext(country: $country, language: $language) {
    products(first: $count, sortKey: $sortKey, reverse: $reverse, query: $query) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

// no-op
export default function ProductsApiRoute() {
  return null;
}
