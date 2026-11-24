import {useEffect, useRef} from 'react';

/**
 * Client-side debug helper for cart metafield persistence.
 * - Logs current saved items count on mount.
 * - Exposes window.cartmeta helpers for manual testing from the console.
 */
export function useCartMetafieldDebug() {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const api = {
      async get() {
        try {
          // console.log('[cartmeta] GET saved: requesting /api/cart.metafield.debug');
          const res = await fetch('/api/cart/metafield/debug').catch(() => fetch('/api/cart.metafield.debug'));
          const data = await res.json();
          // console.log('[cartmeta] GET saved: response', data);
          return data;
        } catch (e) {
          console.warn('[cartmeta] GET saved: error', e);
          return null;
        }
      },
      async cart() {
        try {
          // console.log('[cartmeta] GET cart.debug');
          const res = await fetch('/api/cart/debug').catch(() => fetch('/api/cart.debug'));
          const data = await res.json();
          // console.log('[cartmeta] cart.debug response', data);
          return data;
        } catch (e) {
          console.warn('[cartmeta] cart.debug error', e);
          return null;
        }
      },
      async persist() {
        try {
          // console.log('[cartmeta] PERSIST: POST /api/cart/persist');
          const res = await fetch('/api/cart/persist', {method: 'POST'});
          const data = await res.json();
          // console.log('[cartmeta] PERSIST response', data);
          return data;
        } catch (e) {
          console.warn('[cartmeta] PERSIST error', e);
          return null;
        }
      },
      async restore() {
        try {
          // console.log('[cartmeta] RESTORE: POST /api/cart/restore');
          const res = await fetch('/api/cart/restore', {method: 'POST'});
          const data = await res.json();
          // console.log('[cartmeta] RESTORE response', data);
          return data;
        } catch (e) {
          console.warn('[cartmeta] RESTORE error', e);
          return null;
        }
      },
      async clear() {
        try {
          // console.log('[cartmeta] CLEAR: POST /api/cart/clear-saved');
          const res = await fetch('/api/cart/clear-saved', {method: 'POST'});
          const data = await res.json();
          // console.log('[cartmeta] CLEAR response', data);
          return data;
        } catch (e) {
          console.warn('[cartmeta] CLEAR error', e);
          return null;
        }
      },
      async addByHandle(handle: string, qty = 1) {
        try {
          // console.log('[cartmeta] ADD BY HANDLE:', handle, qty);
          const url = new URL('/api/cart/add-by-handle', window.location.origin);
          url.searchParams.set('handle', handle);
          url.searchParams.set('qty', String(qty));
          const res = await fetch(url.toString());
          const data = await res.json();
          // console.log('[cartmeta] ADD BY HANDLE response', data);
          return data;
        } catch (e) {
          console.warn('[cartmeta] ADD BY HANDLE error', e);
          return null;
        }
      },
    } as const;

    // Expose helpers for quick manual testing
    try {
      (window as any).cartmeta = api;
      console.log('[cartmeta] helpers attached to window.cartmeta:', Object.keys(api));
    } catch {}

    // Initial snapshot
    api.get();
    api.cart();
  }, []);
}
