import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {adminGraphQL} from '~/lib/admin.server';

/**
 * GET /api/admin/health
 * 
 * 
 * Returns a JSON summary of Admin API connectivity and required envs.
 * Does not leak secrets.
 */
export async function loader({context}: LoaderFunctionArgs) {
  const env: any = context.env || {};

  const summary: {
    ok: boolean;
    hasToken: boolean;
    storeDomain: string | null;
    apiVersion: string;
    adminOk: boolean;
    error: string | null;
  } = {
    ok: false,
    hasToken: Boolean(env.ADMIN_API_ACCESS_TOKEN || env.SHOPIFY_ADMIN_ACCESS_TOKEN),
    storeDomain: env.PUBLIC_STORE_DOMAIN || null,
    apiVersion: env.ADMIN_API_VERSION || env.SHOPIFY_ADMIN_API_VERSION || '2025-07',
    adminOk: false,
    error: null,
  };

  try {
    // Lightweight Admin query
    const QUERY = `
      query HealthShop { shop { id name } }
    `;
    const data = await adminGraphQL<{shop?: {id: string; name: string} | null}>(context as any, QUERY);
    summary.adminOk = Boolean(data?.shop?.id);
    summary.ok = summary.hasToken && !!summary.storeDomain && summary.adminOk;

    return json(summary, {status: summary.ok ? 200 : 500});
  } catch (e: any) {
    summary.error = String(e?.message || e);
    summary.ok = false;
    return json(summary, {status: 500});
  }
}
