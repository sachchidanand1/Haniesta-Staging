import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

import {
  PRODUCT_CARD_FRAGMENT,
  FEATURED_COLLECTION_FRAGMENT,
} from '~/data/fragments';

const FEATURED_COLOR_SWATCHES_QUERY = `#graphql
  query FeaturedColorSwatches($country: CountryCode, $language: LanguageCode)
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

import {shuffleArray} from '~/lib/shuffle';

export async function loader({context: {storefront, env}}: LoaderFunctionArgs) {
  return json(await getFeaturedData(storefront, env), {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

export async function getFeaturedData(
  storefront: LoaderFunctionArgs['context']['storefront'],
  env: LoaderFunctionArgs['context']['env'] | undefined,
  variables: {pageBy?: number} = {},
) {
  const [featuredData, colorSwatchesData] = await Promise.all([
    storefront.query(FEATURED_ITEMS_QUERY, {
      variables: {
        pageBy: 24,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
        ...variables,
      },
      cache: storefront.CacheNone(),
    }),
    storefront.query(FEATURED_COLOR_SWATCHES_QUERY, {
      variables: {
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    }),
  ]);

  invariant(featuredData, 'No featured items data returned from Shopify API');

  const shuffledProducts = featuredData.featuredProducts?.nodes
    ? shuffleArray(featuredData.featuredProducts.nodes).slice(0, 12)
    : [];

  return {
    ...featuredData,
    featuredProducts: {
      ...featuredData.featuredProducts,
      nodes: shuffledProducts,
    },
    colorSwatches: colorSwatchesData?.colorSwatches ?? {nodes: []},
    storeDomain: env?.PUBLIC_STORE_DOMAIN,
  };
}

export type FeaturedData = Awaited<ReturnType<typeof getFeaturedData>>;

export const FEATURED_ITEMS_QUERY = `#graphql
  query FeaturedItems(
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int = 12
  ) @inContext(country: $country, language: $language) {
    featuredCollections: collections(first: 3, sortKey: UPDATED_AT) {
      nodes {
        ...FeaturedCollectionDetails
      }
    }
    featuredProducts: products(first: $pageBy) {
      nodes {
        ...ProductCard
      }
    }
  }

  ${PRODUCT_CARD_FRAGMENT}
  ${FEATURED_COLLECTION_FRAGMENT}
` as const;
