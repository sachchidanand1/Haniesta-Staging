import {useRouteLoaderData} from '@remix-run/react';
import type {RootLoader} from '~/root';

/**
 * Hook to access the Shopify Customer Account API version from the root loader
 * @returns The API version string
 */
export function useShopifyCustomerApiVersion(): string {
  const rootData = useRouteLoaderData<RootLoader>('root');
  return rootData?.shopifyCustomerApiVersion || '2025-07';
}
