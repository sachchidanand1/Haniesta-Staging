import {json, type ActionFunctionArgs} from '@shopify/remix-oxygen';
import {clearSavedCartItems} from '~/lib/cart-metafield.server';

export async function action({context}: ActionFunctionArgs) {
  try {
    const loggedIn = await context.customerAccount.isLoggedIn();
    if (!loggedIn) return json({error: 'Not authenticated'}, {status: 401});

    await clearSavedCartItems(context);
    return json({success: true, message: 'Saved cart cleared'});
  } catch (e: any) {
    return json({error: String(e?.message || e)}, {status: 500});
  }
}
