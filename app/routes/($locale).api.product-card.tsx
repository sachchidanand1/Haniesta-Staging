import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

const API_PRODUCT_CARD_QUERY = `#graphql
  query ApiProductCard(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductCard
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

export async function loader({request, context}: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const handle = url.searchParams.get('handle') ?? '';
    if (!handle) return json({product: null});

    const result = await context.storefront.query(API_PRODUCT_CARD_QUERY, {
      variables: {
        handle,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
      cache: context.storefront.CacheLong(),
    });

    return json({product: (result as any)?.product ?? null});
  } catch (err) {
    console.error('Error in api.product-card loader:', err);
    return json({product: null});
  }
}

export default function ProductCardApiRoute() {
  return null;
}
