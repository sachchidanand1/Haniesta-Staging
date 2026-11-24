import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import {adminGraphQL} from '~/lib/admin.server';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

const ADMIN_GROUP_PRODUCTS_QUERY = `
  query AdminGroupProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          featuredImage {
            url
            altText
          }
          group: metafield(namespace: "custom", key: "group") {
            value
          }
          colorLabel: metafield(namespace: "custom", key: "color_label") {
            value
          }
          colorFamilyKey: metafield(namespace: "custom", key: "color_family_key") {
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
        }
      }
    }
  }
`;

const serverGroupCache = new Map<string, {data: any; timestamp: number}>();
const CACHE_TTL_MS = 15 * 60 * 1000;

export async function loader({request, context}: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const group = url.searchParams.get('group') ?? '';
    const debug = url.searchParams.get('debug') === '1';
    const groupNormalized = String(group).trim();
    if (!groupNormalized) {
      return json(
        {group: '', products: [], debug: null},
        {headers: {'Cache-Control': 'public, max-age=60'}},
      );
    }

    if (!debug && serverGroupCache.has(groupNormalized)) {
      const cached = serverGroupCache.get(groupNormalized)!;
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return json(cached.data, {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
          },
        });
      }
    }

    const groupEscaped = groupNormalized.replace(/\"/g, '\\\"');
    const queryQuoted = `metafields.custom.group:"${groupEscaped}"`;
    const queryUnquoted = `metafields.custom.group:${groupEscaped}`;

    const dbg: any = debug ? {group: groupNormalized, attempts: [] as any[]} : null;

    const filterExactGroup = (arr: any[]) =>
      arr.filter(
        (p: any) => String(p?.group?.value || '').trim() === groupNormalized,
      );

    const filterBlankOrMatchGroup = (arr: any[]) =>
      arr.filter((p: any) => {
        const v = String(p?.group?.value || '').trim();
        return v === '' || v === groupNormalized;
      });

    const record = (label: string, arr: any[], out: any[]) => {
      if (!dbg) return;
      dbg.attempts.push({
        label,
        rawCount: Array.isArray(arr) ? arr.length : 0,
        rawHandles: Array.isArray(arr)
          ? arr.map((p: any) => p?.handle).filter(Boolean)
          : [],
        filteredCount: Array.isArray(out) ? out.length : 0,
        filteredHandles: Array.isArray(out)
          ? out.map((p: any) => p?.handle).filter(Boolean)
          : [],
      });
    };

    const runAdmin = async (q: string) => {
      const data = await adminGraphQL<{
        products?: {
          edges?: Array<{node: any}>;
        } | null;
      }>(context as any, ADMIN_GROUP_PRODUCTS_QUERY, {query: q, first: 50});

      const edges = data?.products?.edges ?? [];
      return Array.isArray(edges) ? edges.map((e: any) => e?.node).filter(Boolean) : [];
    };

    let nodes = await runAdmin(queryQuoted);
    let filtered = Array.isArray(nodes) ? filterExactGroup(nodes) : [];
    record('quoted_admin', nodes, filtered);

    if (filtered.length === 0) {
      nodes = await runAdmin(queryUnquoted);
      filtered = Array.isArray(nodes) ? filterExactGroup(nodes) : [];
      record('unquoted_admin', nodes, filtered);
    }

    if (filtered.length === 0) {
      const tagQuery = `tag:"${groupEscaped}"`;
      nodes = await runAdmin(tagQuery);
      filtered = Array.isArray(nodes) ? filterBlankOrMatchGroup(nodes) : [];
      record('tag_admin', nodes, filtered);
    }

    const payload = {group: groupNormalized, products: filtered, debug: dbg};
    if (!debug && filtered.length > 0) {
      serverGroupCache.set(groupNormalized, {data: payload, timestamp: Date.now()});
    }

    return json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('Error in api.group-products loader:', err);
    return json({group: '', products: [], debug: null});
  }
}

export default function GroupProductsApiRoute() {
  return null;
}
