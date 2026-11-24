import clsx from 'clsx';
import {useEffect, useRef, useState} from 'react';
import {flattenConnection, Money} from '@shopify/hydrogen';
import {Image} from '~/components/Image';
import type {MoneyV2, Product} from '@shopify/hydrogen/storefront-api-types';
import {useFetcher, useLocation} from '@remix-run/react';

import type {ProductCardFragment} from 'storefrontapi.generated';
import {Link} from '~/components/Link';
import {isDiscounted, isNewArrival, usePrefixPathWithLocale} from '~/lib/utils';
import {getProductPlaceholder} from '~/lib/placeholders';
import {JudgeMePreviewBadge} from '~/components/JudgeMePreviewBadge';
import {QuickShopDrawer} from '~/components/QuickShop';
import {useFavorites} from '~/hooks/useFavorites';
import {Button} from '~/components/Button';
import {IconBag} from '~/components/Icon';
import {FavoriteButton} from '~/components/FavoriteButton';

function normalizeColorKey(str?: string) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function extractDimensionKey(str?: string): string | null {
  if (!str) return null;
  const cleanedStr = str.replace(/gid:\/\/[^\s]+/g, '').replace(/mo=[^\s]+/g, '');
  const norm = cleanedStr.toLowerCase();
  const match = norm.match(/(\d{2,4})\s*[\*x\u00d7\-]\s*(\d{2,4})/i);
  if (match) {
    const num1 = parseInt(match[1], 10);
    const num2 = parseInt(match[2], 10);
    return `${num1}x${num2}`;
  }
  const singleMatch = norm.match(/\b(60|70|80|90|100|120|130|140|150|160|180|200|240|250|300|350)\b/);
  if (singleMatch) {
    return singleMatch[1];
  }
  return null;
}

function parseSizeContext(pathname?: string, search?: string) {
  let targetSizeKey: string | null = null;
  let isRunner = false;
  let isRound = false;
  let isOval = false;

  if (search) {
    try {
      const params = new URLSearchParams(search);
      const sizeParam =
        params.get('filter.v.option.size') ||
        params.get('size') ||
        params.get('q');
      if (sizeParam) {
        targetSizeKey = extractDimensionKey(sizeParam);
      }
    } catch (e) {
      // ignore search param parsing errors
    }
  }

  const cleanPath = (pathname || '').toLowerCase();
  const cleanSearch = (search || '')
    .replace(/gid:\/\/[^\s]+/g, '')
    .replace(/mo=[^\s]+/g, '')
    .toLowerCase();
  const combined = `${cleanPath} ${cleanSearch}`;

  if (!targetSizeKey) {
    targetSizeKey = extractDimensionKey(cleanPath);
  }

  if (combined.includes('runner') || combined.includes('hallway')) isRunner = true;
  if (combined.includes('round') || combined.includes('circle')) isRound = true;
  if (combined.includes('oval')) isOval = true;

  return {targetSizeKey, isRunner, isRound, isOval};
}

function matchesSizeKey(sizeStr?: string, key?: string | null): boolean {
  if (!sizeStr || !key) return false;
  const strKey = extractDimensionKey(sizeStr);
  if (strKey && strKey === key) return true;
  if (key.includes('x') && strKey) {
    return strKey === key;
  }
  const sizeLower = sizeStr.toLowerCase();
  const keyLower = key.toLowerCase();
  // Safe whole-word matching
  const regex = new RegExp(`\\b${keyLower}\\b`, 'i');
  return regex.test(sizeLower);
}

function isValidColor(color?: string): boolean {
  if (!color) return false;
  if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color)) return true;
  const namedColors = new Set([
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
    'black', 'white', 'gray', 'grey', 'navy', 'teal', 'olive', 'lime',
    'aqua', 'silver', 'maroon', 'fuchsia',
  ]);
  return namedColors.has(color.toLowerCase());
}

function isImageRound(img?: {url?: string; altText?: string | null} | null): boolean {
  if (!img?.url) return false;
  const url = img.url.toLowerCase();
  const alt = (img.altText || '').toLowerCase();
  if ((alt.includes('rectangle') || url.includes('rectangle')) && !alt.includes('round') && !url.includes('round')) {
    return false;
  }
  return (
    alt.includes('#shape:round') ||
    alt.includes('round') ||
    alt.includes('circle') ||
    alt.includes('circular') ||
    url.includes('_r1.') ||
    url.includes('_r1_') ||
    url.includes('-r1.') ||
    url.includes('_r1') ||
    url.includes('/round.') ||
    url.includes('/round_') ||
    url.includes('_round') ||
    url.includes('-round') ||
    url.includes('roumnd') ||
    url.includes('round')
  );
}

/**
 * Searches product media gallery for dedicated round photography
 * (e.g. cutout studio shot ending with _R1.jpg, _ROUND.jpg, and lifestyle in-situ shot)
 */
