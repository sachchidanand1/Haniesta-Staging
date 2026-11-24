import type {Storefront} from '@shopify/hydrogen';

/**
 * Generic metaobject field type
 */
export type MetaobjectField = {
  key: string;
  value: string;
  type: string;
  reference?: {
    image?: {
      id: string;
      url: string;
      altText?: string;
      width?: number;
      height?: number;
    };
  };
};

/**
 * Generic metaobject type
 * Note: displayName is marked optional to prevent type-check schema mismatch
 * issues with codegen definitions that don't output displayName.
 */
export type Metaobject = {
  id: string;
  handle: string;
  type: string;
  displayName?: string;
  fields: MetaobjectField[];
};

/**
 * Hero-specific metaobject type with typed fields
 */
export type HeroMetaobject = {
  id: string;
  handle: string;
  type: string;
  displayName?: string;
  heading?: {
    value: string;
  };
  subHeading?: {
    value: string;
  };
  heroImage?: {
    reference?: {
      image?: {
        url: string;
        altText?: string;
        width?: number;
        height?: number;
      };
    };
  };
};

/**
 * Shop By Size metaobject type with typed fields
 */
export type ShopBySizeItem = {
  id: string;
  handle: string;
  areaId?: {
    value: string;
  };
  name?: {
    value: string;
  };
  sqft?: {
    value: string;
  };
  sizeLabel?: {
    value: string;
  };
  description?: {
    value: string;
  };
  image?: {
    reference?: {
      image?: {
        url: string;
        altText?: string;
        width?: number;
        height?: number;
      };
    };
  };
};

/**
 * Shop By Fabric metaobject type with typed fields
 */
export type ShopByFabricItem = {
  id: string;
  handle: string;
  fabricId?: {
    value: string;
  };
  name?: {
    value: string;
  };
  description?: {
    value: string;
  };
  image?: {
    reference?: {
      image?: {
        url: string;
        altText?: string;
        width?: number;
        height?: number;
      };
    };
  };
}

export async function getLifestyleCollections(
  storefront: Storefront,
): Promise<FeaturedCollection[]> {
  const query = `#graphql
    query getLifestyleCollections($first: Int!) {
      metaobjects(type: "lifestyle", first: $first) {
        nodes {
          id
          handle
          name: field(key: "name") { value }
          description: field(key: "description") { value }
          collectionName: field(key: "collection_name") { value }
          image: field(key: "image") {
            reference {
              ... on MediaImage {
                image { url altText width height }
              }
              ... on GenericFile {
                originalFileSize
                url
              }
            }
          }
        }
      }
    }
  `;

  try {
    const {metaobjects} = await storefront.query(query, {variables: {first: 50}});
    const nodes = metaobjects?.nodes || [];

    return nodes.map((node: any) => {
      const ref = node.image?.reference;
      const image = ref?.image ? ref.image : undefined;
      const imageUrl = !image && ref?.url ? ref.url : undefined;
      return {
        id: node.id,
        name: node.name?.value || node.handle,
        description: node.description?.value || undefined,
        collectionHandle: node.collectionName?.value || undefined,
        image,
        imageUrl,
      } as FeaturedCollection;
    });
  } catch (e) {
    console.error('Error fetching lifestyle collections metaobjects', e);
    return [];
  }
}

/**
 * Fetch a single metaobject by ID (either featured_specific_collection or featured_collections entry)
 * and normalize to FeaturedCollection shape.
 */
