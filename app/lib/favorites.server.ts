import type {AppLoadContext} from '@shopify/remix-oxygen';
import {adminGraphQL} from '~/lib/admin.server';
import {findAdminCustomerIdByEmail} from '~/lib/customer-admin.server';

// For this branch, persist favorites in the session for logged-in users.
// Guest users continue to use localStorage on the client.

export async function readFavorites(context: AppLoadContext): Promise<string[]> {
  let customerId = context.session.get('customerId') as string | undefined;
  if (!customerId && (await context.customerAccount.isLoggedIn())) {
    // Prefer resolving the Admin customer GID directly from the Customer Account API
    // and fall back to email-based lookup only if needed.
    try {
      const accountQuery = `
        query AccountBasics {
          customer {
            id
            emailAddress { emailAddress }
          }
        }
      `;
      const accountRes = await context.customerAccount.query(accountQuery);
      const accountAny = accountRes as any;
      const customerNode = accountAny?.customer ?? accountAny?.data?.customer;
      const cxId = customerNode?.id as string | undefined;
      const email = customerNode?.emailAddress?.emailAddress as
        | string
        | undefined;

      if (cxId) {
        // cxId is typically in gid://shopify/Customer/<id> format already.
        context.session.set('customerId', cxId);
        customerId = cxId;
        // console.log('[favorites] Seeded customerId from CustomerAccount id:', cxId);
      } else if (email) {
        // Fallback to Admin lookup by email if id was not available
        const adminId = await findAdminCustomerIdByEmail(context, email);
        if (adminId) {
          context.session.set('customerId', adminId);
          customerId = adminId;
          // console.log('[favorites] Seeded customerId via Admin lookup by email:', email);
        }
      }
    } catch {
      // Swallow errors to keep favorites guest-friendly when Customer Account fails
    }
  }
  if (!customerId) {
    const sessionFavs = (context.session.get('favorites') as string[] | undefined) ?? [];
    // console.log('[favorites] Using session favorites (guest or no admin id):', sessionFavs.length);
    return sessionFavs;
  }

  const query = `
    query getCustomerMetafield($customerId: ID!) {
      customer(id: $customerId) {
        metafield(namespace: "favorites", key: "favorite_products") {
          value
          type
        }
      }
    }
  `;

  try {
    // console.log('[favorites] Fetching admin metafield for customerId:', customerId);
    const data = await adminGraphQL<{customer?: {metafield?: {value?: string} | null} | null}>(
      context,
      query,
      {customerId},
    );
    const raw = data?.customer?.metafield?.value;
    if (!raw) {
      // console.log('[favorites] Admin metafield empty or missing; returning empty list');
      return [];
    }
    return JSON.parse(raw) as string[];
  } catch (e) {
    // console.log('[favorites] Error reading admin metafield:', e);
    return [];
  }
}

export async function writeFavorites(context: AppLoadContext, favorites: string[]) {
  const customerId = context.session.get('customerId') as string | undefined;
  if (!customerId) {
    context.session.set('favorites', favorites);
    const headers = new Headers();
    headers.set('Set-Cookie', await context.session.commit());
    return {headers};
  }

  const mutation = `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }
  `;

  await adminGraphQL(
    context,
    mutation,
    {
      metafields: [
        {
          ownerId: customerId,
          namespace: 'favorites',
          key: 'favorite_products',
          type: 'list.product_reference',
          value: JSON.stringify(favorites),
        },
      ],
    },
  );

  return {headers: undefined};
}


