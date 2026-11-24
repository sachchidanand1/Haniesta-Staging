import {parseJudgemeWidgetHTML} from '~/utils/judgeme';

export type ProductReviewForSchema = {
  authorName: string;
  datePublished: string;
  reviewBody: string;
  ratingValue: number;
};

export type ProductReviewsSchemaData = {
  averageRating: number;
  reviewCount: number;
  reviews: ProductReviewForSchema[];
};

const JUDGEME_PRODUCT_API = 'https://judge.me/api/v1/products/-1';
const JUDGEME_WIDGET_API = 'https://api.judge.me/api/v1/widgets/product_review';
const JUDGEME_REVIEWS_API = 'https://api.judge.me/api/v1/reviews';
const MAX_REVIEWS_IN_SCHEMA = 10;

function sanitizeShopDomain(v: string): string {
  const raw = String(v || '').trim();
  if (!raw) return raw;
  try {
    const test = raw.startsWith('http') ? raw : `https://${raw}`;
    return new URL(test).hostname;
  } catch {
    return raw.replace(/^https?:\/\//, '').split('/')[0];
  }
}

function reviewerName(rev: any): string {
  const rawName = String(rev?.reviewer?.name || '').trim();
  const email = String(rev?.reviewer?.email || '').trim();
  if (rawName && !/^customer$/i.test(rawName)) return rawName;
  if (email) {
    const local = email.split('@')[0] || '';
    if (local) return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return 'Haniesta customer';
}

function mapReview(rev: any): ProductReviewForSchema | null {
  const rating = Number(rev?.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return null;

  const body = String(rev?.body || rev?.content || '').trim();
  const title = String(rev?.title || '').trim();
  const reviewBody = body || title;
  if (!reviewBody) return null;

  const created = rev?.created_at || rev?.createdAt;
  const datePublished = created
    ? new Date(created).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return {
    authorName: reviewerName(rev),
    datePublished,
    reviewBody,
    ratingValue: rating,
  };
}

/**
 * Fetches Judge.me review data for Product JSON-LD (aggregateRating + review).
 */
export async function fetchJudgeMeProductReviewsForSchema(
  env: Record<string, string | undefined>,
  productHandle: string,
): Promise<ProductReviewsSchemaData | null> {
  const token = env.JUDGEME_PRIVATE_API_TOKEN;
  const shopDomain = sanitizeShopDomain(
    env.JUDGEME_SHOP_DOMAIN || env.PUBLIC_STORE_DOMAIN || '',
  );

  if (!token || !shopDomain || !productHandle) return null;

  const disableExternal = String(env.DISABLE_EXTERNAL_FETCH || '').toLowerCase();
  if (disableExternal === '1' || disableExternal === 'true') return null;

  try {
    const productUrl = new URL(JUDGEME_PRODUCT_API);
    productUrl.searchParams.set('handle', productHandle);
    productUrl.searchParams.set('shop_domain', shopDomain);
    productUrl.searchParams.set('api_token', token);

    const widgetUrl = new URL(JUDGEME_WIDGET_API);
    widgetUrl.searchParams.set('api_token', token);
    widgetUrl.searchParams.set('shop_domain', shopDomain);
    widgetUrl.searchParams.set('handle', productHandle);
    widgetUrl.searchParams.set('per_page', '1');
    widgetUrl.searchParams.set('page', '1');

    // Parallelize product lookup + widget summary (was sequential).
    const [prodJson, widgetJson] = (await Promise.all([
      fetch(productUrl.toString(), {headers: {Accept: 'application/json'}})
        .then((res) => res.json().catch(() => null))
        .catch(() => null),
      fetch(widgetUrl.toString(), {headers: {Accept: 'application/json'}})
        .then((res) => res.json().catch(() => null))
        .catch(() => null),
    ])) as [
      {product?: {id?: number}} | null,
      {widget?: string} | null,
    ];

    const productId = prodJson?.product?.id;
    const widgetHtml = widgetJson?.widget || '';
    const summary = parseJudgemeWidgetHTML(widgetHtml);

    let reviews: ProductReviewForSchema[] = [];
    if (productId) {
      const reviewsUrl = new URL(JUDGEME_REVIEWS_API);
      reviewsUrl.searchParams.set('api_token', token);
      reviewsUrl.searchParams.set('shop_domain', shopDomain);
      reviewsUrl.searchParams.set('product_id', String(productId));
      reviewsUrl.searchParams.set('per_page', String(MAX_REVIEWS_IN_SCHEMA));
      reviewsUrl.searchParams.set('page', '1');

      const revJson = (await fetch(reviewsUrl.toString(), {
        headers: {Accept: 'application/json'},
      })
        .then((res) => res.json().catch(() => null))
        .catch(() => null)) as {reviews?: any[]} | null;
      reviews = (revJson?.reviews || [])
        .map(mapReview)
        .filter((r): r is ProductReviewForSchema => r !== null);
    }

    const reviewCount = Math.max(
      summary.totalReviews,
      reviews.length,
    );
    const averageRating =
      summary.averageRating > 0
        ? summary.averageRating
        : reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.ratingValue, 0) / reviews.length
          : 0;

    if (reviewCount <= 0 || averageRating <= 0) return null;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount,
      reviews,
    };
  } catch {
    return null;
  }
}
