import {useState, useEffect} from 'react';
import {useFetcher} from '@remix-run/react';
import {Image} from '~/components/Image';
import {Link} from '~/components/Link';
import {getImageLoadingPriority} from '~/lib/const';
import type {ArticleFragment} from 'storefrontapi.generated';

type ArticleCardData = ArticleFragment & {publishedAt: string};

type BlogListProps = {
  initialArticles: ArticleCardData[];
  hasNextPage: boolean;
  endCursor: string | null;
};

type FetcherData = {
  articles: ArticleCardData[];
  hasNextPage: boolean;
  endCursor: string | null;
};

export function BlogList({initialArticles, hasNextPage, endCursor}: BlogListProps) {
  const [allArticles, setAllArticles] = useState<ArticleCardData[]>(initialArticles);
  const [currentHasNextPage, setCurrentHasNextPage] = useState(hasNextPage);
  const [currentEndCursor, setCurrentEndCursor] = useState(endCursor);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetcher = useFetcher<FetcherData>();

  // When fetcher returns new data, accumulate articles
  useEffect(() => {
    if (fetcher.data && fetcher.data.articles) {
      const newArticles = fetcher.data.articles;
      setAllArticles((prev) => {
        const existingIds = new Set(prev.map(a => a.id));
        const filteredNew = newArticles.filter((a: any) => !existingIds.has(a.id));
        return [...prev, ...filteredNew];
      });
      setCurrentHasNextPage(fetcher.data.hasNextPage);
      setCurrentEndCursor(fetcher.data.endCursor);
      setIsLoading(false);
    }
  }, [fetcher.data]);

  const loadMore = () => {
    if (currentEndCursor && !isLoading) {
      setIsLoading(true);
      fetcher.load(`/blogs?cursor=${encodeURIComponent(currentEndCursor)}`);
    }
  };

  return (
    <>
      <ol className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {allArticles.map((article: any, i: number) => (
          <ArticleCard
            key={article.id}
            article={article}
            loading={getImageLoadingPriority(i, 3)}
          />
        ))}
      </ol>
      {currentHasNextPage && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Load More Articles'}
          </button>
        </div>
      )}
    </>
  );
}

function ArticleCard({
  article,
  loading,
}: {
  article: ArticleCardData;
  loading?: HTMLImageElement['loading'];
}) {
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

  return (
    <li key={article.id}>
      <Link to={`/blogs/${article.handle}`} className="group block">
        {imageData && (
          <div className="overflow-hidden rounded-2xl bg-neutral-100 aspect-[4/3]">
            <Image
              alt={imageData?.altText || article.title}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
              data={imageData}
              aspectRatio="4/3"
              loading={loading}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            />
          </div>
        )}
        <h2 className="mt-4 text-[15px] md:text-base font-bold leading-snug">
          {article.title}
        </h2>
        <div className="mt-1 text-sm text-neutral-600">{article.publishedAt}</div>
        {excerpt ? (
          <div className="mt-2 text-sm text-neutral-700 line-clamp-2">
            {excerpt}
          </div>
        ) : null}
      </Link>
    </li>
  );
}
