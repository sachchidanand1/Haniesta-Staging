import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useRouteLoaderData} from '@remix-run/react';

type FavoriteList = string[];
const STORAGE_KEY = 'guest_favorites';

// Global state to prevent multiple syncs across all hook instances
let globalSyncInProgress = false;
let globalHasSynced = false;
let globalFavorites: string[] = [];
let globalListeners: Set<(favorites: string[]) => void> = new Set();
let globalAdminIdSeedingInProgress = false;
let globalFavoritesHookInitialized = false;

// Global sync function that all hook instances can use
async function globalSync() {
  if (globalSyncInProgress || globalHasSynced) return;
  
  globalSyncInProgress = true;
  // console.log('Global sync: Starting sync process');
  
  try {
    const guestRaw = localStorage.getItem(STORAGE_KEY);
    const guest: string[] = guestRaw ? (JSON.parse(guestRaw) as string[]) : [];
    // console.log('Global sync: Guest favorites:', guest);

    if (guest.length) {
      // console.log('Global sync: Merging guest favorites...');
      await fetch('/api/customer/favorites', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({favorites: guest, merge: true}),
      });
      localStorage.removeItem(STORAGE_KEY);
    }

    // console.log('Global sync: Fetching server favorites...');
    const res = await fetch('/api/customer/favorites');
    const data = (await res.json()) as {favorites?: string[]};
    // console.log('Global sync: Server favorites response:', data);
    
    if (Array.isArray(data?.favorites)) {
      globalFavorites = data.favorites;
      // console.log('Global sync: Setting global favorites:', globalFavorites);
      // Notify all listeners
      globalListeners.forEach(listener => listener(globalFavorites));
    }
  } catch (error) {
    console.error('Global sync error:', error);
  } finally {
    globalSyncInProgress = false;
    globalHasSynced = true;
  }
}

