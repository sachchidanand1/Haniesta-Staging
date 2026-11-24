import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {getFeaturedCollections} from '~/lib/metafields';

export async function loader({context}: LoaderFunctionArgs) {
  const data = await getFeaturedCollections(context.storefront);
  return json({count: data.length, items: data});
}

export default function FeaturedDebug() {
  return null;
}
