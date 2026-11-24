import {useShopifyCustomerApiVersion} from '~/hooks/useShopifyCustomerApiVersion';

/**
 * Example component demonstrating how to access the Shopify Customer API version
 * This component can be used anywhere in your app to display or use the API version
 */
export function ShopifyApiVersionDisplay() {
  const apiVersion = useShopifyCustomerApiVersion();

  return (
    <div className="text-sm text-gray-600">
      Shopify Customer API Version: {apiVersion}
    </div>
  );
}

/**
 * Example of how to use the API version in a server-side context
 * This would be used in a loader function
 */
export function getApiVersionFromContext(context: {env: Env}): string {
  const {getShopifyCustomerApiVersion} = await import('~/lib/utils');
  return getShopifyCustomerApiVersion(context.env);
}
