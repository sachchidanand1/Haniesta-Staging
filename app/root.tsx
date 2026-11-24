import {
  defer,
  type LinksFunction,
  type LoaderFunctionArgs,
  type AppLoadContext,
  type MetaArgs,
} from '@shopify/remix-oxygen';
import {
  isRouteErrorResponse,
  Links,
  useLoaderData,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  useRouteError,
  type ShouldRevalidateFunction,
} from '@remix-run/react';
import {
  useNonce,
  Analytics,
  getShopAnalytics,
  getSeoMeta,
  type SeoConfig,
} from '@shopify/hydrogen';
import {useEffect} from 'react';
import invariant from 'tiny-invariant';

import {PageLayout} from '~/components/PageLayout';
import {GenericError} from '~/components/GenericError';
import {NotFound} from '~/components/NotFound';
import {ReleaseSync} from '~/components/ReleaseSync';
import favicon from '~/assets/hanie_favicon_big.ico';
import {seoPayload} from '~/lib/seo.server';
import styles from '~/styles/app.css?url';
import {getAnnouncementBarConfig} from '~/lib/announcement-bar.server';
import {isAnnouncementClosedFromCookieHeader} from '~/lib/announcement-preferences';

// Import Source Sans Pro font
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/600.css';
import '@fontsource/source-sans-pro/700.css';

import {DEFAULT_LOCALE, parseMenu, getShopifyCustomerApiVersion} from './lib/utils';
import {decodeIdTokenClaims, extractCustomerFromClaims} from '~/lib/idtoken.server';
// Admin ID seeding and favorites sync handled by useFavorites hooks

export type RootLoader = typeof loader;

// This is important to avoid re-fetching root queries on sub-navigations
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') {
    return true;
  }

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) {
    return true;
  }

  return false;
};

/**
 * The link to the main stylesheet is purposely not in this list. Instead, it is added
 * in the Layout function.
 *
 * This is to avoid a development bug where after an edit/save, navigating to another
 * link will cause page rendering error "failed to execute 'insertBefore' on 'Node'".
 *
 * This is a workaround until this is fixed in the foundational library.
 */
export const links: LinksFunction = () => {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Cormorant+Garamond:wght@400;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600&family=Manrope:wght@500;700;800&display=swap',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({
    ...deferredData,
    ...criticalData,
  });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({request, context}: LoaderFunctionArgs) {
  // Seed Admin customerId from cookie if present (automatic after login from another app)
  try {
    const cookie = request.headers.get('Cookie') || '';
    const match = /(?:^|;\s*)shopify_customer_id=([^;]+)/.exec(cookie);
    const cookieId = match ? decodeURIComponent(match[1]) : undefined;
    const existing = context.session.get('customerId') as string | undefined;
    if (cookieId && !existing) {
      const gid = cookieId.startsWith('gid://shopify/Customer/')
        ? cookieId
        : /^\d+$/.test(cookieId)
        ? `gid://shopify/Customer/${cookieId}`
        : cookieId;
      context.session.set('customerId', gid);
    }
    // Seed from id token cookie if present and still missing
    if (!context.session.get('customerId')) {
      const idTokenMatch = /(?:^|;\s*)shopify_id_token=([^;]+)/.exec(cookie);
      const idToken = idTokenMatch ? decodeURIComponent(idTokenMatch[1]) : undefined;
      if (idToken) {
        const claims = decodeIdTokenClaims(idToken);
        const extracted = extractCustomerFromClaims(claims);
        const possibleId = extracted.id as string | undefined;
        if (possibleId) {
          const gid = possibleId.startsWith('gid://shopify/Customer/')
            ? possibleId
            : /^\d+$/.test(possibleId)
            ? `gid://shopify/Customer/${possibleId}`
            : possibleId;
          context.session.set('customerId', gid);
        }
      }
    }
    // Seed from session-stored id token if present and still missing
    if (!context.session.get('customerId')) {
      const storedToken = context.session.get('shopify_id_token') as string | undefined;
      if (storedToken) {
        const claims = decodeIdTokenClaims(storedToken);
        const extracted = extractCustomerFromClaims(claims);
        const possibleId = extracted.id as string | undefined;
        if (possibleId) {
          const gid = possibleId.startsWith('gid://shopify/Customer/')
            ? possibleId
            : /^\d+$/.test(possibleId)
            ? `gid://shopify/Customer/${possibleId}`
            : possibleId;
          context.session.set('customerId', gid);
        }
      }
    }
  } catch {}
  const cookieHeader = request.headers.get('Cookie');
  const announcementClosed = isAnnouncementClosedFromCookieHeader(cookieHeader);

  const [layout, announcementBarConfig] = await Promise.all([
    getLayoutData(context),
    getAnnouncementBarConfig(context),
    // Add other queries here, so that they are loaded in parallel
  ]);

  const seo = layout?.shop 
    ? seoPayload.root({shop: layout.shop, url: request.url})
    : {
        title: 'Haniesta - Premium Rugs & Home Decor',
        description: 'Discover our collection of premium rugs and home decor items.',
      };

  const {storefront, env} = context;
  const klaviyoPublicApiKey = env.PUBLIC_KLAVIYO_API_KEY || null;
  const klaviyoSignupFormId = env.PUBLIC_KLAVIYO_SIGNUP_FORM_ID || null;

  // Temporary debug: log if Klaviyo key is present on server
  //console.log('[Klaviyo Debug] PUBLIC_KLAVIYO_API_KEY present?', Boolean(env.PUBLIC_KLAVIYO_API_KEY));

  return {
    layout,
    seo,
    announcementBarConfig,
    announcementClosed,
    productReviewsColor: env.PRODUCT_REVIEWS_COLOR || null,
    klaviyoPublicApiKey,
    klaviyoSignupFormId,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN || 'checkout.shopify.com',
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
    },
    selectedLocale: storefront.i18n,
    shopifyCustomerApiVersion: getShopifyCustomerApiVersion(env),
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const {cart, customerAccount} = context;

  return {
    isLoggedIn: customerAccount.isLoggedIn(),
    cart: cart.get(),
  };
}

