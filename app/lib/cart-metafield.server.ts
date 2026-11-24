import type {AppLoadContext} from '@shopify/remix-oxygen';
import {adminGraphQL} from '~/lib/admin.server';

export type SavedCartItem = {
  variantId: string;
  quantity: number;
  productTitle?: string;
};

async function resolveAdminCustomerId(context: AppLoadContext): Promise<string | null> {
  let customerId = context.session.get('customerId') as string | undefined;
  try {
    if (!customerId && (await context.customerAccount.isLoggedIn())) {
      const Q = `
        query AccountBasics { customer { id } }
      `;
      const res = await context.customerAccount.query(Q);
      const id = (res as any)?.customer?.id ?? (res as any)?.data?.customer?.id;
      if (id) {
        context.session.set('customerId', id);
        customerId = id;
        // console.log('[cart-metafield] seeded customerId from CustomerAccount:', id);
      }
    }
  } catch {}
  return customerId ?? null;
}

export async function readSavedCartItems(context: AppLoadContext): Promise<SavedCartItem[]> {
  const customerId = await resolveAdminCustomerId(context);
  if (!customerId) return [];

  const QUERY = `
    query getCustomerCartMetafield($customerId: ID!) {
      customer(id: $customerId) {
        metafield(namespace: "cartdetails", key: "cart_items") {
          value
          type
        }
      }
    }
  `;

  try {
    // console.log('[cart-metafield] reading saved cart for customerId:', customerId);
    const data = await adminGraphQL<{customer?: {metafield?: {value?: string | null} | null} | null}>(
      context,
      QUERY,
      {customerId},
    );
    const raw = data?.customer?.metafield?.value;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      console.log('[cart-metafield] read saved cart count:', parsed.length);
      return parsed as SavedCartItem[];
    }
    return [];
  } catch (e) {
    console.log('[cart-metafield] read error:', e);
    throw e;
  }
}

export async function writeSavedCartItems(context: AppLoadContext, items: SavedCartItem[]) {
  const customerId = await resolveAdminCustomerId(context);
  if (!customerId) throw new Error('Not authenticated');

  const MUT = `
    mutation updateCustomerCartMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id key value }
        userErrors { field message }
      }
    }
  `;

  const variables = {
    metafields: [
      {
        ownerId: customerId,
        namespace: 'cartdetails',
        key: 'cart_items',
        type: 'json',
        value: JSON.stringify(items ?? []),
      },
    ],
  };

  try {
    // console.log('[cart-metafield] writing items:', items?.length ?? 0, 'for customerId:', customerId);
    const result = await adminGraphQL<any>(context, MUT, variables);
    const errs = result?.metafieldsSet?.userErrors;
    if (Array.isArray(errs) && errs.length) {
      throw new Error('Admin metafieldsSet error: ' + JSON.stringify(errs));
    }
    console.log('[cart-metafield] write success');
    return true;
  } catch (e) {
    console.log('[cart-metafield] write error:', e);
    throw e;
  }
}

export async function clearSavedCartItems(context: AppLoadContext) {
  return writeSavedCartItems(context, []);
}