export async function getFeaturedMetaobjectById(
  storefront: Storefront,
  id: string,
): Promise<FeaturedCollection | null> {
  const query = `#graphql
    query getFeaturedMetaobjectById($id: ID!) {
      metaobject(id: $id) {
        id
        type
        handle
        name: field(key: "name") { value }
        description: field(key: "description") { value }
        collectionRef: field(key: "collection") { reference { ... on Collection { id handle title } } }
        collectionName: field(key: "collection_name") { value }
        image: field(key: "image") {
          reference {
            ... on MediaImage { image { url altText width height } }
            ... on GenericFile { url }
          }
        }
      }
    }
  `;

  try {
    const {metaobject} = await storefront.query(query, {variables: {id}});
    if (!metaobject) return null;
    const ref = metaobject.image?.reference;
    const image = ref?.image ? ref.image : undefined;
    const imageUrl = !image && ref?.url ? ref.url : undefined;
    const fromRef = metaobject.collectionRef?.reference?.handle as string | undefined;
    const fromName = metaobject.collectionName?.value as string | undefined;
    return {
      id: metaobject.id,
      name: metaobject.name?.value || metaobject.handle,
      description: metaobject.description?.value || undefined,
      collectionHandle: fromRef || fromName || undefined,
      image,
      imageUrl,
    } as FeaturedCollection;
  } catch (e) {
    console.error('Error fetching metaobject by id', e);
    return null;
  }
}

export type ShopByColorItem = {
  id: string;
  handle: string;
  areaId?: {
    value: string;
  };
  name?: {
    value: string;
  };
  description?: {
    value: string;
  };
  image?: {
    reference?: {
      image?: {
        url: string;
        altText?: string | null;
        width?: number | null;
        height?: number | null;
      };
      url?: string;
    };
  };
  imageLower?: {
    reference?: {
      image?: {
        url: string;
        altText?: string | null;
        width?: number | null;
        height?: number | null;
      };
      url?: string;
    };
  };
  color1?: {
    value: string;
  };
  color2?: {
    value: string;
  };
  color3?: {
    value: string;
  };
}

export type ShopByCollaboratorItem = {
  handle: string;
  areaId?: {
    value: string;
  };
  name?: {
    value: string;
  };
  specialty?: {
    value: string;
  };
  description?: {
    value: string;
  };
}

/**
 * Generic function to fetch metaobject by handle
 * @param storefront - Shopify Storefront API client
 * @param type - Metaobject type (e.g., 'hero_section_info')
 * @param handle - Metaobject handle (e.g., 'every-rug-tells-a-story')
 * @param fields - Array of field keys to fetch
 * @returns Promise<Metaobject | null>
 */
export async function getMetaobjectByHandle(
  storefront: Storefront,
  type: string,
  handle: string,
  fields: string[] = []
): Promise<Metaobject | null> {
  // Build field selections dynamically
  const fieldSelections = fields.map(field => `
    ${field}: field(key: "${field}") {
      value
      reference {
        ... on MediaImage {
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  `).join('\n');

  /* 
    GraphQL query fix:
    Changed metaobjectByHandle schema query to metaobject query
    to match correct storefront API schemas and resolve codegen validation errors.
  */
  const query = `
    query getMetaobjectByHandle($handle: MetaobjectHandleInput!) {
      metaobject(handle: $handle) {
        id
        handle
        type
        ${fieldSelections}
      }
    }
  `;

  try {
    const {metaobject} = await storefront.query(query, {
      variables: {
        handle: {
          type,
          handle,
        },
      },
    });

    return metaobject;
  } catch (error) {
    console.error('Error fetching metaobject:', error);
    return null;
  }
}

/**
 * Specific function to fetch hero metaobject
 * @param storefront - Shopify Storefront API client
 * @param handle - Hero handle (defaults to 'every-rug-tells-a-story')
 * @returns Promise<HeroMetaobject | null>
 */
export async function getHeroMetaobject(
  storefront: Storefront,
  handle: string = 'every-rug-tells-a-story'
): Promise<HeroMetaobject | null> {
  const query = `#graphql
    query getHero($h: MetaobjectHandleInput!) {
      metaobject(handle: $h) {
        id
        handle
        type
        heading: field(key: "heading") {
          value
        }
        subHeading: field(key: "sub_heading") {
          value
        }
        heroImage: field(key: "hero_image") {
          reference {
            ... on MediaImage {
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
  `;

  try {
    const {metaobject} = await storefront.query(query, {
      variables: {
        h: {  // Changed from 'handle' to 'h' to match the query variable
          type: 'hero_section_info',
          handle,
        },
      },
    });

    return metaobject;
  } catch (error) {
    console.error('Error fetching hero metaobject:', error);
    return null;
  }
}

