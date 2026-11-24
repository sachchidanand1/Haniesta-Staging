import {redirect, json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context, request}: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const variantIdRaw = url.searchParams.get('variantId');
    const qty = Number(url.searchParams.get('qty') || '1');
    const returnTo = url.searchParams.get('returnTo') || '/cart';

    if (!variantIdRaw) {
      return json({error: 'Missing ?variantId='}, {status: 400});
    }

    const variantId = String(variantIdRaw).trim();
    const merchandiseId = variantId.startsWith('gid://')
      ? variantId
      : `gid://shopify/ProductVariant/${variantId}`;

    const result = await context.cart.addLines([
      {merchandiseId, quantity: Math.max(1, Number.isFinite(qty) ? qty : 1)},
    ]);
    const headers = context.cart.setCartId(result.cart.id);

    return redirect(returnTo, {headers});
  } catch (e: any) {
    return json({error: String(e?.message || e)}, {status: 500});
  }
}
