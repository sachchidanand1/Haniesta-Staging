/// <reference types="vite/client" />
/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

import type {
  WithCache,
  HydrogenCart,
  HydrogenSessionData,
} from '@shopify/hydrogen';
import type {Storefront, CustomerAccount} from '~/lib/type';
import type {AppSession} from '~/lib/session.server';

declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: {env: {NODE_ENV: 'production' | 'development'}};

  /**
   * Declare expected Env parameter in fetch handler.
   */
  interface Env {
    SESSION_SECRET: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PRIVATE_STOREFRONT_API_TOKEN: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_URL: string;
    PUBLIC_CHECKOUT_DOMAIN: string;
    SHOP_ID: string;
    SHOPIFY_CUSTOMER_API_VERSION: string;
    ADMIN_API_ACCESS_TOKEN: string;
    SHOPIFY_ADMIN_ACCESS_TOKEN: string;
    SHOPIFY_ADMIN_API_VERSION: string;
    PUBLIC_KLAVIYO_PUBLIC_API_KEY?: string;
    PUBLIC_KLAVIYO_API_KEY?: string;
    PUBLIC_KLAVIYO_SIGNUP_FORM_ID?: string;
    KLAVIYO_PRIVATE_API_KEY: string;
    KLAVIYO_WAITLIST_LIST_ID: string;
    TRACK123_API_KEY?: string;
    TRACK123_BASE_URL?: string;
    TRACK123_SHOP_UUID?: string;
    /**
     * Theme tokens
     */
    PRODUCT_REVIEWS_COLOR?: string; // Hex or CSS color value for Judge.me stars and histogram
    /**
     * Judge.me configuration (server-side only)
     */
    JUDGEME_BASE_URL: string; // e.g. https://api.judge.me/api/v1
    JUDGEME_SHOP_DOMAIN: string; // optional override for Judge.me shop_domain (e.g. your-store.myshopify.com)
    JUDGEME_PRIVATE_API_TOKEN: string; // Private API token from Judge.me
  }
}

declare module '@shopify/remix-oxygen' {
  /**
   * Declare local additions to the Remix loader context.
   */
  export interface AppLoadContext {
    waitUntil: ExecutionContext['waitUntil'];
    session: AppSession;
    storefront: Storefront;
    customerAccount: CustomerAccount;
    cart: HydrogenCart;
    env: Env;
  }

  /**
   * Declare local additions to the Remix session data.
   */
  interface SessionData extends HydrogenSessionData {}
}

declare module '*.png' {
  const src: string;
  export default src;
}

// Needed to make this file a module.
export {};
