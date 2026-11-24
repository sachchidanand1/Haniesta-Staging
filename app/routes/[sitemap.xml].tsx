import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

import {getSitemapIndex} from 'app/lib/sitemap';

const FALLBACK_SITEMAP_QUERY = `#graphql
  query FallbackSitemap($productsFirst: Int!, $collectionsFirst: Int!, $pagesFirst: Int!, $articlesFirst: Int!) {
    products(first: $productsFirst) {
      nodes {
        handle
        updatedAt
      }
    }
    collections(first: $collectionsFirst) {
      nodes {
        handle
        updatedAt
      }
    }
    pages(first: $pagesFirst) {
      nodes {
        handle
        updatedAt
      }
    }
    articles(first: $articlesFirst) {
      nodes {
        handle
        blog {
          handle
        }
        publishedAt
      }
    }
  }
` as const;

function renderUrlSet({
  baseUrl,
  staticPaths,
  products,
  collections,
  pages,
  articles,
}: {
  baseUrl: string;
  staticPaths: string[];
  products: Array<{handle: string; updatedAt?: string | null}>;
  collections: Array<{handle: string; updatedAt?: string | null}>;
  pages: Array<{handle: string; updatedAt?: string | null}>;
  articles?: Array<{handle: string; blog?: {handle: string} | null; updatedAt?: string | null}>;
}) {
  const now = new Date().toISOString();
  const urlTag = (loc: string, lastmod?: string | null) => {
    const lm = lastmod || now;
    return `<url><loc>${loc}</loc><lastmod>${lm}</lastmod></url>`;
  };

  const urls: string[] = [];
  for (const p of staticPaths) {
    urls.push(urlTag(`${baseUrl}${p}`, now));
  }
  for (const p of products) {
    if (!p?.handle) continue;
    urls.push(urlTag(`${baseUrl}/products/${encodeURIComponent(p.handle)}`, p.updatedAt));
  }
  for (const c of collections) {
    if (!c?.handle) continue;
    urls.push(urlTag(`${baseUrl}/collections/${encodeURIComponent(c.handle)}`, c.updatedAt));
  }
  for (const pg of pages) {
    if (!pg?.handle) continue;
    urls.push(urlTag(`${baseUrl}/pages/${encodeURIComponent(pg.handle)}`, pg.updatedAt));
  }
  if (articles) {
    for (const art of articles) {
      if (!art?.handle) continue;
      const blogHandle = art.blog?.handle || 'blogs';
      urls.push(urlTag(`${baseUrl}/blogs/${encodeURIComponent(blogHandle)}/${encodeURIComponent(art.handle)}`, art.publishedAt));
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
    '\n',
  )}\n</urlset>`;
}

export async function loader({
  request,
  context: {storefront},
}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const baseUrl = url.origin;

  const response = await getSitemapIndex({
    storefront,
    request,
    types: ['products', 'pages', 'collections', 'articles'],
    customUrls: [],
  });

  const body = await response.text();
  const hasDynamicSitemaps = body.includes('/sitemap/products/') || body.includes('/sitemap/collections/') || body.includes('/sitemap/pages/');
  if (!hasDynamicSitemaps) {
    const fallback = await storefront.query(FALLBACK_SITEMAP_QUERY, {
      variables: {
        productsFirst: 250,
        collectionsFirst: 250,
        pagesFirst: 250,
        articlesFirst: 250,
      },
    });

    const xml = renderUrlSet({
      baseUrl,
      staticPaths: [
        '/',
        '/bespoke',
        '/about',
        '/favorites',
        '/products',
        '/featured',
        '/lifestyle',
        '/track-shipment',
      ],
      products: (fallback as any)?.products?.nodes ?? [],
      collections: (fallback as any)?.collections?.nodes ?? [],
      pages: (fallback as any)?.pages?.nodes ?? [],
      articles: (fallback as any)?.articles?.nodes ?? [],
    });

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': `max-age=${60 * 60 * 24}`,
        'Oxygen-Cache-Control': `max-age=${60 * 60 * 24}`,
        Vary: 'Accept-Encoding, Accept-Language',
      },
    });
  }

  response.headers.set('Oxygen-Cache-Control', `max-age=${60 * 60 * 24}`);
  response.headers.set('Vary', 'Accept-Encoding, Accept-Language');

  return new Response(body, {
    headers: response.headers,
    status: response.status,
  });
}
