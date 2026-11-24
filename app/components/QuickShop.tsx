import {Fragment, useEffect, useMemo, useRef, useState} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {useFetcher} from '@remix-run/react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {Image} from '~/components/Image';
import {Quantity} from '~/components/Quantity';
import {Button} from '~/components/Button';
import {Link} from '~/components/Link';
import {
  getProductOptions,
  type MappedProductOptions,
  Money,
  ShopPayButton,
} from '@shopify/hydrogen';
import {isDiscounted, usePrefixPathWithLocale} from '~/lib/utils';
import {JudgeMePreviewBadge} from '~/components/JudgeMePreviewBadge';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {IconBag} from '~/components/Icon';
import VideoPlayer from '~/components/VideoPlayer.client';

function HlsVideo({src, poster}: {src: string; poster?: string}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const canNative = video.canPlayType('application/vnd.apple.mpegurl');
    if (canNative) {
      video.src = src;
      return;
    }

    let hls: any;
    let cancelled = false;

    (async () => {
      try {
        const mod = (await import('hls.js')) as any;
        const HlsCtor = (mod as any)?.default || mod;
        if (!HlsCtor?.isSupported?.() || cancelled) {
          // last-resort fallback: try assigning src directly
          if (!cancelled) {
            video.src = src;
          }
          return;
        }
        hls = new HlsCtor();
        hls.loadSource(src);
        hls.attachMedia(video);
      } catch (e) {
        console.error('[QuickShop HLS] error initializing hls.js', e);
        try {
          video.src = src;
        } catch {}
      }
    })();

    return () => {
      cancelled = true;
      if (hls) {
        try {
          hls.destroy();
        } catch {}
      }
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className="absolute inset-0 w-full h-full object-cover"
      autoPlay
      muted
      playsInline
      preload="metadata"
      poster={poster}
      crossOrigin="anonymous"
    />
  );
}

function getInitialVariant(product: ProductCardFragment) {
  const variants = product?.variants?.nodes || [];
  return variants.find((v) => v?.availableForSale) || variants[0];
}

const COLOR_OPTION_NAMES = ['Color', 'Colors', 'Colour', 'Colours'];

function normalize(str?: string) {
  return (str || '').trim().toLowerCase();
}

function normalizeColorKey(str?: string) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function isValidColor(color?: string): boolean {
  if (!color) return false;
  if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color)) return true;
  const namedColors = new Set([
    'red',
    'blue',
    'green',
    'yellow',
    'orange',
    'purple',
    'pink',
    'brown',
    'black',
    'white',
    'gray',
    'grey',
    'navy',
    'teal',
    'olive',
    'lime',
    'aqua',
    'silver',
    'maroon',
    'fuchsia',
  ]);
  return namedColors.has(color.toLowerCase());
}

