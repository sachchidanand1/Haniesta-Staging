import type { AppLoadContext, EntryContext } from '@shopify/remix-oxygen';
import { RemixServer } from '@remix-run/react';
import isbot from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import { createContentSecurityPolicy } from '@shopify/hydrogen';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  context: AppLoadContext,
) {
  const storeDomain = context.env.PUBLIC_STORE_DOMAIN;
  const checkoutDomain = context.env.PUBLIC_CHECKOUT_DOMAIN || 'checkout.shopify.com';
  const { nonce, header, NonceProvider } = createContentSecurityPolicy({
    shop: {
      checkoutDomain,
      storeDomain,
    },
    fontSrc: [
      'self',
      'data:',
      'blob:',
      'https:',
      'https://cdn.shopify.com',
      ...(storeDomain ? [`https://${storeDomain}`] : []),
      ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:*'] : []),
    ],
    styleSrc: [
      'self',
      'unsafe-inline',
      'https://cdn.shopify.com',
      'https://static.klaviyo.com',
      'https://static-tracking.klaviyo.com',
      'https://fonts.googleapis.com',
      ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:*'] : []),
    ],
    imgSrc: [
      'self',
      'blob:',
      'data:',
      'https:',
      'https://cdn.shopify.com',
      'https://xinglian-dev-1254213275.cos.accelerate.myqcloud.com',
      ...(storeDomain ? [`https://${storeDomain}`] : []),
      ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:*'] : []),
    ],
    scriptSrc: [
      'self',
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://static.klaviyo.com',
      'https://static-tracking.klaviyo.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://connect.facebook.net',
      'unsafe-inline',
      "'sha256-FeKBGzRHcROv0xd1BUE68Cy1yefbayaeP0AhzHm/mNo='",
      "'sha256-ecazt1o8Qp0CgUTpmtNT86WqcsylPaAC+IgAmZ6K6HE='",
      "'sha256-gde7pNyV/Ngul2V0ZqeStuua+JlFyYa3khCs5YU0gzE='",
      ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:*'] : []),
    ],
    mediaSrc: [
      'self',
      'blob:',
      'data:',
      'https://cdn.shopify.com',
      ...(storeDomain ? [`https://${storeDomain}`] : []),
      ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:*'] : []),
    ],
    connectSrc: [
      'self',
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://monorail-edge.shopifysvc.com',
      'https://a.klaviyo.com',
      'https://fast.a.klaviyo.com',
      'https://static-tracking.klaviyo.com',
      'https://static-forms.klaviyo.com',
      'https://www.google-analytics.com',
      'https://region1.google-analytics.com',
      'https://analytics.google.com',
      'https://www.google.com',
      'https://www.googletagmanager.com',
      'https://www.facebook.com',
      'https://connect.facebook.net',
      'https://hydrogen-app-builder.vercel.app',
      `https://${checkoutDomain}`,
      ...(storeDomain ? [`https://${storeDomain}`] : []),
      ...(process.env.NODE_ENV !== 'production'
        ? ['http://localhost:*', 'ws://localhost:*', 'ws://127.0.0.1:*']
        : []),
    ],
    frameSrc: [
      'self',
      'https://www.facebook.com',
      'https://connect.facebook.net',
      'https://staticxx.facebook.com',
      ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:*'] : []),
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