/**
 * Helper function to extract field value from metaobject
 * @param metaobject - The metaobject
 * @param fieldKey - The field key to extract
 * @returns string | null
 */
export function getMetaobjectFieldValue(
  metaobject: Metaobject | null,
  fieldKey: string
): string | null {
  if (!metaobject?.fields) return null;
  
  const field = metaobject.fields.find(f => f.key === fieldKey);
  return field?.value || null;
}

/**
 * Helper function to extract image reference from metaobject field
 * @param metaobject - The metaobject
 * @param fieldKey - The field key to extract image from
 * @returns Image object | null
 */
export function getMetaobjectImageReference(
  metaobject: Metaobject | null,
  fieldKey: string
) {
  if (!metaobject?.fields) return null;
  
  const field = metaobject.fields.find(f => f.key === fieldKey);
  return field?.reference?.image || null;
}

/**
 * Specific function to fetch Shop By Size metaobjects
 * @param storefront - Shopify Storefront API client
 * @param first - Number of items to fetch (defaults to 10)
 * @returns Promise<ShopBySizeItem[] | null>
 */
export async function getShopBySizeMetaobjects(
  storefront: Storefront,
  first: number = 10
): Promise<ShopBySizeItem[] | null> {
  const query = `#graphql
    query getShopBySizeItems($first: Int!) {
      metaobjects(type: "shop_by_size", first: $first) {
        nodes {
          id
          handle
          areaId: field(key: "area_id") {
            value
          }
          name: field(key: "name") {
            value
          }
          sqft: field(key: "sqft") {
            value
          }
          sizeLabel: field(key: "sizeLabel") {
            value
          }
          description: field(key: "description") {
            value
          }
          image: field(key: "image") {
            reference {
              ... on MediaImage {
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
    }
  `;

  try {
    const {metaobjects} = await storefront.query(query, {
      variables: {
        first,
      },
    });

    return metaobjects?.nodes || null;
  } catch (error) {
    console.error('Error fetching Shop By Size metaobjects:', error);
    return null;
  }
}

/**
 * Specific function to fetch Shop By Fabric metaobjects
 * @param storefront - Shopify Storefront API client
 * @param first - Number of items to fetch (defaults to 10)
 * @returns Promise<ShopByFabricItem[] | null>
 */
export async function getShopByFabricMetaobjects(
  storefront: Storefront,
  first: number = 10
): Promise<ShopByFabricItem[] | null> {
  const query = `#graphql
    query getShopByFabricItems($first: Int!) {
      metaobjects(type: "shop_by_fabric", first: $first) {
        nodes {
          id
          handle
          fabricId: field(key: "fabric_id") {
            value
          }
          name: field(key: "name") {
            value
          }
          description: field(key: "description") {
            value
          }
          image: field(key: "image") {
            reference {
              ... on MediaImage {
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
    }
  `;

  try {
    const {metaobjects} = await storefront.query(query, {
      variables: {
        first,
      },
    });

    return metaobjects?.nodes || null;
  } catch (error) {
    console.error('Error fetching Shop By Fabric metaobjects:', error);
    return null;
  }
}

/**
 * Fetch Shop By Color metaobjects from Shopify
 * @param storefront - Shopify Storefront API client
 * @param first - Number of items to fetch (defaults to 10)
 * @returns Promise<ShopByColorItem[] | null>
 */
