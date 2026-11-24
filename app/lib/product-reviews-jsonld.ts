export type ProductReviewJsonLd = {
  authorName: string;
  datePublished: string;
  reviewBody: string;
  ratingValue: number;
};

export type ProductReviewsJsonLdData = {
  averageRating: number;
  reviewCount: number;
  reviews: ProductReviewJsonLd[];
};

/**
 * Builds AggregateRating/Review JSON-LD after Judge.me resolves off the
 * critical path. Safe for client + server (no Node-only APIs / .server imports).
 */
export function productReviewsJsonLdScript({
  url,
  productTitle,
  selectedVariant,
  reviews,
}: {
  url: string;
  productTitle: string;
  selectedVariant?: {
    image?: {url?: string | null} | null;
    sku?: string | null;
  } | null;
  reviews: ProductReviewsJsonLdData;
}): string | null {
  if (!reviews || reviews.reviewCount <= 0) return null;

  const productNode: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': url,
    name: productTitle,
    ...(selectedVariant?.image?.url ? {image: [selectedVariant.image.url]} : {}),
    ...(selectedVariant?.sku ? {sku: selectedVariant.sku} : {}),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: reviews.averageRating,
      reviewCount: reviews.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  };

  if (reviews.reviews.length > 0) {
    const itemReviewed = {
      '@type': 'Product',
      '@id': url,
      name: productTitle,
      ...(selectedVariant?.image?.url
        ? {image: selectedVariant.image.url}
        : {}),
      ...(selectedVariant?.sku ? {sku: selectedVariant.sku} : {}),
    };

    productNode.review = reviews.reviews.map((rev) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: rev.authorName,
      },
      datePublished: rev.datePublished,
      reviewBody: rev.reviewBody,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: rev.ratingValue,
        bestRating: 5,
        worstRating: 1,
      },
      itemReviewed,
    }));
  }

  return JSON.stringify(productNode);
}
