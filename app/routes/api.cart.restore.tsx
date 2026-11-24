import {json, type ActionFunctionArgs, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {readSavedCartItems, writeSavedCartItems, type SavedCartItem} from '~/lib/cart-metafield.server';

const RESTORE_COOLDOWN_MS = 5000; // 5s

async function restoreNow(context: ActionFunctionArgs['context'] | LoaderFunctionArgs['context']) {
  try {
    const {cart, customerAccount, session} = context;

    // Require login
    const loggedIn = await customerAccount.isLoggedIn();
    if (!loggedIn) return json({error: 'Not authenticated'}, {status: 401});

    // Avoid running more than once per session
    const alreadyDone = Boolean(session.get('cartRestoreDone'));
    if (alreadyDone) {
      return json({success: true, message: 'Already restored this session', restored: 0});
    }

    // Rate limit
    const now = Date.now();
    const lastAt = (session.get('cartRestoreAt') as number | undefined) ?? 0;
    if (now - lastAt < RESTORE_COOLDOWN_MS) {
      return json({error: 'Rate limited. Try again shortly.'}, {status: 429});
    }

    // Read saved items from metafield (may be various shapes)
    const savedRaw = (await readSavedCartItems(context)) as any[];
    const normalized = await normalizeSavedToVariantItems(context, savedRaw);
    // Deduplicate and sum saved quantities per variant
    const savedMap = new Map<string, number>();
    for (const it of normalized || []) {
      if (!it?.variantId || !it.quantity) continue;
      savedMap.set(it.variantId, (savedMap.get(it.variantId) || 0) + it.quantity);
    }
    //try { console.log('[cart.restore] normalized items (unique variants):', savedMap.size); } catch {}
    if (!savedMap.size) {
      session.set('cartRestoreAt', now);
      return json({success: true, message: 'No saved items to restore', restored: 0});
    }

    // Read live cart
    const live = await cart.get();
    const conn: any = (live as any)?.lines;
    const liveLines: any[] = Array.isArray(conn?.edges)
      ? conn.edges.map((e: any) => e?.node).filter(Boolean)
      : (conn?.nodes ?? []);

    const byVariant = new Map<string, {lineId: string; quantity: number}>();
    for (const ln of liveLines) {
      const variantId: string | undefined = ln?.merchandise?.id ?? ln?.merchandiseId;
      if (!variantId) continue;
      byVariant.set(variantId, {lineId: ln.id, quantity: ln.quantity ?? 0});
    }

    const linesToUpdate: Array<{id: string; quantity: number}> = [];
    const linesToAdd: Array<{merchandiseId: string; quantity: number}> = [];

    for (const [variantId, savedQty] of savedMap.entries()) {
      const existing = byVariant.get(variantId);
      if (existing) {
        // Merge without multiplying: choose the greater quantity
        const newQty = Math.max(existing.quantity || 0, savedQty || 0);
        if (newQty !== (existing.quantity || 0)) {
          linesToUpdate.push({id: existing.lineId, quantity: newQty});
        }
      } else {
        linesToAdd.push({merchandiseId: variantId, quantity: savedQty});
      }
    }

    let updatedCount = 0;
    let addedCount = 0;
    let headers: Headers | undefined;

    if (linesToUpdate.length) {
      const result = await cart.updateLines(linesToUpdate);
      headers = cart.setCartId(result.cart.id);
      updatedCount = linesToUpdate.length;
      try {
        if ((result as any)?.userErrors?.length) console.warn('[cart.restore] updateLines userErrors:', (result as any).userErrors);
        if ((result as any)?.errors?.length) console.warn('[cart.restore] updateLines errors:', (result as any).errors);
      } catch {}
    }

    if (linesToAdd.length) {
      const result = await cart.addLines(linesToAdd);
      headers = cart.setCartId(result.cart.id);
      addedCount = linesToAdd.length;
      try {
        if ((result as any)?.userErrors?.length) console.warn('[cart.restore] addLines userErrors:', (result as any).userErrors);
        if ((result as any)?.errors?.length) console.warn('[cart.restore] addLines errors:', (result as any).errors);
      } catch {}
    }

    //try { console.log('[cart.restore] linesToUpdate:', linesToUpdate.length, 'linesToAdd:', linesToAdd.length); } catch {}

    // Persist updated cart back to metafield (best-effort)
    try {
      const fresh = await cart.get();
      const connF: any = (fresh as any)?.lines;
      const freshLines: any[] = Array.isArray(connF?.edges)
        ? connF.edges.map((e: any) => e?.node).filter(Boolean)
        : (connF?.nodes ?? []);
      const items: SavedCartItem[] = freshLines
        .map((ln: any) => {
          const variantId = ln?.merchandise?.id ?? ln?.merchandiseId;
          const quantity = ln?.quantity ?? 0;
          const productTitle = ln?.merchandise?.product?.title ?? ln?.merchandise?.title ?? undefined;
          if (!variantId || !quantity) return null;
          return {variantId, quantity, productTitle} as SavedCartItem;
        })
        .filter(Boolean) as SavedCartItem[];
      await writeSavedCartItems(context, items);
    } catch {}

    // Mark restore done and set cooldown
    session.set('cartRestoreAt', now);
    session.set('cartRestoreDone', true);

    return json(
      {
        success: true,
        message: 'Cart restored (merged) successfully',
        updatedLines: updatedCount,
        addedLines: addedCount,
      },
      headers ? {headers} : undefined,
    );
  } catch (e: any) {
    return json({error: String(e?.message || e)}, {status: 500});
  }
}

export async function action({context}: ActionFunctionArgs) {
  return restoreNow(context);
}

async function normalizeSavedToVariantItems(
  context: ActionFunctionArgs['context'],
  saved: any[],
): Promise<Array<{variantId: string; quantity: number}>> {
  const result: Array<{variantId: string; quantity: number}> = [];
  const productIds: string[] = [];

  for (const entry of saved || []) {
    if (!entry) continue;
    if (typeof entry === 'string') {
      const id = entry;
      if (id.includes('/ProductVariant/')) {
        result.push({variantId: id, quantity: 1});
      } else if (id.includes('/Product/')) {
        productIds.push(id);
      }
      continue;
    }
    if (typeof entry === 'object') {
      const qtyRaw = (entry as any).quantity;
      const quantity = Number.isFinite(qtyRaw) && qtyRaw > 0 ? Number(qtyRaw) : 1;
      const vId: string | undefined = (entry as any).variantId;
      const pId: string | undefined = (entry as any).productId;

      if (vId && vId.includes('/ProductVariant/')) {
        result.push({variantId: vId, quantity});
        continue;
      }
      if (vId && vId.includes('/Product/')) {
        productIds.push(vId);
        continue;
      }
      if (pId && pId.includes('/Product/')) {
        productIds.push(pId);
        continue;
      }
    }
  }

  if (productIds.length) {
    try {
      const Q = `#graphql
        query ProductNodes($ids: [ID!]!, $language: LanguageCode) @inContext(language: $language) {
          nodes(ids: $ids) {
            ... on Product {
              id
              selectedOrFirstAvailableVariant { id availableForSale product { title } }
              variants(first: 1) { nodes { id availableForSale product { title } } }
            }
          }
        }
      `;
      const data: any = await context.storefront.query(Q, {
        variables: {ids: productIds, language: context.storefront.i18n.language},
      });
      const nodes: any[] = Array.isArray(data?.nodes) ? data.nodes : [];
      for (const n of nodes) {
        const varId = n?.selectedOrFirstAvailableVariant?.id || n?.variants?.nodes?.[0]?.id;
        if (varId) result.push({variantId: varId, quantity: 1});
      }
    } catch (e) {
      try { console.warn('[restore] product->variant lookup error:', e); } catch {}
    }
  }

  return result;
}
