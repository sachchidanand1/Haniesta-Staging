// Debug endpoint for About Us images - can be removed in production
import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {getAboutUsMetaobject} from '~/lib/metafields';

export async function loader({context}: LoaderFunctionArgs) {
  try {
    const aboutUsImages = await getAboutUsMetaobject(context.storefront, 'about-us-images-qporpdzl');
    
    return json({
      success: true,
      data: aboutUsImages,
      imageStatus: {
        heroBackgroundImage: !!aboutUsImages?.heroBackgroundImage?.reference?.image,
        brandStoryImage: !!aboutUsImages?.brandStoryImage?.reference?.image,
        heritageImage: !!aboutUsImages?.heritageImage?.reference?.image,
        inspirationImage: !!aboutUsImages?.inspirationImage?.reference?.image,
      }
    });
  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
