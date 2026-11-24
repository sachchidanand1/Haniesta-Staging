/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type OrderCardFragment = Pick<
  StorefrontAPI.Order,
  'id' | 'orderNumber' | 'processedAt' | 'financialStatus' | 'fulfillmentStatus'
> & {
  currentTotalPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  lineItems: {
    edges: Array<{
      node: Pick<StorefrontAPI.OrderLineItem, 'title'> & {
        variant?: StorefrontAPI.Maybe<{
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'height' | 'width'>
          >;
        }>;
      };
    }>;
  };
};

type Media_ExternalVideo_Fragment = {__typename: 'ExternalVideo'} & Pick<
  StorefrontAPI.ExternalVideo,
  'id' | 'embedUrl' | 'host' | 'mediaContentType' | 'alt'
> & {previewImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>};

type Media_MediaImage_Fragment = {__typename: 'MediaImage'} & Pick<
  StorefrontAPI.MediaImage,
  'id' | 'mediaContentType' | 'alt'
> & {
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    previewImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
  };

type Media_Model3d_Fragment = {__typename: 'Model3d'} & Pick<
  StorefrontAPI.Model3d,
  'id' | 'mediaContentType' | 'alt'
> & {
    sources: Array<Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>>;
    previewImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
  };

type Media_Video_Fragment = {__typename: 'Video'} & Pick<
  StorefrontAPI.Video,
  'id' | 'mediaContentType' | 'alt'
> & {
    sources: Array<Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>>;
    previewImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
  };

export type MediaFragment =
  | Media_ExternalVideo_Fragment
  | Media_MediaImage_Fragment
  | Media_Model3d_Fragment
  | Media_Video_Fragment;

export type ProductCardFragment = Pick<
  StorefrontAPI.Product,
  | 'id'
  | 'title'
  | 'publishedAt'
  | 'handle'
  | 'vendor'
  | 'tags'
  | 'encodedVariantExistence'
  | 'encodedVariantAvailability'
  | 'description'
> & {
  collections: {
    nodes: Array<Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'>>;
  };
  group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  material?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  construction?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  pileHeight?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  origin?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  isNew?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  isBestseller?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  swatchImage?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url' | 'altText'>>;
    }>;
  }>;
  adjacentVariants: Array<
    Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
      product: Pick<StorefrontAPI.Product, 'handle'>;
    }
  >;
  options: Array<
    Pick<StorefrontAPI.ProductOption, 'name' | 'values'> & {
      optionValues: Array<
        Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
          firstSelectableVariant?: StorefrontAPI.Maybe<{
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            product: Pick<StorefrontAPI.Product, 'handle'>;
            variantSwatch?: StorefrontAPI.Maybe<{
              reference?: StorefrontAPI.Maybe<
                | Pick<StorefrontAPI.GenericFile, 'url'>
                | {
                    image?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Image, 'url' | 'altText'>
                    >;
                  }
              >;
            }>;
            metafield?: StorefrontAPI.Maybe<{
              references?: StorefrontAPI.Maybe<{
                nodes: Array<
                  | {
                      __typename:
                        | 'Collection'
                        | 'Metaobject'
                        | 'Model3d'
                        | 'Page'
                        | 'Product'
                        | 'ProductVariant'
                        | 'Video';
                    }
                  | ({__typename: 'GenericFile'} & Pick<
                      StorefrontAPI.GenericFile,
                      'url'
                    >)
                  | ({__typename: 'MediaImage'} & {
                      image?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url'>
                      >;
                    })
                >;
              }>;
            }>;
          }>;
          swatch?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
              image?: StorefrontAPI.Maybe<
                | ({__typename: 'ExternalVideo' | 'Model3d' | 'Video'} & {
                    previewImage?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Image, 'url'>
                    >;
                  })
                | ({__typename: 'MediaImage'} & {
                    image?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Image, 'url' | 'altText'>
                    >;
                    previewImage?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Image, 'url'>
                    >;
                  })
              >;
            }
          >;
        }
      >;
    }
  >;
  media: {
    nodes: Array<
      | {__typename: 'ExternalVideo' | 'Model3d' | 'Video'}
      | ({__typename: 'MediaImage'} & Pick<StorefrontAPI.MediaImage, 'id'> & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          })
    >;
  };
  variants: {
    nodes: Array<
      Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale' | 'sku'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
        product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
      }
    >;
  };
};

export type FeaturedCollectionDetailsFragment = Pick<
  StorefrontAPI.Collection,
  'id' | 'title' | 'handle'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
  >;
};

export type HeroMetafieldsFragment = Pick<
  StorefrontAPI.Metaobject,
  'id' | 'type'
> & {
  fields: Array<
    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value' | 'type'> & {
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MediaImage, 'id'> & {
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        }
      >;
    }
  >;
};

export type GetLifestyleCollectionsQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type GetLifestyleCollectionsQuery = {
  metaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        name?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        description?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        collectionName?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        image?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<
            | Pick<StorefrontAPI.GenericFile, 'originalFileSize' | 'url'>
            | {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              }
          >;
        }>;
      }
    >;
  };
};

export type GetFeaturedMetaobjectByIdQueryVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
}>;

export type GetFeaturedMetaobjectByIdQuery = {
  metaobject?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metaobject, 'id' | 'type' | 'handle'> & {
      name?: StorefrontAPI.Maybe<Pick<StorefrontAPI.MetaobjectField, 'value'>>;
      description?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MetaobjectField, 'value'>
      >;
      collectionRef?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Collection, 'id' | 'handle' | 'title'>
        >;
      }>;
      collectionName?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MetaobjectField, 'value'>
      >;
      image?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | Pick<StorefrontAPI.GenericFile, 'url'>
          | {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
            }
        >;
      }>;
    }
  >;
};

export type GetHeroQueryVariables = StorefrontAPI.Exact<{
  h: StorefrontAPI.MetaobjectHandleInput;
}>;

export type GetHeroQuery = {
  metaobject?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
      heading?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MetaobjectField, 'value'>
      >;
      subHeading?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MetaobjectField, 'value'>
      >;
      heroImage?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<{
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }>;
      }>;
    }
  >;
};

export type GetShopBySizeItemsQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type GetShopBySizeItemsQuery = {
  metaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        areaId?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        name?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        sqft?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        sizeLabel?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        description?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        image?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          }>;
        }>;
      }
    >;
  };
};

export type GetShopByFabricItemsQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type GetShopByFabricItemsQuery = {
  metaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        fabricId?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        name?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        description?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        image?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          }>;
        }>;
      }
    >;
  };
};

export type GetShopByColorItemsQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type GetShopByColorItemsQuery = {
  metaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        areaId?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        name?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        description?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        image?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<
            | Pick<StorefrontAPI.GenericFile, 'url'>
            | {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              }
          >;
        }>;
        imageLower?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<
            | Pick<StorefrontAPI.GenericFile, 'url'>
            | {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              }
          >;
        }>;
        color1?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        color2?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        color3?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
      }
    >;
  };
};

export type GetShopByCollaboratorItemsQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type GetShopByCollaboratorItemsQuery = {
  metaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        areaId?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        name?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        specialty?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        description?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
      }
    >;
  };
};

export type GetFeaturedCollectionsQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type GetFeaturedCollectionsQuery = {
  metaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        name?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        description?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        collectionName?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        image?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<
            | Pick<StorefrontAPI.GenericFile, 'originalFileSize' | 'url'>
            | {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              }
          >;
        }>;
      }
    >;
  };
};

export type GetFeaturedSpecificQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type GetFeaturedSpecificQuery = {
  metaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        name?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        description?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        collectionRef?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Collection, 'id' | 'handle' | 'title'>
          >;
        }>;
        collectionName?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        image?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<
            | Pick<StorefrontAPI.GenericFile, 'url'>
            | {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              }
          >;
        }>;
      }
    >;
  };
};

export type GetAboutUsImagesQueryVariables = StorefrontAPI.Exact<{
  h: StorefrontAPI.MetaobjectHandleInput;
}>;

export type GetAboutUsImagesQuery = {
  metaobject?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
      heroBackgroundImage?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<{
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }>;
      }>;
      brandStoryImage?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<{
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }>;
      }>;
      heritageImage?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<{
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }>;
      }>;
      inspirationImage?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<{
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }>;
      }>;
      sustainabilityImage?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<{
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }>;
      }>;
    }
  >;
};

export type LayoutQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  headerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  footerMenuHandle: StorefrontAPI.Scalars['String']['input'];
}>;

export type LayoutQuery = {
  shop: Pick<StorefrontAPI.Shop, 'id' | 'name' | 'description'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    paymentSettings: Pick<StorefrontAPI.PaymentSettings, 'currencyCode'>;
    brand?: StorefrontAPI.Maybe<{
      logo?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      }>;
    }>;
  };
  headerMenu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            > & {
              items: Array<
                Pick<
                  StorefrontAPI.MenuItem,
                  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
                >
              >;
            }
          >;
        }
      >;
    }
  >;
  footerMenu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            > & {
              items: Array<
                Pick<
                  StorefrontAPI.MenuItem,
                  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
                >
              >;
            }
          >;
        }
      >;
    }
  >;
};

export type ShopFragment = Pick<
  StorefrontAPI.Shop,
  'id' | 'name' | 'description'
> & {
  primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
  paymentSettings: Pick<StorefrontAPI.PaymentSettings, 'currencyCode'>;
  brand?: StorefrontAPI.Maybe<{
    logo?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
    }>;
  }>;
};

export type MenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ChildMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    >
  >;
};

export type ParentMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        >
      >;
    }
  >;
};

export type MenuFragment = Pick<StorefrontAPI.Menu, 'id'> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
};

export type FeaturedCollectionsQueryVariables = StorefrontAPI.Exact<{
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
}>;

export type FeaturedCollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
      }
    >;
  };
};

export type GetShopPrimaryDomainQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetShopPrimaryDomainQuery = {
  shop: {primaryDomain: Pick<StorefrontAPI.Domain, 'url'>};
};

export type CollectionContentFragment = Pick<
  StorefrontAPI.Collection,
  'id' | 'handle' | 'title' | 'descriptionHtml'
> & {
  heading?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  byline?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  cta?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  spread?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<
      | ({__typename: 'MediaImage'} & Pick<
          StorefrontAPI.MediaImage,
          'id' | 'mediaContentType' | 'alt'
        > & {
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
      | ({__typename: 'Model3d'} & Pick<
          StorefrontAPI.Model3d,
          'id' | 'mediaContentType' | 'alt'
        > & {
            sources: Array<
              Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>
            >;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
      | ({__typename: 'Video'} & Pick<
          StorefrontAPI.Video,
          'id' | 'mediaContentType' | 'alt'
        > & {
            sources: Array<Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>>;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
    >;
  }>;
  spreadSecondary?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<
      | ({__typename: 'MediaImage'} & Pick<
          StorefrontAPI.MediaImage,
          'id' | 'mediaContentType' | 'alt'
        > & {
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
      | ({__typename: 'Model3d'} & Pick<
          StorefrontAPI.Model3d,
          'id' | 'mediaContentType' | 'alt'
        > & {
            sources: Array<
              Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>
            >;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
      | ({__typename: 'Video'} & Pick<
          StorefrontAPI.Video,
          'id' | 'mediaContentType' | 'alt'
        > & {
            sources: Array<Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>>;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
    >;
  }>;
};

export type SeoCollectionContentQueryVariables = StorefrontAPI.Exact<{
  handle?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SeoCollectionContentQuery = {
  hero?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'descriptionHtml'
    > & {
      heading?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      byline?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      cta?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      spread?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'mediaContentType' | 'alt'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Model3d'} & Pick<
              StorefrontAPI.Model3d,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
        >;
      }>;
      spreadSecondary?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'mediaContentType' | 'alt'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Model3d'} & Pick<
              StorefrontAPI.Model3d,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
        >;
      }>;
    }
  >;
  shop: Pick<StorefrontAPI.Shop, 'name' | 'description'>;
};

export type HeroCollectionContentQueryVariables = StorefrontAPI.Exact<{
  handle?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HeroCollectionContentQuery = {
  hero?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'descriptionHtml'
    > & {
      heading?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      byline?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      cta?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      spread?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'mediaContentType' | 'alt'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Model3d'} & Pick<
              StorefrontAPI.Model3d,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
        >;
      }>;
      spreadSecondary?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'mediaContentType' | 'alt'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Model3d'} & Pick<
              StorefrontAPI.Model3d,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
        >;
      }>;
    }
  >;
};

export type HomepageFeaturedProductsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomepageFeaturedProductsQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'publishedAt'
        | 'handle'
        | 'vendor'
        | 'tags'
        | 'encodedVariantExistence'
        | 'encodedVariantAvailability'
        | 'description'
      > & {
        collections: {
          nodes: Array<
            Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'>
          >;
        };
        group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        material?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        construction?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        pileHeight?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        origin?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isNew?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isBestseller?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        swatchImage?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          }>;
        }>;
        adjacentVariants: Array<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            product: Pick<StorefrontAPI.Product, 'handle'>;
          }
        >;
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name' | 'values'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<{
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                  variantSwatch?: StorefrontAPI.Maybe<{
                    reference?: StorefrontAPI.Maybe<
                      | Pick<StorefrontAPI.GenericFile, 'url'>
                      | {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                        }
                    >;
                  }>;
                  metafield?: StorefrontAPI.Maybe<{
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        | {
                            __typename:
                              | 'Collection'
                              | 'Metaobject'
                              | 'Model3d'
                              | 'Page'
                              | 'Product'
                              | 'ProductVariant'
                              | 'Video';
                          }
                        | ({__typename: 'GenericFile'} & Pick<
                            StorefrontAPI.GenericFile,
                            'url'
                          >)
                        | ({__typename: 'MediaImage'} & {
                            image?: StorefrontAPI.Maybe<
                              Pick<StorefrontAPI.Image, 'url'>
                            >;
                          })
                      >;
                    }>;
                  }>;
                }>;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<
                      | ({__typename: 'ExternalVideo' | 'Model3d' | 'Video'} & {
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                      | ({__typename: 'MediaImage'} & {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                    >;
                  }
                >;
              }
            >;
          }
        >;
        media: {
          nodes: Array<
            | {__typename: 'ExternalVideo' | 'Model3d' | 'Video'}
            | ({__typename: 'MediaImage'} & Pick<
                StorefrontAPI.MediaImage,
                'id'
              > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                })
          >;
        };
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
            }
          >;
        };
      }
    >;
  };
  colorSwatches: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value' | 'type'> & {
            reference?: StorefrontAPI.Maybe<{
              image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url' | 'altText'>
              >;
            }>;
          }
        >;
      }
    >;
  };
};

export type HomepageFeaturedCollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomepageFeaturedCollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
        >;
      }
    >;
  };
};

export type HomepageLifestyleCollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomepageLifestyleCollectionsQuery = {
  featured?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
      >;
    }
  >;
  lifestyle?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
      >;
    }
  >;
  ecoFriendly?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
      >;
    }
  >;
  sustainability?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
      >;
    }
  >;
};

export type RugFinderSectionQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.MetaobjectHandleInput;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type RugFinderSectionQuery = {
  metaobject?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
      heading?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MetaobjectField, 'value'>
      >;
      subHeading?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MetaobjectField, 'value'>
      >;
      buttonText?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MetaobjectField, 'value'>
      >;
      link?: StorefrontAPI.Maybe<Pick<StorefrontAPI.MetaobjectField, 'value'>>;
      image?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | {
              __typename:
                | 'Collection'
                | 'GenericFile'
                | 'Metaobject'
                | 'Model3d'
                | 'Page'
                | 'Product'
                | 'ProductVariant'
                | 'Video';
            }
          | ({__typename: 'MediaImage'} & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
            })
        >;
      }>;
    }
  >;
};

export type TestimonialsQueryVariables = StorefrontAPI.Exact<{
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type TestimonialsQuery = {
  metaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        title?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        quote?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        authorName?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        role?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        rating?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        featured?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        avatar?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<
            | {
                __typename:
                  | 'Collection'
                  | 'GenericFile'
                  | 'Metaobject'
                  | 'Model3d'
                  | 'Page'
                  | 'Product'
                  | 'ProductVariant'
                  | 'Video';
              }
            | ({__typename: 'MediaImage'} & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              })
          >;
        }>;
      }
    >;
  };
};

