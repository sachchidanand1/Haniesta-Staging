import {useEffect, useRef} from 'react';
import {useRouteLoaderData} from '@remix-run/react';

const STORAGE_KEY = 'guest_favorites';

// Global flag to prevent multiple executions across all hook instances
let globalSyncInitialized = false;

/**
 * Sync guest favorites from localStorage to server once after login.
 * Safe to include globally; it runs only when login flips to true.
 */
export function useSyncFavoritesOnLogin() {
  const rootData = useRouteLoaderData('root') as any;
  const hasSyncedRef = useRef(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current || globalSyncInitialized) return;
    isInitializedRef.current = true;
    globalSyncInitialized = true;
    
    let isMounted = true;

    async function maybeSync() {
      try {
        if (!rootData?.isLoggedIn || hasSyncedRef.current) return;
        const loggedIn = await rootData.isLoggedIn;
        if (!isMounted || !loggedIn || hasSyncedRef.current) return;

        // Ensure Admin customerId is seeded before syncing to avoid
        // writing to session fallback and losing guest data on reload.
        const dbgRes = await fetch('/api/customer/favorites/debug');
        const dbg = await dbgRes.json().catch(() => ({} as any));
        if (!(dbg as any)?.customerId) {
          // Admin ID not ready yet; try to seed it
          // console.log('Admin ID not found, attempting to seed...');
          
          // Get customer data to seed admin ID
          const customerRes = await fetch('/api/customer/details');
          if (customerRes.ok) {
            const customerData = await customerRes.json() as any;
            const customerId = customerData.customer?.id;
            
            if (customerId) {
              // console.log('Seeding admin ID with customer ID:', customerId);
              const seedRes = await fetch('/api/customer/admin-id', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({customerId}),
              });
              
              if (seedRes.ok) {
                const seedResult = await seedRes.json() as any;
                if (seedResult.set) {
                  // console.log('Successfully seeded admin ID:', seedResult.customerId);
                  // Wait a moment for session to be committed
                  await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                  console.log('Failed to seed admin ID:', seedResult.reason);
                  return; // Don't proceed with sync if seeding failed
                }
              } else {
                console.log('Failed to call admin ID seeding endpoint');
                return;
              }
            } else {
              console.log('No customer ID found to seed');
              return;
            }
          } else {
            console.log('Failed to fetch customer data for seeding');
            return;
          }
        }

        const raw = localStorage.getItem(STORAGE_KEY);
        const guest = raw ? (JSON.parse(raw) as string[]) : [];
        if (guest.length) {
          await fetch('/api/customer/favorites', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({favorites: guest, merge: true}),
          });
          localStorage.removeItem(STORAGE_KEY);
        }

        // Now trigger the global sync to fetch server favorites
        // console.log('Triggering global sync after admin ID seeding and guest sync');
        const globalSyncRes = await fetch('/api/customer/favorites');
        if (globalSyncRes.ok) {
          const globalData = await globalSyncRes.json() as any;
          // console.log('Global sync completed:', globalData);
          
          // Trigger a custom event to notify useFavorites hooks
          window.dispatchEvent(new CustomEvent('favorites:server-sync', {
            detail: { favorites: globalData.favorites || [] }
          }));
        }

        hasSyncedRef.current = true;
      } catch {
        // ignore network errors; hook is best-effort
      }
    }

    maybeSync();
    return () => {
      isMounted = false;
    };
  }, [rootData?.isLoggedIn]);
}