function findRoundImages(
  mediaImages: any[] | undefined,
  colorValue?: string,
  competingColors?: string[],
) {
  if (!mediaImages || !mediaImages.length) {
    return {primary: undefined, secondary: undefined};
  }

  const colorLower = (colorValue || '').toLowerCase().trim();
  const colorParts = colorLower.split(/[\s\-_/]+/).filter((w) => w.length >= 3);
  const activeTokens = [colorLower, ...colorParts];

  // Break competing colors into individual tokens (e.g. 'off white' -> ['off white', 'white'])
  const competingTokens = (competingColors || []).flatMap((c) => {
    const cLower = c.toLowerCase().trim();
    const parts = cLower
      .split(/[\s\-_/]+/)
      .filter((w) => w.length >= 3 && !['and', 'the'].includes(w));
    return [cLower, ...parts];
  });

  // Filter media for active color: exclude images that belong to other competing colors
  const colorMedia = mediaImages.filter((node: any) => {
    const alt = (node?.image?.altText || '').toLowerCase();
    const url = (node?.image?.url || '').toLowerCase();
    const combined = `${alt} ${url}`;

    if (competingTokens.length > 0) {
      const matchesCurrent =
        Boolean(colorLower) && activeTokens.some((t) => combined.includes(t));
      const hasOther = competingTokens.some((c) => {
        const r = new RegExp(`(^|[^a-z0-9])${c}([^a-z0-9]|$)`, 'i');
        return r.test(combined) || combined.includes(`_${c}`) || combined.includes(`-${c}`);
      });
      if (hasOther && !matchesCurrent) return false;
    }
    return true;
  });

  // Find dedicated round cutout studio shots
  const roundCutouts = colorMedia.filter((node: any) => {
    const alt = (node?.image?.altText || '').toLowerCase();
    const url = (node?.image?.url || '').toLowerCase();
    if ((alt.includes('rectangle') || url.includes('rectangle')) && !alt.includes('round') && !url.includes('round')) return false;
    return (
      url.includes('_r1.') ||
      url.includes('_r1_') ||
      url.includes('-r1.') ||
      url.includes('_r1') ||
      url.includes('_round') ||
      url.includes('-round') ||
      url.includes('roumnd') ||
      alt.includes('– round') ||
      alt.includes('- round') ||
      alt.includes(': round') ||
      alt.endsWith('round')
    );
  });

    const primary =
    roundCutouts[0]?.image ||
    colorMedia.find((n: any) => isImageRound(n?.image))?.image ||
    colorMedia[0]?.image;

  // Hover image resolution:
  // 1. Explicit #hover tag in alt text
  const explicitHover = colorMedia.find((node: any) => {
    const alt = (node?.image?.altText || '').toLowerCase();
    return alt.includes('#hover') && node?.image?.url !== primary?.url;
  });

  if (explicitHover) {
    return {primary, secondary: explicitHover.image};
  }

  // 2. Honors Shopify Admin media order:
  // Finds the next image in Shopify Admin order for this color that:
  // - Is not identical to the primary image
  // - Does not explicitly belong to the opposite shape (not rectangular/runner)
  // - Is not a pure measurement/ruler thickness shot
  const hoverCandidate = colorMedia.find((node: any) => {
    if (!node?.image?.url || node.image.url === primary?.url) return false;
    const alt = (node?.image?.altText || '').toLowerCase();
    const url = (node?.image?.url || '').toLowerCase();
    const combined = `${alt} ${url}`;

    // Exclude explicit rectangle/runner unless it also says round
    if (
      (alt.includes('rectangle') || url.includes('rectangle') || alt.includes('runner') || url.includes('runner')) &&
      !alt.includes('round') &&
      !url.includes('round')
    ) {
      return false;
    }

    // Exclude ruler/thickness shots
    if (/ruler|measurement|thickness/i.test(combined)) {
      return false;
    }

    return true;
  });

  const secondary = hoverCandidate?.image || undefined;
  return {primary, secondary};
}

function getVariantSize(v: any) {
  const opt = v?.selectedOptions?.find((so: any) =>
    /^(size|dimensions?|taille)$/i.test(so.name),
  );
  return opt?.value;
}

const clientGroupDataCache = new Map<string, any[]>();
const clientGroupPromiseCache = new Map<string, Promise<any[]>>();
const clientGroupListeners = new Map<string, Set<(products: any[]) => void>>();

