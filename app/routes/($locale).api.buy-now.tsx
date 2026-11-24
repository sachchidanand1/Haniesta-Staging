import {type ActionFunctionArgs, json, redirect} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

export async function action({request, context}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  const formData = await request.formData();
  const variantId = formData.get('variantId');
  const quantityRaw = formData.get('quantity');

  // try {
  //   console.log('[buy-now] action hit', {
  //     url: request.url,
  //     method: request.method,
  //     variantIdType: typeof variantId,
  //     hasVariantId: typeof variantId === 'string' && variantId.length > 0,
  //     quantityRaw,
  //   });
  // } catch {}

  invariant(typeof variantId === 'string' && variantId.length > 0, 'Missing variantId');

  let quantity = 1;
  if (typeof quantityRaw === 'string' && quantityRaw) {
    const parsed = parseInt(quantityRaw, 10);
    if (Number.isFinite(parsed) && parsed > 0) quantity = parsed;
  }

  // Merge into the shopper's existing cart so the item is still there
  // if they abandon checkout. Capture the persistent cart ID so that
  // a later webhook (on successful order) can clean this line back out.
  let persistentCartId: string | undefined;
  try {
    const {cart} = context;
    const existing = await cart.get();

    if (existing?.id) {
      persistentCartId = String(existing.id);
      // If the line already exists in the cart, override its quantity (do not increment).
      // Otherwise add it as a new line.
      const conn: any = (existing as any)?.lines;
      const liveLines: any[] = Array.isArray(conn?.edges)
        ? conn.edges.map((e: any) => e?.node).filter(Boolean)
        : (conn?.nodes ?? []);
      const found = liveLines.find((ln: any) => {
        const merchId: string | undefined = ln?.merchandise?.id ?? ln?.merchandiseId;
        return merchId === variantId;
      });

      if (found?.id) {
        const result = await cart.updateLines([{id: found.id, quantity}]);
        try {
          const cartResult: any = (result as any)?.cart ?? result;
          if (cartResult?.id) persistentCartId = String(cartResult.id);
        } catch {}
      } else {
        const result = await cart.addLines([{merchandiseId: variantId, quantity}]);
        try {
          const cartResult: any = (result as any)?.cart ?? result;
          if (cartResult?.id) persistentCartId = String(cartResult.id);
        } catch {}
      }
    } else {
      const result = await cart.create({
        lines: [{merchandiseId: variantId, quantity}],
      });
      try {
        const cartResult: any = (result as any)?.cart ?? result;
        if (cartResult?.id) {
          persistentCartId = String(cartResult.id);
        }
      } catch {}
    }
  } catch (error: any) {
    try {
      console.error('[buy-now] failed to merge into existing cart', error);
    } catch {}
    // Non-fatal: still allow Buy Now checkout to proceed
  }

  const CART_CREATE_MUTATION = `#graphql
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  let result: any;
  try {
    // const buyNowLineAttributes: Array<{key: string; value: string}> = [
    //   {key: 'buy_now', value: 'true'},
    //   {key: 'buy_now_variant_id', value: variantId},
    //   {key: 'buy_now_quantity', value: String(quantity)},
    // ];

    // if (persistentCartId) {
    //   buyNowLineAttributes.push({
    //     key: 'hydrogen_persistent_cart_id',
    //     value: persistentCartId,
    //   });
    // }

    result = await context.storefront.mutate(CART_CREATE_MUTATION, {
      variables: {
        input: {
          lines: [
            {
              merchandiseId: variantId,
              quantity,
              // attributes: buyNowLineAttributes,
            },
          ],
        },
      },
    });
  } catch (error: any) {
    try {
      console.error('[buy-now] storefront.mutate failed', error);
    } catch {}
    return json(
      {
        error: 'Storefront API request failed',
        message: error?.message,
      },
      {status: 500},
    );
  }

  const cart = result?.cartCreate?.cart;
  const errors = result?.cartCreate?.userErrors || [];

  // try {
  //   console.log('[buy-now] cartCreate result', {
  //     hasCart: Boolean(cart),
  //     checkoutUrl: cart?.checkoutUrl,
  //     errorsCount: Array.isArray(errors) ? errors.length : 0,
  //     firstError: errors?.[0],
  //   });
  // } catch {}

  if (!cart?.checkoutUrl) {
    const message = errors?.[0]?.message || 'Failed to create checkout';
    return json({error: message, userErrors: errors}, {status: 400});
  }

  return redirect(cart.checkoutUrl);
}

export function loader() {
  return json({error: 'Method not allowed'}, {status: 405});
}
