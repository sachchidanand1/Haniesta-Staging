export const MEDIA_FRAGMENT = `#graphql
  fragment Media on Media {
    __typename
    mediaContentType
    alt
    previewImage {
      url
    }
    ... on MediaImage {
      id
      image {
        id
        url
        altText
        width
        height
      }
    }
    ... on Video {
      id
      sources {
        mimeType
        url
      }
    }
    ... on Model3d {
      id
      sources {
        mimeType
        url
      }
    }
    ... on ExternalVideo {
      id
      embedUrl
      host
    }
  }
`;

export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    title
    publishedAt
    handle
    vendor
    tags
    collections(first: 10) {
      nodes {
        id
        title
        handle
      }
    }
    group: metafield(namespace: "custom", key: "group") {
      value
    }
    material: metafield(namespace: "custom", key: "material") {
      value
    }
    construction: metafield(namespace: "custom", key: "construction") {
      value
    }
    pileHeight: metafield(namespace: "custom", key: "pile_height") {
      value
    }
    origin: metafield(namespace: "custom", key: "origin") {
      value
    }
    isNew: metafield(namespace: "custom", key: "is_new") {
      value
    }
    isBestseller: metafield(namespace: "custom", key: "is_bestseller") {
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
    encodedVariantExistence
    encodedVariantAvailability
    adjacentVariants {
      id
      availableForSale
      selectedOptions {
        name
        value
      }
      product {
        handle
      }
    }
    options {
      name
      values
      optionValues {
        name
        firstSelectableVariant {
          selectedOptions {
            name
            value
          }
          product {
            handle
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
            references(first: 1) {
              nodes {
                __typename
                ... on MediaImage {
                  image {
                    url
                  }
                }
                ... on GenericFile {
                  url
                }
              }
            }
          }
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
    description
    media(first: 16) {
      nodes {
        __typename
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
    variants(first: 25) {
      nodes {
        id
        availableForSale
        sku
        image {
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
        selectedOptions {
          name
          value
        }
        product {
          handle
          title
        }
      }
    }
  }
`;

export const FEATURED_COLLECTION_FRAGMENT = `#graphql
  fragment FeaturedCollectionDetails on Collection {
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
`;

export const HERO_METAFIELDS_FRAGMENT = `#graphql
  fragment HeroMetafields on Metaobject {
    id
    type
    fields {
      key
      value
      type
      reference {
        ... on MediaImage {
          id
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;
