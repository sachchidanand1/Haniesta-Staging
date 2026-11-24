import type {AppLoadContext} from '@shopify/remix-oxygen';

export type JudgeMeWidgetType =
  | 'featured_carousel'
  | 'product_review'
  | 'preview_badge';

export async function fetchJudgeMeWidgetHTML(
  env: AppLoadContext['env'],
  type: JudgeMeWidgetType,
  params: {handle?: string},
): Promise<string | null> {
  const {JUDGEME_BASE_URL, PUBLIC_STORE_DOMAIN, JUDGEME_SHOP_DOMAIN, JUDGEME_PRIVATE_API_TOKEN} = env as any;
  const shopDomain = JUDGEME_SHOP_DOMAIN || PUBLIC_STORE_DOMAIN;
  if (!shopDomain || !JUDGEME_PRIVATE_API_TOKEN) return null;

  const base = String(JUDGEME_BASE_URL || 'https://api.judge.me/api/v1').replace(/\/$/, '');
  const sp = new URLSearchParams({
    shop_domain: String(shopDomain),
    api_token: String(JUDGEME_PRIVATE_API_TOKEN),
  });

  let path = '/widgets/featured_carousel';
  if (type === 'product_review') {
    path = '/widgets/product_review';
    if (params.handle) sp.set('handle', params.handle);
  } else if (type === 'preview_badge') {
    path = '/widgets/preview_badge';
    if (params.handle) sp.set('handle', params.handle);
  }

  const url = `${base}${path}?${sp.toString()}`;
  const debug = String((env as any).DEBUG_JUDGEME || '').toLowerCase();
  //if (debug === '1' || debug === 'true') {
    // Do not log url to avoid exposing token
    // eslint-disable-next-line no-console
    // console.log('[JudgeMe][server.fetch] request', {
    //   type,
    //   shopDomain,
    //   handle: params.handle,
    //   path,
    //   base,
    // });
  //}
  try {
    const res = await fetch(url, {headers: {Accept: 'application/json, text/html'}});
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    //if (debug === '1' || debug === 'true') {
      // eslint-disable-next-line no-console
      // console.log('[JudgeMe][server.fetch] response', {
      //   type,
      //   status: res.status,
      //   contentType: ct,
      // });
    //}
    if (ct.includes('application/json')) {
      const data = (await res.json()) as Record<string, string | undefined>;
      // extract by expected keys per endpoint
      if (type === 'featured_carousel') return (data['featured_carousel'] as string) || null;
      if (type === 'preview_badge') return (data['badge'] as string) || null;
      if (type === 'product_review') return (data['widget'] as string) || null;
      return null;
    }
    const text = await res.text();
    try {
      const maybeJson = JSON.parse(text) as Record<string, string | undefined>;
      if (type === 'featured_carousel') return (maybeJson['featured_carousel'] as string) || null;
      if (type === 'preview_badge') return (maybeJson['badge'] as string) || null;
      if (type === 'product_review') return (maybeJson['widget'] as string) || null;
      return null;
    } catch {
      return text || null;
    }
  } catch {
    return null;
  }
}
