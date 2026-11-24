import {type SeoConfig} from '@shopify/hydrogen';
import type {SearchAction} from 'schema-dts';
import type {
  Article,
  Blog,
  Collection,
  Page,
  Product,
  ProductVariant,
  ShopPolicy,
  Image,
} from '@shopify/hydrogen/storefront-api-types';
import type {
  Article as SeoArticle,
  AggregateRating,
  BreadcrumbList,
  Blog as SeoBlog,
  CollectionPage,
  Offer,
  Organization,
  Product as SeoProduct,
  Review,
  WebPage,
  WithContext,
} from 'schema-dts';

import type {ShopFragment} from 'storefrontapi.generated';
import {FAQ_SECTIONS} from '~/data/faq';
import {getAllFaqItems} from '~/lib/faq';
import type {ProductReviewsSchemaData} from '~/lib/judgeme-product-reviews.server';

function root({
  shop,
  url,
}: {
  shop: ShopFragment;
  url: Request['url'];
}): SeoConfig {
  const origin = new URL(url).origin;

  return {
    title: shop?.name,
    titleTemplate: '%s',
    description: truncate(shop?.description ?? ''),
    handle: '@shopify',
    url,

    media: {
      type: 'image',
      url: 'https://cdn.shopify.com/s/files/1/0662/0050/2374/files/Haniesta_Logo_1886379f-bd90-43fe-bcc7-689063cdc669_450x.png?v=1771266312',
    },

    robots: {
      noIndex: false,
      noFollow: false,
    },

    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: shop.name,
      logo: shop.brand?.logo?.image?.url,
      sameAs: [
        'https://x.com/Haniestarugs',
        'https://www.facebook.com/profile.php?id=61587752201407',
        'https://www.instagram.com/haniestarugs/',
      ],
      url: origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/search?q={search_term}`,
        'query': 'required name=search_term',
      } as SearchAction,
    },
  };
}

function home({url}: {url: Request['url']}): SeoConfig {
  return {
    title: 'Buy Handmade Rugs Online | Luxury & Modern Rugs',
    titleTemplate: '%s',
    description:
      'Shop handmade rugs, luxury carpet rugs, and handcrafted area rugs online. Discover modern, large, and cream rugs perfect for elevating your home décor.',
    url,

    media: {
      type: 'image',
      url: 'https://cdn.shopify.com/s/files/1/0662/0050/2374/files/Haniesta_Logo_1886379f-bd90-43fe-bcc7-689063cdc669_450x.png',
    },

    robots: {
      noIndex: false,
      noFollow: false,
    },

    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Home page',
    },
  };
}

type SelectedVariantRequiredFields = Pick<ProductVariant, 'sku'> & {
  image?: null | Partial<Image>;
};

type ProductRequiredFields = Pick<
  Product,
  'title' | 'description' | 'vendor' | 'seo'
> & {
  variants: Array<
    Pick<
      ProductVariant,
      'sku' | 'price' | 'selectedOptions' | 'availableForSale'
    >
  >;
};

type ProductSchema = Extract<SeoProduct, {'@type': 'Product'}>;

function productJsonLd({
  product,
  selectedVariant,
  url,
  reviews,
}: {
  product: ProductRequiredFields;
  selectedVariant: SelectedVariantRequiredFields;
  url: Request['url'];
  reviews?: ProductReviewsSchemaData | null;
}): SeoConfig['jsonLd'] {
  const origin = new URL(url).origin;
  const variants = product.variants;
  const description = truncate(
    product?.seo?.description ?? product?.description,
  );
  const offers: Offer[] = (variants || []).map((variant) => {
    const variantUrl = new URL(url);
    for (const option of variant.selectedOptions) {
      variantUrl.searchParams.set(option.name, option.value);
    }
    const availability = variant.availableForSale
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

    return {
      '@type': 'Offer',
      availability,
      price: parseFloat(variant.price.amount),
      priceCurrency: variant.price.currencyCode,
      sku: variant?.sku ?? '',
      url: variantUrl.toString(),
    };
  });

  const productNode: WithContext<ProductSchema> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': url,
    brand: {
      '@type': 'Brand',
      name: product.vendor,
    },
    description,
    image: [selectedVariant?.image?.url ?? ''].filter(Boolean),
    name: product.title,
    offers,
    sku: selectedVariant?.sku ?? '',
    url,
  };

  if (reviews && reviews.reviewCount > 0) {
    const aggregateRating: AggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: reviews.averageRating,
      reviewCount: reviews.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
    productNode.aggregateRating = aggregateRating;

    if (reviews.reviews.length > 0) {
      const itemReviewed: ProductSchema = {
        '@type': 'Product',
        '@id': url,
        name: product.title,
        ...(selectedVariant?.image?.url
          ? {image: selectedVariant.image.url}
          : {}),
        ...(selectedVariant?.sku ? {sku: selectedVariant.sku} : {}),
      };

      productNode.review = reviews.reviews.map(
        (rev): Review => ({
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
        }),
      );
    }
  }

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Products',
          item: `${origin}/products`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: product.title,
        },
      ],
    },
    productNode,
  ];
}

function product({
  product,
  url,
  selectedVariant,
  reviews,
}: {
  product: ProductRequiredFields;
  selectedVariant: SelectedVariantRequiredFields;
  url: Request['url'];
  reviews?: ProductReviewsSchemaData | null;
}): SeoConfig {
  const description = truncate(
    product?.seo?.description ?? product?.description ?? '',
  );
  return {
    title: product?.seo?.title ?? product?.title,
    description,
    url,
    media: selectedVariant?.image,
    jsonLd: productJsonLd({product, selectedVariant, url, reviews}),
  };
}

type CollectionRequiredFields = Omit<
  Collection,
  'products' | 'descriptionHtml' | 'metafields' | 'image' | 'updatedAt'
> & {
  products: {nodes: Pick<Product, 'handle'>[]};
  image?: null | Pick<Image, 'url' | 'height' | 'width' | 'altText'>;
  descriptionHtml?: null | Collection['descriptionHtml'];
  updatedAt?: null | Collection['updatedAt'];
  metafields?: null | Collection['metafields'];
};

function collectionJsonLd({
  url,
  collection,
}: {
  url: Request['url'];
  collection: CollectionRequiredFields;
}): SeoConfig['jsonLd'] {
  const siteUrl = new URL(url);
  const itemListElement: CollectionPage['mainEntity'] =
    collection.products.nodes.map((product, index) => {
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: `/products/${product.handle}`,
      };
    });

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Collections',
          item: `${siteUrl.host}/collections`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: collection.title,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: collection?.seo?.title ?? collection?.title ?? '',
      description: truncate(
        collection?.seo?.description ?? collection?.description ?? '',
      ),
      image: collection?.image?.url,
      url: `/collections/${collection.handle}`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement,
      },
    },
  ];
}

function collection({
  collection,
  url,
}: {
  collection: CollectionRequiredFields;
  url: Request['url'];
}): SeoConfig {
  return {
    title: collection?.seo?.title,
    description: truncate(
      collection?.seo?.description ?? collection?.description ?? '',
    ),
    titleTemplate: '%s | Collection',
    url,
    media: {
      type: 'image',
      url: collection?.image?.url,
      height: collection?.image?.height,
      width: collection?.image?.width,
      altText: collection?.image?.altText,
    },
    jsonLd: collectionJsonLd({collection, url}),
  };
}

type CollectionListRequiredFields = {
  nodes: Omit<CollectionRequiredFields, 'products'>[];
};

function collectionsJsonLd({
  url,
  collections,
}: {
  url: Request['url'];
  collections: CollectionListRequiredFields;
}): SeoConfig['jsonLd'] {
  const itemListElement: CollectionPage['mainEntity'] = collections.nodes.map(
    (collection, index) => {
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: `/collections/${collection.handle}`,
      };
    },
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Collections',
    description: 'All collections',
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement,
    },
  };
}

function listCollections({
  collections,
  url,
}: {
  collections: CollectionListRequiredFields;
  url: Request['url'];
}): SeoConfig {
  return {
    title: 'Collections',
    titleTemplate: '%s | Collections',
    description: 'All haniesta collections',
    url,
    jsonLd: collectionsJsonLd({collections, url}),
  };
}

function article({
  article,
  url,
}: {
  article: Pick<
    Article,
    'title' | 'contentHtml' | 'seo' | 'publishedAt' | 'excerpt'
  > & {
    image?: null | Pick<
      NonNullable<Article['image']>,
      'url' | 'height' | 'width' | 'altText'
    >;
  };
  url: Request['url'];
}): SeoConfig {
  return {
    title: article?.seo?.title ?? article?.title,
    description: truncate(article?.seo?.description ?? ''),
    titleTemplate: '%s | Journal',
    url,
    media: {
      type: 'image',
      url: article?.image?.url,
      height: article?.image?.height,
      width: article?.image?.width,
      altText: article?.image?.altText,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      alternativeHeadline: article.title,
      articleBody: article.contentHtml,
      datePublished: article?.publishedAt,
      description: truncate(
        article?.seo?.description || article?.excerpt || '',
      ),
      headline: article?.seo?.title || '',
      image: article?.image?.url,
      url,
    },
  };
}

function blog({
  blog,
  url,
}: {
  blog: Pick<Blog, 'seo' | 'title'>;
  url: Request['url'];
}): SeoConfig {
  return {
    title: blog?.seo?.title,
    description: truncate(blog?.seo?.description || ''),
    titleTemplate: '%s | Blog',
    url,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: blog?.seo?.title || blog?.title || '',
      description: blog?.seo?.description || '',
      url,
    },
  };
}

function faq({url}: {url: Request['url']}): SeoConfig {
  const mainEntity = getAllFaqItems(FAQ_SECTIONS).map((item) => ({
    '@type': 'Question' as const,
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer' as const,
      text: item.answer,
    },
  }));

  return {
    title: 'FAQ',
    description:
      'Frequently asked questions about Haniesta handmade rugs, materials, shipping, care, returns, and customer support.',
    titleTemplate: '%s',
    url,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      name: 'Frequently Asked Questions',
      description:
        'Answers to common questions about Haniesta handmade rugs, shipping, care, and returns.',
      url,
      mainEntity,
    },
  };
}

function page({
  page,
  url,
}: {
  page: Pick<Page, 'title' | 'seo'>;
  url: Request['url'];
}): SeoConfig {
  return {
    description: truncate(page?.seo?.description || ''),
    title: page?.seo?.title ?? page?.title,
    titleTemplate: '%s | Page',
    url,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
    },
  };
}

function policy({
  policy,
  url,
}: {
  policy: Pick<ShopPolicy, 'title' | 'body'>;
  url: Request['url'];
}): SeoConfig {
  return {
    description: truncate(policy?.body ?? ''),
    title: policy?.title,
    titleTemplate: '%s | Policy',
    url,
  };
}

function policies({
  policies,
  url,
}: {
  policies: Array<Pick<ShopPolicy, 'title' | 'handle'>>;
  url: Request['url'];
}): SeoConfig {
  const origin = new URL(url).origin;
  const itemListElement: BreadcrumbList['itemListElement'] = policies
    .filter(Boolean)
    .map((policy, index) => {
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: policy.title,
        item: `${origin}/policies/${policy.handle}`,
      };
    });
  return {
    title: 'Policies',
    titleTemplate: '%s | Policies',
    description: 'Hydrogen store policies',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        description: 'Hydrogen store policies',
        name: 'Policies',
        url,
      },
    ],
  };
}

export const seoPayload = {
  article,
  blog,
  collection,
  faq,
  home,
  listCollections,
  page,
  policies,
  policy,
  product,
  root,
};

/**
 * Truncate a string to a given length, adding an ellipsis if it was truncated
 * @param str - The string to truncate
 * @param num - The maximum length of the string
 * @returns The truncated string
 * @example
 * ```js
 * truncate('Hello world', 5) // 'Hello...'
 * ```
 */
function truncate(str: string, num = 155): string {
  if (typeof str !== 'string') return '';
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num - 3) + '...';
}