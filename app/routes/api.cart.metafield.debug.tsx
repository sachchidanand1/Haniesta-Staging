import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {adminGraphQL} from '~/lib/admin.server';

export async function loader({context}: LoaderFunctionArgs) {
  try {
    // Resolve customerId from session or Customer Account API
    let customerId = context.session.get('customerId') as string | undefined;
    if (!customerId && (await context.customerAccount.isLoggedIn())) {
      const Q = `query { customer { id } }`;
      const res = await context.customerAccount.query(Q);
      const id = (res as any)?.customer?.id ?? (res as any)?.data?.customer?.id;
      if (id) {
        context.session.set('customerId', id);
        customerId = id;
      }
    }

    const sessionCartPersistAt = context.session.get('cartPersistAt') as number | undefined;
    const sessionCartRestoreAt = context.session.get('cartRestoreAt') as number | undefined;

    if (!customerId) {
      return json({
        error: true,
        reason: 'no_customer_id',
        message: 'Not logged in or customerId missing',
        sessionCartPersistAt,
        sessionCartRestoreAt,
      }, {status: 401});
    }

    const QUERY = `
      query getCustomerCartMetafield($customerId: ID!) {
        customer(id: $customerId) {
          id
          metafield(namespace: "cartdetails", key: "cart_items") {
            id
            namespace
            key
            type
            value
          }
        }
      }
    `;

    const data = await adminGraphQL<{customer?: {id: string; metafield?: {id: string; namespace: string; key: string; type: string; value: string | null} | null} | null}>(
      context as any,
      QUERY,
      {customerId},
    );

    let parsed: any[] = [];
    let parseError: string | null = null;
    try {
      const raw = data?.customer?.metafield?.value;
      parsed = raw ? JSON.parse(raw) : [];
    } catch (e: any) {
      parseError = String(e?.message || e);
    }

    return json({
      customerId,
      sessionCartPersistAt,
      sessionCartRestoreAt,
      metafield: data?.customer?.metafield ?? null,
      parsedItemsCount: Array.isArray(parsed) ? parsed.length : 0,
      parsedItems: Array.isArray(parsed) ? parsed : [],
      parseError,
    });
  } catch (e: any) {
    return json({error: true, message: String(e?.message || e)}, {status: 500});
  }
}
