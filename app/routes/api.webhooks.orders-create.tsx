import {json, type ActionFunctionArgs} from '@shopify/remix-oxygen';

type BuyNowCleanupTarget = {
  cartId: string;
  variantId: string;
  quantity: number;
};

const CART_LINES_QUERY = `#graphql
  query CartLinesForWebhook($id: ID!) {
    cart(id: $id) {
      id
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
              }
            }
          }
        }
      }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `#graphql
  mutation CartLinesUpdateForWebhook($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `#graphql
  mutation CartLinesRemoveForWebhook($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function action({request, context}: ActionFunctionArgs) {
  try {
    const raw = await request.text();
    if (!raw) {
      return json({ok: true, reason: 'empty body'}, {status: 200});
    }

    let payload: any;
    try {
      payload = JSON.parse(raw);
    } catch {
      try {
        console.error('[webhooks.orders-create] invalid JSON payload');
      } catch {}
      return json({ok: true, reason: 'invalid json'}, {status: 200});
    }

    const lineItems: any[] = Array.isArray(payload?.line_items)
      ? payload.line_items
      : [];

    const targets: BuyNowCleanupTarget[] = [];

    for (const li of lineItems) {
      const properties: any[] = Array.isArray(li?.properties)
        ? li.properties
        : [];
      if (!properties.length) continue;

      const propMap: Record<string, string> = {};
      for (const prop of properties) {
        if (!prop || typeof prop !== 'object') continue;
        const key = String((prop as any).name ?? (prop as any).key ?? '');
        const value = String((prop as any).value ?? '');
        if (!key) continue;
        propMap[key] = value;
      }

      if (
        propMap['buy_now'] === 'true' &&
        propMap['hydrogen_persistent_cart_id'] &&
        propMap['buy_now_variant_id']
      ) {
        let qty = Number(propMap['buy_now_quantity'] || li.quantity || 0);
        if (!Number.isFinite(qty) || qty <= 0) qty = 1;

        targets.push({
          cartId: propMap['hydrogen_persistent_cart_id'],
          variantId: propMap['buy_now_variant_id'],
          quantity: qty,
        });
      }
    }

    if (!targets.length) {
      return json({ok: true, reason: 'no buy-now lines'}, {status: 200});
    }

    let processed = 0;
    for (const target of targets) {
      try {
        const didChange = await removeOrReduceBuyNowLine(
          context,
          target.cartId,
          target.variantId,
          target.quantity,
        );
        if (didChange) processed += 1;
      } catch (error: any) {
        try {
          console.error(
            '[webhooks.orders-create] cleanup failed for cart',
            target.cartId,
            'variant',
            target.variantId,
            error,
          );
        } catch {}
      }
    }

    return json({ok: true, processed}, {status: 200});
  } catch (error: any) {
    try {
      console.error('[webhooks.orders-create] unhandled error', error);
    } catch {}
    // Webhooks should generally return 200 to avoid retries when failures are local-only
    return json({ok: false}, {status: 200});
  }
}

async function removeOrReduceBuyNowLine(
  context: ActionFunctionArgs['context'],
  cartId: string,
  variantId: string,
  quantityToRemove: number,
): Promise<boolean> {
  const storefront: any = (context as any).storefront;
  if (!storefront) return false;

  const data = await storefront.query(CART_LINES_QUERY, {
    variables: {id: cartId},
    cache: storefront.CacheNone?.() ?? undefined,
  });

  const cart: any = (data as any)?.cart;
  if (!cart) return false;

  const edges: any[] = Array.isArray(cart.lines?.edges)
    ? cart.lines.edges
    : [];
  const lines: any[] = edges.map((e: any) => e?.node).filter(Boolean);

  const targetLine = lines.find((ln: any) => {
    const merchId: string | undefined =
      ln?.merchandise?.id ?? ln?.merchandiseId;
    return merchId === variantId;
  });

  if (!targetLine) {
    return false;
  }

  const currentQty: number = Number(targetLine.quantity || 0);
  if (!Number.isFinite(currentQty) || currentQty <= 0) {
    return false;
  }

  const newQty = currentQty - quantityToRemove;

  if (newQty > 0) {
    const result = await storefront.mutate(CART_LINES_UPDATE_MUTATION, {
      variables: {
        cartId,
        lines: [{id: targetLine.id, quantity: newQty}],
      },
    });
    const userErrors: any[] =
      (result as any)?.cartLinesUpdate?.userErrors ?? [];
    if (userErrors.length) {
      try {
        console.error(
          '[webhooks.orders-create] cartLinesUpdate userErrors',
          userErrors,
        );
      } catch {}
    }
    return true;
  } else {
    const result = await storefront.mutate(CART_LINES_REMOVE_MUTATION, {
      variables: {
        cartId,
        lineIds: [targetLine.id],
      },
    });
    const userErrors: any[] =
      (result as any)?.cartLinesRemove?.userErrors ?? [];
    if (userErrors.length) {
      try {
        console.error(
          '[webhooks.orders-create] cartLinesRemove userErrors',
          userErrors,
        );
      } catch {}
    }
    return true;
  }
}