export function useFavorites() {
  const rootData = useRouteLoaderData('root') as any;
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<FavoriteList>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const hasSyncedRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Resolve the isLoggedIn promise only once
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    //console.log('useFavorites: Initializing hook');
    if (rootData?.isLoggedIn) {
      rootData.isLoggedIn.then((loggedIn: boolean) => {
        //console.log('useFavorites: isLoggedIn resolved to', loggedIn);
        setIsLoggedIn(loggedIn);
      });
    } else {
      console.log('useFavorites: no isLoggedIn promise in rootData');
    }
  }, [rootData?.isLoggedIn]);

  // Load from localStorage on mount (only once)
  useEffect(() => {
    if (favorites.length > 0) return; // Already loaded
    
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FavoriteList;
        // console.log('useFavorites: Loaded from localStorage:', parsed);
        setFavorites(parsed);
      }
    } catch (e) {
      console.warn('Failed to parse guest_favorites');
    }
  }, []);

  // Listen for favorites change events (from other hook instances or tabs)
  useEffect(() => {
    function onBroadcast(e: Event) {
      try {
        const custom = e as CustomEvent<{favorites?: string[]}>;
        if (Array.isArray(custom.detail?.favorites)) {
          // console.log('useFavorites: Received favorites:changed event:', custom.detail.favorites);
          setFavorites(custom.detail.favorites);
          return;
        }
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as FavoriteList;
          setFavorites(parsed);
        }
      } catch {}
    }
    
    function onServerSync(e: Event) {
      try {
        const custom = e as CustomEvent<{favorites?: string[]}>;
        if (Array.isArray(custom.detail?.favorites)) {
          // console.log('useFavorites: Received server sync event:', custom.detail.favorites);
          setFavorites(custom.detail.favorites);
          globalFavorites = custom.detail.favorites;
          // Notify all listeners
          globalListeners.forEach(listener => listener(custom.detail.favorites || []));
        }
      } catch {}
    }
    
    function onStorage(ev: StorageEvent) {
      if (ev.key === STORAGE_KEY && typeof ev.newValue === 'string') {
        try {
          const next = JSON.parse(ev.newValue) as FavoriteList;
          setFavorites(next);
        } catch {}
      }
    }
    
    window.addEventListener('favorites:changed', onBroadcast as EventListener);
    window.addEventListener('favorites:server-sync', onServerSync as EventListener);
    window.addEventListener('storage', onStorage);
    
    return () => {
      window.removeEventListener('favorites:changed', onBroadcast as EventListener);
      window.removeEventListener('favorites:server-sync', onServerSync as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Register this hook instance with global state
  useEffect(() => {
    const listener = (newFavorites: string[]) => {
      // console.log('useFavorites: Received global favorites update:', newFavorites);
      setFavorites(newFavorites);
    };
    
    globalListeners.add(listener);
    
    // If we already have global favorites, use them
    if (globalFavorites.length > 0) {
      setFavorites(globalFavorites);
    }
    
    return () => {
      globalListeners.delete(listener);
    };
  }, []);

  // Sync to server when logged in (only once globally)
  useEffect(() => {
    // console.log('useFavorites sync effect:', { 
    //   isLoggedIn, 
    //   hasSynced: hasSyncedRef.current, 
    //   globalSyncInProgress, 
    //   globalHasSynced,
    //   globalFavoritesHookInitialized
    // });
    
    if (!isLoggedIn || hasSyncedRef.current || globalFavoritesHookInitialized) return;
    
    hasSyncedRef.current = true;
    globalFavoritesHookInitialized = true;
    // console.log('useFavorites: Triggering global sync with admin ID seeding');
    
    // Handle admin ID seeding and favorites sync in sequence
    const handleSync = async () => {
      try {
        // Check if admin ID seeding is already in progress
        if (globalAdminIdSeedingInProgress) {
          // console.log('Admin ID seeding already in progress, skipping...');
          return;
        }
        
        // First, check if admin ID exists
        const dbgRes = await fetch('/api/customer/favorites/debug');
        const dbg = await dbgRes.json().catch(() => ({} as any));
        //console.log('Debug endpoint response:', dbg);
        
        if (!(dbg as any)?.customerId) {
          globalAdminIdSeedingInProgress = true;
          //console.log('Admin ID not found, attempting to seed...');
          
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
                  // console.log('Failed to seed admin ID:', seedResult.reason);
                  globalAdminIdSeedingInProgress = false;
                  return;
                }
              } else {
                // console.log('Failed to call admin ID seeding endpoint');
                globalAdminIdSeedingInProgress = false;
                return;
              }
            } else {
              // console.log('No customer ID found to seed');
              globalAdminIdSeedingInProgress = false;
              return;
            }
          } else {
            // console.log('Failed to fetch customer data for seeding');
            globalAdminIdSeedingInProgress = false;
            return;
          }
          
          globalAdminIdSeedingInProgress = false;
        }
        
        // Now proceed with the global sync
        globalSync();
      } catch (error) {
        console.error('Error in admin ID seeding and sync:', error);
        globalAdminIdSeedingInProgress = false;
      }
    };
    
    handleSync();
  }, [isLoggedIn]);

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites],
  );

  const add = useCallback((productId: string) => {
    // console.log('Adding favorite:', productId);
    const newFavorites = favorites.includes(productId) ? favorites : [...favorites, productId];
    setFavorites(newFavorites);
    globalFavorites = newFavorites;

    if (!isLoggedIn) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const existing = raw ? (JSON.parse(raw) as string[]) : [];
        const next = existing.includes(productId)
          ? existing
          : [...existing, productId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        // Notify all listeners
        globalListeners.forEach(listener => listener(next));
      } catch {}
    }
    if (isLoggedIn) {
      setIsLoading(true);
      queueMicrotask(() => {
        // console.log('Sending add request to API with merge: true');
        fetch('/api/customer/favorites', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({favorites: [productId], merge: true}),
        }).then(res => res.json()).then((data: any) => {
          console.log('Add API response:', data);
          if (data?.favorites && Array.isArray(data.favorites)) {
            globalFavorites = data.favorites;
            setFavorites(data.favorites);
            // Notify all listeners
            globalListeners.forEach(listener => listener(data.favorites));
          }
        }).catch(err => {
          console.error('Add API error:', err);
        }).finally(() => {
          setIsLoading(false);
        });
      });
    }
  }, [favorites, isLoggedIn]);

  const remove = useCallback((productId: string) => {
    // console.log('Removing favorite:', productId);
    const next = favorites.filter((id) => id !== productId);
    // console.log('Filtered favorites:', next);
    setFavorites(next);
    globalFavorites = next;
    
    if (!isLoggedIn) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const existing = raw ? (JSON.parse(raw) as string[]) : [];
        const pruned = existing.filter((id) => id !== productId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
        // Notify all listeners
        globalListeners.forEach(listener => listener(pruned));
      } catch {}
    }
    if (isLoggedIn) {
      setIsLoading(true);
      queueMicrotask(() => {
        // console.log('Sending remove request to API with filtered array');
        fetch('/api/customer/favorites', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({favorites: next, merge: false}),
        }).then(res => res.json()).then((data: any) => {
          console.log('Remove API response:', data);
          if (data?.favorites && Array.isArray(data.favorites)) {
            globalFavorites = data.favorites;
            setFavorites(data.favorites);
            // Notify all listeners
            globalListeners.forEach(listener => listener(data.favorites));
          }
        }).catch(err => {
          console.error('Remove API error:', err);
        }).finally(() => {
          setIsLoading(false);
        });
      });
    }
  }, [favorites, isLoggedIn]);

  const toggle = useCallback(
    (productId: string) => {
      // console.log('Toggle favorite for product:', productId);
      // console.log('Current favorites:', favorites);
      // console.log('Is currently favorite:', isFavorite(productId));
      return isFavorite(productId) ? remove(productId) : add(productId);
    },
    [isFavorite, add, remove, favorites],
  );

  return useMemo(
    () => ({favorites, isFavorite, add, remove, toggle, isLoading}),
    [favorites, isFavorite, add, remove, toggle, isLoading],
  );
}