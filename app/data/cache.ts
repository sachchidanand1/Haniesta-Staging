import {
  CacheCustom,
  CacheLong,
  CacheNone,
  CacheShort,
  generateCacheControlHeader,
} from '@shopify/hydrogen';

export function routeHeaders({loaderHeaders}: {loaderHeaders: Headers}) {
  // Keep the same cache-control headers when loading the page directly
  // versus when transititioning to the page from other areas in the app
  return {
    'Cache-Control': loaderHeaders.get('Cache-Control'),
    'Oxygen-Cache-Control':
      loaderHeaders.get('Oxygen-Cache-Control') ||
      loaderHeaders.get('Cache-Control'),
  };
}

export const CACHE_SHORT = generateCacheControlHeader(CacheShort());
export const CACHE_LONG = generateCacheControlHeader(CacheLong());
export const CACHE_NONE = generateCacheControlHeader(CacheNone());

/** Anonymous PDP/PLP HTML — 1h fresh, ~23h SWR at the edge. */
export const CACHE_HTML = generateCacheControlHeader(
  CacheCustom({
    mode: 'public',
    maxAge: 3600,
    staleWhileRevalidate: 82800,
  }),
);

export function htmlCacheHeaders() {
  return {
    'Cache-Control': CACHE_HTML,
    'Oxygen-Cache-Control': CACHE_HTML,
  };
}