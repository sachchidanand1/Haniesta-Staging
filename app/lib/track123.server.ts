import type {AppLoadContext} from '@shopify/remix-oxygen';

export type Track123OrderResponse = {
  order?: {
    order_name?: string;
    order_number?: string;
    order_id?: string;
    order_tag?: string;
    tracking_link?: string;
    order_create_at?: string;
    order_update_at?: string;
    order_closed_at?: string | null;
    status?: string;
    customer?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    shipping_address?: {
      country?: string;
      province?: string;
      city?: string;
      address?: string;
      phone?: string;
    };
    fulfillments?: Array<{
      create_at?: string;
      id?: string;
      tracking_company?: string;
      tracking_number?: string;
      carrier_code?: string;
      courier?: {
        query_link?: string;
        country_code?: string;
        phone?: string;
        code?: string;
        name?: string;
        home_page?: string;
        pic_url?: string;
      };
      transit_status?: string;
      transit_sub_status?: string;
      last_event?: string;
      last_event_time?: string;
      line_items?: Array<{
        id?: string;
        product_id?: string;
        variant_id?: string;
        title?: string;
        sku?: string;
        variant_title?: string | null;
        quantity?: number;
      }>;
      tracking_details?: Array<{
        event_time?: string;
        event_time_utc?: string;
        event_detail?: string;
        event_location?: string;
      }>;
      last_mile_tracking_supported?: boolean;
      last_mile_info?: {
        lm_track_no?: string;
        lm_track_no_provider_code?: string;
        lm_track_no_provider_name?: string;
        courier_logo?: string;
        query_link?: string;
        courier_home_page?: string;
        details?: Array<{
          event_time?: string;
          event_time_utc?: string;
          event_detail?: string;
          event_location?: string;
        }>;
      };
    }>;
  };
  store?: {
    name?: string;
    url?: string;
  };
};

type Track123AnonymousQueryPayload = {
  store_domain: string;
  email: string;
  order_or_number: string;
  source_type?: number;
  locale?: string;
  currency_code?: string;
  select_type?: number;
};

type Track123AnonymousQueryResponse =
  | (Track123OrderResponse & {error?: unknown; message?: unknown; code?: unknown})
  | {
      data?: Track123OrderResponse | {order?: Track123OrderResponse['order']};
      order?: Track123OrderResponse['order'];
      error?: unknown;
      message?: unknown;
      code?: unknown;
    };

function normalizeHost(value: unknown): string | null {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;
  return str.replace(/^https?:\/\//, '').split('/')[0] || null;
}

function safeJsonParse(value: unknown): any {
  if (typeof value !== 'string' || !value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getShopUuidFromEnv(env: AppLoadContext['env']): string | null {
  const explicit = (env as any).TRACK123_SHOP_UUID as string | undefined;
  if (explicit) return explicit;

  const candidates = [
    (env as any).SHOPIFY_STORE_DOMAIN,
    (env as any).JUDGEME_SHOP_DOMAIN,
    (env as any).PUBLIC_STORE_DOMAIN,
  ];

  for (const c of candidates) {
    const host = normalizeHost(c);
    if (!host) continue;

    const myshopifyMatch = host.match(/^([a-z0-9-]+)\.myshopify\.com$/i);
    if (myshopifyMatch?.[1]) return myshopifyMatch[1];

    // If it's not a myshopify domain (custom domain), we can't reliably infer the Track123 uuid.
    // Let the caller set TRACK123_SHOP_UUID.
  }

  return null;
}

export async function fetchTrack123Order(
  env: AppLoadContext['env'],
  orderId: string,
): Promise<{data: Track123OrderResponse | null; error: string | null}> {
  const disable = String((env as any).DISABLE_EXTERNAL_FETCH || '').toLowerCase();
  if (disable === '1' || disable === 'true') {
    return {data: null, error: 'External requests are disabled'};
  }

  const apiKey = (env as any).TRACK123_API_KEY as string | undefined;
  if (!apiKey) return {data: null, error: 'Missing TRACK123_API_KEY'};

  const uuid = getShopUuidFromEnv(env);
  if (!uuid) {
    return {
      data: null,
      error:
        'Unable to derive store uuid. Set TRACK123_SHOP_UUID to your myshopify subdomain (e.g. "yourstore").',
    };
  }

  const base = String((env as any).TRACK123_BASE_URL || 'https://shp.track123.com').replace(/\/$/, '');
  const url = `${base}/shopify/api/v1/${encodeURIComponent(uuid)}/orders/${encodeURIComponent(orderId)}.json`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        data: null,
        error: `Track123 request failed (${res.status}) for ${url}${text ? `: ${text}` : ''}`,
      };
    }

    const json = (await res.json().catch(() => null)) as Track123OrderResponse | null;
    if (!json) return {data: null, error: 'Invalid Track123 response'};

    return {data: json, error: null};
  } catch (e: any) {
    return {data: null, error: e?.message || 'Track123 request failed'};
  }
}

