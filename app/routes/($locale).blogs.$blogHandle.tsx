import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type MetaArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type SVGProps,
} from 'react';
import invariant from 'tiny-invariant';

import {routeHeaders} from '~/data/cache';
import {Image} from '~/components/Image';
import {Link} from '~/components/Link';
import {IconArrow} from '~/components/Icon';
import {seoPayload} from '~/lib/seo.server';

export const headers = routeHeaders;

function getFirstImageUrlFromHtml(html?: string | null) {
  if (typeof html !== 'string' || !html) return null;
  const match = html.match(/<img[^>]+src=(?:"([^"]+)"|'([^']+)')/i);
  return match?.[1] || match?.[2] || null;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getExcerpt(article: any) {
  const raw =
    (typeof article?.excerpt === 'string' && article.excerpt) ||
    (typeof article?.excerptHtml === 'string' && stripHtml(article.excerptHtml)) ||
    (typeof article?.contentHtml === 'string' && stripHtml(article.contentHtml)) ||
    '';

  const text = raw.trim();
  if (!text) return '';
  return text.length > 120 ? `${text.slice(0, 120).trim()}…` : text;
}

export async function loader({request, params, context}: LoaderFunctionArgs) {
  invariant(params.blogHandle, 'Missing article handle');

  if (params.blogHandle.toLowerCase() === 'news') {
    const prefix = params?.locale ? `/${params.locale}` : '';
    return redirect(`${prefix}/blogs`, 301);
  }

  const {language, country} = context.storefront.i18n;

  const {blog} = await context.storefront.query(ARTICLE_QUERY, {
    variables: {
      blogHandle: 'news',
      articleHandle: params.blogHandle,
      language,
    },
  });

  if (!blog?.articleByHandle) {
    throw new Response('Not found', {status: 404});
  }

  const article = blog.articleByHandle;

  const formattedDate = new Intl.DateTimeFormat(`${language}-${country}`, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article?.publishedAt!));

  const relatedArticles = ((blog as any)?.articles?.edges || [])
    .map((e: any) => e?.node)
    .filter(Boolean)
    .filter((a: any) => a?.handle !== article?.handle)
    .slice(0, 8);

  const shareImageUrlRaw =
    (typeof (article as any)?.image?.url === 'string' && (article as any).image.url) ||
    getFirstImageUrlFromHtml((article as any)?.contentHtml) ||
    null;

  let shareImageUrl: string | null = null;
  if (shareImageUrlRaw) {
    try {
      shareImageUrl = new URL(shareImageUrlRaw, request.url).toString();
    } catch {
      shareImageUrl = shareImageUrlRaw;
    }
  }

  const seo = {
    ...seoPayload.article({article, url: request.url}),
    titleTemplate: '%s | Blogs',
    ...(shareImageUrl
      ? {
          media: {
            type: 'image',
            url: shareImageUrl,
          },
        }
      : null),
  };

  return json({
    article,
    formattedDate,
    relatedArticles,
    seo,
    canonicalUrl: request.url,
    shareImageUrl,
  });
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  const seoEntries = (matches || [])
    .map((m) => (m.data as any)?.seo)
    .filter(Boolean) as any[];
  if (seoEntries.length > 0) return getSeoMeta(...seoEntries);
  return [{title: 'Article'}];
};