export async function getShopByColorMetaobjects(
  storefront: Storefront,
  first: number = 10
): Promise<ShopByColorItem[] | null> {
  const query = `#graphql
    query getShopByColorItems($first: Int!) {
      metaobjects(type: "shop_by_color", first: $first) {
        nodes {
          id
          handle
          areaId: field(key: "area_id") {
            value
          }
          name: field(key: "name") {
            value
          }
          description: field(key: "description") {
            value
          }
          image: field(key: "Image") {
            reference {
              ... on MediaImage {
                image {
                  url
                  altText
                  width
                  height
                }
              }
              ... on GenericFile {
                url
              }
            }
          }
          imageLower: field(key: "image") {
            reference {
              ... on MediaImage {
                image {
                  url
                  altText
                  width
                  height
                }
              }
              ... on GenericFile {
                url
              }
            }
          }
          color1: field(key: "color_1") {
            value
          }
          color2: field(key: "color_2") {
            value
          }
          color3: field(key: "color_3") {
            value
          }
        }
      }
    }
  `;

  try {
    const {metaobjects} = await storefront.query(query, {
      variables: {
        first,
      },
    });

    return metaobjects?.nodes || null;
  } catch (error) {
    console.error('Error fetching Shop By Color metaobjects:', error);
    return null;
  }
}

/**
 * Fetch Shop By Collaborator metaobjects from Shopify
 * @param storefront - Shopify Storefront API client
 * @param first - Number of items to fetch (defaults to 10)
 * @returns Promise<ShopByCollaboratorItem[] | null>
 */
export async function getShopByCollaboratorMetaobjects(
  storefront: Storefront,
  first: number = 10
): Promise<ShopByCollaboratorItem[] | null> {
  const query = `#graphql
    query getShopByCollaboratorItems($first: Int!) {
      metaobjects(type: "shop_by_collaborator", first: $first) {
        nodes {
          id
          handle
          areaId: field(key: "area_id") {
            value
          }
          name: field(key: "name") {
            value
          }
          specialty: field(key: "specialty") {
            value
          }
          description: field(key: "description") {
            value
          }
        }
      }
    }
  `;

  try {
    const {metaobjects} = await storefront.query(query, {
      variables: {
        first,
      },
    });

    return metaobjects?.nodes || null;
  } catch (error) {
    console.error('Error fetching Shop By Collaborator metaobjects:', error);
    return null;
  }
}

/**
 * About Us specific metaobject type with typed fields
 */
export type AboutUsMetaobject = {
  id: string;
  handle: string;
  type: string;
  displayName?: string;
  heroBackgroundImage?: {
    reference?: {
      image?: {
        url: string;
        altText?: string;
        width?: number;
        height?: number;
      };
    };
  };
  brandStoryImage?: {
    reference?: {
      image?: {
        url: string;
        altText?: string;
        width?: number;
        height?: number;
      };
    };
  };
  heritageImage?: {
    reference?: {
      image?: {
        url: string;
        altText?: string;
        width?: number;
        height?: number;
      };
    };
  };
  inspirationImage?: {
    reference?: {
      image?: {
        url: string;
        altText?: string;
        width?: number;
        height?: number;
      };
    };
  };
  sustainabilityImage?: {
    reference?: {
      image?: {
        url: string;
        altText?: string;
        width?: number;
        height?: number;
      };
    };
  };
};

/**
 * Specific function to fetch About Us metaobject images
 * @param storefront - Shopify Storefront API client
 * @param handle - About Us handle (defaults to 'about-us-images')
 * @returns Promise<AboutUsMetaobject | null>
 */

/**
 * Type for featured collection data
 */
export type FeaturedCollection = {
  id: string;
  name: string;
  description?: string;
  collectionHandle?: string; // taken from collection_name field
  image?: {
    url: string;
    altText?: string;
    width: number;
    height: number;
  };
  imageUrl?: string; // fallback when field is a GenericFile
};

/**
 * Fetches featured collections from metafields
 * @param storefront - Shopify Storefront API client
 * @returns Promise<FeaturedCollection[]>
 */
