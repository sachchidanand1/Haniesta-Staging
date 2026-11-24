import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {readSavedCartItems} from '~/lib/cart-metafield.server';

export async function loader({context}: LoaderFunctionArgs) {
  try {
    const loggedIn = await context.customerAccount.isLoggedIn();
    if (!loggedIn) return json({error: 'Not authenticated'}, {status: 401});

    const items = await readSavedCartItems(context);
    return json({
      success: true,
      cartItems: items,
      message: 'Cart items retrieved successfully',
    });
  } catch (e: any) {
    return json({error: String(e?.message || e)}, {status: 500});
  }
}
