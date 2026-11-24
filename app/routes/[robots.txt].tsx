import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';

export const loader = ({request}: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  return new Response(robotsTxtData({url: url.origin}), {
    status: 200,
    headers: {
      'content-type': 'text/plain',
      // Cache for 24 hours
      'cache-control': `max-age=${60 * 60 * 24}`,
    },
  });
};

function robotsTxtData({url}: {url: string}) {
  const sitemapUrl = url ? `${url}/sitemap.xml` : 'https://haniesta.com/sitemap.xml';

  return `
User-agent: *
Disallow: /admin
Disallow: /cart
Disallow: /carts
Disallow: /orders
Disallow: /checkouts/
Disallow: /checkout
Disallow: /account
Disallow: /*?*q=*
Disallow: /*?*sort=*
Allow: /
Allow: /llms.txt
Allow: /sitemap.xml

# Google adsbot ignores robots.txt unless specifically named!
User-agent: adsbot-google
Disallow: /checkouts/
Disallow: /checkout
Disallow: /carts
Disallow: /orders

# AI & LLM Search Engine Crawlers (2026 GEO Standard)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Pinterest
Crawl-delay: 1

Sitemap: ${sitemapUrl}
`.trim();
}
