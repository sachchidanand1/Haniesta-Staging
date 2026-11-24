import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {writeSavedCartItems, type SavedCartItem} from '~/lib/cart-metafield.server';

export async function loader({context, request}: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const handle = url.searchParams.get('handle');
    const qty = Number(url.searchParams.get('qty') || '1');

    if (!handle) {
      return json({error: 'Missing ?handle=product-handle'}, {status: 400});
    }

    const QUERY = `#graphql
      query getProductForAdd($handle: String!, $language: LanguageCode) @inContext(language: $language) {
        product(handle: $handle) {
          id
          title
          selectedOrFirstAvailableVariant {
            id
            availableForSale
          }
        }
      }
    `;

    const data = await context.storefront.query(QUERY, {
      variables: {handle, language: context.storefront.i18n.language},
    });

    const variantId: string | undefined = (data as any)?.product?.selectedOrFirstAvailableVariant?.id;
    const available: boolean = Boolean((data as any)?.product?.selectedOrFirstAvailableVariant?.availableForSale);
    if (!variantId) {
      return json({error: 'No variant found for handle', handle}, {status: 404});
    }
    if (!available) {
      return json({error: 'Variant not available for sale', handle, variantId}, {status: 409});
    }

    const result = await context.cart.addLines([{merchandiseId: variantId, quantity: Math.max(1, qty)}]);
    const headers = context.cart.setCartId(result.cart.id);

    // If logged in, also persist immediately to metafield for easier debugging
    let persisted = false;
    let itemsCount = 0;
    try {
      const loggedIn = await context.customerAccount.isLoggedIn();
      if (loggedIn) {
        // Extract lines from mutation result, fallback to live and storefront query
        let lines: any[] = [];
        try {
          const connRes: any = result?.cart?.lines;
          lines = Array.isArray(connRes?.edges)
            ? connRes.edges.map((e: any) => e?.node).filter(Boolean)
            : (connRes?.nodes ?? []);
        } catch {}

        if (!lines?.length) {
          try {
            const live = await context.cart.get();
            const conn: any = (live as any)?.lines ?? (live as any)?.cart?.lines;
            lines = Array.isArray(conn?.edges)
              ? conn.edges.map((e: any) => e?.node).filter(Boolean)
              : (conn?.nodes ?? []);
          } catch {}
        }

        if (!lines?.length) {
          try {
            const CART_LINES_QUERY = `#graphql
              query AddByHandleCartLines($id: ID!) {
                cart(id: $id) {
                  id
                  lines(first: 100) {
                    edges { node { quantity merchandise { ... on ProductVariant { id product { title } } } } }
                  }
                }
              }
            `;
            const gqlCartId = String(result?.cart?.id ?? '').split('?')[0];
            if (gqlCartId) {
              const data: any = await context.storefront.query(CART_LINES_QUERY, {
                variables: {id: gqlCartId},
              });
              const conn2: any = data?.cart?.lines;
              lines = Array.isArray(conn2?.edges)
                ? conn2.edges.map((e: any) => e?.node).filter(Boolean)
                : (conn2?.nodes ?? []);
            }
          } catch {}
        }

        const items: SavedCartItem[] = (lines || [])
          .map((ln: any) => {
            const vId = ln?.merchandise?.id ?? ln?.merchandiseId;
            const q = ln?.quantity ?? 0;
            const title = ln?.merchandise?.product?.title ?? ln?.merchandise?.title ?? undefined;
            if (!vId || !q) return null;
            return {variantId: vId, quantity: q, productTitle: title} as SavedCartItem;
          })
          .filter(Boolean) as SavedCartItem[];
        await writeSavedCartItems(context, items);
        persisted = true;
        itemsCount = items.length;
      }
    } catch {}

    return json({
      success: true,
      message: 'Line added to cart',
      productHandle: handle,
      variantId,
      totalQuantity: result.cart.totalQuantity,
      persisted,
      itemsCount,
    }, {headers});
  } catch (e: any) {
    return json({error: String(e?.message || e)}, {status: 500});
  }
}
