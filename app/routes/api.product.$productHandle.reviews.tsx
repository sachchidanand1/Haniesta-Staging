import {type LoaderFunctionArgs, type ActionFunctionArgs, json} from '@shopify/remix-oxygen';

const JUDGEME_PRODUCT_API = 'https://judge.me/api/v1/products/-1';
const JUDGEME_BADGE_API = 'https://api.judge.me/api/v1/widgets/preview_badge';
const JUDGEME_WIDGET_API = 'https://api.judge.me/api/v1/widgets/product_review';
const JUDGEME_REVIEWS_API = 'https://api.judge.me/api/v1/reviews';
const NUM_REVIEWS_REGEX = /data-number-of-reviews=['"]([^'"]+)['"]/;

function sanitizeShopDomain(v: string): string {
  const raw = String(v || '').trim();
  if (!raw) return raw;
  try {
    const test = raw.startsWith('http') ? raw : `https://${raw}`;
    const url = new URL(test);
    return url.hostname;
  } catch {
    return raw.replace(/^https?:\/\//, '').split('/')[0];
  }
}

export async function action({request, context, params}: ActionFunctionArgs) {
  try {
    const {JUDGEME_PRIVATE_API_TOKEN, PUBLIC_STORE_DOMAIN, JUDGEME_SHOP_DOMAIN} = context.env as any;
    const shopDomain = sanitizeShopDomain(JUDGEME_SHOP_DOMAIN || PUBLIC_STORE_DOMAIN);
    const productHandle = params.productHandle;
    if (!productHandle) return json({error: 'Missing product handle.'}, {status: 400});

    // Dev escape hatch
    const disableExternal = String((context.env as any).DISABLE_EXTERNAL_FETCH || '').toLowerCase();
    if (disableExternal === '1' || disableExternal === 'true') {
      return json({review: null, disabled: true}, {status: 201});
    }

    if (!JUDGEME_PRIVATE_API_TOKEN || !shopDomain) {
      return json({error: 'Judge.me not configured'}, {status: 500});
    }

    const formData = await request.formData();
    // Convert FormData to a simple object
    const bodyObj: Record<string, any> = {};
    formData.forEach((v, k) => {
      bodyObj[k] = v;
    });

    const postUrl = new URL(JUDGEME_REVIEWS_API);
    postUrl.searchParams.set('api_token', JUDGEME_PRIVATE_API_TOKEN);
    postUrl.searchParams.set('shop_domain', shopDomain);

    const res = await fetch(postUrl.toString(), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        shop_domain: shopDomain,
        platform: 'shopify',
        ...bodyObj,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return json({error: 'Failed to submit review', detail: text}, {status: 500});
    }
    const payload = await res.json().catch(() => ({}));
    return json({review: payload}, {status: 201});
  } catch (err: any) {
    return json({error: err?.message || 'Unknown error'}, {status: 500});
  }
}
export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {JUDGEME_PRIVATE_API_TOKEN, PUBLIC_STORE_DOMAIN, JUDGEME_SHOP_DOMAIN} = context.env as any;
  const shopDomain = sanitizeShopDomain(JUDGEME_SHOP_DOMAIN || PUBLIC_STORE_DOMAIN);
  const productHandle = params.productHandle;
  if (!productHandle) return new Response('Missing product handle.', {status: 400});

  const disableExternal = String((context.env as any).DISABLE_EXTERNAL_FETCH || '').toLowerCase();
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const debug = String((context.env as any).DEBUG_JUDGEME || '').toLowerCase();

  if (disableExternal === '1' || disableExternal === 'true') {
    if (type === 'rating') return new Response(null, {status: 204});
    return json({widget: '', reviews: [], currentPage: 1, perPage: 5});
  }

  if (!JUDGEME_PRIVATE_API_TOKEN || !shopDomain) {
    return new Response('Judge.me not configured', {status: 500});
  }

  if (type === 'rating') {
    const badgeUrl = new URL(JUDGEME_BADGE_API);
    badgeUrl.searchParams.set('api_token', JUDGEME_PRIVATE_API_TOKEN);
    badgeUrl.searchParams.set('shop_domain', shopDomain);
    badgeUrl.searchParams.set('handle', productHandle);
    badgeUrl.searchParams.set('platform', 'shopify');
    // if (debug === '1' || debug === 'true') {
    //   // eslint-disable-next-line no-console
    //   console.log('[JudgeMe][api.rating] request', {shopDomain, handle: productHandle});
    // }
    const res = await fetch(badgeUrl.toString(), {headers: {Accept: 'application/json'}});
    // if (debug === '1' || debug === 'true') {
    //   // eslint-disable-next-line no-console
    //   console.log('[JudgeMe][api.rating] response', {status: res.status, contentType: res.headers.get('content-type')});
    // }
    if (res.ok) {
      const data = (await res.json()) as {badge?: string} | null;
      const html = data?.badge || '';
      if (html) return new Response(html, {status: 200, headers: {'Content-Type': 'text/html; charset=utf-8'}});
    }
    // Fallback: fetch widget summary and synthesize stars+count
    const widgetUrl2 = new URL(JUDGEME_WIDGET_API);
    widgetUrl2.searchParams.set('api_token', JUDGEME_PRIVATE_API_TOKEN);
    widgetUrl2.searchParams.set('shop_domain', shopDomain);
    widgetUrl2.searchParams.set('handle', productHandle);
    widgetUrl2.searchParams.set('per_page', '1');
    widgetUrl2.searchParams.set('page', '1');
    const widgetRes2 = await fetch(widgetUrl2.toString(), {headers: {Accept: 'application/json'}});
    if (!widgetRes2.ok) return new Response(null, {status: 204});
    const widgetJson2 = (await widgetRes2.json().catch(() => null)) as {widget?: string} | null;
    const html2 = (widgetJson2?.widget || '').toString();
    // Extract rating and total from data-* attributes
    const avgMatch = html2.match(/data-average-rating=['"]([^'"]+)['"]/);
    const numMatch = html2.match(/data-number-of-reviews=['"]([^'"]+)['"]/);
    const avg = Math.round(parseFloat(avgMatch?.[1] || '0')) || 0;
    const total = parseInt(numMatch?.[1] || '0', 10) || 0;
    const synth = `<span aria-label="${avg} out of 5 stars, ${total} reviews"><span class="mr-1" aria-hidden>${'★'.repeat(avg)}${'☆'.repeat(
      5 - avg,
    )}</span><span class="opacity-70">(${total})</span></span>`;
    return new Response(synth, {status: 200, headers: {'Content-Type': 'text/html; charset=utf-8'}});
  }

  // Reviews and widget summary
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10);
  const perPage = Number.parseInt(url.searchParams.get('per_page') || '5', 10);

  // Resolve Judge.me product id by handle
  const productUrl = new URL(JUDGEME_PRODUCT_API);
  productUrl.searchParams.set('handle', productHandle);
  productUrl.searchParams.set('shop_domain', shopDomain);
  productUrl.searchParams.set('api_token', JUDGEME_PRIVATE_API_TOKEN);
  // if (debug === '1' || debug === 'true') {
  //   // eslint-disable-next-line no-console
  //   console.log('[JudgeMe][api.product] request', {shopDomain, handle: productHandle});
  // }
  const prodRes = await fetch(productUrl.toString(), {headers: {Accept: 'application/json'}});
  // if (debug === '1' || debug === 'true') {
  //   // eslint-disable-next-line no-console
  //   console.log('[JudgeMe][api.product] response', {status: prodRes.status, contentType: prodRes.headers.get('content-type')});
  // }
  const prodJson = (await prodRes.json().catch(() => null)) as {product?: {id?: number}} | null;
  const productId = prodJson?.product?.id;

  // Widget HTML (summary)
  const widgetUrl = new URL(JUDGEME_WIDGET_API);
  widgetUrl.searchParams.set('api_token', JUDGEME_PRIVATE_API_TOKEN);
  widgetUrl.searchParams.set('shop_domain', shopDomain);
  widgetUrl.searchParams.set('handle', productHandle);
  widgetUrl.searchParams.set('per_page', String(perPage));
  widgetUrl.searchParams.set('page', String(page));
  // if (debug === '1' || debug === 'true') {
  //   // eslint-disable-next-line no-console
  //   console.log('[JudgeMe][api.widget] request', {shopDomain, handle: productHandle, page, perPage});
  // }
  const widgetRes = await fetch(widgetUrl.toString(), {headers: {Accept: 'application/json'}});
  // if (debug === '1' || debug === 'true') {
  //   // eslint-disable-next-line no-console
  //   console.log('[JudgeMe][api.widget] response', {status: widgetRes.status, contentType: widgetRes.headers.get('content-type')});
  // }
  const widgetJson = (await widgetRes.json().catch(() => null)) as {widget?: string} | null;
  const widget = widgetJson?.widget || '';
  const totalReviews = Number.parseInt(widget.match(NUM_REVIEWS_REGEX)?.[1] || '0', 10);
  const totalPage = Math.max(1, Math.ceil(totalReviews / (perPage > 0 ? perPage : 5)));

  // Reviews list
  let currentPage = page;
  let reviews: any[] = [];
  if (productId) {
    const reviewsUrl = new URL(JUDGEME_REVIEWS_API);
    reviewsUrl.searchParams.set('api_token', JUDGEME_PRIVATE_API_TOKEN);
    reviewsUrl.searchParams.set('shop_domain', shopDomain);
    reviewsUrl.searchParams.set('product_id', String(productId));
    reviewsUrl.searchParams.set('per_page', String(perPage));
    reviewsUrl.searchParams.set('page', String(page));
    // if (debug === '1' || debug === 'true') {
    //   // eslint-disable-next-line no-console
    //   console.log('[JudgeMe][api.reviews] request', {shopDomain, productId, page, perPage});
    // }
    const revRes = await fetch(reviewsUrl.toString(), {headers: {Accept: 'application/json'}});
    // if (debug === '1' || debug === 'true') {
    //   // eslint-disable-next-line no-console
    //   console.log('[JudgeMe][api.reviews] response', {status: revRes.status, contentType: revRes.headers.get('content-type')});
    // }
    const revJson = (await revRes.json().catch(() => null)) as {reviews?: any[]; current_page?: number} | null;
    reviews = revJson?.reviews || [];
    if (revJson?.current_page) currentPage = revJson.current_page;
  }

  return json({widget, reviews, currentPage, perPage, totalPage});
}
