import { useEffect, useRef, useState, Suspense } from 'react';
import { Disclosure, Listbox, Transition } from '@headlessui/react';
import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import { useLoaderData, Await, Link as RemixLink, useNavigate } from '@remix-run/react';
import { htmlCacheHeaders, routeHeaders } from '~/data/cache';
import {
  getSeoMeta,
  Money,
  ShopPayButton,
  CartForm,
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  getProductOptions,
  type MappedProductOptions,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import { adminGraphQL } from '~/lib/admin.server';

import type { ProductFragment } from 'storefrontapi.generated';
import { Heading, Section, Text } from '~/components/Text';
import { Link } from '~/components/Link';
import { Button } from '~/components/Button';
import { Drawer } from '~/components/Drawer';
import { AddToCartButton } from '~/components/AddToCartButton';
import { Skeleton } from '~/components/Skeleton';
import { ProductSwimlane } from '~/components/ProductSwimlane';
import { ProductGallery } from '~/components/ProductGallery';
import { IconCaret, IconCheck, IconClose, IconBag } from '~/components/Icon';
import { JudgeMePreviewBadge } from '~/components/JudgeMePreviewBadge';
import { getExcerpt } from '~/lib/utils';
import { seoPayload } from '~/lib/seo.server';
import { productReviewsJsonLdScript } from '~/lib/product-reviews-jsonld';
import type { Storefront } from '~/lib/type';
import { MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT } from '~/data/fragments';
import JudgeMeSection from '~/components/JudgeMeSection';
import { FavoriteButton } from '~/components/FavoriteButton';
import { fetchJudgeMeWidgetHTML } from '~/lib/judgeme.server';
import { fetchJudgeMeProductReviewsForSchema } from '~/lib/judgeme-product-reviews.server';
import { ProductSections } from '~/components/ProductSections';
import { ProductOptionValues } from '~/components/ProductOptionValues';
import { SizeGuideModal } from '~/components/SizeGuideModal';
import { WashingInstructionsSection } from '~/components/WashingInstructionsSection';
import { ShopInspiredStyles } from '~/components/ShopInspiredStyles';
import { usePrefixPathWithLocale } from '~/lib/utils';
import { RugShapeSelector, detectRugShape, ShapeIcon, SHAPE_DEFINITIONS } from '~/components/RugShapeSelector';
import defaultSizeThumbnail from '~/assets/sizepics/80x80round.png';
import sizeThumb40x60Doormat from '~/assets/sizepics/40x60doormat.png';
import sizeThumb60x90Doormat from '~/assets/sizepics/60x90doormat.png';
import sizeThumb60x100Doormat from '~/assets/sizepics/60x100doormat.png';
import sizeThumb60x100Oval from '~/assets/sizepics/60x100oval.png';
import sizeThumb80x80Round from '~/assets/sizepics/80x80round.png';
import sizeThumb70x140Bed from '~/assets/sizepics/70x140bed.png';
import sizeThumb70x200Bed from '~/assets/sizepics/70x200bed.png';
import sizeThumb70x300Hall from '~/assets/sizepics/70x300hall.png';
import sizeThumb80x150Bed from '~/assets/sizepics/80x150bed.png';
import sizeThumb80x150Oval from '~/assets/sizepics/80x150oval.png';
import sizeThumb100x100Round from '~/assets/sizepics/100x100round.png';
import sizeThumb120x120Round from '~/assets/sizepics/120x120round.png';
import sizeThumb120x170Living from '~/assets/sizepics/120x170living.png';
import sizeThumb120x170Oval from '~/assets/sizepics/120x170oval.png';
import sizeThumb130x190Living from '~/assets/sizepics/130x190living.png';
import sizeThumb150x150Round from '~/assets/sizepics/150x150round.png';
import sizeThumb160x160Round from '~/assets/sizepics/160x160round.png';
import sizeThumb160x230Living from '~/assets/sizepics/160x230living.png';
import sizeThumb160x230Oval from '~/assets/sizepics/160x230oval.png';
import sizeThumb170x240Living from '~/assets/sizepics/170x240living.png';
import sizeThumb200x200Round from '~/assets/sizepics/200x200round.png';
import sizeThumb200x290Living from '~/assets/sizepics/200x290living.png';
import sizeThumb200x290Oval from '~/assets/sizepics/200x290oval.png';
import sizeThumb200x300Living from '~/assets/sizepics/200x300living.png';
import sizeThumb250x300Living from '~/assets/sizepics/250x300living.png';
import sizeThumb250x350Living from '~/assets/sizepics/250x350living.png';
type GroupProductItem = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText?: string | null } | null;
  group?: { value?: string | null } | null;
  colorLabel?: { value?: string | null } | null;
  colorFamilyKey?: { value?: string | null } | null;
  swatchImage?: {
    reference?: { image?: { url: string; altText?: string | null } | null } | null;
  } | null;
};

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  const { productHandle } = args.params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  // Now that we have product handle, start fetching non-critical data
  const deferredData = loadDeferredData(args, criticalData.product.handle, criticalData.product.id, criticalData.product.tags, criticalData.product);

  return defer({ ...deferredData, ...criticalData }, {
    headers: htmlCacheHeaders(),
  });
}

function getShopifyNumericId(gid?: string | null) {
  if (!gid) return undefined;
  const idx = gid.lastIndexOf('/');
  return idx >= 0 ? gid.substring(idx + 1) : gid;
}

function sendKlaviyoEvent(eventName: string, payload: any) {
  if (typeof window === 'undefined') return;
  // Klaviyo loads window.klaviyo; before load it can be an array queue
  const k: any = (window as any).klaviyo || [];
  (window as any).klaviyo = k;

  if (Array.isArray(k)) {
    k.push(['track', eventName, payload]);
    return;
  }

  if (typeof k.track === 'function') {
    k.track(eventName, payload);
  }
}

function sendKlaviyoViewedItem(payload: any) {
  if (typeof window === 'undefined') return;
  const k: any = (window as any).klaviyo || [];
  (window as any).klaviyo = k;

  if (Array.isArray(k)) {
    k.push(['trackViewedItem', payload]);
    return;
  }

  if (typeof k.trackViewedItem === 'function') {
    k.trackViewedItem(payload);
  }
}

function trackKlaviyoViewedProduct(product: any, selectedVariant: any) {
  const item = {
    Name: product?.title,
    ProductID: getShopifyNumericId(product?.id),
    ImageURL: selectedVariant?.image?.url,
    Handle: product?.handle,
    Brand: product?.vendor,
    Price: selectedVariant?.price?.amount,
    Metadata: {
      Brand: product?.vendor,
      Price: selectedVariant?.price?.amount,
      CompareAtPrice: selectedVariant?.compareAtPrice?.amount,
    },
  };

  sendKlaviyoEvent('Hydrogen Viewed Product', item);
  sendKlaviyoViewedItem(item);
}