export type AccountFavoritesProductsQueryVariables = StorefrontAPI.Exact<{
  ids:
    | Array<StorefrontAPI.Scalars['ID']['input']>
    | StorefrontAPI.Scalars['ID']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type AccountFavoritesProductsQuery = {
  nodes: Array<
    StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'publishedAt'
        | 'handle'
        | 'vendor'
        | 'tags'
        | 'encodedVariantExistence'
        | 'encodedVariantAvailability'
        | 'description'
      > & {
        collections: {
          nodes: Array<
            Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'>
          >;
        };
        group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        material?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        construction?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        pileHeight?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        origin?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isNew?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isBestseller?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        swatchImage?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          }>;
        }>;
        adjacentVariants: Array<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            product: Pick<StorefrontAPI.Product, 'handle'>;
          }
        >;
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name' | 'values'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<{
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                  variantSwatch?: StorefrontAPI.Maybe<{
                    reference?: StorefrontAPI.Maybe<
                      | Pick<StorefrontAPI.GenericFile, 'url'>
                      | {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                        }
                    >;
                  }>;
                  metafield?: StorefrontAPI.Maybe<{
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        | {
                            __typename:
                              | 'Collection'
                              | 'Metaobject'
                              | 'Model3d'
                              | 'Page'
                              | 'Product'
                              | 'ProductVariant'
                              | 'Video';
                          }
                        | ({__typename: 'GenericFile'} & Pick<
                            StorefrontAPI.GenericFile,
                            'url'
                          >)
                        | ({__typename: 'MediaImage'} & {
                            image?: StorefrontAPI.Maybe<
                              Pick<StorefrontAPI.Image, 'url'>
                            >;
                          })
                      >;
                    }>;
                  }>;
                }>;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<
                      | ({__typename: 'ExternalVideo' | 'Model3d' | 'Video'} & {
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                      | ({__typename: 'MediaImage'} & {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                    >;
                  }
                >;
              }
            >;
          }
        >;
        media: {
          nodes: Array<
            | {__typename: 'ExternalVideo' | 'Model3d' | 'Video'}
            | ({__typename: 'MediaImage'} & Pick<
                StorefrontAPI.MediaImage,
                'id'
              > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                })
          >;
        };
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
            }
          >;
        };
      }
    >
  >;
};

export type CartCreateMutationVariables = StorefrontAPI.Exact<{
  input: StorefrontAPI.CartInput;
}>;

export type CartCreateMutation = {
  cartCreate?: StorefrontAPI.Maybe<{
    cart?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Cart, 'id' | 'checkoutUrl'>>;
    userErrors: Array<Pick<StorefrontAPI.CartUserError, 'field' | 'message'>>;
  }>;
};

export type CustomerCreateMutationVariables = StorefrontAPI.Exact<{
  input: StorefrontAPI.CustomerCreateInput;
}>;

export type CustomerCreateMutation = {
  customerCreate?: StorefrontAPI.Maybe<{
    customer?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Customer, 'id' | 'email'>
    >;
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'message'>
    >;
  }>;
};

export type ApiProductCardQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ApiProductCardQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      | 'id'
      | 'title'
      | 'publishedAt'
      | 'handle'
      | 'vendor'
      | 'tags'
      | 'encodedVariantExistence'
      | 'encodedVariantAvailability'
      | 'description'
    > & {
      collections: {
        nodes: Array<Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'>>;
      };
      group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      material?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      construction?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      pileHeight?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      origin?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      isNew?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      isBestseller?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      swatchImage?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<{
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText'>
          >;
        }>;
      }>;
      adjacentVariants: Array<
        Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          product: Pick<StorefrontAPI.Product, 'handle'>;
        }
      >;
      options: Array<
        Pick<StorefrontAPI.ProductOption, 'name' | 'values'> & {
          optionValues: Array<
            Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
              firstSelectableVariant?: StorefrontAPI.Maybe<{
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
                product: Pick<StorefrontAPI.Product, 'handle'>;
                variantSwatch?: StorefrontAPI.Maybe<{
                  reference?: StorefrontAPI.Maybe<
                    | Pick<StorefrontAPI.GenericFile, 'url'>
                    | {
                        image?: StorefrontAPI.Maybe<
                          Pick<StorefrontAPI.Image, 'url' | 'altText'>
                        >;
                      }
                  >;
                }>;
                metafield?: StorefrontAPI.Maybe<{
                  references?: StorefrontAPI.Maybe<{
                    nodes: Array<
                      | {
                          __typename:
                            | 'Collection'
                            | 'Metaobject'
                            | 'Model3d'
                            | 'Page'
                            | 'Product'
                            | 'ProductVariant'
                            | 'Video';
                        }
                      | ({__typename: 'GenericFile'} & Pick<
                          StorefrontAPI.GenericFile,
                          'url'
                        >)
                      | ({__typename: 'MediaImage'} & {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                    >;
                  }>;
                }>;
              }>;
              swatch?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                  image?: StorefrontAPI.Maybe<
                    | ({__typename: 'ExternalVideo' | 'Model3d' | 'Video'} & {
                        previewImage?: StorefrontAPI.Maybe<
                          Pick<StorefrontAPI.Image, 'url'>
                        >;
                      })
                    | ({__typename: 'MediaImage'} & {
                        image?: StorefrontAPI.Maybe<
                          Pick<StorefrontAPI.Image, 'url' | 'altText'>
                        >;
                        previewImage?: StorefrontAPI.Maybe<
                          Pick<StorefrontAPI.Image, 'url'>
                        >;
                      })
                  >;
                }
              >;
            }
          >;
        }
      >;
      media: {
        nodes: Array<
          | {__typename: 'ExternalVideo' | 'Model3d' | 'Video'}
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              })
        >;
      };
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'sku'
          > & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
          }
        >;
      };
    }
  >;
};

export type ApiColorSwatchesQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ApiColorSwatchesQuery = {
  colorSwatches: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value' | 'type'> & {
            reference?: StorefrontAPI.Maybe<{
              image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url' | 'altText'>
              >;
            }>;
          }
        >;
      }
    >;
  };
};

export type ApiAllProductsQueryVariables = StorefrontAPI.Exact<{
  query?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  count?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  reverse?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Boolean']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  sortKey?: StorefrontAPI.InputMaybe<StorefrontAPI.ProductSortKeys>;
}>;

export type ApiAllProductsQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'publishedAt'
        | 'handle'
        | 'vendor'
        | 'tags'
        | 'encodedVariantExistence'
        | 'encodedVariantAvailability'
        | 'description'
      > & {
        collections: {
          nodes: Array<
            Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'>
          >;
        };
        group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        material?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        construction?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        pileHeight?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        origin?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isNew?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isBestseller?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        swatchImage?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          }>;
        }>;
        adjacentVariants: Array<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            product: Pick<StorefrontAPI.Product, 'handle'>;
          }
        >;
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name' | 'values'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<{
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                  variantSwatch?: StorefrontAPI.Maybe<{
                    reference?: StorefrontAPI.Maybe<
                      | Pick<StorefrontAPI.GenericFile, 'url'>
                      | {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                        }
                    >;
                  }>;
                  metafield?: StorefrontAPI.Maybe<{
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        | {
                            __typename:
                              | 'Collection'
                              | 'Metaobject'
                              | 'Model3d'
                              | 'Page'
                              | 'Product'
                              | 'ProductVariant'
                              | 'Video';
                          }
                        | ({__typename: 'GenericFile'} & Pick<
                            StorefrontAPI.GenericFile,
                            'url'
                          >)
                        | ({__typename: 'MediaImage'} & {
                            image?: StorefrontAPI.Maybe<
                              Pick<StorefrontAPI.Image, 'url'>
                            >;
                          })
                      >;
                    }>;
                  }>;
                }>;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<
                      | ({__typename: 'ExternalVideo' | 'Model3d' | 'Video'} & {
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                      | ({__typename: 'MediaImage'} & {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                    >;
                  }
                >;
              }
            >;
          }
        >;
        media: {
          nodes: Array<
            | {__typename: 'ExternalVideo' | 'Model3d' | 'Video'}
            | ({__typename: 'MediaImage'} & Pick<
                StorefrontAPI.MediaImage,
                'id'
              > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                })
          >;
        };
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
            }
          >;
        };
      }
    >;
  };
};

export type ArticleDetailsQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  blogHandle: StorefrontAPI.Scalars['String']['input'];
  articleHandle: StorefrontAPI.Scalars['String']['input'];
}>;

export type ArticleDetailsQuery = {
  blog?: StorefrontAPI.Maybe<{
    articleByHandle?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Article,
        'title' | 'contentHtml' | 'publishedAt' | 'handle'
      > & {
        author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'altText' | 'url' | 'width' | 'height'
          >
        >;
        seo?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Seo, 'description' | 'title'>
        >;
      }
    >;
    articles: {
      edges: Array<{
        node: Pick<
          StorefrontAPI.Article,
          | 'id'
          | 'handle'
          | 'title'
          | 'publishedAt'
          | 'excerpt'
          | 'excerptHtml'
          | 'contentHtml'
        > & {
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'altText' | 'url' | 'width' | 'height'
            >
          >;
        };
      }>;
    };
  }>;
};

export type BlogQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  blogHandle: StorefrontAPI.Scalars['String']['input'];
  pageBy: StorefrontAPI.Scalars['Int']['input'];
  cursor?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
}>;

export type BlogQuery = {
  blog?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Blog, 'id' | 'handle' | 'title'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'title' | 'description'>
      >;
      articles: {
        edges: Array<{
          node: Pick<
            StorefrontAPI.Article,
            | 'contentHtml'
            | 'excerpt'
            | 'excerptHtml'
            | 'handle'
            | 'id'
            | 'publishedAt'
            | 'title'
          > & {
            author?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ArticleAuthor, 'name'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'altText' | 'url' | 'width' | 'height'
              >
            >;
          };
        }>;
        pageInfo: Pick<StorefrontAPI.PageInfo, 'hasNextPage' | 'endCursor'>;
      };
    }
  >;
};

export type ArticleFragment = Pick<
  StorefrontAPI.Article,
  | 'contentHtml'
  | 'excerpt'
  | 'excerptHtml'
  | 'handle'
  | 'id'
  | 'publishedAt'
  | 'title'
> & {
  author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'altText' | 'url' | 'width' | 'height'>
  >;
};

export type RouteCartLinesQueryVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
}>;

export type RouteCartLinesQuery = {
  cart?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Cart, 'id' | 'updatedAt'> & {
      lines: {
        edges: Array<{
          node:
            | (Pick<StorefrontAPI.CartLine, 'quantity'> & {
                merchandise: Pick<StorefrontAPI.ProductVariant, 'id'> & {
                  product: Pick<StorefrontAPI.Product, 'title'>;
                };
              })
            | (Pick<StorefrontAPI.ComponentizableCartLine, 'quantity'> & {
                merchandise: Pick<StorefrontAPI.ProductVariant, 'id'> & {
                  product: Pick<StorefrontAPI.Product, 'title'>;
                };
              });
        }>;
      };
    }
  >;
};

export type CollectionDetailsQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  filters?: StorefrontAPI.InputMaybe<
    Array<StorefrontAPI.ProductFilter> | StorefrontAPI.ProductFilter
  >;
  sortKey: StorefrontAPI.ProductCollectionSortKeys;
  reverse?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Boolean']['input']>;
  first: StorefrontAPI.Scalars['Int']['input'];
  after?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
}>;

export type CollectionDetailsQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description'
    > & {
      collectionIntroHeader?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      collectionIntroFooter?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height' | 'altText'>
      >;
      products: {
        filters: Array<
          Pick<StorefrontAPI.Filter, 'id' | 'label' | 'type'> & {
            values: Array<
              Pick<
                StorefrontAPI.FilterValue,
                'id' | 'label' | 'count' | 'input'
              >
            >;
          }
        >;
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            | 'id'
            | 'title'
            | 'publishedAt'
            | 'handle'
            | 'vendor'
            | 'tags'
            | 'encodedVariantExistence'
            | 'encodedVariantAvailability'
            | 'description'
          > & {
            collections: {
              nodes: Array<
                Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'>
              >;
            };
            group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
            material?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            construction?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            pileHeight?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            origin?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            isNew?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
            isBestseller?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            swatchImage?: StorefrontAPI.Maybe<{
              reference?: StorefrontAPI.Maybe<{
                image?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url' | 'altText'>
                >;
              }>;
            }>;
            adjacentVariants: Array<
              Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
                product: Pick<StorefrontAPI.Product, 'handle'>;
              }
            >;
            options: Array<
              Pick<StorefrontAPI.ProductOption, 'name' | 'values'> & {
                optionValues: Array<
                  Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                    firstSelectableVariant?: StorefrontAPI.Maybe<{
                      selectedOptions: Array<
                        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                      >;
                      product: Pick<StorefrontAPI.Product, 'handle'>;
                      variantSwatch?: StorefrontAPI.Maybe<{
                        reference?: StorefrontAPI.Maybe<
                          | Pick<StorefrontAPI.GenericFile, 'url'>
                          | {
                              image?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.Image, 'url' | 'altText'>
                              >;
                            }
                        >;
                      }>;
                      metafield?: StorefrontAPI.Maybe<{
                        references?: StorefrontAPI.Maybe<{
                          nodes: Array<
                            | {
                                __typename:
                                  | 'Collection'
                                  | 'Metaobject'
                                  | 'Model3d'
                                  | 'Page'
                                  | 'Product'
                                  | 'ProductVariant'
                                  | 'Video';
                              }
                            | ({__typename: 'GenericFile'} & Pick<
                                StorefrontAPI.GenericFile,
                                'url'
                              >)
                            | ({__typename: 'MediaImage'} & {
                                image?: StorefrontAPI.Maybe<
                                  Pick<StorefrontAPI.Image, 'url'>
                                >;
                              })
                          >;
                        }>;
                      }>;
                    }>;
                    swatch?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                        image?: StorefrontAPI.Maybe<
                          | ({
                              __typename: 'ExternalVideo' | 'Model3d' | 'Video';
                            } & {
                              previewImage?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.Image, 'url'>
                              >;
                            })
                          | ({__typename: 'MediaImage'} & {
                              image?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.Image, 'url' | 'altText'>
                              >;
                              previewImage?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.Image, 'url'>
                              >;
                            })
                        >;
                      }
                    >;
                  }
                >;
              }
            >;
            media: {
              nodes: Array<
                | {__typename: 'ExternalVideo' | 'Model3d' | 'Video'}
                | ({__typename: 'MediaImage'} & Pick<
                    StorefrontAPI.MediaImage,
                    'id'
                  > & {
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'url' | 'altText' | 'width' | 'height'
                        >
                      >;
                    })
              >;
            };
            variants: {
              nodes: Array<
                Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'sku'
                > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
                }
              >;
            };
          }
        >;
        pageInfo: Pick<StorefrontAPI.PageInfo, 'hasNextPage' | 'endCursor'>;
      };
    }
  >;
  collections: {
    edges: Array<{node: Pick<StorefrontAPI.Collection, 'title' | 'handle'>}>;
  };
  colorSwatches: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value' | 'type'> & {
            reference?: StorefrontAPI.Maybe<{
              image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url' | 'altText'>
              >;
            }>;
          }
        >;
      }
    >;
  };
};

export type CollectionPageInfoQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  filters?: StorefrontAPI.InputMaybe<
    Array<StorefrontAPI.ProductFilter> | StorefrontAPI.ProductFilter
  >;
  sortKey: StorefrontAPI.ProductCollectionSortKeys;
  reverse?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Boolean']['input']>;
  first: StorefrontAPI.Scalars['Int']['input'];
  after?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
}>;

export type CollectionPageInfoQuery = {
  collection?: StorefrontAPI.Maybe<{
    products: {
      pageInfo: Pick<StorefrontAPI.PageInfo, 'hasNextPage' | 'endCursor'>;
    };
  }>;
};