export function QuickShopDrawer({
  product,
  open,
  onClose,
  colorSwatchData,
  storeDomain,
  initialVariantId,
}: {
  product: ProductCardFragment;
  open: boolean;
  onClose: () => void;
  colorSwatchData?: any;
  storeDomain?: string;
  initialVariantId?: string;
}) {
  const [quantity, setQuantity] = useState<number>(1);
  const [activeProduct, setActiveProduct] = useState<ProductCardFragment>(product);
  const [selectedVariant, setSelectedVariant] = useState(() => {
    if (initialVariantId) {
      const found = product?.variants?.nodes?.find((v) => v?.id === initialVariantId);
      if (found) return found;
    }
    return getInitialVariant(product);
  });

  useEffect(() => {
    setActiveProduct(product);
    if (initialVariantId) {
      const found = product?.variants?.nodes?.find((v) => v?.id === initialVariantId);
      if (found) {
        setSelectedVariant(found);
        return;
      }
    }
    setSelectedVariant(getInitialVariant(product));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, initialVariantId]);

  const groupValue = (activeProduct as any)?.group?.value as string | undefined;
  const groupFetcher = useFetcher<{group: string; products: any[]}>();
  const groupApiBase = usePrefixPathWithLocale('/api/group-products');

  const productFetcher = useFetcher<{product: ProductCardFragment | null}>();
  const productApiBase = usePrefixPathWithLocale('/api/product-card');

  useEffect(() => {
    if (!open) return;
    if (!groupValue) return;
    if (groupFetcher.state !== 'idle') return;
    if ((groupFetcher.data as any)?.group === groupValue) return;
    const url = `${groupApiBase}?group=${encodeURIComponent(String(groupValue))}`;
    groupFetcher.load(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, groupValue, groupApiBase]);

  useEffect(() => {
    const next = (productFetcher.data as any)?.product as
      | ProductCardFragment
      | null
      | undefined;
    if (!next?.id) return;
    setActiveProduct(next);
    setSelectedVariant(getInitialVariant(next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productFetcher.data]);

  const productOptions = useMemo(() => {
    if (!selectedVariant) return [] as MappedProductOptions[];
    return getProductOptions({
      ...activeProduct,
      selectedOrFirstAvailableVariant: selectedVariant,
    });
  }, [activeProduct, selectedVariant]);

  const fallbackOptions = useMemo(() => {
    const raw = ((activeProduct as any)?.options || []) as any[];
    if (raw.length) {
      return raw.map((opt) => {
        const values: string[] = Array.isArray(opt?.values)
          ? opt.values
          : Array.isArray(opt?.optionValues)
            ? (opt.optionValues as any[]).map((v) => v?.name).filter(Boolean)
            : [];
        return {
          name: opt?.name,
          optionValues: values.map((name) => ({name})),
        } as unknown as MappedProductOptions;
      });
    }
    const variants = (((activeProduct as any)?.variants?.nodes) || []) as any[];
    const map = new Map<string, Set<string>>();
    variants.forEach((v: any) => {
      (v?.selectedOptions || []).forEach((so: any) => {
        if (!so?.name || !so?.value) return;
        if (!map.has(so.name)) map.set(so.name, new Set());
        map.get(so.name)!.add(so.value);
      });
    });
    return Array.from(map.entries()).map(([name, set]) => {
      const values = Array.from(set.values());
      return {
        name,
        optionValues: values.map((v) => ({name: v})),
      } as unknown as MappedProductOptions;
    });
  }, [activeProduct]);

  const rawOptions = useMemo(() => {
    return (productOptions && productOptions.length > 0)
      ? productOptions
      : fallbackOptions;
  }, [productOptions, fallbackOptions]);

  const optionsToRender = useMemo(() => {
    const isDefaultLike = (str?: string) => {
      const s = normalize(str);
      return s === 'default title' || s === 'default' || s === 'default option';
    };
    return (rawOptions || []).filter((option: any) => {
      const name = normalize(option?.name);
      const values = (option?.optionValues || []).map((v: any) => v?.name);
      const defaultValuesOnly = values.length > 0 && values.every(isDefaultLike);
      return !(name === 'title' || defaultValuesOnly);
    });
  }, [rawOptions]);

  // Build gallery items: support MediaImage, Video, ExternalVideo; fallback to variant images
  const galleryItems = useMemo(() => {
    const items: any[] = [];
    const mediaNodes = ((((activeProduct as any)?.media?.nodes) || []) as any[]);
    const seen = new Set<string>();
    const keyFor = (m: any) => {
      if (!m) return '';
      if (m.__typename === 'MediaImage') return m?.image?.url || '';
      if (m.__typename === 'Video') return (m?.sources?.[0]?.url || m?.id || '') as string;
      if (m.__typename === 'ExternalVideo') return (m?.embedUrl || m?.id || '') as string;
      return '';
    };
    for (const m of mediaNodes) {
      if (!m) continue;
      const k = keyFor(m);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      if (m.__typename === 'MediaImage' && m?.image?.url) {
        items.push({__typename: 'MediaImage', image: m.image, alt: m.alt});
      } else if (m.__typename === 'Video') {
        items.push(m);
      } else if (m.__typename === 'ExternalVideo') {
        items.push(m);
      }
    }
    // Fallback: include variant images not already present
    const variantNodes = ((((activeProduct as any)?.variants?.nodes) || []) as any[])
      .map((v) => v?.image)
      .filter((img) => img && img.url) as Array<{url: string; altText?: string; width?: number; height?: number}>;
    for (const img of variantNodes) {
      const k = img.url;
      if (!seen.has(k)) {
        seen.add(k);
        items.push({__typename: 'MediaImage', image: img});
      }
    }
    return items;
  }, [activeProduct]);

  const [imageIndex, setImageIndex] = useState(0);

  // Keep gallery index in sync with selected variant image when possible
  useEffect(() => {
    const url = (selectedVariant as any)?.image?.url as string | undefined;
    if (url) {
      const idx = galleryItems.findIndex((g: any) => g?.__typename === 'MediaImage' && g?.image?.url === url);
      if (idx >= 0) setImageIndex(idx);
    } else {
      setImageIndex(0);
    }
  }, [selectedVariant, galleryItems]);

  const canAdd = Boolean(selectedVariant?.availableForSale);
  const buyNowApiAction = usePrefixPathWithLocale('/api/buy-now');
  const price = (selectedVariant as any)?.price;
  const compareAtPrice = (selectedVariant as any)?.compareAtPrice;
  const rawSummary =
    (activeProduct as any)?.summary ||
    (activeProduct as any)?.description ||
    (activeProduct as any)?.descriptionHtml;
  const summaryText =
    typeof rawSummary === 'string'
      ? rawSummary.replace(/<[^>]*>/g, '')
      : undefined;
  const shortSummary = summaryText
    ? summaryText.slice(0, 220) + (summaryText.length > 220 ? '…' : '')
    : undefined;

  // Close QuickShop when the cart drawer opens to avoid double Dialog conflicts
  useEffect(() => {
    const handler = (e: any) => {
      if (typeof document !== 'undefined') {
        const isCartOpen = !!e?.detail;
        setCartOpen(isCartOpen);
      }
      if (e?.detail === true && open) {
        try {
          onClose();
        } catch {}
      }
    };
    try {
      window.addEventListener('cart-open-changed', handler);
    } catch {}
    return () => {
      try { window.removeEventListener('cart-open-changed', handler); } catch {}
    };
  }, [open, onClose]);

  const [cartOpen, setCartOpen] = useState<boolean>(false);
  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        setCartOpen(document.body.classList.contains('cart-open'));
      }
    } catch {}
  }, []);

  const handleDialogClose = () => {
    onClose();
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-[1100]" onClose={handleDialogClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        {/* Global close button in top-right corner, independent of panel size */}
        <button
          type="button"
          aria-label="Close"
          className="fixed right-5 top-5 z-[1200] inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow hover:bg-white"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl overflow-hidden rounded bg-white text-left align-middle shadow-xl">
                <div className="relative">
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-4 items-start">
                      <div className="md:col-span-1">
                        <div className="relative w-full h-[320px] sm:h-[420px] md:h-[620px] lg:h-[720px] max-h-[85vh] overflow-hidden bg-[#FBF6EC]">
                          {galleryItems.length > 0 && (() => {
                            const itm: any = galleryItems[imageIndex];
                            if (itm?.__typename === 'MediaImage') {
                              return (
                                <Image
                                  data={itm.image as any}
                                  alt={itm?.image?.altText || activeProduct.title}
                                  className="absolute inset-0 w-full h-full object-contain object-center p-4 sm:p-6 md:p-8 bg-[#FBF6EC]"
                                  sizes="(min-width: 1024px) 480px, (min-width: 768px) 360px, 90vw"
                                  width={1200}
                                />
                              );
                            }
                            if (itm?.__typename === 'Video') {
                              const srcs = Array.isArray(itm.sources) ? itm.sources : [];
                              const lc = (v?: string) => String(v || '').toLowerCase();
                              const mp4List = srcs.filter((s: any) => lc(s?.mimeType).includes('mp4') || lc(s?.url).endsWith('.mp4'));
                              const hls = srcs.find((s: any) => lc(s?.mimeType).includes('mpegurl') || lc(s?.url).endsWith('.m3u8'));
                              if (hls?.url) {
                                const url = hls.url as string;
                                console.log('[QuickShop Video] HLS URL:', url);
                                return (
                                  <HlsVideo src={url} poster={itm?.previewImage?.url || undefined} />
                                );
                              }
                              if (mp4List.length > 0) {
                                console.log('[QuickShop Video] MP4 URLs:', mp4List.map((s: any) => s.url));
                                return (
                                  <video
                                    key={mp4List[0].url}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    playsInline
                                    preload="metadata"
                                    crossOrigin="anonymous"
                                    poster={itm?.previewImage?.url}
                                  >
                                    {mp4List.map((s: any, i: number) => (
                                      <source key={i} src={s.url} type={s.mimeType || 'video/mp4'} />
                                    ))}
                                  </video>
                                );
                              }
                              const url = srcs[0]?.url as string | undefined;
                              if (url) {
                                console.log('[QuickShop Video] Fallback URL:', url);
                                return (
                                  <VideoPlayer key={url} url={url} width="100%" height="100%" playsinline />
                                );
                              }
                            }
                            if (itm?.__typename === 'ExternalVideo') {
                              const url = itm?.embedUrl as string;
                              return (
                                <VideoPlayer key={url} url={url} width="100%" height="100%" playsinline />
                              );
                            }
                            return null;
                          })()}
                          {galleryItems.length > 1 && (
                            <div className="absolute bottom-3 right-3 flex gap-2">
                              <button
                                type="button"
                                aria-label="Previous image"
                                className="h-7 w-7 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                onClick={() => setImageIndex((i) => (i - 1 + galleryItems.length) % galleryItems.length)}
                              >
                                &#8249;
                              </button>
                              <button
                                type="button"
                                aria-label="Next image"
                                className="h-7 w-7 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                onClick={() => setImageIndex((i) => (i + 1) % galleryItems.length)}
                              >
                                &#8250;
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-1 max-h-[85vh] flex flex-col">
                        {/* Scrollable details and option selectors */}
                        <div className="p-6 pb-4 flex-grow overflow-y-auto hiddenScroll space-y-4">
                          <Dialog.Title className="text-xl font-medium text-[#2C2420]">
                            {activeProduct.title}
                          </Dialog.Title>
                          <div className="text-sm text-primary/80">
                            <JudgeMePreviewBadge handle={activeProduct.handle} variant="compact" />
                          </div>
                          {!!price && !!compareAtPrice && isDiscounted(price as any, compareAtPrice as any) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-500 text-white text-xs font-medium">Sale</span>
                          )}
                          <div className="flex items-baseline gap-2">
                            {!!price && (
                              <Money withoutTrailingZeros data={price} />
                            )}
                            {!!compareAtPrice && !!price &&
                              isDiscounted(price as any, compareAtPrice as any) && (
                                <Money
                                  withoutTrailingZeros
                                  data={compareAtPrice}
                                  as="span"
                                  className="opacity-50 strike"
                                />
                              )}
                          </div>
                          {shortSummary ? (
                            <p className="text-sm text-gray-700">{shortSummary}</p>
                          ) : null}
                          {optionsToRender.map((option) => {
                            const selected = selectedVariant?.selectedOptions?.find(
                              (o) => o.name === option.name,
                            );
                            const groupProducts = (groupFetcher.data as any)?.products;
                            const hasGroupProducts =
                              groupValue &&
                              Array.isArray(groupProducts) &&
                              groupProducts.length > 1;
                            return (
                              <div key={option.name} className="space-y-2">
                                <legend className="font-medium">
                                  {option.name}
                                  {selected?.value ? <span>: {selected.value}</span> : null}
                                </legend>
                                <div className="flex flex-wrap gap-2">
                                  {option.optionValues.map((ov) => {
                                    const isSelected = Boolean(
                                      selectedVariant?.selectedOptions?.find(
                                        (o) => o.name === option.name && o.value === ov.name,
                                      ),
                                    );
                                    const variants = (activeProduct?.variants?.nodes || []) as any[];
                                    const nextOptions = (selectedVariant?.selectedOptions || []).map((o) =>
                                      o.name === option.name ? {...o, value: ov.name} : o,
                                    );
                                    const matchingVariant = variants.find((v) => {
                                      const vOpts = v?.selectedOptions || [];
                                      return vOpts.every((vo: any) =>
                                        nextOptions.some((no: any) => no.name === vo.name && no.value === vo.value),
                                      );
                                    });
                                    const disabled = !matchingVariant;
                                    const isColor = COLOR_OPTION_NAMES.some(
                                      (n) => normalize(n) === normalize(option.name),
                                    );
                                    if (isColor) {
                                      if (hasGroupProducts) {
                                        const normalized = groupProducts
                                          .filter((p: any) => p?.handle)
                                          .sort((a: any, b: any) =>
                                            String(
                                              a?.colorLabel?.value || a?.title || '',
                                            ).localeCompare(
                                              String(
                                                b?.colorLabel?.value || b?.title || '',
                                              ),
                                            ),
                                          );

                                        return (
                                          <Fragment key={option.name}>
                                            {normalized.slice(0, 12).map((p: any) => {
                                              const label =
                                                p?.colorLabel?.value || p?.title;

                                              const familyKey = p?.colorFamilyKey
                                                ?.value
                                                ? String(p.colorFamilyKey.value)
                                                : undefined;
                                              const normalizedFamilyKey = familyKey
                                                ? normalizeColorKey(familyKey)
                                                : undefined;
                                              const normalizedLabelKey =
                                                normalizeColorKey(label);

                                              const colorMetaobject =
                                                colorSwatchData?.nodes?.find(
                                                  (meta: any) => {
                                                    const labelField =
                                                      meta?.fields?.find(
                                                        (field: any) =>
                                                          field.key ===
                                                            'label' ||
                                                          field.key ===
                                                            'name' ||
                                                          field.key ===
                                                            'title',
                                                      );
                                                    const metaLabel =
                                                      labelField?.value ||
                                                      meta?.handle;
                                                    const handleKey =
                                                      normalizeColorKey(
                                                        meta?.handle,
                                                      );
                                                    const metaLabelKey =
                                                      normalizeColorKey(metaLabel);
                                                    if (normalizedFamilyKey) {
                                                      return (
                                                        handleKey ===
                                                        normalizedFamilyKey
                                                      );
                                                    }
                                                    return (
                                                      handleKey ===
                                                        normalizedLabelKey ||
                                                      metaLabelKey ===
                                                        normalizedLabelKey
                                                    );
                                                  },
                                                );

                                              const colorField =
                                                colorMetaobject?.fields?.find(
                                                  (field: any) =>
                                                    field.key === 'color',
                                                );
                                              const imageField =
                                                colorMetaobject?.fields?.find(
                                                  (field: any) =>
                                                    field.key === 'image' ||
                                                    field.key ===
                                                      'swatch_image',
                                                );

                                              const swatchUrl =
                                                imageField?.reference?.image
                                                  ?.url ||
                                                p?.swatchImage?.reference?.image
                                                  ?.url;

                                              const swatchColor =
                                                typeof colorField?.value ===
                                                'string'
                                                  ? (colorField.value as string)
                                                  : undefined;

                                              const isActive =
                                                p?.handle === activeProduct.handle;

                                              return (
                                                <button
                                                  key={p.id}
                                                  type="button"
                                                  className={[
                                                    'flex aspect-square w-10 h-10 rounded-full border-2 transition-all duration-200 overflow-hidden',
                                                    'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#463925]',
                                                    isActive
                                                      ? 'border-[#463925] ring-2 ring-[#463925] ring-offset-2'
                                                      : 'border-gray-300 hover:border-gray-400',
                                                  ].join(' ')}
                                                  style={{
                                                    backgroundColor:
                                                      !swatchUrl &&
                                                      swatchColor &&
                                                      isValidColor(swatchColor)
                                                        ? swatchColor
                                                        : '#f3f4f6',
                                                  }}
                                                  title={label}
                                                  onClick={() => {
                                                    const handle = p?.handle;
                                                    if (!handle) return;
                                                    if (handle === activeProduct.handle) return;
                                                    const url = `${productApiBase}?handle=${encodeURIComponent(
                                                      String(handle),
                                                    )}`;
                                                    productFetcher.load(url);
                                                  }}
                                                >
                                                  {swatchUrl ? (
                                                    <img
                                                      src={swatchUrl}
                                                      alt={label}
                                                      className="w-full h-full object-cover rounded-full"
                                                    />
                                                  ) : (
                                                    <span className="sr-only">
                                                      {label}
                                                    </span>
                                                  )}
                                                </button>
                                              );
                                            })}
                                          </Fragment>
                                        );
                                      }

                                      const productSwatchUrl =
                                        (activeProduct as any)?.swatchImage?.reference?.image
                                          ?.url as string | undefined;

                                      const rawOpt = ((activeProduct as any)?.options || []).find(
                                        (o: any) => normalize(o?.name) === normalize(option.name),
                                      );
                                      const rawOv = rawOpt?.optionValues?.find(
                                        (v: any) => normalize(v?.name) === normalize(ov.name),
                                      );

                                      const firstSelectableVariant =
                                        rawOv?.firstSelectableVariant;

                                      const variantSwatchRef =
                                        firstSelectableVariant?.variantSwatch
                                          ?.reference;
                                      const variantSwatchUrl =
                                        variantSwatchRef?.image?.url ||
                                        variantSwatchRef?.url;

                                      const variantImagesNodes =
                                        firstSelectableVariant?.variantImages
                                          ?.references?.nodes;
                                      const hasVariantImages =
                                        Array.isArray(variantImagesNodes) &&
                                        variantImagesNodes.length > 0;

                                      const imageUrl = hasVariantImages
                                        ? variantSwatchUrl
                                        : variantSwatchUrl || productSwatchUrl;

                                      return (
                                        <button
                                          key={ov.name}
                                          type="button"
                                          disabled={disabled}
                                          title={ov.name}
                                          className={[
                                            'flex aspect-square w-10 h-10 rounded-full border-2 transition-all duration-200 overflow-hidden',
                                            'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#463925]',
                                            isSelected
                                              ? 'border-[#463925] ring-2 ring-[#463925] ring-offset-2'
                                              : 'border-gray-300 hover:border-gray-400',
                                            disabled ? 'opacity-50 cursor-not-allowed relative' : '',
                                          ].join(' ')}
                                          onClick={() => {
                                            if (matchingVariant) setSelectedVariant(matchingVariant as any);
                                          }}
                                          style={{
                                            backgroundColor: '#f3f4f6',
                                          }}
                                        >
                                          {imageUrl ? (
                                            <img
                                              src={imageUrl}
                                              alt={ov.name}
                                              className="w-full h-full object-cover rounded-full"
                                            />)
                                            : <span className="sr-only">{ov.name}</span>}
                                          {disabled && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                              <div className="w-full h-0.5 bg-red-500 rotate-45 transform"></div>
                                            </div>
                                          )}
                                        </button>
                                      );
                                    }
                                    return (
                                      <button
                                        key={ov.name}
                                        type="button"
                                        disabled={disabled}
                                         className={[
                                          'px-3 py-2 border text-sm transition',
                                          isSelected
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400',
                                          disabled ? 'opacity-50 cursor-not-allowed' : '',
                                        ].join(' ')}
                                        onClick={() => {
                                          if (matchingVariant) setSelectedVariant(matchingVariant as any);
                                        }}
                                      >
                                        {ov.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}

                          <Quantity value={quantity} onChange={setQuantity} />
                        </div>

                        {/* Sticky Action Footer (Always visible at the bottom of the right panel) */}
                        <div className="p-6 pt-4 border-t border-[#E8E1D6] bg-[#FBF8F3] space-y-3 relative z-[20]">
                          <AddToCartButton
                            disabled={!canAdd}
                            width="full"
                            lines={
                              selectedVariant
                                ? [
                                    {
                                      merchandiseId: selectedVariant.id,
                                      quantity,
                                    },
                                  ]
                                : []
                            }
                          >
                            <span className="flex items-center justify-center gap-2">
                              {canAdd ? <IconBag className="h-4 w-4" /> : null}
                              <span>{canAdd ? 'Add to cart' : 'Sold out'}</span>
                            </span>
                          </AddToCartButton>

                          {canAdd && selectedVariant?.id ? (
                            <form method="post" action={buyNowApiAction}>
                              <input
                                type="hidden"
                                name="variantId"
                                value={selectedVariant.id}
                              />
                              <input
                                type="hidden"
                                name="quantity"
                                value={String(quantity)}
                              />
                              <Button
                                as="button"
                                type="submit"
                                variant="secondary"
                                className="w-full"
                              >
                                Buy Now
                              </Button>
                            </form>
                          ) : null}

                          {/* {canAdd && storeDomain ? (
                            <div>
                              <ShopPayButton
                                width="100%"
                                variantIds={[selectedVariant!.id]}
                                storeDomain={storeDomain}
                              />

                          {/* <div>
                            <Button variant="secondary" width="full" onClick={onClose}>
                              Close
                            </Button>
                          </div> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
