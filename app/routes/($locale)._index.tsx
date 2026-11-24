import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await, useLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';

import {Hero} from '~/components/Hero';
import {ModernHero} from '~/components/ModernHero';
import {FeaturedCollections} from '~/components/FeaturedCollections';
import {LifestyleCollections} from '~/components/LifestyleCollections';
import {BestSellingProducts} from '~/components/BestSellingProducts';
import {ShopByNeed} from '~/components/ShopByNeed';
  import {CustomerTestimonials} from '~/components/CustomerTestimonials';
  import {RugFinder} from '~/components/RugFinder';
  import {JudgeMeCarousel} from '~/components/JudgeMeCarousel';
  import {JudgeMeTestimonials} from '~/components/JudgeMeTestimonials';
  import {JudgeMeFiveUpCarousel} from '~/components/JudgeMeFiveUpCarousel';
  import {ProductSwimlane} from '~/components/ProductSwimlane';
  import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
  import {getHeroPlaceholder} from '~/lib/placeholders';
  import {seoPayload} from '~/lib/seo.server';
  import {routeHeaders} from '~/data/cache';
  import {shuffleArray} from '~/lib/shuffle';
import {getHeroMetaobject, getShopBySizeMetaobjects, getShopByFabricMetaobjects, getShopByColorMetaobjects, getShopByCollaboratorMetaobjects} from '~/lib/metafields';

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const [{shop, hero}, heroMetafields, shopBySizeData, shopByFabricData, shopByColorData, shopByCollaboratorData] = await Promise.all([
    context.storefront.query(HOMEPAGE_SEO_QUERY, {
      variables: {handle: 'freestyle'},
    }),
    getHeroMetaobject(context.storefront, 'every-rug-tells-a-story'),
    getShopBySizeMetaobjects(context.storefront, 10),
    getShopByFabricMetaobjects(context.storefront, 10),
    getShopByColorMetaobjects(context.storefront, 10),
    getShopByCollaboratorMetaobjects(context.storefront, 10),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    shop,
    primaryHero: hero,
    heroMetafields,
    shopBySizeData,
    shopByFabricData,
    shopByColorData,
    shopByCollaboratorData,
    seo: seoPayload.home({url: request.url}),
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
  function loadDeferredData({context}: LoaderFunctionArgs) {
    const {language, country} = context.storefront.i18n;
    const storeDomain = (context.env as any)?.PUBLIC_STORE_DOMAIN;

  const featuredProducts = context.storefront
    .query(HOMEPAGE_FEATURED_PRODUCTS_QUERY, {
      variables: {
        country,
        language,
      },
      cache: context.storefront.CacheNone(),
    })
    .then((response: any) => {
      if (!response?.products?.nodes) return response;
      const nodes = shuffleArray(response.products.nodes);
      return {
        ...response,
        products: {
          ...response.products,
          nodes: nodes.slice(0, 10),
        },
      };
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      // eslint-disable-next-line no-console
      console.error(error);
      return null;
    });

  const secondaryHero = context.storefront
    .query(COLLECTION_HERO_QUERY, {
      variables: {
        handle: 'backcountry',
        country,
        language,
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      // eslint-disable-next-line no-console
      console.error(error);
      return null;
    });

  const featuredCollections = context.storefront
    .query(FEATURED_COLLECTIONS_QUERY, {
      variables: {
        country,
        language,
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      // eslint-disable-next-line no-console
      console.error(error);
      return null;
    });

  const lifestyleCollections = context.storefront
    .query(HOMEPAGE_LIFESTYLE_COLLECTIONS_QUERY, {
      variables: {
        country,
        language,
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      // eslint-disable-next-line no-console
      console.error(error);
      return null;
    });

  const tertiaryHero = context.storefront
    .query(COLLECTION_HERO_QUERY, {
      variables: {
        handle: 'winter-2022',
        country,
        language,
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      // eslint-disable-next-line no-console
      console.error(error);
      return null;
    });

  const rugFinder = context.storefront
    .query(RUG_FINDER_QUERY, {
      variables: {
        handle: {type: 'rug_finder_section', handle: 'not-sure'},
        country,
        language,
      },
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      return null;
    });

  const testimonials = context.storefront
    .query(TESTIMONIALS_QUERY, {
      variables: {first: 6, country, language},
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      return null;
    });

  // Fetch Judge.me Featured Carousel HTML (server-side)
  const judgeMeFeaturedCarousel = (async () => {
    try {
      const {JUDGEME_BASE_URL, PUBLIC_STORE_DOMAIN, JUDGEME_PRIVATE_API_TOKEN, JUDGEME_SHOP_DOMAIN} = context.env as any;
      const shopDomain = (JUDGEME_SHOP_DOMAIN || PUBLIC_STORE_DOMAIN) as string | undefined;
      if (!shopDomain || !JUDGEME_PRIVATE_API_TOKEN) {
        return null;
      }
      const base = (JUDGEME_BASE_URL || 'https://api.judge.me/api/v1').replace(/\/$/, '');
      const url = `${base}/widgets/featured_carousel?shop_domain=${encodeURIComponent(
        shopDomain,
      )}&api_token=${encodeURIComponent(JUDGEME_PRIVATE_API_TOKEN)}`;
      // temp: debug which domain we're requesting
      // eslint-disable-next-line no-console
      //console.log('[jdgm] featured_carousel shop_domain =', shopDomain);
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json, text/html',
        },
        method: 'GET',
      });
      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.error('[jdgm] featured_carousel fetch failed', res.status);
        return null;
      }
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = (await res.json()) as {featured_carousel?: string} | null;
        const html = data?.featured_carousel ?? '';
        // eslint-disable-next-line no-console
        if (html) console.log('[jdgm] featured_carousel html length', html.length);
        return html || null;
      } else {
        const text = await res.text();
        try {
          const maybeJson = JSON.parse(text) as {featured_carousel?: string} | null;
          const html = maybeJson?.featured_carousel ?? '';
          // eslint-disable-next-line no-console
          if (html) console.log('[jdgm] featured_carousel html length', html.length);
          return html || null;
        } catch {
          // eslint-disable-next-line no-console
          if (text) console.log('[jdgm] featured_carousel text length', text.length);
          return text || null;
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return null;
    }
  })();

  // Fetch latest site-wide Judge.me reviews (server-side) to power a custom testimonials grid
  const judgeMeLatestReviews = (async () => {
    try {
      const {
        JUDGEME_BASE_URL,
        PUBLIC_STORE_DOMAIN,
        JUDGEME_PRIVATE_API_TOKEN,
        JUDGEME_SHOP_DOMAIN,
        DISABLE_EXTERNAL_FETCH,
      } = context.env as any;
      const disable = String(DISABLE_EXTERNAL_FETCH || '').toLowerCase();
      if (disable === '1' || disable === 'true') return [] as any[];
      const shopDomain = (JUDGEME_SHOP_DOMAIN || PUBLIC_STORE_DOMAIN) as string | undefined;
      if (!shopDomain || !JUDGEME_PRIVATE_API_TOKEN) return null;
      const base = String(JUDGEME_BASE_URL || 'https://api.judge.me/api/v1').replace(/\/$/, '');
      const url = new URL(`${base}/reviews`);
      url.searchParams.set('shop_domain', shopDomain);
      url.searchParams.set('api_token', JUDGEME_PRIVATE_API_TOKEN as string);
      url.searchParams.set('platform', 'shopify');
      url.searchParams.set('per_page', '6');
      url.searchParams.set('page', '1');
      url.searchParams.set('published', '1');
      const res = await fetch(url.toString(), {headers: {Accept: 'application/json'}});
      if (!res.ok) return null;
      const data = (await res.json().catch(() => null)) as {reviews?: any[]} | null;
      return Array.isArray(data?.reviews) ? data!.reviews : [];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return null;
    }
  })();

  return {
    featuredProducts,
    secondaryHero,
    featuredCollections,
    lifestyleCollections,
    tertiaryHero,
    rugFinder,
    testimonials,
    judgeMeFeaturedCarousel,
    judgeMeLatestReviews,
    storeDomain,
  };
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  const seoEntries = (matches || [])
    .map((m) => (m.data as any)?.seo)
    .filter(Boolean) as any[];
  if (seoEntries.length > 0) return getSeoMeta(...seoEntries);
  return [
    {title: 'Haniesta - Premium Rugs & Home Decor'},
    {
      name: 'description',
      content: 'Discover our collection of premium rugs and home decor items.',
    },
  ];
};

export default function Homepage() {
  const {
    primaryHero,
    secondaryHero,
    tertiaryHero,
    featuredCollections,
    lifestyleCollections,
    featuredProducts,
    heroMetafields,
    shopBySizeData,
    shopByFabricData,
    shopByColorData,
    shopByCollaboratorData,
    rugFinder,
    testimonials,
    judgeMeFeaturedCarousel,
    judgeMeLatestReviews,
    storeDomain,
  } = useLoaderData<typeof loader>();

  // TODO: skeletons vs placeholders
  const skeletons = getHeroPlaceholder([{}, {}, {}]);
  //console.log('heroMetafields', heroMetafields);
  return (
    <>
      {/* Modern Hero Section */}
      {(() => {
        const resolvedHero = (heroMetafields ?? primaryHero) as any;
        return resolvedHero ? (
          <ModernHero heroData={resolvedHero} height="full" top loading="eager" />
        ) : null;
      })()}

      {/* Shop By Need Section */}
      <ShopByNeed shopBySizeData={shopBySizeData} shopByFabricData={shopByFabricData} shopByColorData={shopByColorData} shopByCollaboratorData={shopByCollaboratorData}/>

      {/* Best Selling Products Section */}
      {featuredProducts && (
        <Suspense>
          <Await resolve={featuredProducts}>
            {(response) => {
              if (
                !response ||
                !response?.products ||
                !response?.products?.nodes
              ) {
                return <></>;
              }
              return (
                <BestSellingProducts
                  products={response.products}
                  colorSwatches={(response as any).colorSwatches}
                  storeDomain={storeDomain as any}
                  title="Shop the Best Selling Products"
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {/* Lifestyle Collections Section */}
      {lifestyleCollections && (
        <Suspense>
          <Await resolve={lifestyleCollections}>
            {(response) => {
              if (
                !response ||
                (!response?.featured &&
                  !response?.lifestyle &&
                  !response?.ecoFriendly &&
                  !response?.sustainability)
              ) {
                return <></>;
              }

              const nodes = [
                response.featured,
                response.lifestyle,
                response.ecoFriendly,
                response.sustainability,
              ].filter(Boolean);

              return (
                <LifestyleCollections
                  collections={{nodes} as any}
                  title="Featured Collections"
                />
              );
            }}
          </Await>
        </Suspense>
      )}


      {/* Customer Testimonials Section: Prefer custom 5-up API carousel (3 + 2); then widget HTML; then metaobject */}
      {judgeMeLatestReviews ? (
        <Suspense>
          <Await resolve={judgeMeLatestReviews}>
            {(reviews: any[] | null) => {
              if (Array.isArray(reviews) && reviews.length > 0) {
                // Try to fetch widget HTML only for summary numbers; render even if it's not ready
                return judgeMeFeaturedCarousel ? (
                  <Suspense>
                    <Await resolve={judgeMeFeaturedCarousel}>
                      {(jdgmHtml: string | null) => (
                        <JudgeMeFiveUpCarousel reviews={reviews} summaryHtml={jdgmHtml || undefined} />
                      )}
                    </Await>
                  </Suspense>
                ) : (
                  <JudgeMeFiveUpCarousel reviews={reviews} />
                );
              }
              // No reviews via API; fallback to widget HTML if available
              return judgeMeFeaturedCarousel ? (
                <Suspense>
                  <Await resolve={judgeMeFeaturedCarousel}>
                    {(jdgmHtml: string | null) => {
                      const html = jdgmHtml ?? '';
                      return html ? <JudgeMeCarousel html={html} /> : null;
                    }}
                  </Await>
                </Suspense>
              ) : testimonials ? (
                <Suspense>
                  <Await resolve={testimonials}>
                    {(response) => {
                      const nodes = response?.metaobjects?.nodes ?? [];
                      return <CustomerTestimonials nodes={nodes} />;
                    }}
                  </Await>
                </Suspense>
              ) : null;
            }}
          </Await>
        </Suspense>
      ) : judgeMeFeaturedCarousel ? (
        <Suspense>
          <Await resolve={judgeMeFeaturedCarousel}>
            {(jdgmHtml: string | null) => {
              const html = jdgmHtml ?? '';
              return html ? <JudgeMeCarousel html={html} /> : null;
            }}
          </Await>
        </Suspense>
      ) : testimonials ? (
        <Suspense>
          <Await resolve={testimonials}>
            {(response) => {
              const nodes = response?.metaobjects?.nodes ?? [];
              return <CustomerTestimonials nodes={nodes} />;
            }}
          </Await>
        </Suspense>
      ) : null}

      {/* Rug Finder CTA Section (Metaobject-driven) */}
      {rugFinder && (
        <Suspense>
          <Await resolve={rugFinder}>
            {(response) => {
              if (!response || !response?.metaobject) return <></>;
              return <RugFinder data={response} />;
            }}
          </Await>
        </Suspense>
      )}

      {/* Secondary Hero (if available) */}
      {secondaryHero && (
        <Suspense fallback={<Hero {...skeletons[1]} />}>
          <Await resolve={secondaryHero}>
            {(response) => {
              if (!response || !response?.hero) {
                return <></>;
              }
              return <Hero {...response.hero} />;
            }}
          </Await>
        </Suspense>
      )}
    </>
  );
}

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
  }
  ${MEDIA_FRAGMENT}
` as const;

const HOMEPAGE_SEO_QUERY = `#graphql
  query seoCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
    shop {
      name
      description
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
` as const;

const COLLECTION_HERO_QUERY = `#graphql
  query heroCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
` as const;

// @see: https://shopify.dev/api/storefront/current/queries/products
export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 24, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
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
  ${PRODUCT_CARD_FRAGMENT}
` as const;

// @see: https://shopify.dev/api/storefront/current/queries/collections
export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(
      first: 50,
      sortKey: UPDATED_AT,
      reverse: true
    ) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
` as const;

export const HOMEPAGE_LIFESTYLE_COLLECTIONS_QUERY = `#graphql
  query homepageLifestyleCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    featured: collection(handle: "shopify-products-collections") {
      id
      title
      handle
      image {
        altText
        width
        height
        url
      }
    }
    lifestyle: collection(handle: "lifestyle") {
      id
      title
      handle
      image {
        altText
        width
        height
        url
      }
    }
    ecoFriendly: collection(handle: "eco-friendly") {
      id
      title
      handle
      image {
        altText
        width
        height
        url
      }
    }
    sustainability: collection(handle: "sustainability") {
      id
      title
      handle
      image {
        altText
        width
        height
        url
      }
    }
  }
` as const;


export const RUG_FINDER_QUERY = `#graphql
  query rugFinderSection($handle: MetaobjectHandleInput!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobject(handle: $handle) {
      id
      handle
      type
      heading: field(key: "heading") { value }
      subHeading: field(key: "sub_heading") { value }
      buttonText: field(key: "button_text") { value }
      link: field(key: "link") { value }
      image: field(key: "image") {
        reference {
          __typename
          ... on MediaImage {
            image { url altText width height }
          }
        }
      }
    }
  }
` as const;

export const TESTIMONIALS_QUERY = `#graphql
  query Testimonials($first: Int = 12, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "testimonials", first: $first, sortKey: "updated_at", reverse: true) {
      nodes {
        id
        handle
        title: field(key: "title") { value }
        quote: field(key: "quote") { value }
        authorName: field(key: "author_name") { value }
        role: field(key: "role") { value }
        rating: field(key: "rating") { value }
        featured: field(key: "featured") { value }
        avatar: field(key: "avatar") {
          reference {
            __typename
            ... on MediaImage {
              image { url altText width height }
            }
          }
        }
      }
    }
  }
` as const;