export default function BlogArticleByHandleRoute() {
  const {article, formattedDate, relatedArticles, canonicalUrl, shareImageUrl} =
    useLoaderData<typeof loader>();

  const {title, image, contentHtml, author} = article;
  const fallbackImageUrl = getFirstImageUrlFromHtml(contentHtml);
  const imageData =
    image ??
    (fallbackImageUrl
      ? {
          url: fallbackImageUrl,
          altText: title,
          width: 1600,
          height: 900,
        }
      : null);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-10 md:py-14">
      {imageData && (
        <div className="overflow-hidden rounded-2xl bg-neutral-100">
          <Image
            data={imageData as any}
            className="w-full"
            sizes="(min-width: 1024px) 1280px, 100vw"
            loading="eager"
          />
        </div>
      )}

      <div className="mt-10 md:mt-12 text-center">
        <div className="text-sm text-neutral-500">{formattedDate}</div>
        <h1 className="mt-4 text-3xl md:text-5xl font-medium tracking-tight leading-tight">
          {title}
        </h1>
        {author?.name ? (
          <div className="mt-4 text-xs tracking-[0.18em] text-neutral-700 uppercase">
            By {author.name}
          </div>
        ) : null}
        <hr className="mt-10 md:mt-12 mx-auto w-44 border-neutral-200" />
      </div>

      <div
        dangerouslySetInnerHTML={{__html: contentHtml}}
        className="article mt-10 md:mt-12"
      />

      <BlogArticleFooter
        title={title}
        url={canonicalUrl}
        mediaUrl={shareImageUrl || undefined}
        relatedArticles={relatedArticles as any[]}
      />
    </div>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 22v-8h2.7l.4-3H13.5V9.1c0-.9.3-1.6 1.6-1.6h1.6V4.8c-.3 0-1.4-.1-2.7-.1-2.7 0-4.6 1.7-4.6 4.8V11H7v3h2.4v8h4.1Z" />
    </svg>
  );
}

function PinterestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.1 2C6.6 2 3 5.7 3 10.6c0 3.3 1.8 5.2 3.9 5.2.6 0 .9-.4 1-1l.4-1.6c.1-.4.1-.5-.2-.9-.8-.9-1.2-2-1.2-3.3 0-3.2 2.5-6.3 6.7-6.3 3.6 0 5.6 2.2 5.6 5.1 0 3.9-1.7 7.2-4.3 7.2-1.4 0-2.5-1.2-2.1-2.6l.8-3.2c.3-1.3-.2-2.4-1.4-2.4-1.1 0-2 1.1-2.3 2.5-.2.8-.2 1.3-.2 1.3l-1.4 5.8c-.4 1.6-.1 3.6 0 3.8 0 .1.1.2.3.1.1-.1 1.6-2 2.1-3.6l.8-3c.4.7 1.5 1.3 2.7 1.3 3.6 0 6.1-3.3 6.1-7.7C21 5.1 17.4 2 12.1 2Z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.5l-5.1-6.6L5.6 22H2.5l7.3-8.4L2.3 2h6.7l4.6 6 5.3-6Zm-1.1 18h1.7L8.1 3.9H6.3L17.8 20Z" />
    </svg>
  );
}

