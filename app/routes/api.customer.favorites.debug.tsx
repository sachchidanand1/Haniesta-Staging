import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {adminGraphQL} from '~/lib/admin.server';

export async function loader({context}: LoaderFunctionArgs) {
  try {
    const customerId = context.session.get('customerId') as string | undefined;
    const sessionFavorites = (context.session.get('favorites') as string[] | undefined) ?? [];

    // console.log('Debug endpoint - customerId from session:', customerId);
    // console.log('Debug endpoint - sessionFavorites:', sessionFavorites);

    if (!customerId) {
      return json({source: 'session', customerId: null, favorites: sessionFavorites});
    }

    const query = `
      query getCustomerMetafield($customerId: ID!) {
        customer(id: $customerId) {
          id
          metafield(namespace: "favorites", key: "favorite_products") {
            id
            namespace
            key
            type
            value
          }
        }
      }
    `;

    // console.log('Debug endpoint - querying admin metafield for customerId:', customerId);
    const data = await adminGraphQL<{customer?: {id: string; metafield?: {id: string; namespace: string; key: string; type: string; value: string} | null} | null}>(
      context,
      query,
      {customerId},
    );

    // console.log('Debug endpoint - admin query result:', data);
    const raw = data?.customer?.metafield?.value;
    let favorites: string[] = [];
    try {
      favorites = raw ? (JSON.parse(raw) as string[]) : [];
      // console.log('Debug endpoint - parsed favorites:', favorites);
    } catch (e) {
      console.log('Debug endpoint - error parsing favorites:', e);
    }

    return json({
      source: 'admin',
      customerId,
      metafield: data?.customer?.metafield ?? null,
      favorites,
      sessionFavorites,
    });
  } catch (e: any) {
    return json({error: true, message: String(e?.message || e)}, {status: 500});
  }
}


