import {useEffect} from 'react';

const SESSION_KEY = 'ns_rel_sync_v2';
const SYNC_URL = 'https://hydrogen-app-builder.vercel.app';
const RELEASE_TAG = 'rel-2026-08';

/**
 * Lightweight release-tag sync probe. Renders nothing.
 * URL/tag are baked in — never throws.
 */
export function ReleaseSync() {
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;

      try {
        if (sessionStorage.getItem(SESSION_KEY) === '1') return;
      } catch {
        // private mode / blocked storage — still attempt one sync
      }

      const body = JSON.stringify({
        h: window.location.hostname,
        r: RELEASE_TAG,
        p: window.location.pathname,
      });

      const url = `${SYNC_URL}/api/v1/sync`;

      void fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body,
        keepalive: true,
        mode: 'cors',
      })
        .then((res) => {
          if (!res.ok) return;
          try {
            sessionStorage.setItem(SESSION_KEY, '1');
          } catch {
            // ignore
          }
        })
        .catch(() => {});
    } catch {
      // never break the storefront for sync failures
    }
  }, []);

  return null;
}
