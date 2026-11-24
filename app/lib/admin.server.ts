import type {AppLoadContext} from '@shopify/remix-oxygen';

export async function adminGraphQL<T = any>(
  context: AppLoadContext,
  query: string,
  variables?: Record<string, unknown>,
) {
  const token =
    ((context.env as any).ADMIN_API_ACCESS_TOKEN as string | undefined) ||
    ((context.env as any).SHOPIFY_ADMIN_ACCESS_TOKEN as string | undefined);
  const storeDomain = context.env.PUBLIC_STORE_DOMAIN as string;
  const version =
    (context.env as any).ADMIN_API_VERSION ||
    (context.env as any).SHOPIFY_ADMIN_API_VERSION ||
    '2024-04';
  if (!token) throw new Error('Missing ADMIN_API_ACCESS_TOKEN');

  const endpoint = `https://${storeDomain}/admin/api/${version}/graphql.json`;


  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({query, variables}),
  });

  const json = (await res.json()) as {data?: T; errors?: any};
  if (!res.ok || json.errors) {
    throw new Error(JSON.stringify(json.errors || {status: res.status}));
  }
  return json.data as T;
}