export type CollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type CollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'description' | 'handle'
      > & {
        seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'width' | 'height' | 'altText'
          >
        >;
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasPreviousPage' | 'hasNextPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type RouteFavoritesProductsQueryVariables = StorefrontAPI.Exact<{
  ids:
    | Array<StorefrontAPI.Scalars['ID']['input']>
    | StorefrontAPI.Scalars['ID']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type RouteFavoritesProductsQuery = {
  nodes: Array<
    StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'publishedAt'
        | 'handle'
        | 'vendor'
        | 'tags'
        | 'encodedVariantExistence'
        | 'encodedVariantAvailability'
        | 'description'
      > & {
        collections: {
          nodes: Array<
            Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'>
          >;
        };
        group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        material?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        construction?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        pileHeight?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        origin?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isNew?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isBestseller?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        swatchImage?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          }>;
        }>;
        adjacentVariants: Array<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            product: Pick<StorefrontAPI.Product, 'handle'>;
          }
        >;
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name' | 'values'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<{
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                  variantSwatch?: StorefrontAPI.Maybe<{
                    reference?: StorefrontAPI.Maybe<
                      | Pick<StorefrontAPI.GenericFile, 'url'>
                      | {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                        }
                    >;
                  }>;
                  metafield?: StorefrontAPI.Maybe<{
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        | {
                            __typename:
                              | 'Collection'
                              | 'Metaobject'
                              | 'Model3d'
                              | 'Page'
                              | 'Product'
                              | 'ProductVariant'
                              | 'Video';
                          }
                        | ({__typename: 'GenericFile'} & Pick<
                            StorefrontAPI.GenericFile,
                            'url'
                          >)
                        | ({__typename: 'MediaImage'} & {
                            image?: StorefrontAPI.Maybe<
                              Pick<StorefrontAPI.Image, 'url'>
                            >;
                          })
                      >;
                    }>;
                  }>;
                }>;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<
                      | ({__typename: 'ExternalVideo' | 'Model3d' | 'Video'} & {
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                      | ({__typename: 'MediaImage'} & {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                    >;
                  }
                >;
              }
            >;
          }
        >;
        media: {
          nodes: Array<
            | {__typename: 'ExternalVideo' | 'Model3d' | 'Video'}
            | ({__typename: 'MediaImage'} & Pick<
                StorefrontAPI.MediaImage,
                'id'
              > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                })
          >;
        };
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
            }
          >;
        };
      }
    >
  >;
};

export type FeaturedColorSwatchesQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type FeaturedColorSwatchesQuery = {
  colorSwatches: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value' | 'type'> & {
            reference?: StorefrontAPI.Maybe<{
              image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url' | 'altText'>
              >;
            }>;
          }
        >;
      }
    >;
  };
};

export type FeaturedItemsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  pageBy?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
}>;

export type FeaturedItemsQuery = {
  featuredCollections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
        >;
      }
    >;
  };
  featuredProducts: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'publishedAt'
        | 'handle'
        | 'vendor'
        | 'tags'
        | 'encodedVariantExistence'
        | 'encodedVariantAvailability'
        | 'description'
      > & {
        collections: {
          nodes: Array<
            Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'>
          >;
        };
        group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        material?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        construction?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        pileHeight?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        origin?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isNew?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isBestseller?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        swatchImage?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          }>;
        }>;
        adjacentVariants: Array<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            product: Pick<StorefrontAPI.Product, 'handle'>;
          }
        >;
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name' | 'values'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<{
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                  variantSwatch?: StorefrontAPI.Maybe<{
                    reference?: StorefrontAPI.Maybe<
                      | Pick<StorefrontAPI.GenericFile, 'url'>
                      | {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                        }
                    >;
                  }>;
                  metafield?: StorefrontAPI.Maybe<{
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        | {
                            __typename:
                              | 'Collection'
                              | 'Metaobject'
                              | 'Model3d'
                              | 'Page'
                              | 'Product'
                              | 'ProductVariant'
                              | 'Video';
                          }
                        | ({__typename: 'GenericFile'} & Pick<
                            StorefrontAPI.GenericFile,
                            'url'
                          >)
                        | ({__typename: 'MediaImage'} & {
                            image?: StorefrontAPI.Maybe<
                              Pick<StorefrontAPI.Image, 'url'>
                            >;
                          })
                      >;
                    }>;
                  }>;
                }>;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<
                      | ({__typename: 'ExternalVideo' | 'Model3d' | 'Video'} & {
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                      | ({__typename: 'MediaImage'} & {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                    >;
                  }
                >;
              }
            >;
          }
        >;
        media: {
          nodes: Array<
            | {__typename: 'ExternalVideo' | 'Model3d' | 'Video'}
            | ({__typename: 'MediaImage'} & Pick<
                StorefrontAPI.MediaImage,
                'id'
              > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                })
          >;
        };
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
            }
          >;
        };
      }
    >;
  };
};

export type PageDetailsQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type PageDetailsQuery = {
  page?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Page, 'id' | 'title' | 'body'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'description' | 'title'>
      >;
    }
  >;
};

export type PolicyHandleFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'body' | 'handle' | 'id' | 'title' | 'url'
>;

export type PoliciesHandleQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  privacyPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  shippingPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  termsOfService: StorefrontAPI.Scalars['Boolean']['input'];
  refundPolicy: StorefrontAPI.Scalars['Boolean']['input'];
}>;

export type PoliciesHandleQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
  };
};

export type PolicyIndexFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'id' | 'title' | 'handle'
>;

export type PoliciesIndexQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type PoliciesIndexQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    subscriptionPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicyWithDefault, 'id' | 'title' | 'handle'>
    >;
  };
};

export type ProductVariantFragment = Pick<
  StorefrontAPI.ProductVariant,
  'id' | 'availableForSale' | 'sku' | 'title'
> & {
  selectedOptions: Array<Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>>;
  variantSwatch?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<
      | Pick<StorefrontAPI.GenericFile, 'url'>
      | {
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText'>
          >;
        }
    >;
  }>;
  metafield?: StorefrontAPI.Maybe<{
    references?: StorefrontAPI.Maybe<{
      nodes: Array<
        | Pick<StorefrontAPI.GenericFile, 'id' | 'url'>
        | (Pick<StorefrontAPI.MediaImage, 'id'> & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          })
      >;
    }>;
  }>;
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  compareAtPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  unitPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
};

export type ProductFragment = Pick<
  StorefrontAPI.Product,
  | 'id'
  | 'title'
  | 'vendor'
  | 'handle'
  | 'descriptionHtml'
  | 'description'
  | 'encodedVariantExistence'
  | 'encodedVariantAvailability'
  | 'tags'
> & {
  group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  colorLabel?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  colorFamilyKey?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  swatchImage?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url' | 'altText'>>;
    }>;
  }>;
  sustainabilityPartnerLogo?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url' | 'altText'>>;
    }>;
  }>;
  options: Array<
    Pick<StorefrontAPI.ProductOption, 'name'> & {
      optionValues: Array<
        Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
          firstSelectableVariant?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'sku' | 'title'
            > & {
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              variantSwatch?: StorefrontAPI.Maybe<{
                reference?: StorefrontAPI.Maybe<
                  | Pick<StorefrontAPI.GenericFile, 'url'>
                  | {
                      image?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url' | 'altText'>
                      >;
                    }
                >;
              }>;
              metafield?: StorefrontAPI.Maybe<{
                references?: StorefrontAPI.Maybe<{
                  nodes: Array<
                    | Pick<StorefrontAPI.GenericFile, 'id' | 'url'>
                    | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                        image?: StorefrontAPI.Maybe<
                          Pick<
                            StorefrontAPI.Image,
                            'url' | 'altText' | 'width' | 'height'
                          >
                        >;
                      })
                  >;
                }>;
              }>;
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              unitPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            }
          >;
          swatch?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
              image?: StorefrontAPI.Maybe<
                | ({__typename: 'ExternalVideo' | 'Model3d' | 'Video'} & {
                    previewImage?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Image, 'url'>
                    >;
                  })
                | ({__typename: 'MediaImage'} & {
                    image?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Image, 'url' | 'altText'>
                    >;
                    previewImage?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Image, 'url'>
                    >;
                  })
              >;
            }
          >;
        }
      >;
    }
  >;
  selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.ProductVariant,
      'id' | 'availableForSale' | 'sku' | 'title'
    > & {
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
      variantSwatch?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | Pick<StorefrontAPI.GenericFile, 'url'>
          | {
              image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url' | 'altText'>
              >;
            }
        >;
      }>;
      metafield?: StorefrontAPI.Maybe<{
        references?: StorefrontAPI.Maybe<{
          nodes: Array<
            | Pick<StorefrontAPI.GenericFile, 'id' | 'url'>
            | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              })
          >;
        }>;
      }>;
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      unitPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
    }
  >;
  adjacentVariants: Array<
    Pick<
      StorefrontAPI.ProductVariant,
      'id' | 'availableForSale' | 'sku' | 'title'
    > & {
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
      variantSwatch?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | Pick<StorefrontAPI.GenericFile, 'url'>
          | {
              image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url' | 'altText'>
              >;
            }
        >;
      }>;
      metafield?: StorefrontAPI.Maybe<{
        references?: StorefrontAPI.Maybe<{
          nodes: Array<
            | Pick<StorefrontAPI.GenericFile, 'id' | 'url'>
            | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              })
          >;
        }>;
      }>;
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      unitPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
    }
  >;
  variants: {
    nodes: Array<
      Pick<
        StorefrontAPI.ProductVariant,
        'id' | 'availableForSale' | 'sku' | 'title'
      > & {
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
        variantSwatch?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<
            | Pick<StorefrontAPI.GenericFile, 'url'>
            | {
                image?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url' | 'altText'>
                >;
              }
          >;
        }>;
        metafield?: StorefrontAPI.Maybe<{
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              | Pick<StorefrontAPI.GenericFile, 'id' | 'url'>
              | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                })
            >;
          }>;
        }>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        unitPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
      }
    >;
  };
  seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
  media: {
    nodes: Array<
      | ({__typename: 'ExternalVideo'} & Pick<
          StorefrontAPI.ExternalVideo,
          'id' | 'embedUrl' | 'host' | 'mediaContentType' | 'alt'
        > & {
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
      | ({__typename: 'MediaImage'} & Pick<
          StorefrontAPI.MediaImage,
          'id' | 'mediaContentType' | 'alt'
        > & {
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
      | ({__typename: 'Model3d'} & Pick<
          StorefrontAPI.Model3d,
          'id' | 'mediaContentType' | 'alt'
        > & {
            sources: Array<
              Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>
            >;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
      | ({__typename: 'Video'} & Pick<
          StorefrontAPI.Video,
          'id' | 'mediaContentType' | 'alt'
        > & {
            sources: Array<Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>>;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
    >;
  };
  collections: {
    nodes: Array<Pick<StorefrontAPI.Collection, 'title' | 'handle'>>;
  };
  metafields: Array<
    StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Metafield,
        'id' | 'namespace' | 'key' | 'value' | 'type'
      >
    >
  >;
};

export type ProductSwatchByHandlesQueryVariables = StorefrontAPI.Exact<{
  query: StorefrontAPI.Scalars['String']['input'];
  first: StorefrontAPI.Scalars['Int']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ProductSwatchByHandlesQuery = {
  products: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'handle'> & {
        swatchImage?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          }>;
        }>;
      }
    >;
  };
};

export type ProductQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
  selectedOptions:
    | Array<StorefrontAPI.SelectedOptionInput>
    | StorefrontAPI.SelectedOptionInput;
}>;

export type ProductQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      | 'id'
      | 'title'
      | 'vendor'
      | 'handle'
      | 'descriptionHtml'
      | 'description'
      | 'encodedVariantExistence'
      | 'encodedVariantAvailability'
      | 'tags'
    > & {
      group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      colorLabel?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      colorFamilyKey?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      swatchImage?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<{
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText'>
          >;
        }>;
      }>;
      sustainabilityPartnerLogo?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<{
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText'>
          >;
        }>;
      }>;
      options: Array<
        Pick<StorefrontAPI.ProductOption, 'name'> & {
          optionValues: Array<
            Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
              firstSelectableVariant?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'sku' | 'title'
                > & {
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  variantSwatch?: StorefrontAPI.Maybe<{
                    reference?: StorefrontAPI.Maybe<
                      | Pick<StorefrontAPI.GenericFile, 'url'>
                      | {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                        }
                    >;
                  }>;
                  metafield?: StorefrontAPI.Maybe<{
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        | Pick<StorefrontAPI.GenericFile, 'id' | 'url'>
                        | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                            image?: StorefrontAPI.Maybe<
                              Pick<
                                StorefrontAPI.Image,
                                'url' | 'altText' | 'width' | 'height'
                              >
                            >;
                          })
                      >;
                    }>;
                  }>;
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                  unitPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                }
              >;
              swatch?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                  image?: StorefrontAPI.Maybe<
                    | ({__typename: 'ExternalVideo' | 'Model3d' | 'Video'} & {
                        previewImage?: StorefrontAPI.Maybe<
                          Pick<StorefrontAPI.Image, 'url'>
                        >;
                      })
                    | ({__typename: 'MediaImage'} & {
                        image?: StorefrontAPI.Maybe<
                          Pick<StorefrontAPI.Image, 'url' | 'altText'>
                        >;
                        previewImage?: StorefrontAPI.Maybe<
                          Pick<StorefrontAPI.Image, 'url'>
                        >;
                      })
                  >;
                }
              >;
            }
          >;
        }
      >;
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.ProductVariant,
          'id' | 'availableForSale' | 'sku' | 'title'
        > & {
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          variantSwatch?: StorefrontAPI.Maybe<{
            reference?: StorefrontAPI.Maybe<
              | Pick<StorefrontAPI.GenericFile, 'url'>
              | {
                  image?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.Image, 'url' | 'altText'>
                  >;
                }
            >;
          }>;
          metafield?: StorefrontAPI.Maybe<{
            references?: StorefrontAPI.Maybe<{
              nodes: Array<
                | Pick<StorefrontAPI.GenericFile, 'id' | 'url'>
                | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                  })
              >;
            }>;
          }>;
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
        }
      >;
      adjacentVariants: Array<
        Pick<
          StorefrontAPI.ProductVariant,
          'id' | 'availableForSale' | 'sku' | 'title'
        > & {
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          variantSwatch?: StorefrontAPI.Maybe<{
            reference?: StorefrontAPI.Maybe<
              | Pick<StorefrontAPI.GenericFile, 'url'>
              | {
                  image?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.Image, 'url' | 'altText'>
                  >;
                }
            >;
          }>;
          metafield?: StorefrontAPI.Maybe<{
            references?: StorefrontAPI.Maybe<{
              nodes: Array<
                | Pick<StorefrontAPI.GenericFile, 'id' | 'url'>
                | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                  })
              >;
            }>;
          }>;
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
        }
      >;
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'sku' | 'title'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            variantSwatch?: StorefrontAPI.Maybe<{
              reference?: StorefrontAPI.Maybe<
                | Pick<StorefrontAPI.GenericFile, 'url'>
                | {
                    image?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Image, 'url' | 'altText'>
                    >;
                  }
              >;
            }>;
            metafield?: StorefrontAPI.Maybe<{
              references?: StorefrontAPI.Maybe<{
                nodes: Array<
                  | Pick<StorefrontAPI.GenericFile, 'id' | 'url'>
                  | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'url' | 'altText' | 'width' | 'height'
                        >
                      >;
                    })
                >;
              }>;
            }>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            unitPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
          }
        >;
      };
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
      media: {
        nodes: Array<
          | ({__typename: 'ExternalVideo'} & Pick<
              StorefrontAPI.ExternalVideo,
              'id' | 'embedUrl' | 'host' | 'mediaContentType' | 'alt'
            > & {
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'mediaContentType' | 'alt'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Model3d'} & Pick<
              StorefrontAPI.Model3d,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
        >;
      };
      collections: {
        nodes: Array<Pick<StorefrontAPI.Collection, 'title' | 'handle'>>;
      };
      metafields: Array<
        StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Metafield,
            'id' | 'namespace' | 'key' | 'value' | 'type'
          >
        >
      >;
    }
  >;
  shop: Pick<StorefrontAPI.Shop, 'name'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    globalSustainability?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Metafield, 'value'>
    >;
    globalSustainabilityPartnerLogo?: StorefrontAPI.Maybe<{
      reference?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText'>
        >;
      }>;
    }>;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle'>
    >;
  };
  metaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
            reference?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MediaImage, 'id'> & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              }
            >;
          }
        >;
      }
    >;
  };
  colorSwatches: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value' | 'type'> & {
            reference?: StorefrontAPI.Maybe<{
              image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url' | 'altText'>
              >;
            }>;
          }
        >;
      }
    >;
  };
};

