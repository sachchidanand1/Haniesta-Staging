import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

function sanitizeCookies(header: string | null) {
  if (!header) return [] as Array<{name: string; length: number}>;
  return header
    .split(/;\s*/)
    .filter(Boolean)
    .map((pair) => {
      const idx = pair.indexOf('=');
      const name = idx >= 0 ? pair.slice(0, idx) : pair;
      const value = idx >= 0 ? pair.slice(idx + 1) : '';
      return {name, length: value.length};
    });
}

export async function loader({request, context}: LoaderFunctionArgs) {
  try {
    const cartData: any = await context.cart.get();
    const cartId: string | null = cartData?.id ?? cartData?.cart?.id ?? null;
    const totalQuantity: number = cartData?.totalQuantity ?? 0;

    const cookieHeader = request.headers.get('Cookie');
    const cookies = sanitizeCookies(cookieHeader);

    return json({
      ok: true,
      cartId,
      totalQuantity,
      cookies,
    });
  } catch (e: any) {
    return json({ok: false, error: String(e?.message || e)}, {status: 500});
  }
}