export const meta = ({data, matches}: MetaArgs<typeof loader>) => {
  const seoEntries = (matches || [])
    .map((m) => (m.data as any)?.seo)
    .filter(Boolean) as SeoConfig[];
  if (seoEntries.length > 0) return getSeoMeta(...seoEntries);
  if (data?.seo) return getSeoMeta(data.seo as SeoConfig);
  return [
    {title: 'Haniesta - Premium Rugs & Home Decor'},
    {
      name: 'description',
      content: 'Discover our collection of premium rugs and home decor items.',
    },
  ];
};

function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<typeof loader>('root');
  const locale = data?.selectedLocale ?? DEFAULT_LOCALE;
  const reviewsColor = (data as any)?.productReviewsColor as string | null;
  const klaviyoPublicApiKey = (data as any)?.klaviyoPublicApiKey as string | null;
  const klaviyoSignupFormId = (data as any)?.klaviyoSignupFormId as string | null;

  // Temporary debug: log if Klaviyo key is present on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[Klaviyo Debug] klaviyoPublicApiKey present?', Boolean(klaviyoPublicApiKey));
    }
  }, [klaviyoPublicApiKey]);
  
  // Ensure HLS shim is available on client for ReactPlayer without affecting SSR markup
  useEffect(() => {
    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && !window.Hls) {
        import('hls.js')
          .then((mod: any) => {
            // @ts-ignore
            window.Hls = mod?.default || mod;
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (!klaviyoPublicApiKey) return;
      if (typeof document === 'undefined') return;

      const existing = document.getElementById('klaviyo-onsite-script');
      if (existing) return;

      const script = document.createElement('script');
      script.id = 'klaviyo-onsite-script';
      script.async = true;
      script.type = 'text/javascript';
      script.src = `https://static.klaviyo.com/onsite/js/${klaviyoPublicApiKey}/klaviyo.js`;
      document.body.appendChild(script);
    } catch {}
  }, [klaviyoPublicApiKey]);

  // Facebook Pixel initialization (client-only to avoid hydration mismatch)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      
      // @ts-ignore
      !(function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js'));
      
      // @ts-ignore
      fbq('init', '1533254728189953');
      // @ts-ignore
      fbq('track', 'PageView');
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (!klaviyoSignupFormId) return;
      if (typeof document === 'undefined') return;

      const handler = (e: Event) => {
        const target = e.target as HTMLElement | null;
        const trigger = target?.closest?.('.klaviyo_form_trigger') as HTMLElement | null;
        if (!trigger) return;

        e.preventDefault();

        // Klaviyo docs: queue commands on window._klOnsite
        (window as any)._klOnsite = (window as any)._klOnsite || [];
        (window as any)._klOnsite.push(['openForm', klaviyoSignupFormId]);
      };

      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    } catch {
      return;
    }
  }, [klaviyoSignupFormId]);

  // useEffect(() => {
  //   try {

  //     if (typeof document === 'undefined') return;
      
  //     const handler = (e: Event) => {
  //       const target = e.target as HTMLElement | null;
  //       alert('hi')
  //       const trigger = target?.closest?.('.klaviyo_waitlist_trigger') as HTMLElement | null;
  //       if (!trigger) return;

  //       e.preventDefault();

  //       (window as any)._klOnsite = (window as any)._klOnsite || [];
  //       (window as any)._klOnsite.push(['openForm', 'RAwbUa']);
  //     };

  //     document.addEventListener('click', handler);
  //     return () => document.removeEventListener('click', handler);
  //   } catch {
  //     return;
  //   }
  // }, []);
  
  // console.log('Layout component rendered');
  // console.log('Root data:', data);
  


  // Admin ID seeding and favorites sync handled by useFavorites hooks

  return (
    <html lang={locale.language} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="msvalidate.01" content="A352E6A0AF9A652267361BBB572B8468" />
        <meta
          name="google-site-verification"
          content="6JZ5xMpz7ga00o9IQHWElWy554qh2ETrv3PV6569hgQ"
        />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-WFXRK0T7KL"
        />
        <script
          nonce={nonce}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: required by gtag initialization
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-WFXRK0T7KL');`,
          }}
        />
        <link rel="preload" as="style" href={styles} />
        <link rel="stylesheet" href={styles}></link>
        {/* Theme variables injection (product reviews color) */}
        {reviewsColor ? (
          <style
            key="theme-variables"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: we control the content, and it's a simple CSS var
            dangerouslySetInnerHTML={{
              __html: `:root{--color-product-reviews: ${reviewsColor};}`,
            }}
          />
        ) : null}
        <Meta />
        <Links />
        {/* WebMCP - AI Agent Tool Registration */}
        <script
          nonce={nonce}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: WebMCP API registration script
          dangerouslySetInnerHTML={{
            __html: `(function() {
  // WebMCP - AI Agent Tool Registration
  // Only runs if the browser supports the WebMCP API
  if (!navigator.modelContext || typeof navigator.modelContext.registerTool !== 'function') {
    return;
  }

  const controller = new AbortController();
  const signal = controller.signal;

  // Tool 1: Search Products
  navigator.modelContext.registerTool({
    name: 'search_products',
    description: 'Search for rugs on Haniesta by keyword. Returns matching products with names, prices, and URLs.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term e.g. "jute rug", "oval wool rug", "pet friendly rug under £100"'
        }
      },
      required: ['query']
    },
    execute: async ({ query }) => {
      const searchUrl = 'https://haniesta.com/search?q=' + encodeURIComponent(query) + '&type=product';
      return {
        url: searchUrl,
        message: 'Search results for "' + query + '" on Haniesta',
        action: 'navigate',
        target: searchUrl
      };
    }
  }, { signal });

  // Tool 2: Browse Category
  navigator.modelContext.registerTool({
    name: 'browse_category',
    description: 'Browse a specific rug category on Haniesta. Available categories: jute, wool, kilim, braided, pet-friendly, luxury, all-rugs.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['jute', 'wool', 'kilim', 'braided', 'pet-friendly', 'luxury', 'all-rugs'],
          description: 'The rug category to browse'
        }
      },
      required: ['category']
    },
    execute: async ({ category }) => {
      const categoryUrls = {
        'jute': 'https://haniesta.com/collections/bengal-jutes',
        'wool': 'https://haniesta.com/collections/wool',
        'kilim': 'https://haniesta.com/collections/dhurrie-kilim',
        'braided': 'https://haniesta.com/collections/bohemian-braided',
        'pet-friendly': 'https://haniesta.com/collections/eco-friendly',
        'luxury': 'https://haniesta.com/collections/relaxed-luxury',
        'all-rugs': 'https://haniesta.com/products'
      };
      const url = categoryUrls[category] || 'https://haniesta.com/products';
      return {
        url: url,
        message: 'Browse ' + category + ' rugs on Haniesta',
        action: 'navigate',
        target: url
      };
    }
  }, { signal });

  // Tool 3: Get Site Info
  navigator.modelContext.registerTool({
    name: 'get_site_info',
    description: 'Get general information about Haniesta — what they sell, shipping, and contact details.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    execute: async () => {
      return {
        name: 'Haniesta',
        description: 'Haniesta sells handcrafted luxury rugs for modern homes. Specialising in wool, jute, kilim, braided, and pet-friendly rugs crafted in India.',
        shipping: 'Ships across UK and Europe',
        currency: 'GBP (£)',
        website: 'https://haniesta.com',
        collections_url: 'https://haniesta.com/products',
        bespoke: 'Custom/bespoke rugs available at https://haniesta.com/bespoke'
      };
    }
  }, { signal });

  // Cleanup when page unloads
  window.addEventListener('unload', () => controller.abort());
})();`,
          }}
        />
      </head>
      <body style={{fontFamily: "'Source Sans Pro', sans-serif"}}>
        <noscript>
          <img
            height="1"
            width="1"
            style={{display: 'none'}}
            alt=""
            src="https://www.facebook.com/tr?id=1533254728189953&ev=PageView&noscript=1"
          />
        </noscript>
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <PageLayout
              key={`${locale.language}-${locale.country}`}
              layout={data.layout}
            >
              {children}
            </PageLayout>
          </Analytics.Provider>
        ) : (
          children
        )}
        <ReleaseSync />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function ErrorBoundary({error}: {error: Error}) {
  const routeError = useRouteError();
  const isRouteError = isRouteErrorResponse(routeError);

  let title = 'Error';
  let pageType = 'page';

  if (isRouteError) {
    title = 'Not found';
    if (routeError.status === 404) pageType = routeError.data || pageType;
  }

  return (
    <Layout>
      {isRouteError ? (
        <>
          {routeError.status === 404 ? (
            <NotFound type={pageType} />
          ) : (
            <GenericError
              error={{message: `${routeError.status} ${routeError.data}`}}
            />
          )}
        </>
      ) : (
        <GenericError error={error instanceof Error ? error : undefined} />
      )}
    </Layout>
  );
}

