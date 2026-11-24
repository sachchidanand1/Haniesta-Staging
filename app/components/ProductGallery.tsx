
import { Image } from '~/components/Image';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { MediaFragment } from 'storefrontapi.generated';
import VideoPlayer from '~/components/VideoPlayer.client';

function HlsVideo({ src, poster }: { src: string; poster?: string }) {
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
        if (!HlsCtor?.isSupported?.() || cancelled) return;
        hls = new HlsCtor();
        hls.loadSource(src);
        hls.attachMedia(video);
      } catch (e) {
        console.error('[HLS] error initializing hls.js', e);
      }
    })();

    return () => {
      cancelled = true;
      if (hls) {
        try {
          hls.destroy();
        } catch { }
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

/**
 * A client component that defines a media gallery for hosting images, 3D models, and videos of products
 */
export function ProductGallery({
  media,
  className,
  collectionTitle,
  selectedVariantImageUrl,
  variantImages,
  selectedColor,
  selectedShape,
  selectedSize,
  allProductColors,
}: {
  media: MediaFragment[];
  className?: string;
  collectionTitle?: string;
  selectedVariantImageUrl?: string;
  variantImages?: Array<{
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  }>;
  selectedColor?: string;
  selectedShape?: string;
  selectedSize?: string;
  allProductColors?: string[];
}) {
  if (!media.length) return null;

  const items = useMemo(() => {
    const baseAll = media.filter(
      (m) =>
        m.__typename === 'MediaImage' ||
        m.__typename === 'Video' ||
        m.__typename === 'ExternalVideo',
    );

    const baseNonImages = baseAll.filter((m: any) => m?.__typename !== 'MediaImage');

    // Priority 1: When variantImages (color metafield) exists, use ONLY the images for this specific color
    const variantPrimary = (variantImages || []).filter((img) => img?.url);

    // Build complete list from product media (baseAll) and variant metafield images
    let baseList: any[] = [];
    const urlSet = new Set<string>();

    // 1. Add color metafield images if they exist
    if (variantPrimary.length > 0) {
      variantPrimary.forEach((img) => {
        baseList.push({ __typename: 'MediaImage', image: img });
        urlSet.add(img.url);
      });
    }

    // Determine competing colors for THIS specific product
    const productHasMultipleColors =
      Array.isArray(allProductColors) && allProductColors.length > 1;

    const competingColors = productHasMultipleColors
      ? allProductColors
          .filter(
            (c) =>
              c &&
              c.toLowerCase().trim() !== (selectedColor || '').toLowerCase().trim(),
          )
          .map((c) => c.toLowerCase().trim())
      : selectedColor
        ? [
            'white', 'anthracite', 'nature', 'natural', 'black', 'grey', 'gray',
            'charcoal', 'terracotta', 'rust', 'olive', 'moss', 'blue', 'navy',
            'beige', 'brown', 'cream', 'ivory', 'sand', 'pebble', 'sage',
            'mint', 'gold', 'mustard', 'pink', 'lilac', 'green', 'yellow',
            'red', 'orange', 'silver', 'taupe', 'ochre',
          ].filter((c) => {
            const sc = (selectedColor || '').toLowerCase().trim();
            return !sc.includes(c) && !c.includes(sc);
          })
        : [];

    // 2. Include all product media from Shopify Admin (baseAll)
    baseAll.forEach((m: any) => {
      if (m.__typename !== 'MediaImage') {
        baseList.push(m);
        return;
      }

      if (m?.image?.url && !urlSet.has(m.image.url)) {
        const altText = String(m?.image?.altText || m?.alt || m?.altText || '').toLowerCase();
        const url = m.image.url.toLowerCase();
        const combined = `${altText} ${url}`;

        // If this product has competing colors, strictly filter out images belonging to other colors
        if (productHasMultipleColors || (selectedColor && competingColors.length > 0)) {
          const colorLower = (selectedColor || '').toLowerCase().trim();
          const colorParts = colorLower.split(/[\s\-_/]+/).filter(Boolean);

          // Check if image matches the current selected color in alt text or URL
          const matchesCurrentColor =
            Boolean(colorLower) &&
            (combined.includes(colorLower) ||
              colorParts.some((part) => part.length >= 3 && combined.includes(part)));

          // Check if image explicitly matches a different competing color in alt text or URL
          const hasOtherColor = competingColors.some((c) => {
            const regex = new RegExp(`(^|[^a-z0-9])${c}([^a-z0-9]|$)`, 'i');
            return (
              regex.test(combined) ||
              combined.includes(`_${c}`) ||
              combined.includes(`-${c}`) ||
              combined.includes(`${c}_`) ||
              combined.includes(`${c}-`)
            );
          });

          // Strictly exclude images that explicitly belong to another color (and not the current color)
          if (hasOtherColor && !matchesCurrentColor) {
            return;
          }
        }

        baseList.push(m);
        urlSet.add(m.image.url);
      }
    });

    // 3. If selectedVariantImageUrl is assigned on the variant in Shopify Admin, ensure it's in items at index 0
    if (selectedVariantImageUrl && !urlSet.has(selectedVariantImageUrl)) {
      baseList.unshift({
        __typename: 'MediaImage',
        image: { url: selectedVariantImageUrl, altText: `${selectedColor || ''} ${selectedSize || ''} variant image` },
      } as any);
      urlSet.add(selectedVariantImageUrl);
    }

    // 4. Shape-specific filtering: Filter out images belonging to the opposite shape
    const shapeFilteredList = baseList.filter((m: any) => {
      if (m.__typename !== 'MediaImage') return true;
      const altText = String(m?.image?.altText || m?.altText || m?.alt || '').toLowerCase();
      const url = String(m?.image?.url || m?.url || '').toLowerCase();
      const combined = `${altText} ${url}`;

      // Always keep universal texture and pile detail close-ups for all shapes
      const isDetailShot = /texture|close|detail|pile|height|ruler|thickness|weave|material|zoom/i.test(combined);
      if (isDetailShot) return true;

      const hasRoundKeyword =
        /#shape:round|–\s*round|-\s*round|\bround\b|\bcircle\b|\bcircular\b|150x150|200x200|80x80|100x100|120x120|160x160|ø|_r1\./i.test(
          combined,
        );
      const hasRunnerKeyword =
        /#shape:runner|–\s*runner|-\s*runner|\brunner\b|\bhallway\b|\bbedside\b|60x200|70x200|70x240|70x300|75x245|80x200|80x250|80x300|80x350/i.test(
          combined,
        );
      const hasRectangleKeyword =
        /#shape:rectangle|#shape:rect|\brectangle\b|\brectangular\b|60x100|80x150|120x170|160x230|200x290|250x350/i.test(
          combined,
        );

      const isExplicitRound = hasRoundKeyword;
      const isExplicitRectangle = hasRectangleKeyword && !hasRoundKeyword && !hasRunnerKeyword;
      const isExplicitRunner = hasRunnerKeyword && !hasRoundKeyword;

      // Always keep the exact variant image assigned in Shopify UNLESS it explicitly belongs to an opposite shape
      const isVariantImageOppositeShape = (() => {
        if (!selectedVariantImageUrl || m?.image?.url !== selectedVariantImageUrl) return false;
        if (selectedShape === 'round' && (isExplicitRectangle || isExplicitRunner)) return true;
        if (selectedShape === 'rectangular' && (isExplicitRound || isExplicitRunner)) return true;
        if (selectedShape === 'runner' && (isExplicitRound || isExplicitRectangle)) return true;
        return false;
      })();

      if (selectedVariantImageUrl && m?.image?.url === selectedVariantImageUrl && !isVariantImageOppositeShape) {
        return true;
      }

      if (selectedShape === 'round') {
        // When Round is active: hide explicit rectangular or runner lifestyle shots
        if (isExplicitRectangle || isExplicitRunner) return false;
      } else if (selectedShape === 'rectangular') {
        // When Rectangle is active: strictly hide explicit round or runner cutouts/shots
        if (isExplicitRound || isExplicitRunner) return false;
      } else if (selectedShape === 'runner') {
        // When Runner is active: strictly hide explicit round or rectangle cutouts/shots
        if (isExplicitRound || isExplicitRectangle) return false;
      }

      return true;
    });

    // 5. Intelligent Ordering:
    // 1st: Primary variant cutout image (or shape-matching cutout)
    // 2nd: Room lifestyle shots (in their exact Shopify Admin order)
    // 3rd: Texture close-up & Pile ruler measurement shots at the end
    shapeFilteredList.sort((a: any, b: any) => {
      const aMatchesVariant = selectedVariantImageUrl && a?.image?.url === selectedVariantImageUrl;
      const bMatchesVariant = selectedVariantImageUrl && b?.image?.url === selectedVariantImageUrl;

      const aCombined = `${a?.image?.altText || ''} ${a?.image?.url || ''}`.toLowerCase();
      const bCombined = `${b?.image?.altText || ''} ${b?.image?.url || ''}`.toLowerCase();

      // For round shape, prioritize round cutout image (_r1 or studio round) over generic variant fallback
      if (selectedShape === 'round') {
        const aIsRoundCutout = /_r1\.|\/round\.|– round|- round|#shape:round/i.test(aCombined);
        const bIsRoundCutout = /_r1\.|\/round\.|– round|- round|#shape:round/i.test(bCombined);
        if (aIsRoundCutout && !bIsRoundCutout) return -1;
        if (!aIsRoundCutout && bIsRoundCutout) return 1;
      }

      if (aMatchesVariant) return -1;
      if (bMatchesVariant) return 1;

      const aIsDetail = /texture|close|detail|pile|height|ruler|thickness|weave|material|zoom/i.test(aCombined);
      const bIsDetail = /texture|close|detail|pile|height|ruler|thickness|weave|material|zoom/i.test(bCombined);

      // Detail/ruler shots go to the end
      if (!aIsDetail && bIsDetail) return -1;
      if (aIsDetail && !bIsDetail) return 1;

      return 0;
    });

    return shapeFilteredList;
  }, [media, variantImages, selectedColor, selectedShape, selectedVariantImageUrl, selectedSize]);

  const [active, setActive] = useState(0);
  const [carouselStart, setCarouselStart] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const desktopThumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [pointerFine, setPointerFine] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: fine)').matches;
  });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const ZOOM = 2.2;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine)');
    setPointerFine(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPointerFine(e.matches);
    try {
      mq.addEventListener('change', handler);
    } catch {
      mq.addListener(handler as any);
    }
    return () => {
      try {
        mq.removeEventListener('change', handler);
      } catch {
        mq.removeListener(handler as any);
      }
    };
  }, []);

  const updateContainerSize = () => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSize({ w: rect.width, h: rect.height });
  };

  useEffect(() => {
    if (!isZoomed) return;
    updateContainerSize();
    const onResize = () => updateContainerSize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isZoomed]);

  useEffect(() => {
    setIsZoomed(false);
  }, [active]);

  useEffect(() => {
    setActive(0);
    setCarouselStart(0);
    setIsZoomed(false);
  }, [selectedColor, selectedShape]);

  // Sync active photo whenever variant image or shape changes
  useEffect(() => {
    // If a specific non-rectangular shape is active (e.g. round), match by shape keywords first
    // so a rectangular default variant image doesn't hijack the round view
    if (selectedShape && selectedShape !== 'rectangular') {
      const shapeKeywords: Record<string, RegExp> = {
        round: /_r1\.|\/round\.|– round|- round|#shape:round|round|circle|ø|150x150|200x200|80x80|100x100|120x120/i,
        oval: /oval|60x100oval|80x150oval|120x170oval|160x230oval/i,
        runner: /runner|hallway|60x200|80x250|80x300|70x200|70x300/i,
        special: /petal|daisy|scallop|flower|organic|wavy/i,
      };
      const regex = shapeKeywords[selectedShape];
      if (regex) {
        const shapeIdx = items.findIndex((m: any) =>
          regex.test(`${m?.image?.altText || ''} ${m?.image?.url || ''}`),
        );
        if (shapeIdx >= 0) {
          setActive(shapeIdx);
          return;
        }
      }
    }

    if (selectedVariantImageUrl) {
      const idx = items.findIndex(
        (m: any) => m?.__typename === 'MediaImage' && m?.image?.url === selectedVariantImageUrl,
      );
      if (idx >= 0) {
        setActive(idx);
        return;
      }
    }

    if (selectedShape === 'rectangular') {
      setActive(0);
    }
  }, [selectedVariantImageUrl, selectedShape, selectedSize, items]);

  useEffect(() => {
    const el = desktopThumbRefs.current[active];
    if (!el) return;
    try {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    } catch {
      el.scrollIntoView();
    }
  }, [active]);

  const VISIBLE_THUMBNAILS = 3;

  const onPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    const newActive = (active - 1 + items.length) % items.length;
    setActive(newActive);

    // Auto-scroll carousel to show the active thumbnail
    if (newActive < carouselStart) {
      setCarouselStart(Math.max(0, newActive));
    } else if (newActive >= carouselStart + VISIBLE_THUMBNAILS) {
      setCarouselStart(Math.min(items.length - VISIBLE_THUMBNAILS, newActive - VISIBLE_THUMBNAILS + 1));
    }
  };
  const onNext = (e: React.MouseEvent) => {
    e.preventDefault();
    const newActive = (active + 1) % items.length;
    setActive(newActive);

    // Auto-scroll carousel to show the active thumbnail
    if (newActive < carouselStart) {
      setCarouselStart(Math.max(0, newActive));
    } else if (newActive >= carouselStart + VISIBLE_THUMBNAILS) {
      setCarouselStart(Math.min(items.length - VISIBLE_THUMBNAILS, newActive - VISIBLE_THUMBNAILS + 1));
    }
  };

  const onCarouselPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    const newActive = (active - 1 + items.length) % items.length;
    setActive(newActive);

    // Auto-scroll carousel to show the active thumbnail
    if (newActive < carouselStart) {
      setCarouselStart(Math.max(0, newActive));
    } else if (newActive >= carouselStart + VISIBLE_THUMBNAILS) {
      setCarouselStart(Math.min(items.length - VISIBLE_THUMBNAILS, newActive - VISIBLE_THUMBNAILS + 1));
    }
  };

  const onCarouselNext = (e: React.MouseEvent) => {
    e.preventDefault();
    const newActive = (active + 1) % items.length;
    setActive(newActive);

    // Auto-scroll carousel to show the active thumbnail
    if (newActive < carouselStart) {
      setCarouselStart(Math.max(0, newActive));
    } else if (newActive >= carouselStart + VISIBLE_THUMBNAILS) {
      setCarouselStart(Math.min(items.length - VISIBLE_THUMBNAILS, newActive - VISIBLE_THUMBNAILS + 1));
    }
  };

  const onThumbnailClick = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    setActive(idx);
  };

  const current = items[active] as any;

  const handleEnter = () => {
    if (!pointerFine || current?.__typename !== 'MediaImage') return;
    updateContainerSize();
  };
  const handleLeave = () => {
    return;
  };
  const handleMove = (e: React.MouseEvent) => {
    if (!pointerFine || current?.__typename !== 'MediaImage' || !containerRef.current || !isZoomed) return;
    const rect = containerRef.current.getBoundingClientRect();
    const lx = e.clientX - rect.left;
    const ly = e.clientY - rect.top;
    const cw = size.w || rect.width;
    const ch = size.h || rect.height;
    const x = Math.max(0, Math.min(cw, lx));
    const y = Math.max(0, Math.min(ch, ly));
    setPos({ x, y });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!pointerFine || current?.__typename !== 'MediaImage' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    updateContainerSize();
    const lx = e.clientX - rect.left;
    const ly = e.clientY - rect.top;
    const cw = size.w || rect.width;
    const ch = size.h || rect.height;
    const x = Math.max(0, Math.min(cw, lx));
    const y = Math.max(0, Math.min(ch, ly));
    setPos({ x, y });
    setIsZoomed((z) => !z);
  };

  return (
    <div className={`flex flex-col md:flex-row w-full max-w-full overflow-hidden md:h-full md:min-h-0 ${className}`}>
      <div className="hidden md:flex md:flex-col md:w-28 lg:w-32 md:shrink-0 md:pr-3 md:h-full md:py-6">
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1">
          <div className="flex flex-col gap-3">
            {items.map((itm: any, idx: number) => {
              const thumb: any = itm?.__typename === 'MediaImage' ? itm.image : itm?.previewImage;
              return (
                <button
                  key={itm.id || idx}
                  type="button"
                  aria-label={`Show media ${idx + 1}`}
                  ref={(el) => {
                    desktopThumbRefs.current[idx] = el;
                  }}
                  onClick={(e) => onThumbnailClick(e, idx)}
                  className={`w-20 h-20 lg:w-24 lg:h-24 overflow-hidden transition-all focus:outline-none border bg-white ${idx === active
                    ? 'border-stone-800'
                    : 'border-[#EAD8BB] opacity-80 hover:opacity-100'
                    }`}
                >
                  {thumb ? (
                    <Image
                      loading="lazy"
                      data={thumb as any}
                      className="!object-contain !object-center w-full h-full bg-white"
                      sizes="(min-width: 1024px) 96px, 80px"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-200" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main image */}
      <div className="relative flex-1 w-full bg-stone-100 p-4 md:p-6 aspect-square sm:aspect-[4/3] md:aspect-auto md:h-full md:min-h-0">
        <div
          className="relative w-full h-full bg-stone-100 overflow-hidden"
          ref={containerRef}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onMouseMove={handleMove}
          onClick={handleClick}
          style={{
            cursor: pointerFine
              ? current?.__typename === 'MediaImage'
                ? isZoomed
                  ? 'zoom-out'
                  : 'zoom-in'
                : 'default'
              : 'default',
          }}
        >
          {items.map((itm: any, idx: number) => (
            <div
              key={itm.id || idx}
              className={`absolute inset-0 transition-opacity duration-300 ${idx === active ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
            >
              {itm.__typename === 'MediaImage' ? (
                <Image
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={idx === 0 ? 'high' : 'low'}
                  data={{ ...itm.image, altText: itm.alt || 'Product image' }}
                  containerClassName="absolute inset-0"
                  className="w-full h-full !object-contain !object-center"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                />
              ) : itm.__typename === 'Video' ? (
                <div className="absolute inset-0">
                  {(() => {
                    const srcs = Array.isArray(itm.sources) ? itm.sources : [];
                    const lc = (v?: string) => String(v || '').toLowerCase();
                    const mp4List = srcs.filter((s: any) => lc(s?.mimeType).includes('mp4') || lc(s?.url).endsWith('.mp4'));
                    const hls = srcs.find((s: any) => lc(s?.mimeType).includes('mpegurl') || lc(s?.url).endsWith('.m3u8'));

                    if (hls?.url) {
                      const url = hls.url;
                      console.log('[Video] using HLS URL:', url);
                      return (
                        <HlsVideo
                          key={`${url}-${idx === active ? 'active' : 'inactive'}`}
                          src={url}
                          poster={itm.previewImage?.url || undefined}
                        />
                      );
                    }

                    if (mp4List.length > 0) {
                      console.log('[Video] using MP4 URLs:', mp4List.map((s: any) => s.url));
                      return (
                        <video
                          key={`${mp4List[0].url}-${idx === active ? 'active' : 'inactive'}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          autoPlay
                          muted
                          playsInline
                          preload="metadata"
                          crossOrigin="anonymous"
                          poster={itm.previewImage?.url}
                          onLoadedData={() => console.log('[Video] native loaded:', mp4List[0].url)}
                          onError={() => console.error('[Video] native error:', mp4List[0].url)}
                        >
                          {mp4List.map((s: any, i: number) => (
                            <source key={i} src={s.url} type={s.mimeType || 'video/mp4'} />
                          ))}
                        </video>
                      );
                    }

                    const url = srcs[0]?.url;
                    if (url) console.log('[Video] fallback URL:', url);
                    return url ? (
                      <VideoPlayer
                        key={`${url}-${idx === active ? 'active' : 'inactive'}`}
                        url={url}
                        width="100%"
                        height="100%"
                        playsinline
                        playing={idx === active}
                        onReady={() => console.log('[Video] ready (fallback):', url)}
                        onError={() => console.error('[Video] error (fallback):', url)}
                      />
                    ) : null;
                  })()}
                </div>
              ) : itm.__typename === 'ExternalVideo' ? (
                <div className="absolute inset-0">
                  <VideoPlayer
                    key={`${itm.embedUrl}-${idx === active ? 'active' : 'inactive'}`}
                    url={itm.embedUrl}
                    width="100%"
                    height="100%"
                    playsinline
                    playing={idx === active}
                    onReady={() => console.log('[ExternalVideo] ready:', itm.embedUrl)}
                    onError={() => console.error('[ExternalVideo] error:', itm.embedUrl)}
                    config={{
                      youtube: { playerVars: { playsinline: 1, rel: 0, modestbranding: 1, controls: 0 } },
                    } as any}
                  />
                </div>
              ) : null}
            </div>
          ))}
          {pointerFine && isZoomed && current?.__typename === 'MediaImage' && size.w > 0 && size.h > 0 && (
            (() => {
              const cw = size.w;
              const ch = size.h;
              const iw: number | undefined = current?.image?.width;
              const ih: number | undefined = current?.image?.height;
              const imgW = Math.max(1, iw || cw);
              const imgH = Math.max(1, ih || ch);
              // Match object-contain on the base image
              const scale = Math.min(cw / imgW, ch / imgH);
              const sw = imgW * scale;
              const sh = imgH * scale;
              const offsetX = (cw - sw) / 2;
              const offsetY = (ch - sh) / 2;
              const cx = Math.max(0, Math.min(sw, pos.x - offsetX));
              const cy = Math.max(0, Math.min(sh, pos.y - offsetY));
              const bgLeft = pos.x - cx * ZOOM;
              const bgTop = pos.y - cy * ZOOM;
              const highResUrl: string = current?.image?.url || '';
              return (
                <div
                  className="absolute inset-0 z-40 pointer-events-none"
                  style={{
                    backgroundImage: `url(${highResUrl})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: `${sw * ZOOM}px ${sh * ZOOM}px`,
                    backgroundPosition: `${bgLeft}px ${bgTop}px`,
                  }}
                />
              );
            })()
          )}
        </div>

        {/* Collection Title overlay (pointer-events-none to avoid blocking video controls) */}
        {/* {collectionTitle && (
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
            <div className="relative px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
              <div 
                className="absolute inset-0"
                style={{backgroundColor: '#EAD8BB', opacity: 0.5}}
              ></div>
              <h2 className="relative font-serif uppercase text-[#463925] text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl tracking-wide leading-tight">
                <span className="block">{collectionTitle.toUpperCase()}</span>
                <span className="block">COLLECTION</span>
              </h2>
            </div>
          </div>
        )} */}

        {/* Counter */}
        <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
          <div className="bg-white/90 border border-[#EAD8BB] text-stone-800 text-xs px-2 py-1">
            {active + 1} / {items.length}
          </div>
        </div>

        {/* Desktop arrows */}
        <button
          type="button"
          aria-label="Previous image"
          onClick={onPrev}
          className="hidden md:inline-flex absolute left-3 top-1/2 -translate-y-1/2 z-30 h-10 w-10 items-center justify-center border border-[#EAD8BB] bg-white/95 text-stone-800 shadow-sm hover:bg-[#EAD8BB]/30 transition focus:outline-none focus:ring-2 focus:ring-[#EAD8BB]"
        >
          <span aria-hidden>‹</span>
        </button>
        <button
          type="button"
          aria-label="Next image"
          onClick={onNext}
          className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 z-30 h-10 w-10 items-center justify-center border border-[#EAD8BB] bg-white/95 text-stone-800 shadow-sm hover:bg-[#EAD8BB]/30 transition focus:outline-none focus:ring-2 focus:ring-[#EAD8BB]"
        >
          <span aria-hidden>›</span>
        </button>
      </div>

      {/* Thumbnail navigation */}
      <div className="flex md:hidden items-center gap-1 sm:gap-2 w-full px-2 sm:px-4">
        <button
          type="button"
          aria-label="Previous image"
          onClick={onCarouselPrev}
          className="h-10 w-7 md:h-12 md:w-8 border border-[#EAD8BB] bg-white/95 text-stone-800 shadow-sm hover:bg-[#EAD8BB]/30 transition focus:outline-none focus:ring-2 focus:ring-[#EAD8BB] flex-shrink-0 inline-flex items-center justify-center"
        >
          <span aria-hidden>‹</span>
        </button>

        <div className="flex gap-1 sm:gap-2 md:gap-3 flex-1 justify-center overflow-hidden">
          {items.slice(carouselStart, carouselStart + VISIBLE_THUMBNAILS).map((itm: any, idx: number) => {
            const actualIdx = carouselStart + idx;
            const thumb = itm.__typename === 'MediaImage' ? itm.image : itm.previewImage ? { url: itm.previewImage.url, altText: itm.alt || 'Product thumbnail' } : undefined;
            return (
              <button
                key={itm.id || actualIdx}
                type="button"
                aria-label={`Show media ${actualIdx + 1}`}
                onClick={(e) => onThumbnailClick(e, actualIdx)}
                className={`w-24 h-24 sm:w-32 sm:h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 flex-shrink-0 overflow-hidden transition-all focus:outline-none ${actualIdx === active
                  ? 'ring-2 ring-stone-800 ring-offset-1'
                  : 'opacity-70 hover:opacity-100'
                  }`}
              >
                {thumb ? (
                  <Image
                    loading="lazy"
                    data={thumb as any}
                    className="!object-contain !object-center w-full h-full bg-white"
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 176px, 208px"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-200" />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Next image"
          onClick={onCarouselNext}
          className="h-10 w-7 md:h-12 md:w-8 border border-[#EAD8BB] bg-white/95 text-stone-800 shadow-sm hover:bg-[#EAD8BB]/30 transition focus:outline-none focus:ring-2 focus:ring-[#EAD8BB] flex-shrink-0 inline-flex items-center justify-center"
        >
          <span aria-hidden>›</span>
        </button>
      </div>
    </div>
  );
}