export type RecommendedProductsQueryVariables = StorefrontAPI.Exact<{
  productId: StorefrontAPI.Scalars['ID']['input'];
  count?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type RecommendedProductsQuery = {
  recommended?: StorefrontAPI.Maybe<
    Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'publishedAt'
        | 'handle'
        | 'vendor'
        | 'tags'
        | 'encodedVariantExistence'
        | 'encodedVariantAvailability'
        | 'description'
      > & {
        collections: {
          nodes: Array<
            Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'>
          >;
        };
        group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        material?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        construction?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        pileHeight?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        origin?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isNew?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isBestseller?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        swatchImage?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          }>;
        }>;
        adjacentVariants: Array<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            product: Pick<StorefrontAPI.Product, 'handle'>;
          }
        >;
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name' | 'values'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<{
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                  variantSwatch?: StorefrontAPI.Maybe<{
                    reference?: StorefrontAPI.Maybe<
                      | Pick<StorefrontAPI.GenericFile, 'url'>
                      | {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                        }
                    >;
                  }>;
                  metafield?: StorefrontAPI.Maybe<{
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        | {
                            __typename:
                              | 'Collection'
                              | 'Metaobject'
                              | 'Model3d'
                              | 'Page'
                              | 'Product'
                              | 'ProductVariant'
                              | 'Video';
                          }
                        | ({__typename: 'GenericFile'} & Pick<
                            StorefrontAPI.GenericFile,
                            'url'
                          >)
                        | ({__typename: 'MediaImage'} & {
                            image?: StorefrontAPI.Maybe<
                              Pick<StorefrontAPI.Image, 'url'>
                            >;
                          })
                      >;
                    }>;
                  }>;
                }>;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<
                      | ({__typename: 'ExternalVideo' | 'Model3d' | 'Video'} & {
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                      | ({__typename: 'MediaImage'} & {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                    >;
                  }
                >;
              }
            >;
          }
        >;
        media: {
          nodes: Array<
            | {__typename: 'ExternalVideo' | 'Model3d' | 'Video'}
            | ({__typename: 'MediaImage'} & Pick<
                StorefrontAPI.MediaImage,
                'id'
              > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                })
          >;
        };
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
            }
          >;
        };
      }
    >
  >;
  additional: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'publishedAt'
        | 'handle'
        | 'vendor'
        | 'tags'
        | 'encodedVariantExistence'
        | 'encodedVariantAvailability'
        | 'description'
      > & {
        collections: {
          nodes: Array<
            Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'>
          >;
        };
        group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        material?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        construction?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        pileHeight?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        origin?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isNew?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isBestseller?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        swatchImage?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          }>;
        }>;
        adjacentVariants: Array<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            product: Pick<StorefrontAPI.Product, 'handle'>;
          }
        >;
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name' | 'values'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<{
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                  variantSwatch?: StorefrontAPI.Maybe<{
                    reference?: StorefrontAPI.Maybe<
                      | Pick<StorefrontAPI.GenericFile, 'url'>
                      | {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                        }
                    >;
                  }>;
                  metafield?: StorefrontAPI.Maybe<{
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        | {
                            __typename:
                              | 'Collection'
                              | 'Metaobject'
                              | 'Model3d'
                              | 'Page'
                              | 'Product'
                              | 'ProductVariant'
                              | 'Video';
                          }
                        | ({__typename: 'GenericFile'} & Pick<
                            StorefrontAPI.GenericFile,
                            'url'
                          >)
                        | ({__typename: 'MediaImage'} & {
                            image?: StorefrontAPI.Maybe<
                              Pick<StorefrontAPI.Image, 'url'>
                            >;
                          })
                      >;
                    }>;
                  }>;
                }>;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<
                      | ({__typename: 'ExternalVideo' | 'Model3d' | 'Video'} & {
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                      | ({__typename: 'MediaImage'} & {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                    >;
                  }
                >;
              }
            >;
          }
        >;
        media: {
          nodes: Array<
            | {__typename: 'ExternalVideo' | 'Model3d' | 'Video'}
            | ({__typename: 'MediaImage'} & Pick<
                StorefrontAPI.MediaImage,
                'id'
              > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                })
          >;
        };
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
            }
          >;
        };
      }
    >;
  };
};

export type InspiredProductsQueryVariables = StorefrontAPI.Exact<{
  query: StorefrontAPI.Scalars['String']['input'];
  first: StorefrontAPI.Scalars['Int']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type InspiredProductsQuery = {
  products: {
    edges: Array<{
      node: Pick<StorefrontAPI.Product, 'id' | 'title'> & {
        collections: {
          edges: Array<{
            node: Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
              image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url' | 'altText'>
              >;
            };
          }>;
        };
      };
    }>;
    pageInfo: Pick<StorefrontAPI.PageInfo, 'hasNextPage' | 'endCursor'>;
  };
};

export type TopCollectionsQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type TopCollectionsQuery = {
  collections: {
    edges: Array<{
      node: Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText'>
        >;
      };
    }>;
  };
};

export type IndexAllProductsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  after?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
}>;

export type IndexAllProductsQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'publishedAt'
        | 'handle'
        | 'vendor'
        | 'tags'
        | 'encodedVariantExistence'
        | 'encodedVariantAvailability'
        | 'description'
      > & {
        collections: {
          nodes: Array<
            Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'>
          >;
        };
        group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        material?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        construction?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        pileHeight?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        origin?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isNew?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isBestseller?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        swatchImage?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          }>;
        }>;
        adjacentVariants: Array<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            product: Pick<StorefrontAPI.Product, 'handle'>;
          }
        >;
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name' | 'values'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<{
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                  variantSwatch?: StorefrontAPI.Maybe<{
                    reference?: StorefrontAPI.Maybe<
                      | Pick<StorefrontAPI.GenericFile, 'url'>
                      | {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                        }
                    >;
                  }>;
                  metafield?: StorefrontAPI.Maybe<{
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        | {
                            __typename:
                              | 'Collection'
                              | 'Metaobject'
                              | 'Model3d'
                              | 'Page'
                              | 'Product'
                              | 'ProductVariant'
                              | 'Video';
                          }
                        | ({__typename: 'GenericFile'} & Pick<
                            StorefrontAPI.GenericFile,
                            'url'
                          >)
                        | ({__typename: 'MediaImage'} & {
                            image?: StorefrontAPI.Maybe<
                              Pick<StorefrontAPI.Image, 'url'>
                            >;
                          })
                      >;
                    }>;
                  }>;
                }>;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<
                      | ({__typename: 'ExternalVideo' | 'Model3d' | 'Video'} & {
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                      | ({__typename: 'MediaImage'} & {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                    >;
                  }
                >;
              }
            >;
          }
        >;
        media: {
          nodes: Array<
            | {__typename: 'ExternalVideo' | 'Model3d' | 'Video'}
            | ({__typename: 'MediaImage'} & Pick<
                StorefrontAPI.MediaImage,
                'id'
              > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                })
          >;
        };
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
            }
          >;
        };
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasPreviousPage' | 'hasNextPage' | 'startCursor' | 'endCursor'
    >;
  };
  colorSwatches: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value' | 'type'> & {
            reference?: StorefrontAPI.Maybe<{
              image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url' | 'altText'>
              >;
            }>;
          }
        >;
      }
    >;
  };
};

export type AllProductsPageInfoQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first: StorefrontAPI.Scalars['Int']['input'];
  after?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
}>;

export type AllProductsPageInfoQuery = {
  products: {
    pageInfo: Pick<StorefrontAPI.PageInfo, 'hasNextPage' | 'endCursor'>;
  };
};

export type AllProductsTotalCountQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type AllProductsTotalCountQuery = {
  search: Pick<StorefrontAPI.SearchResultItemConnection, 'totalCount'>;
};

export type RugQuizColorSwatchesQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type RugQuizColorSwatchesQuery = {
  colorSwatches: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value' | 'type'> & {
            reference?: StorefrontAPI.Maybe<{
              image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url' | 'altText'>
              >;
            }>;
          }
        >;
      }
    >;
  };
};

export type SearchCuratedCollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SearchCuratedCollectionsQuery = {
  gabbeh?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
      >;
    }
  >;
  casaBlanc?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
      >;
    }
  >;
  boho?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
      >;
    }
  >;
  runners?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
      >;
    }
  >;
  livingRoom?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
      >;
    }
  >;
};

export type PaginatedProductsSearchQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  filters?: StorefrontAPI.InputMaybe<
    Array<StorefrontAPI.ProductFilter> | StorefrontAPI.ProductFilter
  >;
  sortKey?: StorefrontAPI.InputMaybe<StorefrontAPI.SearchSortKeys>;
  reverse?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Boolean']['input']>;
  searchTerm: StorefrontAPI.Scalars['String']['input'];
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type PaginatedProductsSearchQuery = {
  search: {
    productFilters: Array<
      Pick<StorefrontAPI.Filter, 'id' | 'label' | 'type'> & {
        values: Array<
          Pick<StorefrontAPI.FilterValue, 'id' | 'label' | 'count' | 'input'>
        >;
      }
    >;
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'publishedAt'
        | 'handle'
        | 'vendor'
        | 'tags'
        | 'encodedVariantExistence'
        | 'encodedVariantAvailability'
        | 'description'
      > & {
        collections: {
          nodes: Array<
            Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'>
          >;
        };
        group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        material?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        construction?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        pileHeight?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        origin?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isNew?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isBestseller?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        swatchImage?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          }>;
        }>;
        adjacentVariants: Array<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            product: Pick<StorefrontAPI.Product, 'handle'>;
          }
        >;
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name' | 'values'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<{
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                  variantSwatch?: StorefrontAPI.Maybe<{
                    reference?: StorefrontAPI.Maybe<
                      | Pick<StorefrontAPI.GenericFile, 'url'>
                      | {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                        }
                    >;
                  }>;
                  metafield?: StorefrontAPI.Maybe<{
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        | {
                            __typename:
                              | 'Collection'
                              | 'Metaobject'
                              | 'Model3d'
                              | 'Page'
                              | 'Product'
                              | 'ProductVariant'
                              | 'Video';
                          }
                        | ({__typename: 'GenericFile'} & Pick<
                            StorefrontAPI.GenericFile,
                            'url'
                          >)
                        | ({__typename: 'MediaImage'} & {
                            image?: StorefrontAPI.Maybe<
                              Pick<StorefrontAPI.Image, 'url'>
                            >;
                          })
                      >;
                    }>;
                  }>;
                }>;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<
                      | ({__typename: 'ExternalVideo' | 'Model3d' | 'Video'} & {
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                      | ({__typename: 'MediaImage'} & {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                    >;
                  }
                >;
              }
            >;
          }
        >;
        media: {
          nodes: Array<
            | {__typename: 'ExternalVideo' | 'Model3d' | 'Video'}
            | ({__typename: 'MediaImage'} & Pick<
                StorefrontAPI.MediaImage,
                'id'
              > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                })
          >;
        };
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
            }
          >;
        };
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'startCursor' | 'endCursor' | 'hasNextPage' | 'hasPreviousPage'
    >;
  };
  colorSwatches: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value' | 'type'> & {
            reference?: StorefrontAPI.Maybe<{
              image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url' | 'altText'>
              >;
            }>;
          }
        >;
      }
    >;
  };
};

export type SearchAllProductsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SearchAllProductsQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'publishedAt'
        | 'handle'
        | 'vendor'
        | 'tags'
        | 'encodedVariantExistence'
        | 'encodedVariantAvailability'
        | 'description'
      > & {
        collections: {
          nodes: Array<
            Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'>
          >;
        };
        group?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        material?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        construction?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        pileHeight?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        origin?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isNew?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        isBestseller?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        swatchImage?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          }>;
        }>;
        adjacentVariants: Array<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            product: Pick<StorefrontAPI.Product, 'handle'>;
          }
        >;
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name' | 'values'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<{
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                  variantSwatch?: StorefrontAPI.Maybe<{
                    reference?: StorefrontAPI.Maybe<
                      | Pick<StorefrontAPI.GenericFile, 'url'>
                      | {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                        }
                    >;
                  }>;
                  metafield?: StorefrontAPI.Maybe<{
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        | {
                            __typename:
                              | 'Collection'
                              | 'Metaobject'
                              | 'Model3d'
                              | 'Page'
                              | 'Product'
                              | 'ProductVariant'
                              | 'Video';
                          }
                        | ({__typename: 'GenericFile'} & Pick<
                            StorefrontAPI.GenericFile,
                            'url'
                          >)
                        | ({__typename: 'MediaImage'} & {
                            image?: StorefrontAPI.Maybe<
                              Pick<StorefrontAPI.Image, 'url'>
                            >;
                          })
                      >;
                    }>;
                  }>;
                }>;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<
                      | ({__typename: 'ExternalVideo' | 'Model3d' | 'Video'} & {
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                      | ({__typename: 'MediaImage'} & {
                          image?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        })
                    >;
                  }
                >;
              }
            >;
          }
        >;
        media: {
          nodes: Array<
            | {__typename: 'ExternalVideo' | 'Model3d' | 'Video'}
            | ({__typename: 'MediaImage'} & Pick<
                StorefrontAPI.MediaImage,
                'id'
              > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                })
          >;
        };
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
            }
          >;
        };
      }
    >;
  };
};

export type TrackShipmentProductsQueryVariables = StorefrontAPI.Exact<{
  ids:
    | Array<StorefrontAPI.Scalars['ID']['input']>
    | StorefrontAPI.Scalars['ID']['input'];
}>;

export type TrackShipmentProductsQuery = {
  nodes: Array<
    StorefrontAPI.Maybe<
      | {
          __typename:
            | 'AppliedGiftCard'
            | 'Article'
            | 'Blog'
            | 'Cart'
            | 'CartLine'
            | 'Collection'
            | 'Comment'
            | 'Company'
            | 'CompanyContact'
            | 'CompanyLocation'
            | 'ComponentizableCartLine'
            | 'ExternalVideo'
            | 'GenericFile'
            | 'Location'
            | 'MailingAddress'
            | 'Market'
            | 'MediaImage'
            | 'MediaPresentation'
            | 'Menu'
            | 'MenuItem';
        }
      | {
          __typename:
            | 'Metafield'
            | 'Metaobject'
            | 'Model3d'
            | 'Order'
            | 'Page'
            | 'ProductOption'
            | 'ProductOptionValue'
            | 'Shop'
            | 'ShopPayInstallmentsFinancingPlan'
            | 'ShopPayInstallmentsFinancingPlanTerm'
            | 'ShopPayInstallmentsProductVariantPricing'
            | 'ShopPolicy'
            | 'TaxonomyCategory'
            | 'UrlRedirect'
            | 'Video';
        }
      | ({__typename: 'Product'} & Pick<
          StorefrontAPI.Product,
          'id' | 'handle'
        > & {
            featuredImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          })
      | ({__typename: 'ProductVariant'} & Pick<
          StorefrontAPI.ProductVariant,
          'id'
        > & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
            product: Pick<StorefrontAPI.Product, 'handle'> & {
              featuredImage?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url' | 'altText'>
              >;
            };
          })
    >
  >;
};

export type FallbackSitemapQueryVariables = StorefrontAPI.Exact<{
  productsFirst: StorefrontAPI.Scalars['Int']['input'];
  collectionsFirst: StorefrontAPI.Scalars['Int']['input'];
  pagesFirst: StorefrontAPI.Scalars['Int']['input'];
  articlesFirst: StorefrontAPI.Scalars['Int']['input'];
}>;

export type FallbackSitemapQuery = {
  products: {nodes: Array<Pick<StorefrontAPI.Product, 'handle' | 'updatedAt'>>};
  collections: {
    nodes: Array<Pick<StorefrontAPI.Collection, 'handle' | 'updatedAt'>>;
  };
  pages: {nodes: Array<Pick<StorefrontAPI.Page, 'handle' | 'updatedAt'>>};
  articles: {
    nodes: Array<
      Pick<StorefrontAPI.Article, 'handle' | 'publishedAt'> & {
        blog: Pick<StorefrontAPI.Blog, 'handle'>;
      }
    >;
  };
};

export type GetProductForAddQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type GetProductForAddQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'title'> & {
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'>
      >;
    }
  >;
};

export type AddByHandleCartLinesQueryVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
}>;

export type AddByHandleCartLinesQuery = {
  cart?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Cart, 'id'> & {
      lines: {
        edges: Array<{
          node:
            | (Pick<StorefrontAPI.CartLine, 'quantity'> & {
                merchandise: Pick<StorefrontAPI.ProductVariant, 'id'> & {
                  product: Pick<StorefrontAPI.Product, 'title'>;
                };
              })
            | (Pick<StorefrontAPI.ComponentizableCartLine, 'quantity'> & {
                merchandise: Pick<StorefrontAPI.ProductVariant, 'id'> & {
                  product: Pick<StorefrontAPI.Product, 'title'>;
                };
              });
        }>;
      };
    }
  >;
};

export type PersistCartLinesQueryVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
}>;

export type PersistCartLinesQuery = {
  cart?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Cart, 'id'> & {
      lines: {
        edges: Array<{
          node:
            | (Pick<StorefrontAPI.CartLine, 'quantity'> & {
                merchandise: Pick<StorefrontAPI.ProductVariant, 'id'> & {
                  product: Pick<StorefrontAPI.Product, 'title'>;
                };
              })
            | (Pick<StorefrontAPI.ComponentizableCartLine, 'quantity'> & {
                merchandise: Pick<StorefrontAPI.ProductVariant, 'id'> & {
                  product: Pick<StorefrontAPI.Product, 'title'>;
                };
              });
        }>;
      };
    }
  >;
};

export type ProductNodesQueryVariables = StorefrontAPI.Exact<{
  ids:
    | Array<StorefrontAPI.Scalars['ID']['input']>
    | StorefrontAPI.Scalars['ID']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ProductNodesQuery = {
  nodes: Array<
    StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Product, 'id'> & {
        selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            product: Pick<StorefrontAPI.Product, 'title'>;
          }
        >;
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
              product: Pick<StorefrontAPI.Product, 'title'>;
            }
          >;
        };
      }
    >
  >;
};

export type CustomerFavoritesProductsQueryVariables = StorefrontAPI.Exact<{
  ids:
    | Array<StorefrontAPI.Scalars['ID']['input']>
    | StorefrontAPI.Scalars['ID']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CustomerFavoritesProductsQuery = {
  nodes: Array<
    StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Product,
        'id' | 'handle' | 'title' | 'vendor' | 'publishedAt'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText'>
        >;
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url' | 'altText'>
              >;
            }
          >;
        };
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
      }
    >
  >;
};

export type CartLinesForWebhookQueryVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
}>;

export type CartLinesForWebhookQuery = {
  cart?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Cart, 'id'> & {
      lines: {
        edges: Array<{
          node:
            | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
                merchandise: Pick<StorefrontAPI.ProductVariant, 'id'>;
              })
            | (Pick<
                StorefrontAPI.ComponentizableCartLine,
                'id' | 'quantity'
              > & {merchandise: Pick<StorefrontAPI.ProductVariant, 'id'>});
        }>;
      };
    }
  >;
};

export type CartLinesUpdateForWebhookMutationVariables = StorefrontAPI.Exact<{
  cartId: StorefrontAPI.Scalars['ID']['input'];
  lines:
    | Array<StorefrontAPI.CartLineUpdateInput>
    | StorefrontAPI.CartLineUpdateInput;
}>;

export type CartLinesUpdateForWebhookMutation = {
  cartLinesUpdate?: StorefrontAPI.Maybe<{
    cart?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Cart, 'id'>>;
    userErrors: Array<Pick<StorefrontAPI.CartUserError, 'field' | 'message'>>;
  }>;
};

export type CartLinesRemoveForWebhookMutationVariables = StorefrontAPI.Exact<{
  cartId: StorefrontAPI.Scalars['ID']['input'];
  lineIds:
    | Array<StorefrontAPI.Scalars['ID']['input']>
    | StorefrontAPI.Scalars['ID']['input'];
}>;

export type CartLinesRemoveForWebhookMutation = {
  cartLinesRemove?: StorefrontAPI.Maybe<{
    cart?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Cart, 'id'>>;
    userErrors: Array<Pick<StorefrontAPI.CartUserError, 'field' | 'message'>>;
  }>;
};

export type CartApiQueryFragment = Pick<
  StorefrontAPI.Cart,
  'id' | 'updatedAt' | 'checkoutUrl' | 'totalQuantity'
> & {
  discountCodes: Array<
    Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
  >;
  cost: {
    subtotalAmount: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    totalTaxAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
    >;
    totalDutyAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
    >;
  };
  lines: {
    edges: Array<{
      node:
        | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
            attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
            merchandise: Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'title' | 'availableForSale' | 'sku'
            > & {
              product: Pick<
                StorefrontAPI.Product,
                'id' | 'handle' | 'title' | 'vendor'
              >;
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            };
            cost: {
              totalAmount: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
          })
        | (Pick<StorefrontAPI.ComponentizableCartLine, 'id' | 'quantity'> & {
            attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
            merchandise: Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'title' | 'availableForSale' | 'sku'
            > & {
              product: Pick<
                StorefrontAPI.Product,
                'id' | 'handle' | 'title' | 'vendor'
              >;
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            };
            cost: {
              totalAmount: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
          });
    }>;
  };
};

