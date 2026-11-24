import {
  json,
  type LoaderFunctionArgs,
  type MetaArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {flattenConnection, getSeoMeta} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';

import {BlogList} from '~/components/BlogList';
import {seoPayload} from '~/lib/seo.server';
import {CACHE_SHORT, routeHeaders} from '~/data/cache';
import type {ArticleFragment} from 'storefrontapi.generated';

export const headers = routeHeaders;

const ARTICLES_PER_PAGE = 12;

type ArticleCardData = ArticleFragment & {publishedAt: string};

function stripHtml(html: string) {
  return html
    .replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, ' ')
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getExcerpt(article: any) {
  const raw =
    (typeof article?.excerpt === 'string' && article.excerpt) ||
    (typeof article?.excerptHtml === 'string' && stripHtml(article.excerptHtml)) ||
    (typeof article?.contentHtml === 'string' && stripHtml(article.contentHtml)) ||
    '';

  const text = raw.trim();
  if (!text) return '';
  return text.length > 140 ? `${text.slice(0, 140).trim()}…` : text;
}

function getFirstImageUrlFromHtml(html?: string | null) {
  if (typeof html !== 'string' || !html) return null;
  const match = html.match(/<img[^>]+src=(?:"([^"]+)"|'([^']+)')/i);
  return match?.[1] || match?.[2] || null;
}

export async function loader({request, context: {storefront}}: LoaderFunctionArgs) {
  const {language, country} = storefront.i18n;
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');

  const {blog} = await storefront.query(BLOG_QUERY, {
    variables: {
      blogHandle: 'news',
      pageBy: ARTICLES_PER_PAGE,
      language,
      cursor,
    },
  });

  invariant(blog?.articles, 'Blog not found');

  const articles = (flattenConnection(blog.articles as any) as ArticleFragment[])
    .filter(Boolean)
    .map((article) => {
      const formattedPublishedAt = new Intl.DateTimeFormat(
        `${language}-${country}`,
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
      ).format(new Date((article as any)?.publishedAt!));

      return {
        ...(article as ArticleFragment),
        publishedAt: formattedPublishedAt,
      } satisfies ArticleCardData;
    });

  const pageInfo = (blog.articles as any).pageInfo;
  const hasNextPage = pageInfo?.hasNextPage;
  const endCursor = pageInfo?.endCursor;

  const seo = seoPayload.page({
    page: {
      title: 'Blogs',
      seo: {
        title: 'Blogs',
        description: blog?.seo?.description || 'Browse our latest stories and updates.',
      },
    },
    url: request.url,
  });

  return json(
    {blog, articles, seo, hasNextPage, endCursor},
    {
      headers: {
        'Cache-Control': CACHE_SHORT,
      },
    },
  );
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  const seoEntries = (matches || [])
    .map((m) => (m.data as any)?.seo)
    .filter(Boolean) as any[];
  if (seoEntries.length > 0) return getSeoMeta(...seoEntries);
  return [{title: 'Blogs'}];
};

export default function BlogsIndex() {
  const {blog, articles, hasNextPage, endCursor} = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-10 md:py-14">
      <h1 className="text-center text-4xl md:text-5xl font-medium tracking-tight">
        Blogs
      </h1>
      <BlogList
        initialArticles={articles}
        hasNextPage={hasNextPage}
        endCursor={endCursor}
      />
    </div>
  );
}

const BLOG_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $pageBy: Int!
    $cursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      id
      handle
      title
      seo {
        title
        description
      }
      articles(first: $pageBy, after: $cursor) {
        edges {
          node {
            ...Article
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }

  fragment Article on Article {
    author: authorV2 {
      name
    }
    contentHtml
    excerpt
    excerptHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
  }
` as const;
