/**
 * Utility functions for handling checkout-related operations
 */

/**
 * Gets the correct checkout domain for the current environment
 * Accepts a loose env bag to avoid client/server type coupling.
 */
export function getCheckoutDomain(env: any): string {
  return (env && env.PUBLIC_CHECKOUT_DOMAIN) || 'checkout.shopify.com';
}

/**
 * Validates checkout configuration
 * @param env - Environment variables object
 * @returns Object with validation results
 */
export function validateCheckoutConfig(env: any) {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  if (!env.PUBLIC_STOREFRONT_API_TOKEN) {
    issues.push('PUBLIC_STOREFRONT_API_TOKEN is required');
  }

  if (!env.PUBLIC_STORE_DOMAIN) {
    issues.push('PUBLIC_STORE_DOMAIN is required');
  }

  // Check checkout domain
  const checkoutDomain = getCheckoutDomain(env);
  
  if (checkoutDomain.includes('unstable')) {
    warnings.push('Using unstable checkout domain - consider switching to stable');
  }

  if (!checkoutDomain.includes('checkout.shopify.com')) {
    warnings.push('Using custom checkout domain - ensure it\'s properly configured');
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    checkoutDomain,
  };
}

/**
 * Creates a checkout URL with proper error handling
 * @param checkoutUrl - The checkout URL from Shopify
 * @param expectedDomain - Optional expected domain (e.g. from root loader consent.checkoutDomain)
 * @returns The checkout URL or null if invalid
 */
export function createSafeCheckoutUrl(checkoutUrl: string | null, expectedDomain?: string): string | null {
  if (!checkoutUrl) {
    console.warn('No checkout URL provided');
    return null;
  }

  // Validate the checkout URL format
  try {
    const url = new URL(checkoutUrl);
    
    // Ensure it's using HTTPS
    if (url.protocol !== 'https:') {
      console.warn('Checkout URL is not using HTTPS:', checkoutUrl);
    }

    // Domain validation: allow configured domain OR Shopify preview domains
    const host = url.hostname.toLowerCase();
    const expected = (expectedDomain || 'checkout.shopify.com')
      .replace(/^https?:\/\//, '')
      .toLowerCase();

    const isExpected = host === expected || host.endsWith(`.${expected}`);
    const isShopifyPreview = host.endsWith('.myshopify.com');
    if (!isExpected && !isShopifyPreview) {
      console.warn('Checkout URL domain mismatch:', host, 'expected:', expected);
    }

    return checkoutUrl;
  } catch (error) {
    console.error('Invalid checkout URL format:', checkoutUrl, error);
    return null;
  }
}