interface GeneratedQueryTypes {
  '#graphql\n    query getLifestyleCollections($first: Int!) {\n      metaobjects(type: "lifestyle", first: $first) {\n        nodes {\n          id\n          handle\n          name: field(key: "name") { value }\n          description: field(key: "description") { value }\n          collectionName: field(key: "collection_name") { value }\n          image: field(key: "image") {\n            reference {\n              ... on MediaImage {\n                image { url altText width height }\n              }\n              ... on GenericFile {\n                originalFileSize\n                url\n              }\n            }\n          }\n        }\n      }\n    }\n  ': {
    return: GetLifestyleCollectionsQuery;
    variables: GetLifestyleCollectionsQueryVariables;
  };
  '#graphql\n    query getFeaturedMetaobjectById($id: ID!) {\n      metaobject(id: $id) {\n        id\n        type\n        handle\n        name: field(key: "name") { value }\n        description: field(key: "description") { value }\n        collectionRef: field(key: "collection") { reference { ... on Collection { id handle title } } }\n        collectionName: field(key: "collection_name") { value }\n        image: field(key: "image") {\n          reference {\n            ... on MediaImage { image { url altText width height } }\n            ... on GenericFile { url }\n          }\n        }\n      }\n    }\n  ': {
    return: GetFeaturedMetaobjectByIdQuery;
    variables: GetFeaturedMetaobjectByIdQueryVariables;
  };
  '#graphql\n    query getHero($h: MetaobjectHandleInput!) {\n      metaobject(handle: $h) {\n        id\n        handle\n        type\n        heading: field(key: "heading") {\n          value\n        }\n        subHeading: field(key: "sub_heading") {\n          value\n        }\n        heroImage: field(key: "hero_image") {\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n        }\n      }\n    }\n  ': {
    return: GetHeroQuery;
    variables: GetHeroQueryVariables;
  };
  '#graphql\n    query getShopBySizeItems($first: Int!) {\n      metaobjects(type: "shop_by_size", first: $first) {\n        nodes {\n          id\n          handle\n          areaId: field(key: "area_id") {\n            value\n          }\n          name: field(key: "name") {\n            value\n          }\n          sqft: field(key: "sqft") {\n            value\n          }\n          sizeLabel: field(key: "sizeLabel") {\n            value\n          }\n          description: field(key: "description") {\n            value\n          }\n          image: field(key: "image") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                  width\n                  height\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  ': {
    return: GetShopBySizeItemsQuery;
    variables: GetShopBySizeItemsQueryVariables;
  };
  '#graphql\n    query getShopByFabricItems($first: Int!) {\n      metaobjects(type: "shop_by_fabric", first: $first) {\n        nodes {\n          id\n          handle\n          fabricId: field(key: "fabric_id") {\n            value\n          }\n          name: field(key: "name") {\n            value\n          }\n          description: field(key: "description") {\n            value\n          }\n          image: field(key: "image") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                  width\n                  height\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  ': {
    return: GetShopByFabricItemsQuery;
    variables: GetShopByFabricItemsQueryVariables;
  };
  '#graphql\n    query getShopByColorItems($first: Int!) {\n      metaobjects(type: "shop_by_color", first: $first) {\n        nodes {\n          id\n          handle\n          areaId: field(key: "area_id") {\n            value\n          }\n          name: field(key: "name") {\n            value\n          }\n          description: field(key: "description") {\n            value\n          }\n          image: field(key: "Image") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                  width\n                  height\n                }\n              }\n              ... on GenericFile {\n                url\n              }\n            }\n          }\n          imageLower: field(key: "image") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                  width\n                  height\n                }\n              }\n              ... on GenericFile {\n                url\n              }\n            }\n          }\n          color1: field(key: "color_1") {\n            value\n          }\n          color2: field(key: "color_2") {\n            value\n          }\n          color3: field(key: "color_3") {\n            value\n          }\n        }\n      }\n    }\n  ': {
    return: GetShopByColorItemsQuery;
    variables: GetShopByColorItemsQueryVariables;
  };
  '#graphql\n    query getShopByCollaboratorItems($first: Int!) {\n      metaobjects(type: "shop_by_collaborator", first: $first) {\n        nodes {\n          id\n          handle\n          areaId: field(key: "area_id") {\n            value\n          }\n          name: field(key: "name") {\n            value\n          }\n          specialty: field(key: "specialty") {\n            value\n          }\n          description: field(key: "description") {\n            value\n          }\n        }\n      }\n    }\n  ': {
    return: GetShopByCollaboratorItemsQuery;
    variables: GetShopByCollaboratorItemsQueryVariables;
  };
  '#graphql\n    query getFeaturedCollections($first: Int!) {\n      metaobjects(type: "featured_collections", first: $first) {\n        nodes {\n          id\n          handle\n          name: field(key: "name") { value }\n          description: field(key: "description") { value }\n          collectionName: field(key: "collection_name") { value }\n          image: field(key: "image") {\n            reference {\n              ... on MediaImage {\n                image { url altText width height }\n              }\n              ... on GenericFile {\n                originalFileSize\n                url\n              }\n            }\n          }\n        }\n      }\n    }\n  ': {
    return: GetFeaturedCollectionsQuery;
    variables: GetFeaturedCollectionsQueryVariables;
  };
  '#graphql\n    query getFeaturedSpecific($first: Int!) {\n      metaobjects(type: "featured_specific_collection", first: $first) {\n        nodes {\n          id\n          handle\n          name: field(key: "name") { value }\n          description: field(key: "description") { value }\n          collectionRef: field(key: "collection") {\n            reference { ... on Collection { id handle title } }\n          }\n          collectionName: field(key: "collection_name") { value }\n          image: field(key: "image") {\n            reference {\n              ... on MediaImage { image { url altText width height } }\n              ... on GenericFile { url }\n            }\n          }\n        }\n      }\n    }\n  ': {
    return: GetFeaturedSpecificQuery;
    variables: GetFeaturedSpecificQueryVariables;
  };
  '#graphql\n    query getAboutUsImages($h: MetaobjectHandleInput!) {\n      metaobject(handle: $h) {\n        id\n        handle\n        type\n        heroBackgroundImage: field(key: "hero_background_image") {\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n        }\n        brandStoryImage: field(key: "brand_story_image") {\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n        }\n        heritageImage: field(key: "hertiage_image") {\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n        }\n        inspirationImage: field(key: "inspiration_image") {\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n        }\n        sustainabilityImage: field(key: "sustainability_image") {\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n        }\n      }\n    }\n  ': {
    return: GetAboutUsImagesQuery;
    variables: GetAboutUsImagesQueryVariables;
  };
  '#graphql\n  query layout(\n    $language: LanguageCode\n    $headerMenuHandle: String!\n    $footerMenuHandle: String!\n  ) @inContext(language: $language) {\n    shop {\n      ...Shop\n    }\n    headerMenu: menu(handle: $headerMenuHandle) {\n      ...Menu\n    }\n    footerMenu: menu(handle: $footerMenuHandle) {\n      ...Menu\n    }\n  }\n  fragment Shop on Shop {\n    id\n    name\n    description\n    primaryDomain {\n      url\n    }\n    paymentSettings {\n      currencyCode\n    }\n    brand {\n      logo {\n        image {\n          url\n        }\n      }\n    }\n  }\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    tags\n    title\n    type\n    url\n  }\n  fragment ChildMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      id\n      resourceId\n      tags\n      title\n      type\n      url\n    }\n  }\n  fragment ParentMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...ChildMenuItem\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...ParentMenuItem\n    }\n  }\n': {
    return: LayoutQuery;
    variables: LayoutQueryVariables;
  };
  '#graphql\n  query FeaturedCollections($first: Int) {\n    collections(first: $first, sortKey: UPDATED_AT) {\n      nodes {\n        id\n        title\n        handle\n        image {\n          url\n          altText\n          width\n          height\n        }\n      }\n    }\n  }\n': {
    return: FeaturedCollectionsQuery;
    variables: FeaturedCollectionsQueryVariables;
  };
  '#graphql\n      query getShopPrimaryDomain { shop { primaryDomain { url } } }\n    ': {
    return: GetShopPrimaryDomainQuery;
    variables: GetShopPrimaryDomainQueryVariables;
  };
  '#graphql\n  query seoCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    hero: collection(handle: $handle) {\n      ...CollectionContent\n    }\n    shop {\n      name\n      description\n    }\n  }\n  #graphql\n  fragment CollectionContent on Collection {\n    id\n    handle\n    title\n    descriptionHtml\n    heading: metafield(namespace: "hero", key: "title") {\n      value\n    }\n    byline: metafield(namespace: "hero", key: "byline") {\n      value\n    }\n    cta: metafield(namespace: "hero", key: "cta") {\n      value\n    }\n    spread: metafield(namespace: "hero", key: "spread") {\n      reference {\n        ...Media\n      }\n    }\n    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {\n      reference {\n        ...Media\n      }\n    }\n  }\n  #graphql\n  fragment Media on Media {\n    __typename\n    mediaContentType\n    alt\n    previewImage {\n      url\n    }\n    ... on MediaImage {\n      id\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    ... on Video {\n      id\n      sources {\n        mimeType\n        url\n      }\n    }\n    ... on Model3d {\n      id\n      sources {\n        mimeType\n        url\n      }\n    }\n    ... on ExternalVideo {\n      id\n      embedUrl\n      host\n    }\n  }\n\n\n': {
    return: SeoCollectionContentQuery;
    variables: SeoCollectionContentQueryVariables;
  };
  '#graphql\n  query heroCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    hero: collection(handle: $handle) {\n      ...CollectionContent\n    }\n  }\n  #graphql\n  fragment CollectionContent on Collection {\n    id\n    handle\n    title\n    descriptionHtml\n    heading: metafield(namespace: "hero", key: "title") {\n      value\n    }\n    byline: metafield(namespace: "hero", key: "byline") {\n      value\n    }\n    cta: metafield(namespace: "hero", key: "cta") {\n      value\n    }\n    spread: metafield(namespace: "hero", key: "spread") {\n      reference {\n        ...Media\n      }\n    }\n    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {\n      reference {\n        ...Media\n      }\n    }\n  }\n  #graphql\n  fragment Media on Media {\n    __typename\n    mediaContentType\n    alt\n    previewImage {\n      url\n    }\n    ... on MediaImage {\n      id\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    ... on Video {\n      id\n      sources {\n        mimeType\n        url\n      }\n    }\n    ... on Model3d {\n      id\n      sources {\n        mimeType\n        url\n      }\n    }\n    ... on ExternalVideo {\n      id\n      embedUrl\n      host\n    }\n  }\n\n\n': {
    return: HeroCollectionContentQuery;
    variables: HeroCollectionContentQueryVariables;
  };
  '#graphql\n  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    products(first: 24, sortKey: BEST_SELLING) {\n      nodes {\n        ...ProductCard\n      }\n    }\n    colorSwatches: metaobjects(type: "shopify--color-pattern", first: 50) {\n      nodes {\n        id\n        handle\n        fields {\n          key\n          value\n          type\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    collections(first: 10) {\n      nodes {\n        id\n        title\n        handle\n      }\n    }\n    group: metafield(namespace: "custom", key: "group") {\n      value\n    }\n    material: metafield(namespace: "custom", key: "material") {\n      value\n    }\n    construction: metafield(namespace: "custom", key: "construction") {\n      value\n    }\n    pileHeight: metafield(namespace: "custom", key: "pile_height") {\n      value\n    }\n    origin: metafield(namespace: "custom", key: "origin") {\n      value\n    }\n    isNew: metafield(namespace: "custom", key: "is_new") {\n      value\n    }\n    isBestseller: metafield(namespace: "custom", key: "is_bestseller") {\n      value\n    }\n    swatchImage: metafield(namespace: "custom", key: "swatch_color") {\n      reference {\n        ... on MediaImage {\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n    encodedVariantExistence\n    encodedVariantAvailability\n    adjacentVariants {\n      id\n      availableForSale\n      selectedOptions {\n        name\n        value\n      }\n      product {\n        handle\n      }\n    }\n    options {\n      name\n      values\n      optionValues {\n        name\n        firstSelectableVariant {\n          selectedOptions {\n            name\n            value\n          }\n          product {\n            handle\n          }\n          variantSwatch: metafield(namespace: "custom", key: "variant_swatch") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                }\n              }\n              ... on GenericFile {\n                url\n              }\n            }\n          }\n          metafield(namespace: "custom", key: "variant_images") {\n            references(first: 1) {\n              nodes {\n                __typename\n                ... on MediaImage {\n                  image {\n                    url\n                  }\n                }\n                ... on GenericFile {\n                  url\n                }\n              }\n            }\n          }\n        }\n        swatch {\n          color\n          image {\n            __typename\n            previewImage {\n              url\n            }\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n    description\n    media(first: 16) {\n      nodes {\n        __typename\n        ... on MediaImage {\n          id\n          image {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n    }\n    variants(first: 25) {\n      nodes {\n        id\n        availableForSale\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          handle\n          title\n        }\n      }\n    }\n  }\n\n': {
    return: HomepageFeaturedProductsQuery;
    variables: HomepageFeaturedProductsQueryVariables;
  };
  '#graphql\n  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    collections(\n      first: 50,\n      sortKey: UPDATED_AT,\n      reverse: true\n    ) {\n      nodes {\n        id\n        title\n        handle\n        image {\n          altText\n          width\n          height\n          url\n        }\n      }\n    }\n  }\n': {
    return: HomepageFeaturedCollectionsQuery;
    variables: HomepageFeaturedCollectionsQueryVariables;
  };
  '#graphql\n  query homepageLifestyleCollections($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    featured: collection(handle: "shopify-products-collections") {\n      id\n      title\n      handle\n      image {\n        altText\n        width\n        height\n        url\n      }\n    }\n    lifestyle: collection(handle: "lifestyle") {\n      id\n      title\n      handle\n      image {\n        altText\n        width\n        height\n        url\n      }\n    }\n    ecoFriendly: collection(handle: "eco-friendly") {\n      id\n      title\n      handle\n      image {\n        altText\n        width\n        height\n        url\n      }\n    }\n    sustainability: collection(handle: "sustainability") {\n      id\n      title\n      handle\n      image {\n        altText\n        width\n        height\n        url\n      }\n    }\n  }\n': {
    return: HomepageLifestyleCollectionsQuery;
    variables: HomepageLifestyleCollectionsQueryVariables;
  };
  '#graphql\n  query rugFinderSection($handle: MetaobjectHandleInput!, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    metaobject(handle: $handle) {\n      id\n      handle\n      type\n      heading: field(key: "heading") { value }\n      subHeading: field(key: "sub_heading") { value }\n      buttonText: field(key: "button_text") { value }\n      link: field(key: "link") { value }\n      image: field(key: "image") {\n        reference {\n          __typename\n          ... on MediaImage {\n            image { url altText width height }\n          }\n        }\n      }\n    }\n  }\n': {
    return: RugFinderSectionQuery;
    variables: RugFinderSectionQueryVariables;
  };
  '#graphql\n  query Testimonials($first: Int = 12, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    metaobjects(type: "testimonials", first: $first, sortKey: "updated_at", reverse: true) {\n      nodes {\n        id\n        handle\n        title: field(key: "title") { value }\n        quote: field(key: "quote") { value }\n        authorName: field(key: "author_name") { value }\n        role: field(key: "role") { value }\n        rating: field(key: "rating") { value }\n        featured: field(key: "featured") { value }\n        avatar: field(key: "avatar") {\n          reference {\n            __typename\n            ... on MediaImage {\n              image { url altText width height }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: TestimonialsQuery;
    variables: TestimonialsQueryVariables;
  };
  '#graphql\n  query AccountFavoritesProducts($ids: [ID!]!, $language: LanguageCode)\n  @inContext(language: $language) {\n    nodes(ids: $ids) {\n      ... on Product {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    collections(first: 10) {\n      nodes {\n        id\n        title\n        handle\n      }\n    }\n    group: metafield(namespace: "custom", key: "group") {\n      value\n    }\n    material: metafield(namespace: "custom", key: "material") {\n      value\n    }\n    construction: metafield(namespace: "custom", key: "construction") {\n      value\n    }\n    pileHeight: metafield(namespace: "custom", key: "pile_height") {\n      value\n    }\n    origin: metafield(namespace: "custom", key: "origin") {\n      value\n    }\n    isNew: metafield(namespace: "custom", key: "is_new") {\n      value\n    }\n    isBestseller: metafield(namespace: "custom", key: "is_bestseller") {\n      value\n    }\n    swatchImage: metafield(namespace: "custom", key: "swatch_color") {\n      reference {\n        ... on MediaImage {\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n    encodedVariantExistence\n    encodedVariantAvailability\n    adjacentVariants {\n      id\n      availableForSale\n      selectedOptions {\n        name\n        value\n      }\n      product {\n        handle\n      }\n    }\n    options {\n      name\n      values\n      optionValues {\n        name\n        firstSelectableVariant {\n          selectedOptions {\n            name\n            value\n          }\n          product {\n            handle\n          }\n          variantSwatch: metafield(namespace: "custom", key: "variant_swatch") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                }\n              }\n              ... on GenericFile {\n                url\n              }\n            }\n          }\n          metafield(namespace: "custom", key: "variant_images") {\n            references(first: 1) {\n              nodes {\n                __typename\n                ... on MediaImage {\n                  image {\n                    url\n                  }\n                }\n                ... on GenericFile {\n                  url\n                }\n              }\n            }\n          }\n        }\n        swatch {\n          color\n          image {\n            __typename\n            previewImage {\n              url\n            }\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n    description\n    media(first: 16) {\n      nodes {\n        __typename\n        ... on MediaImage {\n          id\n          image {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n    }\n    variants(first: 25) {\n      nodes {\n        id\n        availableForSale\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          handle\n          title\n        }\n      }\n    }\n  }\n\n': {
    return: AccountFavoritesProductsQuery;
    variables: AccountFavoritesProductsQueryVariables;
  };
  '#graphql\n  query ApiProductCard(\n    $handle: String!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      ...ProductCard\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    collections(first: 10) {\n      nodes {\n        id\n        title\n        handle\n      }\n    }\n    group: metafield(namespace: "custom", key: "group") {\n      value\n    }\n    material: metafield(namespace: "custom", key: "material") {\n      value\n    }\n    construction: metafield(namespace: "custom", key: "construction") {\n      value\n    }\n    pileHeight: metafield(namespace: "custom", key: "pile_height") {\n      value\n    }\n    origin: metafield(namespace: "custom", key: "origin") {\n      value\n    }\n    isNew: metafield(namespace: "custom", key: "is_new") {\n      value\n    }\n    isBestseller: metafield(namespace: "custom", key: "is_bestseller") {\n      value\n    }\n    swatchImage: metafield(namespace: "custom", key: "swatch_color") {\n      reference {\n        ... on MediaImage {\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n    encodedVariantExistence\n    encodedVariantAvailability\n    adjacentVariants {\n      id\n      availableForSale\n      selectedOptions {\n        name\n        value\n      }\n      product {\n        handle\n      }\n    }\n    options {\n      name\n      values\n      optionValues {\n        name\n        firstSelectableVariant {\n          selectedOptions {\n            name\n            value\n          }\n          product {\n            handle\n          }\n          variantSwatch: metafield(namespace: "custom", key: "variant_swatch") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                }\n              }\n              ... on GenericFile {\n                url\n              }\n            }\n          }\n          metafield(namespace: "custom", key: "variant_images") {\n            references(first: 1) {\n              nodes {\n                __typename\n                ... on MediaImage {\n                  image {\n                    url\n                  }\n                }\n                ... on GenericFile {\n                  url\n                }\n              }\n            }\n          }\n        }\n        swatch {\n          color\n          image {\n            __typename\n            previewImage {\n              url\n            }\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n    description\n    media(first: 16) {\n      nodes {\n        __typename\n        ... on MediaImage {\n          id\n          image {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n    }\n    variants(first: 25) {\n      nodes {\n        id\n        availableForSale\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          handle\n          title\n        }\n      }\n    }\n  }\n\n': {
    return: ApiProductCardQuery;
    variables: ApiProductCardQueryVariables;
  };
  '#graphql\n  query ApiColorSwatches($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    colorSwatches: metaobjects(type: "shopify--color-pattern", first: 50) {\n      nodes {\n        id\n        handle\n        fields {\n          key\n          value\n          type\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: ApiColorSwatchesQuery;
    variables: ApiColorSwatchesQueryVariables;
  };
  '#graphql\n  query ApiAllProducts(\n    $query: String\n    $count: Int\n    $reverse: Boolean\n    $country: CountryCode\n    $language: LanguageCode\n    $sortKey: ProductSortKeys\n  ) @inContext(country: $country, language: $language) {\n    products(first: $count, sortKey: $sortKey, reverse: $reverse, query: $query) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    collections(first: 10) {\n      nodes {\n        id\n        title\n        handle\n      }\n    }\n    group: metafield(namespace: "custom", key: "group") {\n      value\n    }\n    material: metafield(namespace: "custom", key: "material") {\n      value\n    }\n    construction: metafield(namespace: "custom", key: "construction") {\n      value\n    }\n    pileHeight: metafield(namespace: "custom", key: "pile_height") {\n      value\n    }\n    origin: metafield(namespace: "custom", key: "origin") {\n      value\n    }\n    isNew: metafield(namespace: "custom", key: "is_new") {\n      value\n    }\n    isBestseller: metafield(namespace: "custom", key: "is_bestseller") {\n      value\n    }\n    swatchImage: metafield(namespace: "custom", key: "swatch_color") {\n      reference {\n        ... on MediaImage {\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n    encodedVariantExistence\n    encodedVariantAvailability\n    adjacentVariants {\n      id\n      availableForSale\n      selectedOptions {\n        name\n        value\n      }\n      product {\n        handle\n      }\n    }\n    options {\n      name\n      values\n      optionValues {\n        name\n        firstSelectableVariant {\n          selectedOptions {\n            name\n            value\n          }\n          product {\n            handle\n          }\n          variantSwatch: metafield(namespace: "custom", key: "variant_swatch") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                }\n              }\n              ... on GenericFile {\n                url\n              }\n            }\n          }\n          metafield(namespace: "custom", key: "variant_images") {\n            references(first: 1) {\n              nodes {\n                __typename\n                ... on MediaImage {\n                  image {\n                    url\n                  }\n                }\n                ... on GenericFile {\n                  url\n                }\n              }\n            }\n          }\n        }\n        swatch {\n          color\n          image {\n            __typename\n            previewImage {\n              url\n            }\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n    description\n    media(first: 16) {\n      nodes {\n        __typename\n        ... on MediaImage {\n          id\n          image {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n    }\n    variants(first: 25) {\n      nodes {\n        id\n        availableForSale\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          handle\n          title\n        }\n      }\n    }\n  }\n\n': {
    return: ApiAllProductsQuery;
    variables: ApiAllProductsQueryVariables;
  };
  '#graphql\n  query ArticleDetails(\n    $language: LanguageCode\n    $blogHandle: String!\n    $articleHandle: String!\n  ) @inContext(language: $language) {\n    blog(handle: $blogHandle) {\n      articleByHandle(handle: $articleHandle) {\n        title\n        contentHtml\n        publishedAt\n        handle\n        author: authorV2 {\n          name\n        }\n        image {\n          id\n          altText\n          url\n          width\n          height\n        }\n        seo {\n          description\n          title\n        }\n      }\n\n      articles(first: 9) {\n        edges {\n          node {\n            id\n            handle\n            title\n            publishedAt\n            excerpt\n            excerptHtml\n            contentHtml\n            image {\n              id\n              altText\n              url\n              width\n              height\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: ArticleDetailsQuery;
    variables: ArticleDetailsQueryVariables;
  };
  '#graphql\n  query Blog(\n    $language: LanguageCode\n    $blogHandle: String!\n    $pageBy: Int!\n    $cursor: String\n  ) @inContext(language: $language) {\n    blog(handle: $blogHandle) {\n      id\n      handle\n      title\n      seo {\n        title\n        description\n      }\n      articles(first: $pageBy, after: $cursor) {\n        edges {\n          node {\n            ...Article\n          }\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n\n  fragment Article on Article {\n    author: authorV2 {\n      name\n    }\n    contentHtml\n    excerpt\n    excerptHtml\n    handle\n    id\n    image {\n      id\n      altText\n      url\n      width\n      height\n    }\n    publishedAt\n    title\n  }\n': {
    return: BlogQuery;
    variables: BlogQueryVariables;
  };
  '#graphql\n            query RouteCartLines($id: ID!) {\n              cart(id: $id) {\n                id\n                updatedAt\n                lines(first: 100) {\n                  edges { node { quantity merchandise { ... on ProductVariant { id product { title } } } } }\n                }\n              }\n            }\n          ': {
    return: RouteCartLinesQuery;
    variables: RouteCartLinesQueryVariables;
  };
  '#graphql\n  query CollectionDetails(\n    $handle: String!\n    $country: CountryCode\n    $language: LanguageCode\n    $filters: [ProductFilter!]\n    $sortKey: ProductCollectionSortKeys!\n    $reverse: Boolean\n    $first: Int!\n    $after: String\n  ) @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      id\n      handle\n      title\n      description\n      collectionIntroHeader: metafield(namespace: "custom", key: "collectionintroheader") {\n        value\n      }\n      collectionIntroFooter: metafield(namespace: "custom", key: "collectionintrofooter") {\n        value\n      }\n      seo {\n        description\n        title\n      }\n      image {\n        id\n        url\n        width\n        height\n        altText\n      }\n      products(\n        first: $first\n        after: $after\n        filters: $filters,\n        sortKey: $sortKey,\n        reverse: $reverse\n      ) {\n        filters {\n          id\n          label\n          type\n          values {\n            id\n            label\n            count\n            input\n          }\n        }\n        nodes {\n          ...ProductCard\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n    collections(first: 100) {\n      edges {\n        node {\n          title\n          handle\n        }\n      }\n    }\n    colorSwatches: metaobjects(type: "shopify--color-pattern", first: 50) {\n      nodes {\n        id\n        handle\n        fields {\n          key\n          value\n          type\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    collections(first: 10) {\n      nodes {\n        id\n        title\n        handle\n      }\n    }\n    group: metafield(namespace: "custom", key: "group") {\n      value\n    }\n    material: metafield(namespace: "custom", key: "material") {\n      value\n    }\n    construction: metafield(namespace: "custom", key: "construction") {\n      value\n    }\n    pileHeight: metafield(namespace: "custom", key: "pile_height") {\n      value\n    }\n    origin: metafield(namespace: "custom", key: "origin") {\n      value\n    }\n    isNew: metafield(namespace: "custom", key: "is_new") {\n      value\n    }\n    isBestseller: metafield(namespace: "custom", key: "is_bestseller") {\n      value\n    }\n    swatchImage: metafield(namespace: "custom", key: "swatch_color") {\n      reference {\n        ... on MediaImage {\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n    encodedVariantExistence\n    encodedVariantAvailability\n    adjacentVariants {\n      id\n      availableForSale\n      selectedOptions {\n        name\n        value\n      }\n      product {\n        handle\n      }\n    }\n    options {\n      name\n      values\n      optionValues {\n        name\n        firstSelectableVariant {\n          selectedOptions {\n            name\n            value\n          }\n          product {\n            handle\n          }\n          variantSwatch: metafield(namespace: "custom", key: "variant_swatch") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                }\n              }\n              ... on GenericFile {\n                url\n              }\n            }\n          }\n          metafield(namespace: "custom", key: "variant_images") {\n            references(first: 1) {\n              nodes {\n                __typename\n                ... on MediaImage {\n                  image {\n                    url\n                  }\n                }\n                ... on GenericFile {\n                  url\n                }\n              }\n            }\n          }\n        }\n        swatch {\n          color\n          image {\n            __typename\n            previewImage {\n              url\n            }\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n    description\n    media(first: 16) {\n      nodes {\n        __typename\n        ... on MediaImage {\n          id\n          image {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n    }\n    variants(first: 25) {\n      nodes {\n        id\n        availableForSale\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          handle\n          title\n        }\n      }\n    }\n  }\n\n': {
    return: CollectionDetailsQuery;
    variables: CollectionDetailsQueryVariables;
  };
  '#graphql\n  query CollectionPageInfo(\n    $handle: String!\n    $country: CountryCode\n    $language: LanguageCode\n    $filters: [ProductFilter!]\n    $sortKey: ProductCollectionSortKeys!\n    $reverse: Boolean\n    $first: Int!\n    $after: String\n  ) @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      products(\n        first: $first\n        after: $after\n        filters: $filters\n        sortKey: $sortKey\n        reverse: $reverse\n      ) {\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n': {
    return: CollectionPageInfoQuery;
    variables: CollectionPageInfoQueryVariables;
  };
  '#graphql\n  query Collections(\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(country: $country, language: $language) {\n    collections(first: $first, last: $last, before: $startCursor, after: $endCursor) {\n      nodes {\n        id\n        title\n        description\n        handle\n        seo {\n          description\n          title\n        }\n        image {\n          id\n          url\n          width\n          height\n          altText\n        }\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n': {
    return: CollectionsQuery;
    variables: CollectionsQueryVariables;
  };
  '#graphql\n  query RouteFavoritesProducts($ids: [ID!]!, $language: LanguageCode)\n  @inContext(language: $language) {\n    nodes(ids: $ids) {\n      ... on Product {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    collections(first: 10) {\n      nodes {\n        id\n        title\n        handle\n      }\n    }\n    group: metafield(namespace: "custom", key: "group") {\n      value\n    }\n    material: metafield(namespace: "custom", key: "material") {\n      value\n    }\n    construction: metafield(namespace: "custom", key: "construction") {\n      value\n    }\n    pileHeight: metafield(namespace: "custom", key: "pile_height") {\n      value\n    }\n    origin: metafield(namespace: "custom", key: "origin") {\n      value\n    }\n    isNew: metafield(namespace: "custom", key: "is_new") {\n      value\n    }\n    isBestseller: metafield(namespace: "custom", key: "is_bestseller") {\n      value\n    }\n    swatchImage: metafield(namespace: "custom", key: "swatch_color") {\n      reference {\n        ... on MediaImage {\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n    encodedVariantExistence\n    encodedVariantAvailability\n    adjacentVariants {\n      id\n      availableForSale\n      selectedOptions {\n        name\n        value\n      }\n      product {\n        handle\n      }\n    }\n    options {\n      name\n      values\n      optionValues {\n        name\n        firstSelectableVariant {\n          selectedOptions {\n            name\n            value\n          }\n          product {\n            handle\n          }\n          variantSwatch: metafield(namespace: "custom", key: "variant_swatch") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                }\n              }\n              ... on GenericFile {\n                url\n              }\n            }\n          }\n          metafield(namespace: "custom", key: "variant_images") {\n            references(first: 1) {\n              nodes {\n                __typename\n                ... on MediaImage {\n                  image {\n                    url\n                  }\n                }\n                ... on GenericFile {\n                  url\n                }\n              }\n            }\n          }\n        }\n        swatch {\n          color\n          image {\n            __typename\n            previewImage {\n              url\n            }\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n    description\n    media(first: 16) {\n      nodes {\n        __typename\n        ... on MediaImage {\n          id\n          image {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n    }\n    variants(first: 25) {\n      nodes {\n        id\n        availableForSale\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          handle\n          title\n        }\n      }\n    }\n  }\n\n': {
    return: RouteFavoritesProductsQuery;
    variables: RouteFavoritesProductsQueryVariables;
  };
  '#graphql\n  query FeaturedColorSwatches($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    colorSwatches: metaobjects(type: "shopify--color-pattern", first: 50) {\n      nodes {\n        id\n        handle\n        fields {\n          key\n          value\n          type\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: FeaturedColorSwatchesQuery;
    variables: FeaturedColorSwatchesQueryVariables;
  };
  '#graphql\n  query FeaturedItems(\n    $country: CountryCode\n    $language: LanguageCode\n    $pageBy: Int = 12\n  ) @inContext(country: $country, language: $language) {\n    featuredCollections: collections(first: 3, sortKey: UPDATED_AT) {\n      nodes {\n        ...FeaturedCollectionDetails\n      }\n    }\n    featuredProducts: products(first: $pageBy) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    collections(first: 10) {\n      nodes {\n        id\n        title\n        handle\n      }\n    }\n    group: metafield(namespace: "custom", key: "group") {\n      value\n    }\n    material: metafield(namespace: "custom", key: "material") {\n      value\n    }\n    construction: metafield(namespace: "custom", key: "construction") {\n      value\n    }\n    pileHeight: metafield(namespace: "custom", key: "pile_height") {\n      value\n    }\n    origin: metafield(namespace: "custom", key: "origin") {\n      value\n    }\n    isNew: metafield(namespace: "custom", key: "is_new") {\n      value\n    }\n    isBestseller: metafield(namespace: "custom", key: "is_bestseller") {\n      value\n    }\n    swatchImage: metafield(namespace: "custom", key: "swatch_color") {\n      reference {\n        ... on MediaImage {\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n    encodedVariantExistence\n    encodedVariantAvailability\n    adjacentVariants {\n      id\n      availableForSale\n      selectedOptions {\n        name\n        value\n      }\n      product {\n        handle\n      }\n    }\n    options {\n      name\n      values\n      optionValues {\n        name\n        firstSelectableVariant {\n          selectedOptions {\n            name\n            value\n          }\n          product {\n            handle\n          }\n          variantSwatch: metafield(namespace: "custom", key: "variant_swatch") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                }\n              }\n              ... on GenericFile {\n                url\n              }\n            }\n          }\n          metafield(namespace: "custom", key: "variant_images") {\n            references(first: 1) {\n              nodes {\n                __typename\n                ... on MediaImage {\n                  image {\n                    url\n                  }\n                }\n                ... on GenericFile {\n                  url\n                }\n              }\n            }\n          }\n        }\n        swatch {\n          color\n          image {\n            __typename\n            previewImage {\n              url\n            }\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n    description\n    media(first: 16) {\n      nodes {\n        __typename\n        ... on MediaImage {\n          id\n          image {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n    }\n    variants(first: 25) {\n      nodes {\n        id\n        availableForSale\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          handle\n          title\n        }\n      }\n    }\n  }\n\n  #graphql\n  fragment FeaturedCollectionDetails on Collection {\n    id\n    title\n    handle\n    image {\n      altText\n      width\n      height\n      url\n    }\n  }\n\n': {
    return: FeaturedItemsQuery;
    variables: FeaturedItemsQueryVariables;
  };
  '#graphql\n  query PageDetails($language: LanguageCode, $handle: String!)\n  @inContext(language: $language) {\n    page(handle: $handle) {\n      id\n      title\n      body\n      seo {\n        description\n        title\n      }\n    }\n  }\n': {
    return: PageDetailsQuery;
    variables: PageDetailsQueryVariables;
  };
  '#graphql\n  fragment PolicyHandle on ShopPolicy {\n    body\n    handle\n    id\n    title\n    url\n  }\n\n  query PoliciesHandle(\n    $language: LanguageCode\n    $privacyPolicy: Boolean!\n    $shippingPolicy: Boolean!\n    $termsOfService: Boolean!\n    $refundPolicy: Boolean!\n  ) @inContext(language: $language) {\n    shop {\n      privacyPolicy @include(if: $privacyPolicy) {\n        ...PolicyHandle\n      }\n      shippingPolicy @include(if: $shippingPolicy) {\n        ...PolicyHandle\n      }\n      termsOfService @include(if: $termsOfService) {\n        ...PolicyHandle\n      }\n      refundPolicy @include(if: $refundPolicy) {\n        ...PolicyHandle\n      }\n    }\n  }\n': {
    return: PoliciesHandleQuery;
    variables: PoliciesHandleQueryVariables;
  };
  '#graphql\n  fragment PolicyIndex on ShopPolicy {\n    id\n    title\n    handle\n  }\n\n  query PoliciesIndex {\n    shop {\n      privacyPolicy {\n        ...PolicyIndex\n      }\n      shippingPolicy {\n        ...PolicyIndex\n      }\n      termsOfService {\n        ...PolicyIndex\n      }\n      refundPolicy {\n        ...PolicyIndex\n      }\n      subscriptionPolicy {\n        id\n        title\n        handle\n      }\n    }\n  }\n': {
    return: PoliciesIndexQuery;
    variables: PoliciesIndexQueryVariables;
  };
  '#graphql\n  query ProductSwatchByHandles(\n    $query: String!\n    $first: Int!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    products(first: $first, query: $query) {\n      nodes {\n        handle\n        swatchImage: metafield(namespace: "custom", key: "swatch_color") {\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: ProductSwatchByHandlesQuery;
    variables: ProductSwatchByHandlesQueryVariables;
  };
  '#graphql\n  query Product(\n    $country: CountryCode\n    $language: LanguageCode\n    $handle: String!\n    $selectedOptions: [SelectedOptionInput!]!\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      ...Product\n    }\n    shop {\n      name\n      primaryDomain {\n        url\n      }\n      globalSustainability: metafield(namespace: "custom", key: "sustainability") {\n        value\n      }\n      globalSustainabilityPartnerLogo: metafield(namespace: "custom", key: "sustainability_partner_logo") {\n        reference {\n          ... on MediaImage {\n            image {\n              url\n              altText\n            }\n          }\n        }\n      }\n      shippingPolicy {\n        body\n        handle\n      }\n      refundPolicy {\n        body\n        handle\n      }\n    }\n    metaobjects(type: "size_guide", first: 10) {\n      nodes {\n        id\n        handle\n        fields {\n          key\n          value\n          reference {\n            ... on MediaImage {\n              id\n              image {\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n        }\n      }\n    }\n    colorSwatches: metaobjects(type: "shopify--color-pattern", first: 50) {\n      nodes {\n        id\n        handle\n        fields {\n          key\n          value\n          type\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment Media on Media {\n    __typename\n    mediaContentType\n    alt\n    previewImage {\n      url\n    }\n    ... on MediaImage {\n      id\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    ... on Video {\n      id\n      sources {\n        mimeType\n        url\n      }\n    }\n    ... on Model3d {\n      id\n      sources {\n        mimeType\n        url\n      }\n    }\n    ... on ExternalVideo {\n      id\n      embedUrl\n      host\n    }\n  }\n\n  #graphql\n  fragment Product on Product {\n    id\n    title\n    vendor\n    handle\n    group: metafield(namespace: "custom", key: "group") {\n      value\n    }\n    colorLabel: metafield(namespace: "custom", key: "color_label") {\n      value\n    }\n    colorFamilyKey: metafield(namespace: "custom", key: "color_family_key") {\n      value\n    }\n    swatchImage: metafield(namespace: "custom", key: "swatch_color") {\n      reference {\n        ... on MediaImage {\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n    sustainabilityPartnerLogo: metafield(namespace: "custom", key: "sustainability_partner_logo") {\n      reference {\n        ... on MediaImage {\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n    descriptionHtml\n    description\n    encodedVariantExistence\n    encodedVariantAvailability\n    options {\n      name\n      optionValues {\n        name\n        firstSelectableVariant {\n          ...ProductVariant\n        }\n        swatch {\n          color\n          image {\n            __typename\n            previewImage {\n              url\n            }\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {\n      ...ProductVariant\n    }\n    adjacentVariants (selectedOptions: $selectedOptions) {\n      ...ProductVariant\n    }\n    variants(first: 100) {\n      nodes {\n        ...ProductVariant\n      }\n    }\n    seo {\n      description\n      title\n    }\n    tags\n    media(first: 20) {\n      nodes {\n        ...Media\n      }\n    }\n    collections(first: 1) {\n      nodes {\n        title\n        handle\n      }\n    }\n    metafields(identifiers: [\n      {namespace: "custom", key: "specifications"},\n      {namespace: "custom", key: "washing_instructions"},\n      {namespace: "custom", key: "extra_description"},\n      {namespace: "custom", key: "price_note"},\n      {namespace: "custom", key: "sustainability"},\n      {namespace: "custom", key: "sustainability_partner_logo"},\n      {namespace: "specs", key: "size"},\n      {namespace: "specs", key: "thickness"},\n      {namespace: "specs", key: "weight"},\n      {namespace: "specs", key: "material"},\n      {namespace: "specs", key: "backing"},\n      {namespace: "specs", key: "edge"},\n      {namespace: "care", key: "washing_instructions"}\n    ]) {\n      id\n      namespace\n      key\n      value\n      type\n    }\n  }\n  #graphql\n  fragment ProductVariant on ProductVariant {\n    id\n    availableForSale\n    selectedOptions {\n      name\n      value\n    }\n    variantSwatch: metafield(namespace: "custom", key: "variant_swatch") {\n      reference {\n        ... on MediaImage {\n          image {\n            url\n            altText\n          }\n        }\n        ... on GenericFile {\n          url\n        }\n      }\n    }\n    metafield(namespace: "custom", key: "variant_images") {\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            image {\n              url\n              altText\n              width\n              height\n            }\n          }\n          ... on GenericFile {\n            id\n            url\n          }\n        }\n      }\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    sku\n    title\n    unitPrice {\n      amount\n      currencyCode\n    }\n    product {\n      title\n      handle\n    }\n  }\n\n\n': {
    return: ProductQuery;
    variables: ProductQueryVariables;
  };
  '#graphql\n  query RecommendedProducts(\n    $productId: ID!\n    $count: Int\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    recommended: productRecommendations(productId: $productId) {\n      ...ProductCard\n    }\n    additional: products(first: $count, sortKey: BEST_SELLING) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    collections(first: 10) {\n      nodes {\n        id\n        title\n        handle\n      }\n    }\n    group: metafield(namespace: "custom", key: "group") {\n      value\n    }\n    material: metafield(namespace: "custom", key: "material") {\n      value\n    }\n    construction: metafield(namespace: "custom", key: "construction") {\n      value\n    }\n    pileHeight: metafield(namespace: "custom", key: "pile_height") {\n      value\n    }\n    origin: metafield(namespace: "custom", key: "origin") {\n      value\n    }\n    isNew: metafield(namespace: "custom", key: "is_new") {\n      value\n    }\n    isBestseller: metafield(namespace: "custom", key: "is_bestseller") {\n      value\n    }\n    swatchImage: metafield(namespace: "custom", key: "swatch_color") {\n      reference {\n        ... on MediaImage {\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n    encodedVariantExistence\n    encodedVariantAvailability\n    adjacentVariants {\n      id\n      availableForSale\n      selectedOptions {\n        name\n        value\n      }\n      product {\n        handle\n      }\n    }\n    options {\n      name\n      values\n      optionValues {\n        name\n        firstSelectableVariant {\n          selectedOptions {\n            name\n            value\n          }\n          product {\n            handle\n          }\n          variantSwatch: metafield(namespace: "custom", key: "variant_swatch") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                }\n              }\n              ... on GenericFile {\n                url\n              }\n            }\n          }\n          metafield(namespace: "custom", key: "variant_images") {\n            references(first: 1) {\n              nodes {\n                __typename\n                ... on MediaImage {\n                  image {\n                    url\n                  }\n                }\n                ... on GenericFile {\n                  url\n                }\n              }\n            }\n          }\n        }\n        swatch {\n          color\n          image {\n            __typename\n            previewImage {\n              url\n            }\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n    description\n    media(first: 16) {\n      nodes {\n        __typename\n        ... on MediaImage {\n          id\n          image {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n    }\n    variants(first: 25) {\n      nodes {\n        id\n        availableForSale\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          handle\n          title\n        }\n      }\n    }\n  }\n\n': {
    return: RecommendedProductsQuery;
    variables: RecommendedProductsQueryVariables;
  };
  '#graphql\n  query InspiredProducts(\n    $query: String!\n    $first: Int!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    products(first: $first, query: $query) {\n      edges {\n        node {\n          id\n          title\n          collections(first: 10) {\n            edges {\n              node {\n                id\n                title\n                handle\n                image {\n                  url\n                  altText\n                }\n              }\n            }\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n': {
    return: InspiredProductsQuery;
    variables: InspiredProductsQueryVariables;
  };
  '#graphql\n  query TopCollections(\n    $first: Int!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    collections(first: $first, sortKey: UPDATED_AT) {\n      edges {\n        node {\n          id\n          title\n          handle\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n  }\n': {
    return: TopCollectionsQuery;
    variables: TopCollectionsQueryVariables;
  };
  '#graphql\n  query IndexAllProducts(\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int\n    $after: String\n  ) @inContext(country: $country, language: $language) {\n    products(first: $first, after: $after) {\n      nodes {\n        ...ProductCard\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n    colorSwatches: metaobjects(type: "shopify--color-pattern", first: 50) {\n      nodes {\n        id\n        handle\n        fields {\n          key\n          value\n          type\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    collections(first: 10) {\n      nodes {\n        id\n        title\n        handle\n      }\n    }\n    group: metafield(namespace: "custom", key: "group") {\n      value\n    }\n    material: metafield(namespace: "custom", key: "material") {\n      value\n    }\n    construction: metafield(namespace: "custom", key: "construction") {\n      value\n    }\n    pileHeight: metafield(namespace: "custom", key: "pile_height") {\n      value\n    }\n    origin: metafield(namespace: "custom", key: "origin") {\n      value\n    }\n    isNew: metafield(namespace: "custom", key: "is_new") {\n      value\n    }\n    isBestseller: metafield(namespace: "custom", key: "is_bestseller") {\n      value\n    }\n    swatchImage: metafield(namespace: "custom", key: "swatch_color") {\n      reference {\n        ... on MediaImage {\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n    encodedVariantExistence\n    encodedVariantAvailability\n    adjacentVariants {\n      id\n      availableForSale\n      selectedOptions {\n        name\n        value\n      }\n      product {\n        handle\n      }\n    }\n    options {\n      name\n      values\n      optionValues {\n        name\n        firstSelectableVariant {\n          selectedOptions {\n            name\n            value\n          }\n          product {\n            handle\n          }\n          variantSwatch: metafield(namespace: "custom", key: "variant_swatch") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                }\n              }\n              ... on GenericFile {\n                url\n              }\n            }\n          }\n          metafield(namespace: "custom", key: "variant_images") {\n            references(first: 1) {\n              nodes {\n                __typename\n                ... on MediaImage {\n                  image {\n                    url\n                  }\n                }\n                ... on GenericFile {\n                  url\n                }\n              }\n            }\n          }\n        }\n        swatch {\n          color\n          image {\n            __typename\n            previewImage {\n              url\n            }\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n    description\n    media(first: 16) {\n      nodes {\n        __typename\n        ... on MediaImage {\n          id\n          image {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n    }\n    variants(first: 25) {\n      nodes {\n        id\n        availableForSale\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          handle\n          title\n        }\n      }\n    }\n  }\n\n': {
    return: IndexAllProductsQuery;
    variables: IndexAllProductsQueryVariables;
  };
  '#graphql\n  query AllProductsPageInfo(\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int!\n    $after: String\n  ) @inContext(country: $country, language: $language) {\n    products(first: $first, after: $after) {\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n': {
    return: AllProductsPageInfoQuery;
    variables: AllProductsPageInfoQueryVariables;
  };
  '#graphql\n  query AllProductsTotalCount(\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    search(query: "", types: [PRODUCT], first: 1) {\n      totalCount\n    }\n  }\n': {
    return: AllProductsTotalCountQuery;
    variables: AllProductsTotalCountQueryVariables;
  };
  '#graphql\n  query RugQuizColorSwatches($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    colorSwatches: metaobjects(type: "shopify--color-pattern", first: 50) {\n      nodes {\n        id\n        handle\n        fields {\n          key\n          value\n          type\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: RugQuizColorSwatchesQuery;
    variables: RugQuizColorSwatchesQueryVariables;
  };
  '#graphql\n  query SearchCuratedCollections(\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    gabbeh: collection(handle: "gabbeh") {\n      id\n      title\n      handle\n      image {\n        altText\n        width\n        height\n        url\n      }\n    }\n    casaBlanc: collection(handle: "casa-blanc-collection") {\n      id\n      title\n      handle\n      image {\n        altText\n        width\n        height\n        url\n      }\n    }\n    boho: collection(handle: "bohemian-braided") {\n      id\n      title\n      handle\n      image {\n        altText\n        width\n        height\n        url\n      }\n    }\n    runners: collection(handle: "runners") {\n      id\n      title\n      handle\n      image {\n        altText\n        width\n        height\n        url\n      }\n    }\n    livingRoom: collection(handle: "living-room-rugs") {\n      id\n      title\n      handle\n      image {\n        altText\n        width\n        height\n        url\n      }\n    }\n  }\n': {
    return: SearchCuratedCollectionsQuery;
    variables: SearchCuratedCollectionsQueryVariables;
  };
  '#graphql\n  query PaginatedProductsSearch(\n    $country: CountryCode\n    $endCursor: String\n    $first: Int\n    $language: LanguageCode\n    $last: Int\n    $filters: [ProductFilter!]\n    $sortKey: SearchSortKeys\n    $reverse: Boolean\n    $searchTerm: String!\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    search(\n      first: $first\n      last: $last\n      before: $startCursor\n      after: $endCursor\n      sortKey: $sortKey\n      reverse: $reverse\n      query: $searchTerm\n      types: [PRODUCT]\n      productFilters: $filters\n    ) {\n      productFilters {\n        id\n        label\n        type\n        values {\n          id\n          label\n          count\n          input\n        }\n      }\n      nodes {\n        ... on Product {\n          ...ProductCard\n        }\n      }\n      pageInfo {\n        startCursor\n        endCursor\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n    colorSwatches: metaobjects(type: "shopify--color-pattern", first: 50) {\n      nodes {\n        id\n        handle\n        fields {\n          key\n          value\n          type\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    collections(first: 10) {\n      nodes {\n        id\n        title\n        handle\n      }\n    }\n    group: metafield(namespace: "custom", key: "group") {\n      value\n    }\n    material: metafield(namespace: "custom", key: "material") {\n      value\n    }\n    construction: metafield(namespace: "custom", key: "construction") {\n      value\n    }\n    pileHeight: metafield(namespace: "custom", key: "pile_height") {\n      value\n    }\n    origin: metafield(namespace: "custom", key: "origin") {\n      value\n    }\n    isNew: metafield(namespace: "custom", key: "is_new") {\n      value\n    }\n    isBestseller: metafield(namespace: "custom", key: "is_bestseller") {\n      value\n    }\n    swatchImage: metafield(namespace: "custom", key: "swatch_color") {\n      reference {\n        ... on MediaImage {\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n    encodedVariantExistence\n    encodedVariantAvailability\n    adjacentVariants {\n      id\n      availableForSale\n      selectedOptions {\n        name\n        value\n      }\n      product {\n        handle\n      }\n    }\n    options {\n      name\n      values\n      optionValues {\n        name\n        firstSelectableVariant {\n          selectedOptions {\n            name\n            value\n          }\n          product {\n            handle\n          }\n          variantSwatch: metafield(namespace: "custom", key: "variant_swatch") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                }\n              }\n              ... on GenericFile {\n                url\n              }\n            }\n          }\n          metafield(namespace: "custom", key: "variant_images") {\n            references(first: 1) {\n              nodes {\n                __typename\n                ... on MediaImage {\n                  image {\n                    url\n                  }\n                }\n                ... on GenericFile {\n                  url\n                }\n              }\n            }\n          }\n        }\n        swatch {\n          color\n          image {\n            __typename\n            previewImage {\n              url\n            }\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n    description\n    media(first: 16) {\n      nodes {\n        __typename\n        ... on MediaImage {\n          id\n          image {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n    }\n    variants(first: 25) {\n      nodes {\n        id\n        availableForSale\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          handle\n          title\n        }\n      }\n    }\n  }\n\n': {
    return: PaginatedProductsSearchQuery;
    variables: PaginatedProductsSearchQueryVariables;
  };
  '#graphql\n  query SearchAllProducts(\n    $country: CountryCode\n    $first: Int\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    products(first: $first) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    collections(first: 10) {\n      nodes {\n        id\n        title\n        handle\n      }\n    }\n    group: metafield(namespace: "custom", key: "group") {\n      value\n    }\n    material: metafield(namespace: "custom", key: "material") {\n      value\n    }\n    construction: metafield(namespace: "custom", key: "construction") {\n      value\n    }\n    pileHeight: metafield(namespace: "custom", key: "pile_height") {\n      value\n    }\n    origin: metafield(namespace: "custom", key: "origin") {\n      value\n    }\n    isNew: metafield(namespace: "custom", key: "is_new") {\n      value\n    }\n    isBestseller: metafield(namespace: "custom", key: "is_bestseller") {\n      value\n    }\n    swatchImage: metafield(namespace: "custom", key: "swatch_color") {\n      reference {\n        ... on MediaImage {\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n    encodedVariantExistence\n    encodedVariantAvailability\n    adjacentVariants {\n      id\n      availableForSale\n      selectedOptions {\n        name\n        value\n      }\n      product {\n        handle\n      }\n    }\n    options {\n      name\n      values\n      optionValues {\n        name\n        firstSelectableVariant {\n          selectedOptions {\n            name\n            value\n          }\n          product {\n            handle\n          }\n          variantSwatch: metafield(namespace: "custom", key: "variant_swatch") {\n            reference {\n              ... on MediaImage {\n                image {\n                  url\n                  altText\n                }\n              }\n              ... on GenericFile {\n                url\n              }\n            }\n          }\n          metafield(namespace: "custom", key: "variant_images") {\n            references(first: 1) {\n              nodes {\n                __typename\n                ... on MediaImage {\n                  image {\n                    url\n                  }\n                }\n                ... on GenericFile {\n                  url\n                }\n              }\n            }\n          }\n        }\n        swatch {\n          color\n          image {\n            __typename\n            previewImage {\n              url\n            }\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          }\n        }\n      }\n    }\n    description\n    media(first: 16) {\n      nodes {\n        __typename\n        ... on MediaImage {\n          id\n          image {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n    }\n    variants(first: 25) {\n      nodes {\n        id\n        availableForSale\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          handle\n          title\n        }\n      }\n    }\n  }\n\n': {
    return: SearchAllProductsQuery;
    variables: SearchAllProductsQueryVariables;
  };
  '#graphql\n        query TrackShipmentProducts($ids: [ID!]!) {\n          nodes(ids: $ids) {\n            __typename\n            ... on Product {\n              id\n              handle\n              featuredImage {\n                url\n                altText\n              }\n            }\n            ... on ProductVariant {\n              id\n              image {\n                url\n                altText\n              }\n              product {\n                handle\n                featuredImage {\n                  url\n                  altText\n                }\n              }\n            }\n          }\n        }\n      ': {
    return: TrackShipmentProductsQuery;
    variables: TrackShipmentProductsQueryVariables;
  };
  '#graphql\n  query FallbackSitemap($productsFirst: Int!, $collectionsFirst: Int!, $pagesFirst: Int!, $articlesFirst: Int!) {\n    products(first: $productsFirst) {\n      nodes {\n        handle\n        updatedAt\n      }\n    }\n    collections(first: $collectionsFirst) {\n      nodes {\n        handle\n        updatedAt\n      }\n    }\n    pages(first: $pagesFirst) {\n      nodes {\n        handle\n        updatedAt\n      }\n    }\n    articles(first: $articlesFirst) {\n      nodes {\n        handle\n        blog {\n          handle\n        }\n        publishedAt\n      }\n    }\n  }\n': {
    return: FallbackSitemapQuery;
    variables: FallbackSitemapQueryVariables;
  };
  '#graphql\n      query getProductForAdd($handle: String!, $language: LanguageCode) @inContext(language: $language) {\n        product(handle: $handle) {\n          id\n          title\n          selectedOrFirstAvailableVariant {\n            id\n            availableForSale\n          }\n        }\n      }\n    ': {
    return: GetProductForAddQuery;
    variables: GetProductForAddQueryVariables;
  };
  '#graphql\n              query AddByHandleCartLines($id: ID!) {\n                cart(id: $id) {\n                  id\n                  lines(first: 100) {\n                    edges { node { quantity merchandise { ... on ProductVariant { id product { title } } } } }\n                  }\n                }\n              }\n            ': {
    return: AddByHandleCartLinesQuery;
    variables: AddByHandleCartLinesQueryVariables;
  };
  '#graphql\n          query PersistCartLines($id: ID!) {\n            cart(id: $id) {\n              id\n              lines(first: 100) {\n                edges { node { quantity merchandise { ... on ProductVariant { id product { title } } } } }\n              }\n            }\n          }\n        ': {
    return: PersistCartLinesQuery;
    variables: PersistCartLinesQueryVariables;
  };
  '#graphql\n        query ProductNodes($ids: [ID!]!, $language: LanguageCode) @inContext(language: $language) {\n          nodes(ids: $ids) {\n            ... on Product {\n              id\n              selectedOrFirstAvailableVariant { id availableForSale product { title } }\n              variants(first: 1) { nodes { id availableForSale product { title } } }\n            }\n          }\n        }\n      ': {
    return: ProductNodesQuery;
    variables: ProductNodesQueryVariables;
  };
  '#graphql\n      query CustomerFavoritesProducts($ids: [ID!]!, $language: LanguageCode)\n      @inContext(language: $language) {\n        nodes(ids: $ids) {\n          ... on Product {\n            id\n            handle\n            title\n            vendor\n            publishedAt\n            featuredImage { url altText }\n            variants(first: 1) {\n              nodes { id price { amount currencyCode } compareAtPrice { amount currencyCode } availableForSale image { url altText } }\n            }\n            priceRange {\n              minVariantPrice { amount currencyCode }\n              maxVariantPrice { amount currencyCode }\n            }\n          }\n        }\n      }\n    ': {
    return: CustomerFavoritesProductsQuery;
    variables: CustomerFavoritesProductsQueryVariables;
  };
  '#graphql\n  query CartLinesForWebhook($id: ID!) {\n    cart(id: $id) {\n      id\n      lines(first: 100) {\n        edges {\n          node {\n            id\n            quantity\n            merchandise {\n              ... on ProductVariant {\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: CartLinesForWebhookQuery;
    variables: CartLinesForWebhookQueryVariables;
  };
}

