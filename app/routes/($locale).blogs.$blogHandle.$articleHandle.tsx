import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

export async function loader({request, params, context}: LoaderFunctionArgs) {
  invariant(params.blogHandle, 'Missing blog handle');
  invariant(params.articleHandle, 'Missing article handle');

  const prefix = params?.locale ? `/${params.locale}` : '';
  return redirect(`${prefix}/blogs/${params.articleHandle}`, 301);
}

export default function BlogLegacyRedirectRoute() {
  return null;
}