function subscribeGroupProducts(
  url: string,
  onData: (products: any[]) => void,
): () => void {
  if (clientGroupDataCache.has(url)) {
    onData(clientGroupDataCache.get(url)!);
    return () => {};
  }

  if (!clientGroupListeners.has(url)) {
    clientGroupListeners.set(url, new Set());
  }
  const listeners = clientGroupListeners.get(url)!;
  listeners.add(onData);

  if (!clientGroupPromiseCache.has(url)) {
    const p = fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const prods = Array.isArray(json?.products) ? json.products : [];
        clientGroupDataCache.set(url, prods);
        clientGroupPromiseCache.delete(url);
        const set = clientGroupListeners.get(url);
        if (set) {
          set.forEach((cb) => {
            try {
              cb(prods);
            } catch (_) {}
          });
          set.clear();
        }
        return prods;
      })
      .catch(() => {
        clientGroupPromiseCache.delete(url);
        return [];
      });
    clientGroupPromiseCache.set(url, p);
  }

  return () => {
    const set = clientGroupListeners.get(url);
    if (set) set.delete(onData);
  };
}

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
  quickAdd = true,
  showReviewBadge = true,
  colorSwatchData,
  storeDomain,
  fixedTitleLines,
  activePriceRange,
  showDetailsButton,
  isFavoriteCard = false,
  collectionHandle,
}: {
  product: ProductCardFragment;
  label?: string;
  className?: string;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
  quickAdd?: boolean;
  showReviewBadge?: boolean;
  colorSwatchData?: any;
  storeDomain?: string;
  fixedTitleLines?: number;
  activePriceRange?: {min?: number; max?: number};
  showDetailsButton?: boolean;
  isFavoriteCard?: boolean;
  collectionHandle?: string;
}) {
  let cardLabel;
  const {toggle} = useFavorites();

  // In-card active product, variant, and caching state for in-place swatch switching
  const [currentProduct, setCurrentProduct] = useState<ProductCardFragment>(product);
  const [cachedProducts, setCachedProducts] = useState<Record<string, ProductCardFragment>>({
    [product.handle]: product,
  });
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);

  const productCardApiBase = usePrefixPathWithLocale('/api/product-card');
  const productCardFetcher = useFetcher<{product: any}>();

  useEffect(() => {
    setCurrentProduct(product);
    setCachedProducts({[product.handle]: product});
    setActiveVariantId(null);
  }, [product]);

  useEffect(() => {
    const fetchedProd = productCardFetcher.data?.product;
    if (fetchedProd?.handle) {
      setCachedProducts((prev) => ({
        ...prev,
        [fetchedProd.handle]: fetchedProd,
      }));
      setCurrentProduct(fetchedProd);
      setActiveVariantId(null);
    }
  }, [productCardFetcher.data]);

  // ── Auto-reset timer: revert to the original product/variant after 10s of inactivity ──
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleReset = () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      setCurrentProduct(product);
      setActiveVariantId(null);
    }, 10_000);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleGroupSwatchClick = (handle: string) => {
    if (cachedProducts[handle]) {
      setCurrentProduct(cachedProducts[handle]);
      setActiveVariantId(null);
    } else {
      productCardFetcher.load(`${productCardApiBase}?handle=${encodeURIComponent(handle)}`);
    }
    scheduleReset();
  };

  const cardProduct: Product = currentProduct?.variants
    ? (currentProduct as Product)
    : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const variants = flattenConnection(cardProduct.variants);
  const firstVariant = variants[0];

  // ── VARIANT SIZE & PRICE RANGE FILTER ALIGNMENT ──
  let locationSearch = '';
  let locationPath = '';
  try {
    const loc = useLocation();
    locationPath = loc.pathname;
    locationSearch = loc.search;
  } catch {
    if (typeof window !== 'undefined') {
      locationSearch = window.location.search;
      locationPath = window.location.pathname;
    }
  }

  const sizeContext = parseSizeContext(
    locationPath || (collectionHandle ? `/collections/${collectionHandle}` : ''),
    locationSearch,
  );

  const productTitleLower = (currentProduct.title || '').toLowerCase();
  const productHandleLower = (currentProduct.handle || '').toLowerCase();
  const tagsLower = ((currentProduct as any).tags || []).map((t: string) => String(t).toLowerCase());

  const isRoundCollection =
    collectionHandle?.toLowerCase().includes('round') ||
    locationPath.toLowerCase().includes('/collections/round') ||
    locationPath.toLowerCase().includes('round-rug');

  const isCasaBlanc =
    productTitleLower.includes('casa blanc') ||
    productHandleLower.includes('casa-blanc');

  // Check if product is inherently round (by title, handle, or shape-specific tag, not multi-size tags like size_..._Round)
  const isInherentlyRound =
    productTitleLower.includes('round') ||
    productTitleLower.includes('circle') ||
    productHandleLower.includes('round') ||
    productHandleLower.includes('circle') ||
    tagsLower.some((t: string) => t === 'round' || t === 'shape:round' || t === 'shape_round' || t === 'circular');

  // Check if product only has round variants (e.g. Shadow Edge, Petal Loop, Ivory Ring, etc.)
  const hasOnlyRoundVariants =
    variants.length > 0 &&
    variants.every((v: any) => {
      const sz = (getVariantSize(v) || '').toLowerCase();
      const title = (v?.title || '').toLowerCase();
      return sz.includes('round') || sz.includes('circle') || title.includes('round') || title.includes('circle');
    });

  const isRunnerProd = sizeContext.isRunner || productTitleLower.includes('runner');
  const isRoundProd =
    isRoundCollection ||
    sizeContext.isRound ||
    isInherentlyRound ||
    hasOnlyRoundVariants;

  const isOvalProd =
    sizeContext.isOval ||
    productTitleLower.includes('oval') ||
    productHandleLower.includes('oval') ||
    tagsLower.some((t: string) => t.includes('oval'));

  const priceInRange = (amount?: string | number | null) => {
    const n = typeof amount === 'number' ? amount : Number(amount);
    if (!Number.isFinite(n)) return false;
    const min = activePriceRange?.min;
    const max = activePriceRange?.max;
    if (typeof min === 'number' && n < min) return false;
    if (typeof max === 'number' && n > max) return false;
    return true;
  };

  const displayVariant = (() => {
    if (activeVariantId) {
      const found = variants.find((v: any) => v.id === activeVariantId);
      if (found) return found;
    }

    if (sizeContext.targetSizeKey) {
      const matched = variants.find((v: any) => {
        const sz = getVariantSize(v);
        return matchesSizeKey(sz, sizeContext.targetSizeKey);
      });
      if (matched) return matched;
    }

    if (isRoundProd) {
      const roundVar = variants.find((v: any) => {
        const sz = (getVariantSize(v) || '').toLowerCase();
        const title = (v?.title || '').toLowerCase();
        if (sz.includes('round') || sz.includes('circle') || title.includes('round') || title.includes('circle')) return true;
        const dimKey = extractDimensionKey(sz);
        if (dimKey) {
          const parts = dimKey.split('x').map((n) => parseInt(n, 10));
          if (parts.length === 2 && parts[0] === parts[1]) return true;
        }
        return false;
      });
      if (roundVar) return roundVar;
    }

    if (isRunnerProd) {
      const runnerVar = variants.find((v: any) => {
        const sz = getVariantSize(v);
        return matchesSizeKey(sz, '70x200') || matchesSizeKey(sz, '70x300');
      });
      if (runnerVar) return runnerVar;
    }

    if (activePriceRange?.min !== undefined || activePriceRange?.max !== undefined) {
      const found = variants.find((v: any) => priceInRange(v?.price?.amount));
      if (found) return found;
    }

    return firstVariant;
  })();

  if (!displayVariant) return null;
  const {image, price, compareAtPrice} = displayVariant as any;

  // Build target URL preserving the selected variant options (Size, Color, etc.)
  const productUrl = (() => {
    const handle = currentProduct.handle;
    if (!displayVariant?.selectedOptions?.length) {
      return `/products/${handle}`;
    }
    const params = new URLSearchParams();
    for (const option of displayVariant.selectedOptions) {
      if (option?.name && option?.value) {
        params.set(option.name, option.value);
      }
    }
    const qs = params.toString();
    return qs ? `/products/${handle}?${qs}` : `/products/${handle}`;
  })();

  const displayedSizeVariants = (() => {
    const uniqueMap = new Map<string, any>();
    for (const v of variants) {
      const sz = getVariantSize(v);
      if (sz && !uniqueMap.has(sz)) {
        uniqueMap.set(sz, {size: sz, variant: v});
      }
    }
    let list = Array.from(uniqueMap.values());

    if (isRunnerProd) {
      const runnerOnly = list.filter((item) => {
        const key = extractDimensionKey(item.size);
        if (!key) return item.size.toLowerCase().includes('runner');
        const parts = key.split('x').map((n) => parseInt(n, 10));
        if (parts.length === 2) {
          const [w, l] = parts;
          if ((w <= 90 && l >= 180) || (l <= 90 && w >= 180)) return true;
        }
        return (
          matchesSizeKey(item.size, '70x200') ||
          matchesSizeKey(item.size, '70x300') ||
          item.size.toLowerCase().includes('runner')
        );
      });
      if (runnerOnly.length > 0) list = runnerOnly;
    } else if (isOvalProd) {
      const ovalOnly = list.filter((item) => item.size.toLowerCase().includes('oval'));
      if (ovalOnly.length > 0) list = ovalOnly;
    } else if (isRoundProd) {
      const roundOnly = list.filter(
        (item) => {
          const sizeLower = item.size.toLowerCase();
          // Check for explicit round/circle keyword
          if (sizeLower.includes('round') || sizeLower.includes('circle')) return true;
          // Also check for square dimensions (e.g., 160x160, 200x200) which typically indicate round rugs
          const dimKey = extractDimensionKey(item.size);
          if (dimKey) {
            const parts = dimKey.split('x').map(n => parseInt(n, 10));
            if (parts.length === 2 && parts[0] === parts[1]) return true;
          }
          return false;
        },
      );
      if (roundOnly.length > 0) list = roundOnly;
    }

    // Reorder size list so the selected size matching targetSizeKey appears at 1st place (index 0)
    if (sizeContext.targetSizeKey) {
      const matchedIdx = list.findIndex((item) =>
        matchesSizeKey(item.size, sizeContext.targetSizeKey),
      );
      if (matchedIdx > 0) {
        const matchedItem = list.splice(matchedIdx, 1)[0];
        list.unshift(matchedItem);
      }
    }

    return list;
  })();

  /**
   * Lists all matching size values that fall within the active price filter bounds.
   * Used to highlight options matches directly on the product list view.
   */
  const isFilterActive = activePriceRange?.min !== undefined || activePriceRange?.max !== undefined;
  const matchingSizes = isFilterActive
    ? Array.from(
        new Set(
          variants
            .filter((v: any) => priceInRange(v?.price?.amount))
            .map(getVariantSize)
            .filter(Boolean),
        ),
      )
    : [];

  const mediaImages = (cardProduct as any)?.media?.nodes?.filter(
    (node: any) => node?.__typename === 'MediaImage' && node?.image?.url,
  );

  // Resolve color-specific images from the general media gallery as a fallback
  // for products that have color variants but missing Shopify variant image mappings.
  const activeColorImages = (() => {
    const colorOpt = displayVariant?.selectedOptions?.find((so: any) =>
      /^(color|colours?|couleurs?)$/i.test(so.name),
    );
    const colorValue = colorOpt?.value;
    if (colorValue && mediaImages?.length) {
      const colorValLower = colorValue.toLowerCase().trim();
      const matched = mediaImages.filter((node: any) => {
        const alt = (node?.image?.altText || '').toLowerCase();
        return alt && alt.includes(colorValLower);
      });
      if (matched.length > 0) {
        return matched.map((m: any) => m.image);
      }
    }
    return [];
  })();

  // Check if round imagery should be prioritized:
  // Active when on round collection page, or searching/filtering for round rugs,
  // or when active displayVariant is explicitly round, or for round-dominant products
  const isDisplayVariantRound = (() => {
    const sz = (getVariantSize(displayVariant) || '').toLowerCase();
    const title = (displayVariant?.title || '').toLowerCase();
    return sz.includes('round') || sz.includes('circle') || title.includes('round') || title.includes('circle');
  })();

  const preferRoundImages = isRoundCollection || isRoundProd || isDisplayVariantRound;

  const allCardProductColors = Array.from(
    new Set(
      variants
        .map((v: any) => {
          const opt = v?.selectedOptions?.find((so: any) =>
            /^(color|colours?|couleurs?)$/i.test(so.name),
          );
          return opt?.value ? String(opt.value).trim() : null;
        })
        .filter(Boolean) as string[],
    ),
  );

  const activeCardColor = displayVariant?.selectedOptions?.find((so: any) =>
    /^(color|colours?|couleurs?)$/i.test(so.name),
  )?.value;

  const cardCompetingColors = allCardProductColors
    .filter((c) => c.toLowerCase() !== (activeCardColor || '').toLowerCase().trim())
    .map((c) => c.toLowerCase());

  const roundMediaImages = preferRoundImages
    ? findRoundImages(
        mediaImages,
        activeCardColor,
        cardCompetingColors,
      )
    : {primary: undefined, secondary: undefined};

  // Check if variant image is round and not belonging to a competing color
  const isVarImageRound = isImageRound(image);
  const varImageHasOther =
    cardCompetingColors.length > 0 &&
    (() => {
      const imgUrl = (image?.url || '').toLowerCase();
      const imgAlt = (image?.altText || '').toLowerCase();
      const combined = `${imgAlt} ${imgUrl}`;
      const competingTokens = cardCompetingColors.flatMap((c) => {
        const parts = c
          .split(/[\s\-_/]+/)
          .filter((w) => w.length >= 3 && !['and', 'the'].includes(w));
        return [c, ...parts];
      });
      return competingTokens.some((t) => {
        const r = new RegExp(`(^|[^a-z0-9])${t}([^a-z0-9]|$)`, 'i');
        return r.test(combined) || combined.includes(`_${t}`) || combined.includes(`-${t}`);
      });
    })();

  const primaryImage =
    (!varImageHasOther && isVarImageRound ? image : undefined) ||
    roundMediaImages.primary ||
    (isImageRound(image) ? image : undefined) ||
    (!preferRoundImages ? (activeColorImages[0] || image) : undefined) ||
    image ||
    mediaImages?.[0]?.image;

  const secondaryImage =
    roundMediaImages.secondary ||
    (!preferRoundImages
      ? (() => {
          const validSecondary = mediaImages?.filter((node: any) => {
            if (!node?.image?.url || node.image.url === primaryImage?.url) return false;
            const alt = (node?.image?.altText || '').toLowerCase();
            const url = (node?.image?.url || '').toLowerCase();
            const combined = `${alt} ${url}`;
            if (cardCompetingColors.length > 0) {
              const hasOther = cardCompetingColors.some((c) => {
                const r = new RegExp(`(^|[^a-z0-9])${c}([^a-z0-9]|$)`, 'i');
                return r.test(combined) || combined.includes(`_${c}`) || combined.includes(`-${c}`);
              });
              if (hasOther) return false;
            }
            return true;
          });
          return validSecondary?.[0]?.image;
        })()
      : undefined);

  const [quickOpen, setQuickOpen] = useState(false);

  const groupValue = (currentProduct as any)?.group?.value as string | undefined;
  const groupApiBase = usePrefixPathWithLocale('/api/group-products');
  const groupUrl = groupValue ? `${groupApiBase}?group=${encodeURIComponent(String(groupValue))}` : '';

  const [groupProducts, setGroupProducts] = useState<any[]>(() => {
    return groupUrl && clientGroupDataCache.has(groupUrl)
      ? clientGroupDataCache.get(groupUrl)!
      : [];
  });
  const [hasRequestedGroup, setHasRequestedGroup] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!groupUrl || !hasRequestedGroup) return;
    const unsubscribe = subscribeGroupProducts(groupUrl, (prods) => {
      setGroupProducts(prods);
    });
    return unsubscribe;
  }, [groupUrl, hasRequestedGroup]);

  useEffect(() => {
    if (!groupValue || hasRequestedGroup) return;
    if (loading === 'eager') {
      const t = setTimeout(() => setHasRequestedGroup(true), 250);
      return () => clearTimeout(t);
    }
    const node = cardContainerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setHasRequestedGroup(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasRequestedGroup(true);
          observer.disconnect();
        }
      },
      {rootMargin: '250px'},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [groupValue, hasRequestedGroup, loading]);

  // Check if ANY variant of this product is on sale (for consistent badge display)
  const hasAnyVariantOnSale = variants.some((v: any) => {
    const p = v?.price;
    const c = v?.compareAtPrice;
    return p?.amount && c?.amount && Number(c.amount) > Number(p.amount);
  });

  if (label) {
    cardLabel = label;
  } else if (hasAnyVariantOnSale) {
    cardLabel = 'Sale';
  } else if (isNewArrival(currentProduct.publishedAt)) {
    cardLabel = 'New';
  }

  const calculateSalePct = (p: MoneyV2, c: MoneyV2) => {
    const pAmt = parseFloat(p.amount);
    const cAmt = parseFloat(c.amount);
    if (!cAmt || cAmt <= pAmt) return 0;
    return Math.round((1 - pAmt / cAmt) * 100);
  };

  const isSoldOut = !cardProduct.availableForSale;

  const isBestseller = (currentProduct as any).isBestseller?.value === 'true' || cardLabel === 'Bestseller';
  const isNew = (currentProduct as any).isNew?.value === 'true' || cardLabel === 'New';

  const badgeText = isBestseller 
    ? 'Bestseller' 
    : (isNew 
      ? 'New' 
      : ((currentProduct as any).tags?.includes('Handwoven') || (currentProduct as any).construction?.value?.toLowerCase().includes('hand') 
        ? 'Handwoven' 
        : undefined));

  const isRound =
    Boolean(roundMediaImages.primary) ||
    isDisplayVariantRound ||
    isRoundProd ||
    isInherentlyRound;

  const isOval =
    isOvalProd ||
    currentProduct.title?.toLowerCase().includes('oval') ||
    tagsLower.some((tag: string) => tag === 'oval' || tag === 'shape:oval' || tag === 'shape_oval');

  const isSpeciallyContained = isRound || isOval;

  const renderSwatches = () => {
    const isGroupSwatch = groupValue && Array.isArray(groupProducts) && groupProducts.length > 1;
    
    const colorOption = cardProduct.options?.find((option: any) => 
      /^(color|colours?|couleurs?)$/i.test(option.name)
    );
    const isLocalSwatch = !!colorOption?.optionValues?.length;

    if (!isGroupSwatch && !isLocalSwatch) return null;

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {isGroupSwatch ? (() => {
          const normalized = groupProducts
            .filter((p: any) => p?.handle)
            .sort((a: any, b: any) =>
              String(a?.colorLabel?.value || a?.title || '').localeCompare(
                String(b?.colorLabel?.value || b?.title || ''),
              ),
            );

          const groupValues = normalized.slice(0, 4);
          const extra = normalized.length - groupValues.length;

          return (
            <>
              {groupValues.map((p: any) => {
                const label = p?.colorLabel?.value || p?.title;
                const familyKey = p?.colorFamilyKey?.value
                  ? String(p.colorFamilyKey.value)
                  : undefined;
                const normalizedFamilyKey = familyKey
                  ? normalizeColorKey(familyKey)
                  : undefined;
                const normalizedLabelKey = normalizeColorKey(label);

                const colorMetaobject = colorSwatchData?.nodes?.find((meta: any) => {
                  const labelField = meta?.fields?.find(
                    (field: any) =>
                      field.key === 'label' ||
                      field.key === 'name' ||
                      field.key === 'title',
                  );
                  const metaLabel = labelField?.value || meta?.handle;
                  const handleKey = normalizeColorKey(meta?.handle);
                  const metaLabelKey = normalizeColorKey(metaLabel);
                  if (normalizedFamilyKey) {
                    return handleKey === normalizedFamilyKey;
                  }
                  return (
                    handleKey === normalizedLabelKey ||
                    metaLabelKey === normalizedLabelKey
                  );
                });

                const colorField = colorMetaobject?.fields?.find(
                  (field: any) => field.key === 'color',
                );
                const imageField = colorMetaobject?.fields?.find(
                  (field: any) =>
                    field.key === 'image' || field.key === 'swatch_image',
                );

                const swatchUrl =
                  imageField?.reference?.image?.url ||
                  p?.swatchImage?.reference?.image?.url;

                const swatchColor =
                  typeof colorField?.value === 'string'
                    ? (colorField.value as string)
                    : undefined;

                return (
                  <Link
                    key={p.id}
                    to={`/products/${p.handle}`}
                    prefetch="intent"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleGroupSwatchClick(p.handle);
                    }}
                    className={clsx(
                      'w-5 h-5 rounded-full border inline-block bg-white overflow-hidden shadow-sm hover:scale-110 transition-transform duration-200',
                      p.handle === currentProduct.handle ? 'border-haniesta-brown ring-1 ring-haniesta-brown' : 'border-stone-200',
                    )}
                    style={{
                      backgroundColor:
                        !swatchUrl && swatchColor && isValidColor(swatchColor)
                          ? swatchColor
                          : '#f3f4f6',
                    }}
                    title={label}
                  >
                    {swatchUrl ? (
                      <img
                        src={swatchUrl}
                        alt={label}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </Link>
                );
              })}
              {extra > 0 && (
                <span className="text-[10px] font-medium text-stone-500 font-jost ml-0.5">+{extra}</span>
              )}
            </>
          );
        })() : (() => {
          if (!colorOption?.optionValues) return null;
          const colorValues = colorOption.optionValues.slice(0, 4);
          const extra = colorOption.optionValues.length - colorValues.length;
          const productSwatchUrl =
            (currentProduct as any)?.swatchImage?.reference?.image?.url as
              | string
              | undefined;

          return (
            <>
              {colorValues.map((colorValue: any) => {
                const colorName = colorValue.name;
                const colorVariants = variants.filter((v: any) =>
                  v.selectedOptions?.some(
                    (so: any) =>
                      so.name.toLowerCase() === colorOption.name.toLowerCase() &&
                      so.value.toLowerCase() === colorName.toLowerCase(),
                  ),
                );
                const localVariant =
                  (isRoundProd
                    ? colorVariants.find((v: any) => {
                        const sz = (getVariantSize(v) || '').toLowerCase();
                        const t = (v?.title || '').toLowerCase();
                        return (
                          sz.includes('round') ||
                          sz.includes('circle') ||
                          t.includes('round') ||
                          t.includes('circle')
                        );
                      })
                    : null) ||
                  colorVariants[0] ||
                  colorValue?.firstSelectableVariant;
                const variant = localVariant || colorValue?.firstSelectableVariant;
                const variantSwatchRef = colorValue?.firstSelectableVariant?.variantSwatch?.reference;
                const variantSwatchUrl =
                  variantSwatchRef?.image?.url || variantSwatchRef?.url;

                const swatchImageUrl = variantSwatchUrl || productSwatchUrl;
                
                return (
                  <button
                    key={colorName}
                    title={colorName}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (variant?.id) {
                        setActiveVariantId(variant.id);
                        scheduleReset();
                      }
                    }}
                    className={clsx(
                      'w-5 h-5 rounded-full border inline-block bg-white overflow-hidden shadow-sm hover:scale-110 transition-transform duration-200',
                      (variant?.id === displayVariant?.id || (!activeVariantId && variant?.id === firstVariant?.id))
                        ? 'border-haniesta-brown ring-1 ring-haniesta-brown'
                        : 'border-stone-200',
                    )}
                    style={{
                      backgroundColor: '#f3f4f6'
                    }}
                  >
                    {swatchImageUrl ? (
                      <img
                        src={swatchImageUrl}
                        alt={colorName}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </button>
                );
              })}
              {extra > 0 && (
                <span className="text-[10px] font-medium text-stone-500 font-jost ml-0.5">+{extra}</span>
              )}
            </>
          );
        })()}
      </div>
    );
  };

  return (
    <div
      ref={cardContainerRef}
      onMouseEnter={() => setHasRequestedGroup(true)}
      onTouchStart={() => setHasRequestedGroup(true)}
      className={clsx('group relative bg-[#FAF7F2] border border-[#E8E3DA] overflow-hidden rounded-sm flex flex-col justify-between h-full transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1', className)}
    >
      
      {/* Product Image Frame: Edge-to-edge */}
      <div className={clsx('relative w-full aspect-[4/5] bg-[#FAF7F2] overflow-hidden flex items-center justify-center', isSpeciallyContained && '!bg-[#FBF6EC]')}>
        <Link
          to={productUrl}
          prefetch="viewport"
          aria-label={currentProduct.title || 'View product details'}
          className="block w-full h-full"
        >
          {primaryImage && (
            <>
              <Image
                containerClassName={clsx(
                  'absolute inset-0 transition-opacity duration-300 overflow-hidden',
                  secondaryImage ? 'opacity-100 lg:group-hover:opacity-0' : 'opacity-100',
                )}
                className={clsx(
                  '!object-center w-full h-full fadeIn bg-transparent transition-transform duration-700 ease-out',
                  isSpeciallyContained ? '!object-contain p-4 mix-blend-multiply' : '!object-contain',
                  isRound && 'scale-round',
                  isOval && 'scale-oval',
                )}
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                data={primaryImage}
                alt={primaryImage.altText || `Picture of ${currentProduct.title}`}
                loading={loading || 'lazy'}
                // @ts-ignore
                fetchpriority={loading === 'eager' ? 'high' : 'auto'}
              />
              {secondaryImage && (
                <Image
                  containerClassName={clsx(
                    'absolute inset-0 opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100 overflow-hidden',
                  )}
                  className="!object-cover !object-center w-full h-full bg-transparent transition-transform duration-700 ease-out lg:group-hover:scale-105"
                  sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                  data={secondaryImage}
                  alt={secondaryImage.altText || `Lifestyle picture of ${currentProduct.title}`}
                  loading="lazy"
                />
              )}
            </>
          )}
        </Link>

        {/* Bestseller/New Badge absolute positioned */}
        {badgeText && (
          <div className="absolute bottom-3 left-3 z-20">
            <span className="inline-block bg-[#EAD8BB] text-[#2C2420] text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider font-jost">
              {badgeText}
            </span>
          </div>
        )}

        {/* Wishlist favorite button absolute positioned */}
        <div className="absolute top-3 right-3 z-20">
          {isFavoriteCard ? (
            <button
              type="button"
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(currentProduct.id);
              }}
              aria-label="Remove from favorites"
              className="w-8 h-8 rounded-full bg-white/90 shadow-sm border border-stone-100 text-stone-600 hover:text-stone-900 hover:bg-white transition-all duration-200 flex items-center justify-center hover:scale-105"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <FavoriteButton
              productId={currentProduct.id}
              className="!rounded-full !bg-white/90 !border-none !w-8 !h-8 !shadow-sm hover:!bg-white text-stone-600 hover:text-stone-900 transition-colors flex items-center justify-center"
              size="sm"
            />
          )}
        </div>

        {/* Hover Quick Add bag button absolute positioned with hover expand pill layout */}
        {quickAdd && (
          <div className="absolute bottom-3 right-3 z-20 pointer-events-auto">
            <Button
              variant="secondary"
              className="inline-flex items-center justify-center h-9 w-9 lg:group-hover:w-24 rounded-full border border-transparent bg-[#EAD8BB] text-[#2C2420] lg:group-hover:bg-white lg:group-hover:border-[#D9C7A8] shadow-sm transition-all duration-300 !p-0 lg:group-hover:!px-3"
              aria-label="Quick add"
              onClick={(e: any) => {
                e?.preventDefault?.();
                e?.stopPropagation?.();
                setQuickOpen(true);
              }}
            >
              <span className="flex items-center justify-center gap-1">
                <IconBag className="h-4 w-4 shrink-0 text-[#2C2420]" />
                <span className="w-0 overflow-hidden text-[10px] font-bold uppercase tracking-wider font-jost transition-all duration-300 lg:group-hover:w-8 text-[#2C2420]">
                  Add
                </span>
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Product Content Details: Cream background with padding */}
      <div className="p-5 flex flex-col flex-grow bg-[#FAF7F2]">
        
        {/* Swatch row */}
        <div className="mb-3">
          {renderSwatches()}
        </div>

        {/* Title */}
        <Link
          to={productUrl}
          prefetch="viewport"
          className={clsx(
            'block mb-2',
            fixedTitleLines === 2 && 'min-h-[2.5rem]',
          )}
        >
          <h3 className="font-cormorant text-base sm:text-lg text-haniesta-brown leading-snug hover:text-accent-gold-dark transition-colors line-clamp-2">
            {currentProduct.title}
          </h3>
        </Link>

        {/* Star Rating badge - fixed height so all cards align */}
        <div className="mb-2 h-[18px] flex items-center">
          {showReviewBadge && (
            <JudgeMePreviewBadge handle={currentProduct.handle} className="inline-flex items-center gap-1 text-[11px] font-jost" variant="compact" />
          )}
        </div>

        {/* Price layout */}
        <div className="flex items-center gap-2 mb-3 min-h-[20px]">
          <span className="text-sm font-semibold text-haniesta-brown font-jost">
            <Money withoutTrailingZeros data={price!} />
          </span>
          {/* Renders the size of the active variant next to the price (e.g. (2x3)) */}
          {getVariantSize(displayVariant) && (
            <span className="text-xs text-stone-400 font-jost">
              ({getVariantSize(displayVariant)})
            </span>
          )}
          {isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2) && (
            <>
              <span className="text-xs text-stone-400 line-through font-jost">
                <Money withoutTrailingZeros data={compareAtPrice as MoneyV2} />
              </span>
              <span className="text-[10px] text-accent-terracotta font-semibold font-jost">
                Save {calculateSalePct(price as MoneyV2, compareAtPrice as MoneyV2)}%
              </span>
            </>
          )}
        </div>

        {/* Interactive Size Chips Selector */}
        {displayedSizeVariants.length > 0 && (
          <div className="mb-3 text-xs font-jost text-stone-500 font-medium flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-stone-400">Size:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {displayedSizeVariants.slice(0, 4).map(({size, variant}) => {
                const activeSizeVal = getVariantSize(displayVariant);
                const isSelected =
                  variant.id === displayVariant?.id ||
                  (Boolean(activeSizeVal) &&
                    Boolean(size) &&
                    String(activeSizeVal).trim().toLowerCase() === String(size).trim().toLowerCase());
                const isAvailable = variant.availableForSale !== false;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveVariantId(variant.id);
                      scheduleReset();
                    }}
                    className={clsx(
                      'px-2 py-0.5 text-[11px] font-medium rounded border transition-all duration-200 cursor-pointer whitespace-nowrap',
                      isSelected
                        ? 'border-[#463925] bg-[#463925] text-white font-semibold shadow-sm'
                        : 'border-[#E8E3DA] bg-white text-stone-700 hover:border-[#463925] hover:text-[#463925]',
                      !isAvailable && 'opacity-50 line-through relative',
                    )}
                    title={isAvailable ? `Select size ${size}` : `Size ${size} (Out of stock)`}
                  >
                    {size}
                  </button>
                );
              })}
              {displayedSizeVariants.length > 4 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuickOpen(true);
                  }}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EAD8BB]/40 border border-[#D9C7A8] text-[#463925] hover:bg-[#EAD8BB] transition-colors whitespace-nowrap"
                >
                  +{displayedSizeVariants.length - 4} more
                </button>
              )}
            </div>
          </div>
        )}

        {/* Trust verification line */}
        <div className="border-t border-[#E8E3DA] pt-3 mt-auto flex items-center gap-1.5 text-[9px] text-stone-500 uppercase tracking-wider font-jost">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-accent-gold fill-none stroke-current stroke-[1.5]" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
          <span>Handcrafted · free UK delivery</span>
        </div>
      </div>

      {quickAdd && (
        <QuickShopDrawer
          product={currentProduct as any}
          open={quickOpen}
          onClose={() => setQuickOpen(false)}
          colorSwatchData={colorSwatchData}
          initialVariantId={displayVariant?.id}
        />
      )}
    </div>
  );
}

export default ProductCard;
