import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json,
} from '@shopify/remix-oxygen';
import {CartForm, type CartQueryDataReturn, Analytics} from '@shopify/hydrogen';
import {Text, Heading} from '~/components/Text';
import {isLocalPath} from '~/lib/utils';
import {Cart} from '~/components/Cart';
import {type SavedCartItem, writeSavedCartItems, readSavedCartItems} from '~/lib/cart-metafield.server';

 type CartAction = NonNullable<ReturnType<typeof CartForm.getFormInput>['action']>;

 function isCartAction(value: string): value is CartAction {
   const actions = Object.values(CartForm.ACTIONS) as string[];
   return actions.includes(value) || value.startsWith('Custom');
 }

export async function action({request, context}: ActionFunctionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  let {action, inputs} = CartForm.getFormInput(formData);
  if (!action) {
    const legacy = formData.get('cartAction');
    if (typeof legacy === 'string' && legacy) {
      if (legacy === 'discountCodeUpdate') {
        action = CartForm.ACTIONS.DiscountCodesUpdate;
      } else if (isCartAction(legacy)) {
        action = legacy;
      }
    }
  }
  if (!action) {
    const raw = formData.get('action');
    if (typeof raw === 'string' && raw) {
      if (raw === 'discountCodeUpdate') {
        action = CartForm.ACTIONS.DiscountCodesUpdate;
      } else if (isCartAction(raw)) {
        action = raw;
      }
    }
  }

  // If Hydrogen couldn't parse inputs, try parsing raw JSON string.
  if (!inputs || typeof inputs !== 'object') {
    const rawInputs = formData.get('inputs');
    if (typeof rawInputs === 'string' && rawInputs.trim()) {
      try {
        inputs = JSON.parse(rawInputs) as any;
      } catch {}
    }
  }
  if (!action) {
    return json({error: 'No cartAction defined'}, {status: 200});
  }

  let status = 200;
  let result: CartQueryDataReturn;

  // Debug logging: capture incoming cart action
  // try {
  //   console.log('[cart.action] action:', action, 'inputs:', JSON.stringify(inputs));
  // } catch {}

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines((inputs as any).lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines((inputs as any).lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines((inputs as any).lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate:
      const formDiscountCode = (inputs as any).discountCode;

      // try {
      //   console.log('[cart.action][discount] raw inputs:', inputs);
      // } catch {}

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      const existingCodes = Array.isArray((inputs as any).discountCodes)
        ? ((inputs as any).discountCodes as string[])
        : [];
      discountCodes.push(...existingCodes);

      // try {
      //   console.log('[cart.action][discount] applying codes:', {
      //     formDiscountCode,
      //     existingCodes,
      //     finalCodes: discountCodes,
      //   });
      // } catch {}

      result = await cart.updateDiscountCodes(discountCodes);

      // Some Hydrogen versions don't return discountCodes in the mutation payload.
      // Re-fetch the cart so the client can reliably render applied / not-applicable.
      try {
        const freshCart: any = await cart.get();
        if (freshCart && (freshCart as any)?.id) {
          (result as any).cart = freshCart;
        }
      } catch {}

      // If the submitted code is invalid/non-applicable, don't keep it on the cart.
      // Use the fresh cart snapshot (authoritative) instead of the mutation payload.
      try {
        const cartSnapshot: any = (result as any)?.cart;
        const dc = cartSnapshot?.discountCodes as
          | Array<{code?: string; applicable?: boolean}>
          | undefined;
        const anyApplicable = Array.isArray(dc) && dc.some((d) => Boolean(d?.applicable));
        if (formDiscountCode && !anyApplicable) {
          result = await cart.updateDiscountCodes([]);

          // Surface a message back to the client so it can display the invalid-code error.
          const nextErrors = Array.isArray((result as any).errors)
            ? (result as any).errors
            : [];
          (result as any).errors = [...nextErrors, "Discount code isn't valid"];

          // Refresh snapshot after clearing
          try {
            const cleared: any = await cart.get();
            if (cleared && cleared?.id) (result as any).cart = cleared;
          } catch {}
        }
      } catch {}

      // try {
      //   const dc = (result as any)?.cart?.discountCodes;
      //   console.log('[cart.action][discount] result discountCodes:', dc);
      // } catch {}
      break;
    case CartForm.ACTIONS.BuyerIdentityUpdate:
      result = await cart.updateBuyerIdentity({
        ...((inputs as any).buyerIdentity || {}),
      });
      break;
    default:
      invariant(false, `${action} cart action is not defined`);
  }

  /**
   * The Cart ID may change after each mutation. We need to update it each time in the session.
   */
  const cartId = result.cart.id;
  const headers = cart.setCartId(result.cart.id);

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string' && isLocalPath(redirectTo)) {
    status = 303;
    headers.set('Location', redirectTo);
  }

  const {cart: cartResult, errors, userErrors} = result;
  // try {
  //   console.log('[cart.action] result cart id:', cartResult?.id, 'totalQuantity:', cartResult?.totalQuantity);
  //   if (errors?.length) console.warn('[cart.action] errors:', errors);
  //   if (userErrors?.length) console.warn('[cart.action] userErrors:', userErrors);
  // } catch {}

  // Persist cart to customer metafield (logged-in only) on every mutation for immediate consistency.
  try {
    const loggedIn = await context.customerAccount.isLoggedIn();
    if (loggedIn) {
      // Prefer lines from mutation result if present,
      // otherwise fetch by cartId via Storefront to ensure we have nodes.
      let lines: any[] = [];
      let snapshotUpdatedAt: string | undefined;
      // 1) Use mutation result lines first (most up-to-date for this request)
      try {
        const connRes: any = cartResult?.lines;
        lines = Array.isArray(connRes?.edges)
          ? connRes.edges.map((e: any) => e?.node).filter(Boolean)
          : (connRes?.nodes ?? []);
        snapshotUpdatedAt = (cartResult as any)?.updatedAt ?? snapshotUpdatedAt;
      } catch {}

      // 2) Fallback to live cart from session API (often most up-to-date immediately after mutation)
      if (!lines?.length) {
        try {
          const live = await cart.get();
          const conn3: any = (live as any)?.lines;
          lines = Array.isArray(conn3?.edges)
            ? conn3.edges.map((e: any) => e?.node).filter(Boolean)
            : (conn3?.nodes ?? []);
          snapshotUpdatedAt = (live as any)?.updatedAt ?? snapshotUpdatedAt;
        } catch {}
      }

      // 3) Fallback to fresh snapshot via Storefront (authoritative, no-cache)
      if (!lines?.length) {
        try {
          // Slightly longer delay to avoid eventual consistency returning the pre-mutation snapshot
          await new Promise((r) => setTimeout(r, 150));
          const CART_LINES_QUERY = `#graphql
            query RouteCartLines($id: ID!) {
              cart(id: $id) {
                id
                updatedAt
                lines(first: 100) {
                  edges { node { quantity merchandise { ... on ProductVariant { id product { title } } } } }
                }
              }
            }
          `;
          const gqlCartId = String(cartId).split('?')[0];
          const data: any = await context.storefront.query(CART_LINES_QUERY, {
            variables: {id: gqlCartId},
            cache: context.storefront.CacheNone(),
          });
          const conn2: any = data?.cart?.lines;
          lines = Array.isArray(conn2?.edges)
            ? conn2.edges.map((e: any) => e?.node).filter(Boolean)
            : (conn2?.nodes ?? []);
          snapshotUpdatedAt = data?.cart?.updatedAt ?? snapshotUpdatedAt;
        } catch {}
      }

      // Guard against stale writes: if we have a newer saved snapshot, skip
      try {
        const lastSavedUpdatedAt = context.session.get('cartSavedUpdatedAt') as string | undefined;
        if (lastSavedUpdatedAt && snapshotUpdatedAt) {
          const lastTs = Date.parse(lastSavedUpdatedAt);
          const snapTs = Date.parse(snapshotUpdatedAt);
          if (Number.isFinite(lastTs) && Number.isFinite(snapTs) && snapTs < lastTs) {
            // try { console.log('[cart.action] skip persist (stale snapshot). snap:', snapshotUpdatedAt, 'last:', lastSavedUpdatedAt); } catch {}
            return json(
              {
                cart: cartResult,
                userErrors,
                errors,
              },
              {status, headers},
            );
          }
        }
      } catch {}

      const items: SavedCartItem[] = (lines || [])
        .map((ln: any) => {
          const variantId = ln?.merchandise?.id ?? ln?.merchandiseId;
          const quantity = ln?.quantity ?? 0;
          const productTitle = ln?.merchandise?.product?.title ?? ln?.merchandise?.title ?? undefined;
          if (!variantId || !quantity) return null;
          return {variantId, quantity, productTitle} as SavedCartItem;
        })
        .filter(Boolean) as SavedCartItem[];

      // Persist synchronously for reliability
      // try {
      //   console.log('[cart.action] about to persist items:', items.map(i => ({v: String(i.variantId).split('/').pop(), q: i.quantity})));
      // } catch {}
      await writeSavedCartItems(context, items);
      // try { console.log('[cart.action] persisted items count:', items.length); } catch {}
      if (snapshotUpdatedAt) context.session.set('cartSavedUpdatedAt', snapshotUpdatedAt);
      context.session.set('cartPersistAt', Date.now());

      // Verify by reading back instantly (best-effort)
      // try {
      //   const saved = await readSavedCartItems(context);
      //   console.log('[cart.action] verify metafield items:', saved.map(i => ({v: String(i.variantId).split('/').pop(), q: i.quantity})));
      // } catch {}
    }
  } catch {}

  // Do not return 4xx for cart mutations when the UI expects to render
  // userErrors inline (e.g. discount code apply). A 4xx triggers the generic
  // Remix error boundary ("Something’s wrong here.") instead of showing the message.
  // Keep errors in the JSON payload and always respond 200 unless redirecting.
  status = status === 303 ? 303 : 200;

  return json(
    {
      cart: cartResult,
      userErrors,
      errors,
    },
    {status, headers},
  );
}

export async function loader({context}: LoaderFunctionArgs) {
  const {cart} = context;
  return json(await cart.get());
}

export default function CartRoute() {
  const cart = useLoaderData<typeof loader>();

  return (
    <div className="cart">
      <Heading as="h1" className="text-2xl">Cart</Heading>
      <Cart layout="page" cart={cart} />
      <Analytics.CartView />
    </div>
  );
}