const LAYOUT_QUERY = `#graphql
  query layout(
    $language: LanguageCode
    $headerMenuHandle: String!
    $footerMenuHandle: String!
  ) @inContext(language: $language) {
    shop {
      ...Shop
    }
    headerMenu: menu(handle: $headerMenuHandle) {
      ...Menu
    }
    footerMenu: menu(handle: $footerMenuHandle) {
      ...Menu
    }
  }
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain {
      url
    }
    paymentSettings {
      currencyCode
    }
    brand {
      logo {
        image {
          url
        }
      }
    }
  }
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
  fragment ChildMenuItem on MenuItem {
    ...MenuItem
    items {
      id
      resourceId
      tags
      title
      type
      url
    }
  }
  fragment ParentMenuItem on MenuItem {
    ...MenuItem
    items {
      ...ChildMenuItem
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...ParentMenuItem
    }
  }
` as const;

async function getLayoutData({storefront, env}: AppLoadContext) {
  const data = await storefront.query(LAYOUT_QUERY, {
    variables: {
      headerMenuHandle: 'main-menu',
      footerMenuHandle: 'footer',
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  /*
    Modify specific links/routes (optional)
    @see: https://shopify.dev/api/storefront/2025-07/enums/MenuItemType
    e.g here we map:
      - /blogs/news -> /news
      - /blog/news/blog-post -> /news/blog-post
      - /collections/all -> /products
  */
  const customPrefixes = {BLOG: '', CATALOG: 'products'};

  const headerMenu = data?.headerMenu
    ? parseMenu(
        data.headerMenu,
        data.shop.primaryDomain.url,
        env,
        customPrefixes,
      )
    : undefined;

  const footerMenu = data?.footerMenu
    ? parseMenu(
        data.footerMenu,
        data.shop.primaryDomain.url,
        env,
        customPrefixes,
      )
    : undefined;

  return {shop: data.shop, headerMenu, footerMenu};
}