interface GeneratedMutationTypes {
  '#graphql\n    mutation CartCreate($input: CartInput!) {\n      cartCreate(input: $input) {\n        cart {\n          id\n          checkoutUrl\n        }\n        userErrors {\n          field\n          message\n        }\n      }\n    }\n  ': {
    return: CartCreateMutation;
    variables: CartCreateMutationVariables;
  };
  '#graphql\n    mutation customerCreate($input: CustomerCreateInput!) {\n      customerCreate(input: $input) {\n        customer {\n          id\n          email\n        }\n        customerUserErrors {\n          code\n          message\n        }\n      }\n    }\n  ': {
    return: CustomerCreateMutation;
    variables: CustomerCreateMutationVariables;
  };
  '#graphql\n  mutation CartLinesUpdateForWebhook($cartId: ID!, $lines: [CartLineUpdateInput!]!) {\n    cartLinesUpdate(cartId: $cartId, lines: $lines) {\n      cart {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n': {
    return: CartLinesUpdateForWebhookMutation;
    variables: CartLinesUpdateForWebhookMutationVariables;
  };
  '#graphql\n  mutation CartLinesRemoveForWebhook($cartId: ID!, $lineIds: [ID!]!) {\n    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {\n      cart {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n': {
    return: CartLinesRemoveForWebhookMutation;
    variables: CartLinesRemoveForWebhookMutationVariables;
  };
}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
