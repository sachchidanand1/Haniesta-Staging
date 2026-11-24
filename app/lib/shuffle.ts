import isbot from 'isbot';

/**
 * Mulberry32 32-bit pseudo-random number generator
 */
export function createSeededRng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic Fisher-Yates shuffle with seed, or Math.random if seed is undefined
 */
export function shuffleArray<T>(arr: T[], seed?: number): T[] {
  const rng = seed !== undefined ? createSeededRng(seed) : Math.random;
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Simple string hash to convert strings into a 32-bit integer seed
 */
export function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return h;
}

/**
 * Extract an existing session seed from URL search params (e.g. infinite scroll fetchers)
 * or generate a new one on every direct page visit/refresh.
 *
 * Search engine bots (Googlebot, Bingbot, etc.) receive a stable, deterministic seed
 * based on the pathname so that indexing remains completely consistent.
 */
export function getOrGenerateSeed(request: Request, url: URL): number {
  const seedParam = url.searchParams.get('seed');
  if (seedParam) {
    const parsed = Number(seedParam);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  // If request is from a search engine bot, provide a stable deterministic seed
  const userAgent = request.headers.get('user-agent') || '';
  if (isbot(userAgent)) {
    return Math.abs(hashString(url.pathname)) || 42;
  }

  // Fresh visit / refresh for human users: generate a brand new random seed
  return Math.floor(Math.random() * (2 ** 31 - 1)) + 1;
}

/**
 * Extract grouping key from product for visual diversity
 */
export function normalizeGroupFamilyKey(product: any): string {
  const groupRaw = String(product?.group?.value || '').trim().toLowerCase();
  const titleRaw = String(product?.title || '').trim().toLowerCase();

  const tokenize = (s: string) =>
    s
      .split(/[^a-z0-9]+/g)
      .map((x) => x.trim())
      .filter(Boolean);

  const stop = new Set([
    'handmade',
    'wool',
    'rug',
    'rugs',
    'carpet',
    'carpets',
    'collection',
    'the',
    'and',
    'for',
    'with',
    'of',
  ]);

  const groupTokens = tokenize(groupRaw).filter((t) => !stop.has(t));
  const titleTokens = new Set(tokenize(titleRaw).filter((t) => !stop.has(t)));

  for (let i = groupTokens.length - 1; i >= 0; i--) {
    const t = groupTokens[i];
    if (titleTokens.has(t)) return t;
  }

  if (groupRaw) {
    const parts = groupRaw.split('_').filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
    return groupRaw;
  }

  return '__none__';
}

/**
 * Interleave items so identical groups are not clustered together
 */
export function interleaveToAvoidAdjacent<T>(
  items: T[],
  getGroupKey: (item: T) => string,
  seed: number,
): T[] {
  if (items.length <= 2) return items;

  const rng = createSeededRng(seed);
  const buckets = new Map<string, T[]>();
  const bucketOrder: string[] = [];

  for (const item of items) {
    const key = getGroupKey(item);
    const list = buckets.get(key);
    if (list) {
      list.push(item);
    } else {
      buckets.set(key, [item]);
      bucketOrder.push(key);
    }
  }

  for (const key of bucketOrder) {
    const list = buckets.get(key);
    if (!list || list.length <= 1) continue;
    buckets.set(key, shuffleArray(list, Math.floor(rng() * 2 ** 31)));
  }

  const shuffledBucketOrder = shuffleArray(
    bucketOrder,
    Math.floor(rng() * 2 ** 31),
  );

  const result: T[] = [];
  let lastKey: string | null = null;

  while (result.length < items.length) {
    let bestKey: string | null = null;
    let bestLen = -1;

    for (const key of shuffledBucketOrder) {
      const list = buckets.get(key);
      const len = list?.length ?? 0;
      if (len <= 0) continue;
      if (key === lastKey) continue;
      if (len > bestLen) {
        bestLen = len;
        bestKey = key;
      }
    }

    if (!bestKey) {
      for (const key of shuffledBucketOrder) {
        const list = buckets.get(key);
        const len = list?.length ?? 0;
        if (len > 0) {
          bestKey = key;
          break;
        }
      }
    }

    if (!bestKey) break;
    const list = buckets.get(bestKey);
    if (!list || list.length === 0) break;
    result.push(list.shift() as T);
    lastKey = bestKey;
  }

  return result;
}

/**
 * Prioritize representative rugs from distinct design families first,
 * then ungrouped, then interleaved remainder.
 */
export function prioritizeGroupsThenUngroupedThenRemainder<T>(
  items: T[],
  getGroupKey: (item: T) => string,
  seed: number,
): T[] {
  if (items.length <= 2) return items;

  const rng = createSeededRng(seed);
  const groupedBuckets = new Map<string, T[]>();
  const ungrouped: T[] = [];

  for (const item of items) {
    const key = getGroupKey(item);
    if (!key || key === '__none__') {
      ungrouped.push(item);
      continue;
    }
    const list = groupedBuckets.get(key);
    if (list) list.push(item);
    else groupedBuckets.set(key, [item]);
  }

  const groupKeys = Array.from(groupedBuckets.keys());
  const shuffledGroupKeys = shuffleArray(
    groupKeys,
    Math.floor(rng() * 2 ** 31),
  );

  const firstWave: T[] = [];
  for (const k of shuffledGroupKeys) {
    const list = groupedBuckets.get(k);
    if (!list || list.length === 0) continue;
    firstWave.push(list.shift() as T);
  }

  const ungroupedShuffled =
    ungrouped.length > 1
      ? shuffleArray(ungrouped, Math.floor(rng() * 2 ** 31))
      : ungrouped;

  const remainingGrouped: T[] = [];
  for (const k of shuffledGroupKeys) {
    const list = groupedBuckets.get(k);
    if (!list || list.length === 0) continue;
    remainingGrouped.push(...list);
  }

  const interleavedRemainder = interleaveToAvoidAdjacent(
    remainingGrouped,
    getGroupKey,
    seed ^ 0x51d2e9a,
  );

  return [...firstWave, ...ungroupedShuffled, ...interleavedRemainder];
}

/**
 * Offset-based pagination over an in-memory node array
 */
export function paginateNodes<T>(
  nodes: T[],
  page: number,
  pageSize: number,
) {
  const totalItems = nodes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const effectivePage = Math.max(1, Math.min(page, totalPages));
  const start = (effectivePage - 1) * pageSize;
  const end = start + pageSize;
  const pageNodes = nodes.slice(start, end);

  return {
    nodes: pageNodes,
    page: effectivePage,
    totalPages,
    hasNextPage: effectivePage < totalPages,
    hasPreviousPage: effectivePage > 1,
  };
}
