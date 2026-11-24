import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData} from '@remix-run/react';
import {Suspense, useEffect, useMemo, useState} from 'react';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {PageHeader, Text} from '~/components/Text';
import {Button} from '~/components/Button';
import {ProductCard} from '~/components/ProductCard';
import {readFavorites} from '~/lib/favorites.server';
import {useFavorites} from '~/hooks/useFavorites';
import {Skeleton} from '~/components/Skeleton';
import {CACHE_NONE, routeHeaders} from '~/data/cache';
import {FavoritesDebugBanner} from '~/components/FavoritesDebugBanner';

export const headers = routeHeaders;

const FAVORITES_QUERY = `#graphql
  query RouteFavoritesProducts($ids: [ID!]!, $language: LanguageCode)
  @inContext(language: $language) {
    nodes(ids: $ids) {
      ... on Product {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

type FavoritesProductsQuery = {
  nodes: ProductCardFragment[];
};

export async function loader({context}: LoaderFunctionArgs) {
  // Guest-friendly favorites: no auth required
  const favorites = await readFavorites(context);

  const productIds = (favorites || []).filter((f) => f.startsWith('gid://'));

  const productsPromise = productIds.length
    ? context.storefront.query<FavoritesProductsQuery>(FAVORITES_QUERY, {
        variables: {
          ids: productIds,
          language: context.storefront.i18n.language,
        },
      })
    : Promise.resolve({nodes: []} as FavoritesProductsQuery);

  return defer({favorites, productsPromise, storeDomain: (context as any)?.env?.PUBLIC_STORE_DOMAIN}, {
    headers: {
      'Cache-Control': CACHE_NONE,
    },
  });
}

function FavoritesGrid({initialProducts, serverFavorites, storeDomain}: {initialProducts: FavoritesProductsQuery['nodes']; serverFavorites: string[]; storeDomain?: string}) {
  const {favorites: clientFavorites, isLoading} = useFavorites();
  const [serverProducts, setServerProducts] = useState<FavoritesProductsQuery['nodes']>(initialProducts);

  const displayFavorites = clientFavorites.length > 0 ? clientFavorites : serverFavorites;

  useEffect(() => {
    const knownIds = new Set(serverProducts.map((p) => p.id));
    const missing = displayFavorites.filter((id: string) => id.startsWith('gid://') && !knownIds.has(id));
    if (!missing.length) return;
    const controller = new AbortController();
    const idsParam = encodeURIComponent(missing.join(','));
    fetch(`/api/customer/favorites/products?ids=${idsParam}`, {signal: controller.signal})
      .then((r) => r.json())
      .then((res: any) => {
        if (!res?.nodes?.length) return;
        setServerProducts((prev) => {
          const map = new Map<string, any>();
          [...prev, ...(res.nodes || [])].forEach((p: any) => map.set(p.id, p));
          return Array.from(map.values());
        });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [displayFavorites, serverProducts]);

  const filteredProducts = useMemo(() => {
    const byId = new Map(serverProducts.map((p) => [p.id, p] as const));
    return displayFavorites
      .map((id: string) => byId.get(id))
      .filter(Boolean) as FavoritesProductsQuery['nodes'];
  }, [displayFavorites, serverProducts]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({length: 8}).map((_, i) => (
          <div key={`sk-${i}`} className="min-h-[320px]">
            <Skeleton className="w-full h-full" />
          </div>
        ))}
      </div>
    );
  }

  if (displayFavorites.length === 0) {
    return (
      <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
        <Text className="mb-4">No favorites yet.</Text>
        <Button to="/products" variant="primary">Browse products</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((p) => (
        <div key={p.id}>
          <ProductCard product={p} quickAdd storeDomain={storeDomain} isFavoriteCard />
        </div>
      ))}
    </div>
  );
}

export default function FavoritesPage() {
  const data = useLoaderData<typeof loader>();
  const {favorites: clientFavorites} = useFavorites();

  const displayFavorites = clientFavorites.length > 0 ? clientFavorites : data.favorites;
  const displayCount = displayFavorites.length;

  return (
    <>
      <PageHeader heading="My Favorites">
        <Text className="text-sm text-primary/70">{displayCount} saved</Text>
      </PageHeader>

      <div className="px-4 py-6 md:px-8 lg:px-12">
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({length: 8}).map((_, i) => (
              <div key={`sk-${i}`} className="min-h-[320px]">
                <Skeleton className="w-full h-full" />
              </div>
            ))}
          </div>
        }>
          <Await resolve={data.productsPromise}>
            {(products) => (
              <FavoritesGrid initialProducts={products?.nodes || []} serverFavorites={data.favorites} storeDomain={data.storeDomain} />
            )}
          </Await>
        </Suspense>
      </div>
      <FavoritesDebugBanner />
    </>
  );
}