export async function fetchTrack123AnonymousOrder(
  env: AppLoadContext['env'],
  params: {
    email: string;
    orderOrNumber: string;
    locale?: string;
    currencyCode?: string;
    userAgent?: string | null;
  },
): Promise<{data: Track123OrderResponse | null; error: string | null}> {
  const disable = String((env as any).DISABLE_EXTERNAL_FETCH || '').toLowerCase();
  if (disable === '1' || disable === 'true') {
    return {data: null, error: 'External requests are disabled'};
  }

  const storeDomain = normalizeHost((env as any).PUBLIC_STORE_DOMAIN);
  if (!storeDomain) return {data: null, error: 'Missing PUBLIC_STORE_DOMAIN'};

  const base = String((env as any).TRACK123_BASE_URL || 'https://shp.track123.com').replace(/\/$/, '');
  const url = `${base}/shopify/api/order/anonymous-query`;

  const payload: Track123AnonymousQueryPayload = {
    store_domain: storeDomain,
    email: params.email,
    order_or_number: params.orderOrNumber,
  };

  if (params.locale) payload.locale = params.locale;
  if (params.currencyCode) payload.currency_code = params.currencyCode;

  const debug = String((env as any).TRACK123_DEBUG || '').toLowerCase();
  //if (debug === '1' || debug === 'true') {
    //console.log('[track123][anonymous-query] request url', url);
    //console.log('[track123][anonymous-query] request payload', payload);
  //}

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/json;charset=utf8',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        data: null,
        error: `Track123 anonymous-query failed (${res.status}) for ${url}${text ? `: ${text}` : ''}`,
      };
    }

    const rawText = await res.text().catch(() => '');
    const json = (rawText
      ? (JSON.parse(rawText) as Track123AnonymousQueryResponse)
      : null) as Track123AnonymousQueryResponse | null;
    if (!json) return {data: null, error: 'Invalid Track123 response'};

    //if (debug === '1' || debug === 'true') {
      //console.log('[track123][anonymous-query] response raw', rawText);
      //console.log('[track123][anonymous-query] response keys', Object.keys(json as any));
      //console.log('[track123][anonymous-query] response json', json);
    //}

    const extractOrder = (value: any): Track123OrderResponse['order'] | null => {
      if (!value || typeof value !== 'object') return null;

      const noQueryData = Boolean((value as any)?.no_query_data);
      const emptyPackages = Array.isArray((value as any)?.order_packages) && (value as any).order_packages.length === 0;
      const zeroOrderNumber = String((value as any)?.order_number || '') === '0';
      const zeroId = String((value as any)?.id || '') === '0';
      if (noQueryData || (emptyPackages && (zeroOrderNumber || zeroId))) {
        return null;
      }

      // Track123 anonymous-query can return a flat object (not wrapped by {order:{...}})
      // with keys like order_name/order_number/order_packages.
      if (value.order_name || value.order_number || value.order_packages) {
        const packages = Array.isArray(value.order_packages) ? value.order_packages : [];
        const fulfillments = packages.map((p: any) => {
          const courier = p?.courier;
          const items = Array.isArray(p?.order_items) ? p.order_items : [];
          const trackingDetails = Array.isArray(p?.tracking_details) ? p.tracking_details : [];
          const statusList = Array.isArray(p?.tracking_status_list) ? p.tracking_status_list : [];
          const statusEvents = statusList
            .filter((s: any) => s && (s.event_time || s.status_name))
            .map((s: any) => ({
              event_time: s.event_time || null,
              event_time_utc: null,
              event_detail: s.status_name || null,
              event_location: null,
            }));

          const queryLink = typeof courier?.query_link === 'string' ? courier.query_link : '';
          const tn = p?.tracking_number ? String(p.tracking_number) : '';
          const resolvedQueryLink = queryLink
            ? queryLink.replace('#{trackingNo}', encodeURIComponent(tn))
            : '';

          return {
            create_at: p?.ship_time || null,
            id: p?.fulfilment_id || p?.order_package_id || null,
            tracking_company: courier?.courier_name_e_n || courier?.courier_name_c_n || courier?.courier_code || null,
            tracking_number: tn || null,
            carrier_code: p?.courier_code || courier?.courier_code || null,
            courier: {
              query_link: resolvedQueryLink || null,
              country_code: courier?.country_code || null,
              phone: courier?.phone || null,
              code: courier?.courier_code || null,
              name: courier?.courier_name_e_n || courier?.courier_name_c_n || null,
              home_page: courier?.courier_home_page || null,
              pic_url: courier?.courier_logo || null,
            },
            transit_status: p?.transit_display_status || p?.transit_status || null,
            transit_sub_status: null,
            last_event: p?.last_event || null,
            last_event_time: null,
            line_items: items.map((it: any) => {
              const ext = safeJsonParse(it?.ext_data);
              return {
                id: String(it?.id || ''),
                product_id: it?.product_id ? String(it.product_id) : undefined,
                variant_id: it?.variant_id ? String(it.variant_id) : undefined,
                title: ext?.productName || it?.title || null,
                sku: it?.sku || null,
                variant_title: null,
                quantity: typeof it?.product_quantity === 'number' ? it.product_quantity : it?.quantity,
              };
            }),
            tracking_details: trackingDetails.map((d: any) => ({
              event_time: d?.event_time || null,
              event_time_utc: d?.event_time_utc || null,
              event_detail: d?.event_detail || null,
              event_location: d?.event_location || null,
            })),
            _status_events: statusEvents,
            last_mile_tracking_supported: false,
            last_mile_info: undefined,
          };
        });

        return {
          order_name: value.order_name,
          order_number: value.order_number,
          order_id: value.shopify_id || value.order_id || value.id,
          order_tag: value.tags,
          tracking_link: value.preview,
          order_create_at: value.order_create_at,
          order_update_at: value.order_update_at,
          order_closed_at: value.order_closed_at,
          status: value.status,
          customer: {
            name: value.customer_name,
            email: value.email,
            phone: value.phone,
          },
          shipping_address: {
            country: value.shipping_country,
            province: value.shipping_province_code,
          },
          fulfillments: fulfillments as any,
        };
      }

      if (value.order && typeof value.order === 'object') return value.order;
      if (value.data && typeof value.data === 'object') {
        const o = extractOrder(value.data);
        if (o) return o;
      }
      if (value.result && typeof value.result === 'object') {
        const o = extractOrder(value.result);
        if (o) return o;
      }
      if (Array.isArray(value.orders) && value.orders[0] && typeof value.orders[0] === 'object') {
        const o = extractOrder(value.orders[0]);
        if (o) return o;
      }
      return null;
    };

    const extracted = extractOrder(json as any);
    if (extracted) return {data: {order: extracted}, error: null};

    const noQueryData = Boolean((json as any)?.no_query_data);
    const emptyPackages = Array.isArray((json as any)?.order_packages) && (json as any).order_packages.length === 0;
    const zeroOrderNumber = String((json as any)?.order_number || '') === '0';
    const zeroId = String((json as any)?.id || '') === '0';
    if (noQueryData || (emptyPackages && (zeroOrderNumber || zeroId))) {
      return {
        data: null,
        error: 'No tracking details found for the provided order number and email/phone.',
      };
    }

    const directOrder = (json as any)?.order as Track123OrderResponse['order'] | undefined;
    if (directOrder) return {data: {order: directOrder}, error: null};

    const dataOrder = (json as any)?.data?.order as Track123OrderResponse['order'] | undefined;
    if (dataOrder) return {data: {order: dataOrder}, error: null};

    const dataObject = (json as any)?.data as Track123OrderResponse | undefined;
    if (dataObject?.order) return {data: dataObject, error: null};

    const message = (json as any)?.message || (json as any)?.msg || (json as any)?.error_message;
    const code = (json as any)?.code || (json as any)?.error_code;
    const err = (json as any)?.error;
    if (typeof message === 'string' && message) {
      return {data: null, error: code ? `${message} (${String(code)})` : message};
    }
    if (typeof err === 'string' && err) {
      return {data: null, error: err};
    }

    const keys = Object.keys(json as any);
    if (debug === '1' || debug === 'true') {
      return {
        data: null,
        error: `Track123 response did not include order data. keys=${keys.join(',')} raw=${rawText.slice(0, 1200)}`,
      };
    }

    return {
      data: null,
      error: `Track123 response did not include order data (keys: ${keys.join(', ') || 'none'})`,
    };
  } catch (e: any) {
    return {data: null, error: e?.message || 'Track123 request failed'};
  }
}
