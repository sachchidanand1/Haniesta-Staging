import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

// GET /api/customer/favorites/products?ids=gid1,gid2
export async function loader({request, context}: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const idsParam = url.searchParams.get('ids') || '';
    const ids = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!ids.length) return json({nodes: []});

    const QUERY = `#graphql
      query CustomerFavoritesProducts($ids: [ID!]!, $language: LanguageCode)
      @inContext(language: $language) {
        nodes(ids: $ids) {
          ... on Product {
            id
            handle
            title
            vendor
            publishedAt
            featuredImage { url altText }
            variants(first: 1) {
              nodes { id price { amount currencyCode } compareAtPrice { amount currencyCode } availableForSale image { url altText } }
            }
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
          }
        }
      }
    ` as const;

    const data = await context.storefront.query(QUERY, {
      variables: {ids, language: context.storefront.i18n.language},
    });

    return json({nodes: (data as any)?.nodes || []});
  } catch (e) {
    return json({error: 'Failed to fetch products'}, {status: 500});
  }
}