function trackKlaviyoAddedToCart(product: any, selectedVariant: any) {
  const item = {
    Name: product?.title,
    ProductID: getShopifyNumericId(product?.id),
    ImageURL: selectedVariant?.image?.url,
    Handle: product?.handle,
    Brand: product?.vendor,
    Price: selectedVariant?.price?.amount,
  };

  sendKlaviyoEvent('Hydrogen Added To Cart', item);
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  params,
  request,
  context,
}: LoaderFunctionArgs) {
  const { productHandle } = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const selectedOptions = getSelectedProductOptions(request);

  const [{ shop, product, metaobjects, colorSwatches }] = await Promise.all([
    context.storefront.query(PRODUCT_QUERY, {
      variables: {
        handle: productHandle,
        selectedOptions,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response('product', { status: 404 });
  }

  // Move recommended products to deferred loading
  const selectedVariant = product.selectedOrFirstAvailableVariant ?? {};
  const variants = getAdjacentAndFirstAvailableVariants(product);

  // Judge.me stays off the critical path — review JSON-LD streams in via deferred data.
  const seo = seoPayload.product({
    product: { ...product, variants },
    selectedVariant,
    url: request.url,
    reviews: null,
  });

  return {
    product,
    variants,
    shop,
    storeDomain: shop.primaryDomain.url,
    pageUrl: request.url,
    seo,
    metaobjects,
    colorSwatches,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData(args: LoaderFunctionArgs, productHandle?: string, productId?: string, productTags?: string[], product?: any) {
  // Put any API calls that are not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  const { context } = args;

  const jdgmProductReviews = productHandle
    ? fetchJudgeMeWidgetHTML(context.env, 'product_review', {
      handle: productHandle,
    })
    : Promise.resolve<string | null>(null);

  const productReviewsForSchema = productHandle
    ? fetchJudgeMeProductReviewsForSchema(
      context.env as unknown as Record<string, string | undefined>,
      productHandle,
    )
    : Promise.resolve(null);

  const recommended = productId
    ? getRecommendedProducts(context.storefront, productId)
    : Promise.resolve({ nodes: [] });

  const inspiredCollections = productTags && productId
    ? getInspiredCollections(context.storefront, productTags, productId)
    : Promise.resolve([]);

  // Move swatch image fetching to deferred loading
  const productSwatchImageMap = (async (): Promise<Record<string, string>> => {
    const map: Record<string, string> = {};
    try {
      if (!product) return map;
      const options = ((product as any)?.options || []) as any[];
      const colorOption = options.find((opt: any) => {
        const n = String(opt?.name || '').toLowerCase();
        return n === 'color' || n === 'colors' || n === 'colour' || n === 'colours';
      });

      const handles = Array.from(
        new Set(
          ((colorOption?.optionValues || []) as any[])
            .map((ov: any) => ov?.firstSelectableVariant?.product?.handle)
            .filter(Boolean)
            .map((h: any) => String(h)),
        ),
      );

      if (handles.length > 0) {
        const handleQuery = handles.map((h) => `handle:${h}`).join(' OR ');
        const swatchProducts = await context.storefront.query(
          PRODUCT_SWATCH_BY_HANDLES_QUERY,
          {
            variables: {
              country: context.storefront.i18n.country,
              language: context.storefront.i18n.language,
              query: handleQuery,
              first: Math.min(handles.length, 50),
            },
          },
        );

        const nodes = (swatchProducts as any)?.products?.nodes || [];
        nodes.forEach((p: any) => {
          const h = String(p?.handle || '');
          const url = p?.swatchImage?.reference?.image?.url;
          if (h && url) map[h] = String(url);
        });
      }
    } catch { }
    return map;
  })();

  // Move group products Admin queries to deferred loading
  const groupProducts = (async (): Promise<any[]> => {
    if (!product) return [];

    const groupValue = (product as any)?.group?.value as string | undefined;
    const groupValueNormalized = groupValue ? String(groupValue).trim() : undefined;
    if (!groupValueNormalized) return [];

    const groupValueEscaped = groupValueNormalized
      ? String(groupValueNormalized).replace(/"/g, '\\"')
      : undefined;
    const groupQueryQuoted = groupValueEscaped
      ? `metafields.custom.group:"${groupValueEscaped}"`
      : undefined;
    const groupQueryUnquoted = groupValueEscaped
      ? `metafields.custom.group:${groupValueEscaped}`
      : undefined;
    const tagFallbackQuery = groupValueEscaped
      ? `tag:"${groupValueEscaped}"`
      : undefined;

    const ADMIN_GROUP_PRODUCTS_QUERY = `
      query AdminGroupProducts($query: String!, $first: Int!) {
        products(first: $first, query: $query) {
          edges {
            node {
              id
              title
              handle
              featuredImage {
                url
                altText
              }
              group: metafield(namespace: "custom", key: "group") { value }
              colorLabel: metafield(namespace: "custom", key: "color_label") { value }
              colorFamilyKey: metafield(namespace: "custom", key: "color_family_key") { value }
              swatchImage: metafield(namespace: "custom", key: "swatch_color") {
                reference {
                  ... on MediaImage {
                    image { url altText }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const runAdmin = async (q: string) => {
      const data = await adminGraphQL<{
        products?: { edges?: Array<{ node: any }> } | null;
      }>(context as any, ADMIN_GROUP_PRODUCTS_QUERY, { query: q, first: 50 });
      const edges = data?.products?.edges ?? [];
      return Array.isArray(edges)
        ? edges.map((e: any) => e?.node).filter(Boolean)
        : [];
    };

    const exact = (arr: any[]) =>
      arr.filter(
        (p: any) =>
          String(p?.group?.value || '').trim() === String(groupValueNormalized),
      );

    let products = exact(await runAdmin(groupQueryQuoted!));
    if (products.length === 0 && groupQueryUnquoted) {
      products = exact(await runAdmin(groupQueryUnquoted));
    }
    if (products.length === 0 && tagFallbackQuery) {
      const nodes = await runAdmin(tagFallbackQuery);
      products = nodes.filter((p: any) => {
        const v = String(p?.group?.value || '').trim();
        return v === '' || v === String(groupValueNormalized);
      });
    }

    return products;
  })();

  return { jdgmProductReviews, productReviewsForSchema, recommended, inspiredCollections, productSwatchImageMap, groupProducts };
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  const seoEntries = (matches || [])
    .map((m) => (m.data as any)?.seo)
    .filter(Boolean) as any[];
  if (seoEntries.length > 0) return getSeoMeta(...seoEntries);
  return [
    { title: 'Product' },
    { name: 'description', content: 'Product details and information' },
  ];
};

export default function Product() {
  const { product, shop, recommended, variants, storeDomain, pageUrl, jdgmProductReviews, productReviewsForSchema, metaobjects, colorSwatches, inspiredCollections, groupProducts, productSwatchImageMap } =
    useLoaderData<typeof loader>();
  const { media, title, vendor, descriptionHtml } = product;
  const { shippingPolicy, refundPolicy } = shop;
  const globalSustainability = (shop as any)?.globalSustainability?.value as string | undefined;
  const globalSustainabilityPartnerLogo = (shop as any)?.globalSustainabilityPartnerLogo
    ?.reference?.image as { url: string; altText?: string | null } | undefined;

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    variants,
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const collectionTitle = (product as any)?.collections?.nodes?.[0]?.title as string | undefined;

  const sizeImageMap = buildSizeImageMap(product);

  const selectedVariantImageUrl = (selectedVariant as any)?.image?.url as
    | string
    | undefined;

  const selectedColor = (selectedVariant as any)?.selectedOptions?.find((o: any) =>
    /^(color|colours?|couleurs?)$/i.test(String(o?.name || '')),
  )?.value as string | undefined;

  const variantsAll = ((product as any)?.variants?.nodes || []) as any[];
  const allProductColors = Array.from(
    new Set(
      variantsAll
        .map((v: any) => {
          const opt = v.selectedOptions?.find((o: any) =>
            /^(color|colours?|couleurs?)$/i.test(String(o?.name || '')),
          );
          return opt?.value ? String(opt.value).trim() : null;
        })
        .filter(Boolean) as string[],
    ),
  );
  const variantWithSelectedColor = variantsAll.find((v: any) => {
    if (!selectedColor) return false;
    const opt = (v as any)?.selectedOptions?.find((o: any) =>
      /^(color|colours?|couleurs?)$/i.test(String(o?.name || '')),
    );
    return String(opt?.value || '') === String(selectedColor);
  });

  const refs = (variantWithSelectedColor as any)?.metafield?.references?.nodes || [];
  const imagesFromMetafield = refs
    .map((n: any) => {
      if (n?.image?.url) return n.image;
      if (n?.url) {
        return { url: n.url, altText: null, width: null, height: null };
      }
      return null;
    })
    .filter((img: any) => img?.url);

  const variantImages = (() => {
    if (imagesFromMetafield.length === 0) return undefined;

    const seen = new Set<string>();
    return imagesFromMetafield.filter((img: any) => {
      const url = String(img.url);
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  })();

  useEffect(() => {
    try {
      if (!product) return;
      trackKlaviyoViewedProduct(product, selectedVariant);

      // Meta Pixel ViewContent tracking
      if (typeof window !== 'undefined' && (window as any).fbq) {
        // Prevent duplicate events within 2 seconds for the same product
        const now = Date.now();
        const lastFiredKey = `fbq_viewcontent_${product.handle}`;
        const lastFired = window.sessionStorage.getItem(lastFiredKey);
        const lastTime = lastFired ? parseInt(lastFired, 10) : 0;

        if (now - lastTime > 2000) {
          window.sessionStorage.setItem(lastFiredKey, String(now));
          (window as any).fbq('track', 'ViewContent', {
            content_name: product.title,
            content_category: (product as any)?.productType || '',
            content_ids: [selectedVariant?.id],
            content_type: 'product',
            value: selectedVariant?.price?.amount,
            currency: selectedVariant?.price?.currencyCode,
          });
        }
      }
    } catch { }
    // Only run once per product handle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.handle]);

  const selectedSizeValue = (selectedVariant as any)?.selectedOptions?.find((o: any) =>
    /^(size|sizes)$/i.test(String(o?.name || '')),
  )?.value as string | undefined;

  const selectedShape = detectRugShape(selectedSizeValue || '', product.title, product.tags || []);

  return (
    <>
      <Suspense fallback={null}>
        <Await resolve={productReviewsForSchema}>
          {(reviews) => {
            if (!reviews) return null;
            const json = productReviewsJsonLdScript({
              url: String(pageUrl || '').split('?')[0] || `/products/${product.handle}`,
              productTitle: product.title,
              selectedVariant,
              reviews,
            });
            if (!json) return null;
            return (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: json}}
              />
            );
          }}
        </Await>
      </Suspense>
      <Section className="px-0 w-full max-w-full md:overflow-hidden pb-14 md:pb-0">
        <div className="w-full max-w-full">
          <div className="flex flex-col md:flex-row items-stretch md:items-start">
            <div className="relative w-full md:flex-[0.9] md:sticky md:top-[var(--height-nav)] md:h-[calc(100dvh-var(--height-nav))] md:overflow-y-auto">
              <ProductGallery
                media={media.nodes}
                className="w-full"
                collectionTitle={collectionTitle}
                selectedVariantImageUrl={selectedVariantImageUrl}
                variantImages={variantImages}
                selectedColor={selectedColor}
                selectedShape={selectedShape}
                selectedSize={selectedSizeValue}
                allProductColors={allProductColors}
              />
              <div className="absolute top-2 right-2 z-30 pointer-events-auto">
                <FavoriteButton productId={product.id} size="lg" />
              </div>
            </div>
            <div className="flex flex-col bg-white md:flex-[1.1] md:sticky md:top-[var(--height-nav)] md:h-[calc(100dvh-var(--height-nav))] md:overflow-y-auto">
              <section className="flex flex-col w-full gap-4 p-5 md:p-6 lg:p-8">
                <div className="grid gap-2">
                  <Heading as="h1" className="font-semibold text-xl md:text-2xl font-sans text-[#463925]">
                    {title}
                  </Heading>
                  <div className="text-sm text-primary/80">
                    <JudgeMePreviewBadge handle={product.handle} />
                  </div>
                  {vendor && (
                    <Text className={'opacity-50 font-medium'}>{vendor}</Text>
                  )}
                </div>
                <ProductSections
                  product={product}
                  selectedVariant={selectedVariant}
                />
                <Suspense fallback={<Skeleton className="h-32" />}>
                  <Await resolve={groupProducts} errorElement={<div>Error loading group products</div>}>
                    {(resolvedGroupProducts) => (
                      <Await resolve={productSwatchImageMap} errorElement={<div>Error loading swatch images</div>}>
                        {(resolvedSwatchMap) => (
                          <ProductForm
                            product={product}
                            productOptions={productOptions}
                            selectedVariant={selectedVariant}
                            storeDomain={storeDomain}
                            sizeGuideData={metaobjects}
                            colorSwatchData={colorSwatches}
                            sizeImageMap={sizeImageMap}
                            groupProducts={(resolvedGroupProducts as GroupProductItem[] | undefined) ?? []}
                            currentProductHandle={product.handle}
                            productSwatchImageMap={resolvedSwatchMap as any}
                            currentProductSwatchUrl={(product as any)?.swatchImage?.reference?.image?.url as any}
                          />
                        )}
                      </Await>
                    )}
                  </Await>
                </Suspense>
                <div className="grid gap-3 py-3">
                  {shippingPolicy?.body && (
                    <ProductDetail
                      title="Shipping Policy"
                      content="<strong>Free UK delivery</strong><br />We currently deliver across the United Kingdom. All orders are dispatched from our UK-based fulfilment center. Estimated delivery: 2–7 business days. Tracking details will be shared by email once dispatched."
                      learnMore={`/policies/${shippingPolicy.handle}`}
                    />
                  )}
                  {refundPolicy?.body && (
                    <ProductDetail
                      title="Return Policy"
                      content="<strong>14-day no-fuss returns</strong><br />Changed your mind? You can return unused rugs within 14 days in their original condition and packaging. Refunds are processed within 5–7 business days after inspection."
                      learnMore={`/policies/${refundPolicy.handle}`}
                    />
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </Section>
      {/* Washing Instructions Section */}
      <Section className="px-6 md:px-8 lg:px-12">
        <ProductDetailsAccordion
          product={product}
          globalSustainability={globalSustainability}
          globalSustainabilityPartnerLogo={globalSustainabilityPartnerLogo}
        />
      </Section>
      {/* Shop Inspired Styles Section */}
      <Suspense fallback={<Skeleton className="h-32" />}>
        <Await
          errorElement="There was a problem loading inspired collections"
          resolve={inspiredCollections}
        >
          {(collections) => {
            // console.log('🎯 Resolved collections:', collections);
            // console.log('🏷️ Product tags from product:', product.tags);
            return (
              <ShopInspiredStyles
                collections={collections}
                productTags={product.tags}
              />
            );
          }}
        </Await>
      </Suspense>
      {/* Customer Reviews Section (moved below Related Products) */}
      <Section className="px-6 md:px-8 lg:px-12" id="customer-reviews">
        <JudgeMeSection handle={product.handle} />
      </Section>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </>
  );
}

function AccordionPlusMinus({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex h-5 w-5 items-center justify-center"
    >
      <span className="absolute h-[2px] w-4 bg-[#463925]" />
      <span
        className={clsx(
          'absolute h-4 w-[2px] bg-[#463925] transition-transform duration-200',
          open && 'scale-y-0',
        )}
      />
    </span>
  );
}

function ProductDetailsAccordion({
  product,
  globalSustainability,
  globalSustainabilityPartnerLogo,
}: {
  product: ProductFragment;
  globalSustainability?: string;
  globalSustainabilityPartnerLogo?: { url: string; altText?: string | null };
}) {
  const mfv = (ns: string, key: string) => {
    const metafields = (product as any)?.metafields || [];
    const metafield = metafields.find((m: any) => m?.namespace === ns && m?.key === key);
    if (!metafield?.value) return undefined;

    try {
      if (
        typeof metafield.value === 'string' &&
        (metafield.value.startsWith('{') || metafield.value.startsWith('['))
      ) {
        return JSON.parse(metafield.value);
      }
    } catch { }

    return metafield.value;
  };

  const customDescription = mfv('custom', 'extra_description');
  const customSpecs = mfv('custom', 'specifications');
  const sustainability = globalSustainability;
  const sustainabilityPartnerLogo = globalSustainabilityPartnerLogo;
  const customWashing = mfv('custom', 'washing_instructions');
  const legacyWashingText = mfv('care', 'washing_instructions');

  const washingText = customWashing || legacyWashingText;
  let washingItems: string[] = [];
  if (washingText) {
    if (typeof washingText === 'string') {
      washingItems = washingText
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (Array.isArray(washingText)) {
      washingItems = washingText.map((item) => String(item)).filter(Boolean);
    } else if (typeof washingText === 'object') {
      washingItems = Object.values(washingText)
        .map((item) => String(item))
        .filter(Boolean);
    }
  }

  let parsedSpecs: Array<{ label: string; value: string }> = [];
  if (customSpecs && typeof customSpecs === 'object' && !Array.isArray(customSpecs)) {
    parsedSpecs = Object.entries(customSpecs).map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: String(value),
    }));
  } else if (customSpecs && typeof customSpecs === 'string') {
    try {
      const parsed = JSON.parse(customSpecs);
      if (parsed && typeof parsed === 'object') {
        parsedSpecs = Object.entries(parsed).map(([key, value]) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1),
          value: String(value),
        }));
      }
    } catch { }
  }

  const legacySpecs = {
    size: mfv('specs', 'size'),
    thickness: mfv('specs', 'thickness'),
    weight: mfv('specs', 'weight'),
    material: mfv('specs', 'material'),
    backing: mfv('specs', 'backing'),
    edge: mfv('specs', 'edge'),
  };

  const specEntries: Array<{ label: string; value?: string }> =
    parsedSpecs.length > 0
      ? parsedSpecs
      : [
        { label: 'Dimensions', value: legacySpecs.size },
        { label: 'Thickness', value: legacySpecs.thickness },
        { label: 'Weight', value: legacySpecs.weight },
        { label: 'Material', value: legacySpecs.material },
        { label: 'Backing', value: legacySpecs.backing },
        { label: 'Edge', value: legacySpecs.edge },
      ].filter((r) => Boolean(r.value));

  const items = [
    {
      key: 'description',
      title: 'Description',
      visible: Boolean(customDescription || product.description),
      panel: (
        <div className="pt-3">
          {customDescription ? (
            <div
              className="prose prose-sm max-w-none leading-relaxed text-sm font-sans text-[#463925]"
              style={{ fontFamily: 'Source Sans Pro', fontWeight: 400 }}
              dangerouslySetInnerHTML={{ __html: customDescription }}
            />
          ) : (
            <p className="leading-relaxed font-sans text-[#836E4C]">{product.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'specifications',
      title: 'Specifications',
      visible: specEntries.length > 0,
      panel: (
        <div className="pt-3 space-y-0">
          {specEntries.map((row) => (
            <div
              key={row.label}
              className="flex items-center py-2 border-b border-stone-200 last:border-b-0 gap-6"
            >
              <span className="text-base font-sans text-[#DAC6A7] w-32 flex-shrink-0">
                {row.label}
              </span>
              <span className="text-base font-sans text-[#836E4C] flex-1">{row.value}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'sustainability',
      title: 'Sustainability',
      visible: Boolean(sustainability),
      panel: (
        <div className="pt-3">
          <div className="grid gap-4 sm:grid-cols-[140px_1fr] items-start">
            {sustainabilityPartnerLogo?.url && (
              <div className="w-full max-w-[140px]">
                <img
                  src={sustainabilityPartnerLogo.url}
                  alt={sustainabilityPartnerLogo.altText || 'Sustainability partner logo'}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
            )}
            <div
              className="prose prose-sm max-w-none leading-relaxed text-base  font-sans text-[#836E4C]"
              dangerouslySetInnerHTML={{ __html: String(sustainability || '') }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'washing',
      title: 'Washing Instructions',
      visible: washingItems.length > 0,
      panel: (
        <ul className="pt-3 list-disc pl-5 grid gap-2">
          {washingItems.map((item, idx) => (
            <li key={idx} className="text-base leading-relaxed font-sans text-[#836E4C]">
              {item}
            </li>
          ))}
        </ul>
      ),
    },
  ].filter((i) => i.visible);

  if (items.length === 0) return null;

  return (
    <div className="border border-stone-200 rounded-lg bg-white">
      {items.map((item, idx) => (
        <Disclosure
          key={item.key}
          as="div"
          className={clsx('px-5', idx > 0 && 'border-t border-stone-200')}
          defaultOpen={false}
        >
          {({ open }) => (
            <>
              <Disclosure.Button className="w-full py-5 flex items-center justify-between text-left">
                <span className="font-semibold text-lg font-sans text-[#463925]">
                  {item.title}
                </span>
                <AccordionPlusMinus open={open} />
              </Disclosure.Button>
              <Transition
                show={open}
                enter="transition duration-300 ease-out"
                enterFrom="opacity-0 -translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition duration-200 ease-in"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 -translate-y-1"
              >
                <Disclosure.Panel static className="pb-6">
                  {item.panel}
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
}

export function ProductForm({
  product,
  productOptions,
  selectedVariant,
  storeDomain,
  sizeGuideData,
  colorSwatchData,
  sizeImageMap,
  groupProducts,
  currentProductHandle,
  productSwatchImageMap,
  currentProductSwatchUrl,
}: {
  product: ProductFragment;
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  storeDomain: string;
  sizeGuideData: any;
  colorSwatchData: any;
  sizeImageMap?: Record<string, Record<string, string>>;
  groupProducts?: GroupProductItem[];
  currentProductHandle?: string;
  productSwatchImageMap?: Record<string, string>;
  currentProductSwatchUrl?: string;
}) {
  const navigate = useNavigate();
  const closeRef = useRef<HTMLButtonElement>(null);
  const sizeGuideRef = useRef<HTMLDivElement>(null);
  const quickColorScrollRef = useRef<HTMLDivElement>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isSizeDrawerOpen, setIsSizeDrawerOpen] = useState(false);
  const [showQuickAddBar, setShowQuickAddBar] = useState(false);
  const [pendingSizeTo, setPendingSizeTo] = useState<string | null>(null);
  const [pendingSizeValue, setPendingSizeValue] = useState<string | null>(null);

  // Scroll detection for Quick ADD bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (!Number.isFinite(docHeight) || docHeight <= 0) return;

      const scrollPercent = (scrollTop / docHeight) * 100;
      if (!Number.isFinite(scrollPercent)) return;

      // Show bar when > 50% scroll
      // Hide bar at 100% (very bottom)
      // Show again when scrolling back up to 95% or less
      if (scrollPercent > 50 && scrollPercent < 100) {
        setShowQuickAddBar(true);
      } else if (scrollPercent >= 100) {
        setShowQuickAddBar(false);
      } else if (scrollPercent <= 95 && scrollPercent > 50) {
        setShowQuickAddBar(true);
      } else {
        setShowQuickAddBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sizeOption =
    productOptions.find(
      (option) =>
        option.name &&
        (option.name.toLowerCase() === 'size' || option.name.toLowerCase() === 'sizes'),
    ) || null;

  const colorOption =
    productOptions.find((option) =>
      /^(color|colour|colors|colours)$/i.test(String(option?.name || '')),
    ) || null;

  const selectedSizeValue =
    selectedVariant?.selectedOptions?.find(
      (option) =>
        option.name &&
        (option.name.toLowerCase() === 'size' || option.name.toLowerCase() === 'sizes'),
    )?.value;

  useEffect(() => {
    if (!isSizeDrawerOpen) return;
    setPendingSizeTo(null);
    setPendingSizeValue(null);
  }, [isSizeDrawerOpen]);

  useEffect(() => {
    setPendingSizeTo(null);
    setPendingSizeValue(null);
  }, [selectedSizeValue]);

  const selectedColorValue =
    selectedVariant?.selectedOptions?.find((option) =>
      /^(color|colour|colors|colours)$/i.test(String(option?.name || '')),
    )?.value;

  const quickGroupColorItems = Array.isArray(groupProducts)
    ? groupProducts
      .filter((p) => p?.handle)
      .sort((a, b) =>
        String(a.colorLabel?.value || a.title || '').localeCompare(
          String(b.colorLabel?.value || b.title || ''),
        ),
      )
    : [];

  const quickVariantColorItems = Array.isArray((colorOption as any)?.optionValues)
    ? ((colorOption as any).optionValues as any[])
    : [];

  const quickColorsCount =
    quickGroupColorItems.length > 1
      ? quickGroupColorItems.length
      : quickVariantColorItems.length;

  const hasQuickColors =
    quickGroupColorItems.length > 1 || quickVariantColorItems.length > 1;

  const selectedSizeImageUrl =
    sizeOption && selectedSizeValue && sizeImageMap
      ? sizeImageMap[sizeOption.name]?.[selectedSizeValue]
      : undefined;

  const isOutOfStock = !selectedVariant?.availableForSale;

  const isOnSale = Boolean(
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    Number(selectedVariant.price.amount) < Number(selectedVariant.compareAtPrice.amount),
  );

  const buyNowApiAction = usePrefixPathWithLocale('/api/buy-now');

  return (
    <div className="grid gap-10">
      <div className="grid gap-4">
        {productOptions
          .filter((option) => option.name !== 'Title') // Filter out Shopify's default "Title" option
          .map((option, optionIndex) => {
            const optionName = option.name || '';
            const isSizeOption =
              optionName.toLowerCase() === 'size' || optionName.toLowerCase() === 'sizes';
            const selectedValue = selectedVariant?.selectedOptions[optionIndex]?.value;

            if (isSizeOption) {
              return (
                <div
                  key={option.name}
                  className="product-options flex flex-col flex-wrap mb-4 gap-y-3 last:mb-0"
                >
                  <RugShapeSelector
                    sizeOption={option}
                    selectedSizeValue={selectedSizeValue}
                    productTitle={product.title}
                    productTags={product.tags || []}
                    variants={(product as any)?.variants?.nodes || []}
                    groupProducts={groupProducts}
                    currentProductHandle={currentProductHandle}
                    onSelectSize={(to, name) => {
                      navigate(to, { preventScrollReset: true, replace: true });
                    }}
                    sizeImageMap={sizeImageMap}
                    onOpenDrawer={() => setIsSizeDrawerOpen(true)}
                  />
                </div>
              );
            }

            return (
              <div
                key={option.name}
                className="product-options flex flex-col flex-wrap mb-3 gap-y-2 last:mb-0"
              >
                <div className="mb-2 grid gap-3">
                  <h3 className="font-semibold text-xl md:text-2xl font-sans text-[#463925]">
                    Select {option.name}
                  </h3>
                  <ProductOptionValues
                    option={option}
                    selectedValue={selectedValue}
                    colorSwatchData={colorSwatchData}
                    sizeImageMap={sizeImageMap}
                    groupProducts={groupProducts}
                    currentProductHandle={currentProductHandle}
                    productSwatchImageMap={productSwatchImageMap}
                    currentProductSwatchUrl={currentProductSwatchUrl}
                    onOptionSelected={() => {
                      // Close the drawer if open when selecting an option
                      setIsSizeDrawerOpen(false);
                    }}
                  />
                </div>
              </div>
            );
          })}

        {sizeOption && (
          <Drawer
            open={isSizeDrawerOpen}
            onClose={() => {
              setIsSizeDrawerOpen(false);
              setPendingSizeTo(null);
            }}
            heading="Choose a size"
            openFrom="right"
          >
            <div className="flex flex-col h-full bg-white">
              <div className="flex-1 overflow-y-auto p-5">
                <RugShapeSelector
                  sizeOption={sizeOption}
                  selectedSizeValue={pendingSizeValue || selectedSizeValue}
                  productTitle={product.title}
                  productTags={product.tags || []}
                  variants={(product as any)?.variants?.nodes || []}
                  groupProducts={groupProducts}
                  currentProductHandle={currentProductHandle}
                  onSelectSize={(to, name) => {
                    setPendingSizeTo(to);
                    setPendingSizeValue(name);
                  }}
                  isDrawerMode={true}
                  sizeImageMap={sizeImageMap}
                />
              </div>
              <div className="border-t border-gray-200 p-4 bg-white">
                <Button
                  variant="primary"
                  className="w-full bg-black text-white hover:bg-stone-900 py-3.5 text-base font-semibold rounded-none"
                  disabled={!pendingSizeTo && !selectedSizeValue}
                  onClick={() => {
                    if (pendingSizeTo) {
                      const next = pendingSizeTo;
                      setIsSizeDrawerOpen(false);
                      setPendingSizeTo(null);
                      setPendingSizeValue(null);
                      navigate(next, { preventScrollReset: true, replace: true });
                      return;
                    }
                    setIsSizeDrawerOpen(false);
                  }}
                >
                  Select
                </Button>
              </div>
            </div>
          </Drawer>
        )}
        {selectedVariant && (
          <div>
            <div className="grid items-stretch gap-3 md:grid-cols-2">
              {isOutOfStock ? (
                <Button variant="secondary" disabled>
                  <Text>Sold Out</Text>
                </Button>
              ) : (
                <AddToCartButton
                  lines={[
                    {
                      merchandiseId: selectedVariant.id!,
                      quantity: 1,
                    },
                  ]}
                  variant="primary"
                  data-test="add-to-cart"
                  className="w-full"
                  onClick={() => {
                    try {
                      trackKlaviyoAddedToCart(product as any, selectedVariant as any);
                    } catch { }
                  }}
                >
                  <Text
                    as="span"
                    className="flex items-center justify-center gap-2"
                  >
                    <span>Add to Cart</span> <span>·</span>{' '}
                    <Money
                      withoutTrailingZeros
                      data={selectedVariant?.price!}
                      as="span"
                      data-test="price"
                    />
                    {isOnSale && (
                      <Money
                        withoutTrailingZeros
                        data={selectedVariant?.compareAtPrice!}
                        as="span"
                        className="opacity-50 strike"
                      />
                    )}
                  </Text>
                </AddToCartButton>
              )}
              {!isOutOfStock && selectedVariant?.id && (
                <form method="post" action={buyNowApiAction} className="w-full">
                  <input type="hidden" name="variantId" value={selectedVariant.id} />
                  <input type="hidden" name="quantity" value="1" />
                  <Button as="button" type="submit" variant="secondary" className="w-full">
                    <Text as="span" className="flex items-center justify-center">
                      Buy Now
                    </Text>
                  </Button>
                </form>
              )}
              {/* {!isOutOfStock && selectedVariant?.id && (
              <div className="mt-4">
                <span className="block mb-2 text-xs tracking-wide text-gray-600">
                  Express Checkout
                </span>
                <ShopPayButton
                  width="100%"
                  variantIds={[selectedVariant.id]}
                  storeDomain={storeDomain}
                />
              </div>
            )} */}
            </div>
          </div>
        )}

        {/* Mobile Always-Visible Sticky Bottom Action Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E1D6] shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
          <div className="flex items-center gap-2.5 max-w-lg mx-auto">
            {/* Left: Price & Size */}
            <div className="shrink-0 min-w-0">
              <div className="flex items-baseline gap-1.5">
                {selectedVariant?.price && (
                  <span className="font-bold text-[15px] text-[#463925]">
                    <Money withoutTrailingZeros data={selectedVariant.price} />
                  </span>
                )}
                {isOnSale && selectedVariant?.compareAtPrice && (
                  <span className="text-[11px] text-[#836E4C] line-through">
                    <Money withoutTrailingZeros data={selectedVariant.compareAtPrice} />
                  </span>
                )}
              </div>
              {sizeOption && (
                <button
                  type="button"
                  onClick={() => setIsSizeDrawerOpen(true)}
                  className="flex items-center gap-0.5 text-[11px] text-[#836E4C] hover:text-[#463925] mt-0.5"
                >
                  <span className="font-medium">{selectedSizeValue || 'Select Size'}</span>
                  <IconCaret direction="down" className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Right: Buttons */}
            {isOutOfStock ? (
              <div className="flex-1 flex items-center justify-center h-[38px] bg-stone-100 text-stone-400 text-[13px] font-semibold">
                Sold Out
              </div>
            ) : (
              <div className="flex items-stretch gap-2 flex-1 min-w-0">
                {selectedVariant?.id && (
                  <CartForm
                    route={usePrefixPathWithLocale('/cart')}
                    inputs={{ lines: [{ merchandiseId: selectedVariant.id, quantity: 1 }] }}
                    action={CartForm.ACTIONS.LinesAdd}
                  >
                    {(fetcher) => (
                      <button
                        type="submit"
                        disabled={fetcher.state !== 'idle'}
                        aria-label="Add to Cart"
                        title="Add to Cart"
                        className="relative group h-[40px] w-[46px] shrink-0 bg-white hover:bg-[#FAF7F2] active:bg-stone-100 border border-[#463925] text-[#463925] flex items-center justify-center transition-all duration-200 disabled:opacity-60 shadow-sm cursor-pointer"
                        onClick={() => {
                          try { trackKlaviyoAddedToCart(product as any, selectedVariant as any); } catch { }
                        }}
                      >
                        {/* Animated Tooltip on hover / focus */}
                        <span className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#2E1D14] text-white text-[11px] font-medium tracking-wide rounded pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-all duration-200 shadow-md whitespace-nowrap z-50">
                          Add to Cart
                          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-[#2E1D14]"></span>
                        </span>

                        {fetcher.state !== 'idle' ? (
                          <svg
                            className="animate-spin h-4 w-4 text-[#463925]"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <IconBag className="w-4 h-4 transition-transform duration-200 group-hover:scale-115 group-active:scale-90" />
                        )}
                      </button>
                    )}
                  </CartForm>
                )}

                {selectedVariant?.id && (
                  <form method="post" action={buyNowApiAction} className="flex-1 min-w-0">
                    <input type="hidden" name="variantId" value={selectedVariant.id} />
                    <input type="hidden" name="quantity" value="1" />
                    <button
                      type="submit"
                      className="w-full h-[40px] bg-[#2E1D14] hover:bg-[#1a100b] text-white text-[13px] font-bold tracking-wider uppercase flex items-center justify-center active:scale-[0.98] transition-all shadow-sm"
                    >
                      Buy Now
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Floating Quick ADD Bar (on scroll) */}
        {showQuickAddBar && (
          <div className="hidden md:block fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg animate-in slide-in-from-bottom duration-300">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-[#463925] truncate">
                      {product.title}
                    </div>
                    <div className="flex items-baseline gap-2">
                      {selectedVariant?.price && (
                        <span className="text-sm font-semibold text-[#463925]">
                          <Money withoutTrailingZeros data={selectedVariant.price} />
                        </span>
                      )}
                      {isOnSale && selectedVariant?.compareAtPrice && (
                        <span className="text-xs text-[#836E4C] line-through font-normal">
                          <Money withoutTrailingZeros data={selectedVariant.compareAtPrice} />
                        </span>
                      )}
                    </div>
                    {selectedColorValue && (
                      <div className="text-xs text-gray-600 truncate">
                        Colour: {selectedColorValue}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {hasQuickColors && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Color:</span>

                      {quickColorsCount >= 5 ? (
                        <button
                          type="button"
                          className="h-8 w-8 inline-flex items-center justify-center rounded border border-gray-300 text-[#463925] hover:border-[#463925]"
                          aria-label="Scroll colors left"
                          onClick={() => {
                            quickColorScrollRef.current?.scrollBy({
                              left: -180,
                              behavior: 'smooth',
                            });
                          }}
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                            <path
                              fillRule="evenodd"
                              d="M12.78 15.53a.75.75 0 0 1-1.06 0L6.69 10.5a.75.75 0 0 1 0-1.06l5.03-5.03a.75.75 0 1 1 1.06 1.06L8.28 10.5l4.5 4.47a.75.75 0 0 1 0 1.06Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      ) : null}

                      <div
                        ref={quickColorScrollRef}
                        className="flex items-center gap-2 max-w-[260px] overflow-x-auto overflow-y-visible scroll-smooth px-1 py-1"
                      >
                        {quickGroupColorItems.length > 1
                          ? quickGroupColorItems.map((p) => {
                            const isActive = p.handle === currentProductHandle;
                            const label = p.colorLabel?.value || p.title;

                            const swatchUrl =
                              p.swatchImage?.reference?.image?.url ||
                              (p.handle
                                ? productSwatchImageMap?.[String(p.handle)]
                                : undefined);

                            return (
                              <RemixLink
                                key={p.id}
                                to={`/products/${p.handle}`}
                                preventScrollReset
                                prefetch="intent"
                                replace
                                className={clsx(
                                  'flex aspect-square w-7 h-7 rounded-full border transition-all duration-200 overflow-hidden shrink-0 ring-offset-2',
                                  isActive
                                    ? 'border-[#463925] ring-2 ring-[#463925] ring-offset-1'
                                    : 'border-gray-300 hover:border-gray-400',
                                )}
                                title={label}
                                aria-label={label}
                                aria-current={isActive ? 'page' : undefined}
                              >
                                {swatchUrl ? (
                                  <img
                                    src={swatchUrl}
                                    alt={label}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-gray-100" />
                                )}
                              </RemixLink>
                            );
                          })
                          : quickVariantColorItems.map((v: any) => {
                            const name = String(v?.name || '');
                            const variantUriQuery = String(v?.variantUriQuery || '');
                            const isDifferentProduct = Boolean(v?.isDifferentProduct);
                            const handle = v?.handle ? String(v.handle) : undefined;
                            const available = v?.available !== false;
                            const isSelected =
                              Boolean(v?.selected) || name === selectedColorValue;

                            const variantSwatchRef = v?.firstSelectableVariant?.variantSwatch
                              ?.reference as any;
                            const swatchUrl =
                              variantSwatchRef?.image?.url || variantSwatchRef?.url;

                            const to = isDifferentProduct
                              ? handle
                                ? `/products/${handle}?${variantUriQuery}`
                                : `?${variantUriQuery}`
                              : `?${variantUriQuery}`;

                            return (
                              <RemixLink
                                key={name}
                                to={to}
                                preventScrollReset
                                prefetch="intent"
                                replace
                                className={clsx(
                                  'relative flex aspect-square w-7 h-7 rounded-full border transition-all duration-200 overflow-hidden shrink-0 ring-offset-2',
                                  isSelected
                                    ? 'border-[#463925] ring-2 ring-[#463925] ring-offset-1'
                                    : 'border-gray-300 hover:border-gray-400',
                                  !available && 'opacity-50 cursor-not-allowed',
                                )}
                                title={name}
                                aria-label={name}
                              >
                                {swatchUrl ? (
                                  <img
                                    src={swatchUrl}
                                    alt={name}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-gray-100" />
                                )}
                                {!available && (
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="w-full h-0.5 bg-red-500 rotate-45" />
                                  </span>
                                )}
                              </RemixLink>
                            );
                          })}
                      </div>

                      {quickColorsCount >= 5 ? (
                        <button
                          type="button"
                          className="h-8 w-8 inline-flex items-center justify-center rounded border border-gray-300 text-[#463925] hover:border-[#463925]"
                          aria-label="Scroll colors right"
                          onClick={() => {
                            quickColorScrollRef.current?.scrollBy({
                              left: 180,
                              behavior: 'smooth',
                            });
                          }}
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                            <path
                              fillRule="evenodd"
                              d="M7.22 4.47a.75.75 0 0 1 1.06 0l5.03 5.03a.75.75 0 0 1 0 1.06l-5.03 5.03a.75.75 0 1 1-1.06-1.06l4.5-4.47-4.5-4.47a.75.75 0 0 1 0-1.06Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsSizeDrawerOpen(true)}
                    className="inline-flex items-center justify-center border border-gray-300 rounded px-4 py-2 text-sm text-[#463925] hover:border-[#463925] transition-colors"
                  >
                    Size
                  </button>

                  {!isOutOfStock && selectedVariant?.id && (
                    <AddToCartButton
                      lines={[
                        {
                          merchandiseId: selectedVariant.id!,
                          quantity: 1,
                        },
                      ]}
                      variant="primary"
                      className="px-6 py-2 text-sm whitespace-nowrap"
                      onClick={() => {
                        try {
                          trackKlaviyoAddedToCart(product as any, selectedVariant as any);
                        } catch { }
                      }}
                    >
                      <Text as="span">Add to Cart</Text>
                    </AddToCartButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="w-8 h-8"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}

function ProductDetail({
  title,
  content,
  learnMore,
}: {
  title: string;
  content: string;
  learnMore?: string;
}) {
  return (
    <Disclosure key={title} as="div" className="grid w-full gap-2">
      {({ open }) => (
        <>
          <Disclosure.Button className="text-left">
            <div className="flex justify-between">
              <Text size="lead" as="h4">
                {title}
              </Text>
              <IconClose
                className={clsx(
                  'transition-transform transform-gpu duration-200',
                  !open && 'rotate-[45deg]',
                )}
              />
            </div>
          </Disclosure.Button>

          <Disclosure.Panel className={'pb-4 pt-2 grid gap-2'}>
            <div className="prose dark:prose-invert">
              <style dangerouslySetInnerHTML={{
                __html: `
                .policy-desc-text, .policy-desc-text p {
                  color: #A07F5C !important;
                }
                .policy-desc-text strong {
                  color: #8A7259 !important;
                  font-weight: 700 !important;
                }
              `}} />
              <div
                className="policy-desc-text"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
            {learnMore && (
              <div className="">
                <Link
                  className="pb-px border-b border-current hover:opacity-80 transition-opacity text-sm font-medium"
                  style={{ color: '#A07F5C' }}
                  to={learnMore}
                >
                  Learn more
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

function getLocalSizeThumbnail(sizeLabel: string | undefined): string {
  if (!sizeLabel) return defaultSizeThumbnail;

  const raw = String(sizeLabel || '').toLowerCase();

  const isRound = /\b(round|circle)\b/.test(raw);
  const isOval = /\boval\b/.test(raw);
  const isDoormat = /\bdoor\s*mat|\bdoormat\b/.test(raw);
  const isBed = /\bbed\b/.test(raw);
  const isHall = /\bhall\b|\brunner\b/.test(raw);
  const isLiving = /\bliving\b/.test(raw);

  let normalized = raw;
  normalized = normalized.replace(/×/g, 'x');
  normalized = normalized.replace(/ft|feet|foot/g, '');
  normalized = normalized.replace(/['"]/g, '');
  normalized = normalized.replace(/cm/g, '');
  normalized = normalized.replace(/\s+/g, '');
  normalized = normalized.replace(/round|circle|oval|doormat|doormat|bed|hall|runner|living/g, '');

  // Explicit mapping for known sizes
  const explicitMap: Record<string, string> = {
    "40x60doormat": sizeThumb40x60Doormat,
    "60x90doormat": sizeThumb60x90Doormat,
    "60x100doormat": sizeThumb60x100Doormat,
    "60x100oval": sizeThumb60x100Oval,
    "70x140bed": sizeThumb70x140Bed,
    "70x200bed": sizeThumb70x200Bed,
    "70x300hall": sizeThumb70x300Hall,
    "80x150bed": sizeThumb80x150Bed,
    "80x150oval": sizeThumb80x150Oval,
    "80x80round": sizeThumb80x80Round,
    "100x100round": sizeThumb100x100Round,
    "120x120round": sizeThumb120x120Round,
    "120x170living": sizeThumb120x170Living,
    "120x170oval": sizeThumb120x170Oval,
    "130x190living": sizeThumb130x190Living,
    "150x150round": sizeThumb150x150Round,
    "160x160round": sizeThumb160x160Round,
    "160x230living": sizeThumb160x230Living,
    "160x230oval": sizeThumb160x230Oval,
    "170x240living": sizeThumb170x240Living,
    "200x200round": sizeThumb200x200Round,
    "200x290living": sizeThumb200x290Living,
    "200x290oval": sizeThumb200x290Oval,
    "200x300living": sizeThumb200x300Living,
    "250x300living": sizeThumb250x300Living,
    "250x350living": sizeThumb250x350Living,
  };

  const suffix = isRound
    ? 'round'
    : isOval
      ? 'oval'
      : isDoormat
        ? 'doormat'
        : isBed
          ? 'bed'
          : isHall
            ? 'hall'
            : isLiving
              ? 'living'
              : '';

  const keyWithSuffix = suffix ? `${normalized}${suffix}` : normalized;

  if (explicitMap[keyWithSuffix]) {
    return explicitMap[keyWithSuffix];
  }

  if (suffix && explicitMap[normalized]) {
    return explicitMap[normalized];
  }

  // If the size exactly matches a known local asset for a common type, prefer it
  // even when the label doesn't explicitly include that keyword.
  // (Keep oval/round conditional to avoid showing those shapes incorrectly.)
  const directTypeKeys = [
    `${normalized}living`,
    `${normalized}bed`,
    `${normalized}hall`,
    `${normalized}doormat`,
  ];
  for (const k of directTypeKeys) {
    if (explicitMap[k]) return explicitMap[k];
  }

  const fallbackKeys = [
    `${normalized}living`,
    `${normalized}bed`,
    ...(isHall ? [`${normalized}hall`] : []),
    ...(isDoormat ? [`${normalized}doormat`] : []),
    ...(isOval ? [`${normalized}oval`] : []),
    ...(isRound ? [`${normalized}round`] : []),
  ];

  for (const k of fallbackKeys) {
    if (explicitMap[k]) return explicitMap[k];
  }

  // Dimension-based fallback for narrow runner/bed sizes where we don't have
  // an exact local asset for the specific length.
  const dimMatch = normalized.match(/^(\d+)x(\d+)$/);
  if (dimMatch) {
    const a = Number(dimMatch[1]);
    const b = Number(dimMatch[2]);
    if (Number.isFinite(a) && Number.isFinite(b)) {
      const minDim = Math.min(a, b);
      const maxDim = Math.max(a, b);

      if (minDim === 240 && maxDim === 340) {
        return sizeThumb250x350Living;
      }

      // Use the same thumbnail for 70x200, 70x250 etc.
      if (minDim === 70 && maxDim >= 200 && maxDim < 300) {
        return sizeThumb70x200Bed;
      }
      if (minDim === 70 && maxDim >= 300) {
        return sizeThumb70x300Hall;
      }
    }
  }

  // Final fallback: avoid showing a round thumbnail for non-round sizes.
  if (isRound) return defaultSizeThumbnail;
  if (isOval) return sizeThumb160x230Oval;
  if (isHall) return sizeThumb70x300Hall;
  if (isDoormat) return sizeThumb60x90Doormat;
  if (isBed) return sizeThumb70x140Bed;
  return sizeThumb200x300Living;
}

function buildSizeImageMap(product: ProductFragment): Record<string, Record<string, string>> {
  const map: Record<string, Record<string, string>> = {};

  const options = (product as any)?.options || [];
  options.forEach((opt: any) => {
    const optionName = opt?.name as string | undefined;
    if (!optionName) return;

    const values = opt?.optionValues || [];
    values.forEach((ov: any) => {
      const valueName = ov?.name as string | undefined;
      if (!valueName) return;

      // Always use a local room-layout thumbnail based on the size label.
      const localThumbnail = getLocalSizeThumbnail(valueName);

      if (!map[optionName]) map[optionName] = {};
      map[optionName][valueName] = localThumbnail;
    });
  });

  return map;
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    variantSwatch: metafield(namespace: "custom", key: "variant_swatch") {
      reference {
        ... on MediaImage {
          image {
            url
            altText
          }
        }
        ... on GenericFile {
          url
        }
      }
    }
    metafield(namespace: "custom", key: "variant_images") {
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            image {
              url
              altText
              width
              height
            }
          }
          ... on GenericFile {
            id
            url
          }
        }
      }
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    group: metafield(namespace: "custom", key: "group") {
      value
    }
    colorLabel: metafield(namespace: "custom", key: "color_label") {
      value
    }
    colorFamilyKey: metafield(namespace: "custom", key: "color_family_key") {
      value
    }
    swatchImage: metafield(namespace: "custom", key: "swatch_color") {
      reference {
        ... on MediaImage {
          image {
            url
            altText
          }
        }
      }
    }
    sustainabilityPartnerLogo: metafield(namespace: "custom", key: "sustainability_partner_logo") {
      reference {
        ... on MediaImage {
          image {
            url
            altText
          }
        }
      }
    }
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            __typename
            previewImage {
              url
            }
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    variants(first: 100) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
    tags
    media(first: 20) {
      nodes {
        ...Media
      }
    }
    collections(first: 1) {
      nodes {
        title
        handle
      }
    }
    metafields(identifiers: [
      {namespace: "custom", key: "specifications"},
      {namespace: "custom", key: "washing_instructions"},
      {namespace: "custom", key: "extra_description"},
      {namespace: "custom", key: "price_note"},
      {namespace: "custom", key: "sustainability"},
      {namespace: "custom", key: "sustainability_partner_logo"},
      {namespace: "specs", key: "size"},
      {namespace: "specs", key: "thickness"},
      {namespace: "specs", key: "weight"},
      {namespace: "specs", key: "material"},
      {namespace: "specs", key: "backing"},
      {namespace: "specs", key: "edge"},
      {namespace: "care", key: "washing_instructions"}
    ]) {
      id
      namespace
      key
      value
      type
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;



const PRODUCT_SWATCH_BY_HANDLES_QUERY = `#graphql
  query ProductSwatchByHandles(
    $query: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query) {
      nodes {
        handle
        swatchImage: metafield(namespace: "custom", key: "swatch_color") {
          reference {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
    shop {
      name
      primaryDomain {
        url
      }
      globalSustainability: metafield(namespace: "custom", key: "sustainability") {
        value
      }
      globalSustainabilityPartnerLogo: metafield(namespace: "custom", key: "sustainability_partner_logo") {
        reference {
          ... on MediaImage {
            image {
              url
              altText
            }
          }
        }
      }
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
    metaobjects(type: "size_guide", first: 10) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              id
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
    colorSwatches: metaobjects(type: "shopify--color-pattern", first: 50) {
      nodes {
        id
        handle
        fields {
          key
          value
          type
          reference {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
  ${MEDIA_FRAGMENT}
  ${PRODUCT_FRAGMENT}
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query RecommendedProducts(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const INSPIRED_PRODUCTS_QUERY = `#graphql
  query InspiredProducts(
    $query: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          collections(first: 10) {
            edges {
              node {
                id
                title
                handle
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
` as const;

const TOP_COLLECTIONS_QUERY = `#graphql
  query TopCollections(
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, sortKey: UPDATED_AT) {
      edges {
        node {
          id
          title
          handle
          image {
            url
            altText
          }
        }
      }
    }
  }
` as const;

async function getInspiredCollections(
  storefront: Storefront,
  productTags: string[],
  currentProductId: string,
) {
  try {
    // console.log('🏷️ Product tags:', productTags);

    // If we have tags, search for products with matching tags and extract their collections
    if (productTags && productTags.length > 0) {
      const tagQuery = productTags
        .filter(Boolean)
        .map((tag) => `tag:"${String(tag).replace(/"/g, '\\"')}"`)
        .join(' OR ');
      // console.log('🔍 Tag query:', tagQuery);

      const products = await storefront.query(INSPIRED_PRODUCTS_QUERY, {
        variables: { query: tagQuery, first: 50 },
      });

      // console.log('📦 Products response:', products);

      if (products?.products?.edges?.length > 0) {
        // console.log('📊 PageInfo:', products.products.pageInfo);

        // Extract all collections from all products and deduplicate
        const collectionsMap = new Map();

        products.products.edges
          .filter((edge: any) => edge.node.id !== currentProductId)
          .forEach((edge: any) => {
            // console.log(`📦 Product "${edge.node.title}" collections:`, edge.node.collections.edges.map((c: any) => c.node.title));

            edge.node.collections.edges.forEach((collectionEdge: any) => {
              const collection = collectionEdge.node;
              if (!collectionsMap.has(collection.id)) {
                collectionsMap.set(collection.id, {
                  id: collection.id,
                  title: collection.title,
                  handle: collection.handle,
                  image: collection.image ? {
                    url: collection.image.url,
                    altText: collection.image.altText || collection.title
                  } : undefined
                });
              }
            });
          });

        const result = Array.from(collectionsMap.values()).slice(0, 10);
        if (result.length > 0) {
          // console.log('✅ Tag-based collections found (top 10):', result);
          return result;
        }
        // console.log('⚠️ Tag-based products found but no collections; falling back to top collections.');
      }
    }

    // console.log('⚠️ No product tags or no tag-based collections found, using top collections');

    // Fallback to top collections if no tags or no tag-based collections found
    const collections = await storefront.query(TOP_COLLECTIONS_QUERY, {
      variables: { first: 10 },
    });

    // console.log('📦 Top collections response:', collections);

    const result = collections?.collections?.edges?.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      image: edge.node.image ? {
        url: edge.node.image.url,
        altText: edge.node.image.altText || edge.node.title
      } : undefined
    })) || [];

    // console.log('✅ Final collections result (top 10):', result);
    return result;

  } catch (error) {
    console.error('❌ Error fetching inspired collections:', error);
    return [];
  }
}

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  try {
    const products = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
      variables: { productId, count: 12 },
    });

    if (!products) {
      console.warn('No data returned from Shopify API for recommended products');
      return { nodes: [] };
    }

    const mergedProducts = (products.recommended ?? [])
      .concat(products.additional?.nodes ?? [])
      .filter(
        (value: any, index: number, array: any[]) =>
          array.findIndex((value2: any) => value2.id === value.id) === index,
      );

    const originalProduct = mergedProducts.findIndex(
      (item: any) => item.id === productId,
    );

    if (originalProduct > -1) {
      mergedProducts.splice(originalProduct, 1);
    }

    return { nodes: mergedProducts };
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    return { nodes: [] };
  }
}
