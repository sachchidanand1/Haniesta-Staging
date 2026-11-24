import {json, type ActionFunctionArgs, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {writeSavedCartItems, type SavedCartItem} from '~/lib/cart-metafield.server';

const PERSIST_COOLDOWN_MS = 2000; // 2s

async function persistNow(context: ActionFunctionArgs['context'] | LoaderFunctionArgs['context']) {
  try {
    // Auth: require customer login
    const loggedIn = await context.customerAccount.isLoggedIn();
    if (!loggedIn) return json({error: 'Not authenticated'}, {status: 401});

    // Rate limit via session
    const now = Date.now();
    const lastAt = (context.session.get('cartPersistAt') as number | undefined) ?? 0;
    if (now - lastAt < PERSIST_COOLDOWN_MS) {
      return json({error: 'Rate limited. Try again shortly.'}, {status: 429});
    }

    // Read current live cart and map to SavedCartItem[]
    const live = await context.cart.get();
    let lines: any[] = [];
    try {
      const conn: any = (live as any)?.lines ?? (live as any)?.cart?.lines;
      lines = Array.isArray(conn?.edges)
        ? conn.edges.map((e: any) => e?.node).filter(Boolean)
        : (conn?.nodes ?? []);
    } catch {}

    if (!lines?.length && (live as any)?.id) {
      try {
        const CART_LINES_QUERY = `#graphql
          query PersistCartLines($id: ID!) {
            cart(id: $id) {
              id
              lines(first: 100) {
                edges { node { quantity merchandise { ... on ProductVariant { id product { title } } } } }
              }
            }
          }
        `;
        const gqlCartId = String((live as any).id).split('?')[0];
        const data: any = await context.storefront.query(CART_LINES_QUERY, {
          variables: {id: gqlCartId},
        });
        const conn2: any = data?.cart?.lines;
        lines = Array.isArray(conn2?.edges)
          ? conn2.edges.map((e: any) => e?.node).filter(Boolean)
          : (conn2?.nodes ?? []);
      } catch {}
    }

    const items: SavedCartItem[] = (lines || [])
      .map((ln: any) => {
        const variantId = ln?.merchandise?.id ?? ln?.merchandiseId;
        const quantity = ln?.quantity ?? 0;
        const productTitle = ln?.merchandise?.product?.title ?? ln?.merchandise?.title ?? undefined;
        if (!variantId || !quantity) return null;
        return {variantId, quantity, productTitle} as SavedCartItem;
      })
      .filter(Boolean) as SavedCartItem[];

    await writeSavedCartItems(context, items);

    // Set cooldown
    context.session.set('cartPersistAt', now);

    //try { console.log('[api.cart.persist] itemsCount:', items.length); } catch {}
    return json({success: true, itemsCount: items.length, message: 'Cart saved to metafield'});
  } catch (e: any) {
    return json({error: String(e?.message || e)}, {status: 500});
  }
}

export async function action({context}: ActionFunctionArgs) {
  return persistNow(context);
}
