import {useEffect, useRef} from 'react';
import {useRevalidator, useRouteLoaderData} from '@remix-run/react';

/**
 * Auto-restore saved cart (customer metafield) after login, once per session.
 */
let globalCartRestoreInProgress = false;
let globalCartRestoreDone = false;

export function useSyncCartOnLogin() {
  const rootData = useRouteLoaderData('root') as any;
  const hasSyncedRef = useRef(false);
  const revalidator = useRevalidator();

  useEffect(() => {
    let alive = true;

    async function maybeRestore() {
      try {
        if (!rootData?.isLoggedIn) return;
        const loggedIn = await rootData.isLoggedIn;
        if (!alive || !loggedIn) return;
        if (hasSyncedRef.current || globalCartRestoreDone || globalCartRestoreInProgress) return;

        globalCartRestoreInProgress = true;
        let ok = false;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const res = await fetch('/api/cart/restore', {method: 'POST'});
            if (res.ok) {
              ok = true;
              break;
            }
            // If rate-limited, wait briefly and retry once
            if (res.status === 429) {
              await new Promise((r) => setTimeout(r, 2000));
              continue;
            }
            // For other errors, do not mark done; bail
            break;
          } catch {
            // Network error; do not mark done
            break;
          }
        }
        if (!alive) return;
        if (ok) {
          hasSyncedRef.current = true;
          globalCartRestoreDone = true;
          // Give cookie a tick to commit, then revalidate to refresh root cart data
          try {
            await new Promise((r) => setTimeout(r, 50));
            if (alive) revalidator.revalidate();
          } catch {}
        }
      } finally {
        globalCartRestoreInProgress = false;
      }
    }

    maybeRestore();
    return () => {
      alive = false;
    };
  }, [rootData?.isLoggedIn]);
}