function BlogArticleFooter({
  title,
  url,
  mediaUrl,
  relatedArticles,
}: {
  title: string;
  url?: string;
  mediaUrl?: string;
  relatedArticles: any[];
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [ShareButtons, setShareButtons] = useState<null | any>(null);

  useEffect(() => {
    let mounted = true;
    import('../components/BlogShareButtons.client')
      .then((mod) => {
        if (!mounted) return;
        const Cmp = (mod as any).BlogShareButtons || (mod as any).default;
        if (!Cmp) throw new Error('BlogShareButtons export not found');
        setShareButtons(() => Cmp);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setShareButtons(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const shareUrl = useMemo(() => {
    if (typeof url === 'string' && url) return url;
    return '';
  }, [url]);

  const canShare = Boolean(shareUrl);
  const facebookHref = canShare
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    : undefined;
  const xHref = canShare
    ? `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`
    : undefined;
  const pinterestHref = canShare
    ? `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(mediaUrl || shareUrl)}&description=${encodeURIComponent(title)}`
    : undefined;

  const hasRelated = Array.isArray(relatedArticles) && relatedArticles.length > 0;
  const [canScrollRelated, setCanScrollRelated] = useState(false);

  useEffect(() => {
    if (!hasRelated) return;

    const el = scrollerRef.current;
    if (!el) return;

    const compute = () => {
      const next = el.scrollWidth > el.clientWidth + 4;
      setCanScrollRelated(next);
    };

    compute();

    const ro = new ResizeObserver(() => compute());
    ro.observe(el);

    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [hasRelated, relatedArticles?.length]);

  return (
    <div className="mt-14 md:mt-20">
      <div className="flex items-center gap-3 text-sm text-neutral-700">
        <div className="font-medium">Share:</div>
        {canShare && ShareButtons ? (
          <ShareButtons url={shareUrl} title={title} mediaUrl={mediaUrl} />
        ) : (
          <div className="flex items-center gap-3">
            {facebookHref ? (
              <a
                href={facebookHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Share on Facebook"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            ) : (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-300">
                <FacebookIcon className="h-4 w-4" />
              </span>
            )}

            {pinterestHref ? (
              <a
                href={pinterestHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Share on Pinterest"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              >
                <PinterestIcon className="h-4 w-4" />
              </a>
            ) : (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-300">
                <PinterestIcon className="h-4 w-4" />
              </span>
            )}

            {xHref ? (
              <a
                href={xHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Share on X"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              >
                <XIcon className="h-4 w-4" />
              </a>
            ) : (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-300">
                <XIcon className="h-4 w-4" />
              </span>
            )}
          </div>
        )}
      </div>

      {hasRelated ? (
        <div className="mt-16 md:mt-20">
          <h2 className="text-center text-3xl md:text-4xl font-medium tracking-tight">
            Related articles
          </h2>

          <div className="mt-10 relative overflow-visible">
            {canScrollRelated ? (
              <button
                type="button"
                aria-label="Scroll related articles left"
                onClick={() => scrollerRef.current?.scrollBy({left: -520, behavior: 'smooth'})}
                className="hidden md:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              >
                <IconArrow direction="left" />
              </button>
            ) : null}

            <div
              ref={scrollerRef}
              className={
                canScrollRelated
                  ? 'flex gap-6 overflow-x-auto scroll-smooth pb-4 px-6 md:px-14'
                  : 'flex gap-6 justify-center pb-4'
              }
            >
              {relatedArticles.map((a) => (
                <RelatedArticleCard key={a.id} article={a} />
              ))}
            </div>

            {canScrollRelated ? (
              <button
                type="button"
                aria-label="Scroll related articles right"
                onClick={() => scrollerRef.current?.scrollBy({left: 520, behavior: 'smooth'})}
                className="hidden md:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              >
                <IconArrow direction="right" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RelatedArticleCard({article}: {article: any}) {
  const excerpt = getExcerpt(article);
  const fallbackImageUrl = getFirstImageUrlFromHtml(article?.contentHtml);
  const imageData =
    article?.image ??
    (fallbackImageUrl
      ? {
          url: fallbackImageUrl,
          altText: article.title,
          width: 1200,
          height: 900,
        }
      : null);

  const formatted = article?.publishedAt
    ? new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(article.publishedAt))
    : '';

  return (
    <div className="w-[280px] flex-none">
      <Link to={`/blogs/${article.handle}`} className="group block">
        {imageData ? (
          <div className="overflow-hidden rounded-2xl bg-neutral-100 aspect-[4/3]">
            <Image
              alt={(imageData as any)?.altText || article.title}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
              data={imageData as any}
              aspectRatio="4/3"
              sizes="280px"
              loading="lazy"
            />
          </div>
        ) : null}

        <div className="mt-4 text-[15px] font-bold leading-snug">{article.title}</div>
        {formatted ? (
          <div className="mt-1 text-sm text-neutral-600">{formatted}</div>
        ) : null}
        {excerpt ? (
          <div className="mt-2 text-sm text-neutral-700 line-clamp-2">{excerpt}</div>
        ) : null}
      </Link>
    </div>
  );
}

const ARTICLE_QUERY = `#graphql
  query ArticleDetails(
    $language: LanguageCode
    $blogHandle: String!
    $articleHandle: String!
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        title
        contentHtml
        publishedAt
        handle
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }

      articles(first: 9) {
        edges {
          node {
            id
            handle
            title
            publishedAt
            excerpt
            excerptHtml
            contentHtml
            image {
              id
              altText
              url
              width
              height
            }
          }
        }
      }
    }
  }
` as const;
