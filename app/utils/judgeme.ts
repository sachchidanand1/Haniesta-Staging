export type JudgemeRatingDistribution = {
  rating: number;
  frequency: number;
  percentage: number;
};

export type JudgemeWidgetData = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: JudgemeRatingDistribution[];
};

const WIDGET_REGEX = /class=['"]jdgm-rev-widg['"][^>]*data-average-rating=['"]([^'"]*)['"]/;
const REVIEWS_REGEX = /data-number-of-reviews=['"]([^'"]*)['"]/;
const HISTOGRAM_ROW_REGEX = /class=['"]jdgm-histogram__row['"][^>]*data-rating=['"](\d+)['"][^>]*data-frequency=['"](\d+)['"][^>]*data-percentage=['"](\d+)['"][^>]*>/g;

/** Remove JSON-LD scripts from Judge.me widget HTML (invalid Review snippets). */
export function stripStructuredDataScripts(html: string): string {
  if (!html) return html;
  return html.replace(
    /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
    '',
  );
}

export function parseJudgemeWidgetHTML(html: string): JudgemeWidgetData {
  // Reset global regex state (important because /g regex retains lastIndex across calls)
  HISTOGRAM_ROW_REGEX.lastIndex = 0;
  const ratingDistribution: JudgemeRatingDistribution[] = [];
  let match: RegExpExecArray | null;
  match = HISTOGRAM_ROW_REGEX.exec(html);
  while (match !== null) {
    const rating = Number.parseInt(match[1], 10);
    const frequency = Number.parseInt(match[2], 10);
    const percentage = Number.parseInt(match[3], 10);
    ratingDistribution.push({rating, frequency, percentage});
    match = HISTOGRAM_ROW_REGEX.exec(html);
  }

  const avgMatch = html.match(WIDGET_REGEX)?.[1] ?? html.match(/data-average-rating=['"]([^'"]+)['"]/i)?.[1] ?? '0';
  const totalMatch = html.match(REVIEWS_REGEX)?.[1] ?? html.match(/data-number-of-reviews=['"]([^'"]+)['"]/i)?.[1] ?? '0';

  return {
    averageRating: Number.parseFloat(avgMatch || '0'),
    totalReviews: Number.parseInt(totalMatch || '0', 10),
    ratingDistribution: ratingDistribution.sort((a, b) => b.rating - a.rating),
  };
}

const AVG_RATING_REGEX = /data-average-rating=['"]([^'"]+)['"]/;
const NUM_REVIEWS_REGEX = /data-number-of-reviews=['"]([^'"]+)['"]/;

export function parseBadgeHtml(html: string): {
  totalReviews: number;
  averageRating: number;
  badge: string;
} {
  return {
    totalReviews: Number.parseInt(html.match(NUM_REVIEWS_REGEX)?.[1] || '0', 10),
    averageRating: Number.parseFloat(html.match(AVG_RATING_REGEX)?.[1] || '0'),
    badge: html,
  };
}
