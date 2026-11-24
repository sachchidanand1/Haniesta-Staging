import {json, type ActionFunctionArgs, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {readFavorites, writeFavorites} from '~/lib/favorites.server';

export async function loader({context}: LoaderFunctionArgs) {
  try {
    // console.log('Favorites API loader called');
    const favorites = await readFavorites(context);
    // console.log('Favorites API loader result:', favorites);
    return json({favorites});
  } catch (e) {
    console.error('Favorites API loader error:', e);
    return json({error: 'Failed to read favorites'}, {status: 500});
  }
}

export async function action({request, context}: ActionFunctionArgs) {
  try {
    const body = (await request.json()) as {
      favorites?: string[];
      merge?: boolean;
      productHandle?: string;
      action?: 'add' | 'remove';
    };

    // Path A: add/remove by product handle (converts to product GID via Storefront API)
    if (body?.productHandle && body?.action) {
      const productId = await getProductIdFromHandle(context, body.productHandle);
      if (!productId) return json({error: 'Product not found'}, {status: 404});

      const current = await readFavorites(context);
      let next = current.slice();
      if (body.action === 'add') {
        if (!next.includes(productId)) next.push(productId);
      } else if (body.action === 'remove') {
        next = next.filter((id) => id !== productId);
      }
      const result = await writeFavorites(context, next);
      return json({success: true, favorites: next}, result);
    }

    // Path B: replace/merge full favorites array of product GIDs
    const current = await readFavorites(context);
    const next = body.merge
      ? Array.from(new Set([...(current ?? []), ...(body.favorites ?? [])]))
      : (body.favorites ?? []);
    const result = await writeFavorites(context, next);
    return json({success: true, favorites: next}, result);
  } catch (e) {
    return json({error: 'Failed to write favorites'}, {status: 500});
  }
}

async function getProductIdFromHandle(
  context: LoaderFunctionArgs['context'],
  handle: string,
): Promise<string | undefined> {
  const QUERY = `
    query getProductByHandle($handle: String!, $language: LanguageCode) @inContext(language: $language) {
      product(handle: $handle) { id }
    }
  `;
  const data = await context.storefront.query(QUERY, {
    variables: {handle, language: context.storefront.i18n.language},
  });
  const id = (data as any)?.product?.id as string | undefined;
  return id;
}