export async function getFeaturedCollections(
  storefront: Storefront,
): Promise<FeaturedCollection[]> {
  const query = `#graphql
    query getFeaturedCollections($first: Int!) {
      metaobjects(type: "featured_collections", first: $first) {
        nodes {
          id
          handle
          name: field(key: "name") { value }
          description: field(key: "description") { value }
          collectionName: field(key: "collection_name") { value }
          image: field(key: "image") {
            reference {
              ... on MediaImage {
                image { url altText width height }
              }
              ... on GenericFile {
                originalFileSize
                url
              }
            }
          }
        }
      }
    }
  `;

  try {
    const {metaobjects} = await storefront.query(query, {variables: {first: 50}});
    const nodes = metaobjects?.nodes || [];

    return nodes.map((node: any) => {
      const ref = node.image?.reference;
      const image = ref?.image ? ref.image : undefined;
      const imageUrl = !image && ref?.url ? ref.url : undefined;
      return {
        id: node.id,
        name: node.name?.value || node.handle,
        description: node.description?.value || undefined,
        collectionHandle: node.collectionName?.value || undefined,
        image,
        imageUrl,
      } as FeaturedCollection;
    });
  } catch (e) {
    console.error('Error fetching featured collections metaobjects', e);
    return [];
  }
}

/**
 * Fetch banner rows from metaobjects of type 'featured_specific_collection'.
 * Supports either a Collection reference field 'collection' or text 'collection_name'.
 * Returns the same shape as FeaturedCollection for easy reuse in UI.
 */
export async function getFeaturedSpecificCollections(
  storefront: Storefront,
  first: number = 5,
): Promise<FeaturedCollection[]> {
  const query = `#graphql
    query getFeaturedSpecific($first: Int!) {
      metaobjects(type: "featured_specific_collection", first: $first) {
        nodes {
          id
          handle
          name: field(key: "name") { value }
          description: field(key: "description") { value }
          collectionRef: field(key: "collection") {
            reference { ... on Collection { id handle title } }
          }
          collectionName: field(key: "collection_name") { value }
          image: field(key: "image") {
            reference {
              ... on MediaImage { image { url altText width height } }
              ... on GenericFile { url }
            }
          }
        }
      }
    }
  `;

  try {
    const {metaobjects} = await storefront.query(query, {variables: {first}});
    const nodes = metaobjects?.nodes || [];
    return nodes.map((n: any) => {
      const ref = n.image?.reference;
      const image = ref?.image ? ref.image : undefined;
      const imageUrl = !image && ref?.url ? ref.url : undefined;
      const fromRef = n.collectionRef?.reference?.handle as string | undefined;
      const fromName = n.collectionName?.value as string | undefined;
      return {
        id: n.id,
        name: n.name?.value || n.handle,
        description: n.description?.value || undefined,
        collectionHandle: fromRef || fromName || undefined,
        image,
        imageUrl,
      } as FeaturedCollection;
    });
  } catch (e) {
    console.error('Error fetching featured_specific_collection metaobjects', e);
    return [];
  }
}

// no standalone query constant; inline query used in function above

export async function getAboutUsMetaobject(
  storefront: Storefront,
  handle: string = 'about-us-images'
): Promise<AboutUsMetaobject | null> {
  const query = `#graphql
    query getAboutUsImages($h: MetaobjectHandleInput!) {
      metaobject(handle: $h) {
        id
        handle
        type
        heroBackgroundImage: field(key: "hero_background_image") {
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
        brandStoryImage: field(key: "brand_story_image") {
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
        heritageImage: field(key: "hertiage_image") {
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
        inspirationImage: field(key: "inspiration_image") {
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
        sustainabilityImage: field(key: "sustainability_image") {
          reference {
            ... on MediaImage {
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
  `;

  try {
    const {metaobject} = await storefront.query(query, {
      variables: {
        h: {
          type: 'about_us_images',
          handle,
        },
      },
    });

    return metaobject;
  } catch (error) {
    console.error('Error fetching About Us metaobject:', error);
    return null;
  }
}
