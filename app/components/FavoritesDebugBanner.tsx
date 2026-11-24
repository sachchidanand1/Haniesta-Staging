import {useEffect, useMemo, useState} from 'react';
import {useLocation} from '@remix-run/react';

/**
 * Debug banner to visualize favorites source/status in production.
 * Shown only when:
 * - URL has ?favoritesDebug=1, or
 * - localStorage.showFavoritesDebug === '1'
 */
export function FavoritesDebugBanner() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const debugEnabled = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('favoritesDebug') === '1') return true;
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem('showFavoritesDebug') === '1';
      }
    } catch {}
    return false;
  }, [location.search]);

  useEffect(() => {
    setVisible(debugEnabled);
  }, [debugEnabled]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch('/api/customer/favorites/debug')
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        setData(res);
      })
      .catch((e) => !cancelled && setError(String(e)))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [visible]);

  if (!visible) return null;

  const togglePersist = () => {
    try {
      const current = window.localStorage.getItem('showFavoritesDebug');
      const next = current === '1' ? '0' : '1';
      window.localStorage.setItem('showFavoritesDebug', next);
    } catch {}
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-md border border-gray-200 bg-white shadow-lg text-sm">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
        <div className="font-medium">Favorites Debug</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePersist}
            className="text-xs px-2 py-1 rounded border hover:bg-gray-100"
            title="Toggle persist via localStorage.showFavoritesDebug"
          >
            Persist
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="text-xs px-2 py-1 rounded border hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
      <div className="p-3">
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="space-y-1">
            <div>
              <span className="font-medium">Source:</span>{' '}
              <span className="uppercase">{data?.source ?? 'unknown'}</span>
            </div>
            <div className="break-all">
              <span className="font-medium">customerId:</span>{' '}
              <span>{data?.customerId ?? 'null'}</span>
            </div>
            <div>
              <span className="font-medium">favorites (count):</span>{' '}
              <span>{Array.isArray(data?.favorites) ? data.favorites.length : 0}</span>
            </div>
            {data?.sessionFavorites && (
              <div>
                <span className="font-medium">sessionFavorites (count):</span>{' '}
                <span>{Array.isArray(data.sessionFavorites) ? data.sessionFavorites.length : 0}</span>
              </div>
            )}
            {data?.metafield && (
              <div className="text-xs text-gray-600">
                <div><span className="font-medium">metafield:</span> {data.metafield.namespace}/{data.metafield.key}</div>
                <div><span className="font-medium">type:</span> {data.metafield.type}</div>
              </div>
            )}
            {data?.error && (
              <div className="text-red-600 text-xs">{data.message || 'Error'}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
