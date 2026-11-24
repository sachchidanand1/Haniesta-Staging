import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context}: LoaderFunctionArgs) {
  try {
    const customerId = context.session.get('customerId') as string | undefined;
    const sessionFavorites = (context.session.get('favorites') as string[] | undefined) ?? [];
    const isLoggedIn = context.customerAccount.isLoggedIn();

    // Safely get session info
    let sessionInfo: any = {};
    try {
      // Try to get session data through the session storage
      sessionInfo = {
        hasCustomerId: context.session.has('customerId'),
        hasFavorites: context.session.has('favorites'),
        isPending: (context.session as any).isPending,
      };
    } catch (e) {
      console.error('Error getting session info:', e);
    }

    return json({
      isLoggedIn,
      customerId,
      sessionFavorites,
      sessionInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error('Session test error:', e);
    return json({error: true, message: String(e?.message || e)}, {status: 500});
  }
}
