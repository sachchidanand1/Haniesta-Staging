import {json, type ActionFunctionArgs, type LoaderFunctionArgs, type MetaFunction} from '@shopify/remix-oxygen';
import {Form, useActionData, useLoaderData, useNavigation} from '@remix-run/react';
import {Fragment, useEffect, useMemo, useRef, useState} from 'react';
import {routeHeaders} from '~/data/cache';
import {fetchTrack123AnonymousOrder, type Track123OrderResponse} from '~/lib/track123.server';

export const headers = routeHeaders;

export const meta: MetaFunction = () => {
  return [
    {title: 'Track Shipment'},
    {name: 'description', content: 'Track your shipment using order number and email.'},
  ];
};

export async function loader({request, context}: LoaderFunctionArgs) {
  return json({});
}

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const identity = String(formData.get('identity') || '').trim();
  const orderNumber = String(formData.get('orderNumber') || '').trim();
  const email = identity;

  if (!identity || !orderNumber) {
    return json({
      email,
      orderNumber,
      data: null as Track123OrderResponse | null,
      error: 'Order number and email or phone are required',
    });
  }

  const {data, error} = await fetchTrack123AnonymousOrder(context.env, {
    email,
    orderOrNumber: orderNumber.replace(/^#/, ''),
    userAgent: request.headers.get('user-agent'),
  });

  async function enrichLineItemsWithShopify() {
    try {
      const order: any = data?.order;
      const fulfillments: any[] = Array.isArray(order?.fulfillments) ? order.fulfillments : [];
      const lineItems: any[] = fulfillments.flatMap((f: any) => (Array.isArray(f?.line_items) ? f.line_items : []));
      if (!lineItems.length) return;

      const toProductGid = (id: string) => `gid://shopify/Product/${id}`;
      const toVariantGid = (id: string) => `gid://shopify/ProductVariant/${id}`;

      const ids = Array.from(
        new Set(
          lineItems
            .flatMap((li: any) => {
              const out: string[] = [];
              const pid = li?.product_id ? String(li.product_id) : '';
              const vid = li?.variant_id ? String(li.variant_id) : '';
              if (pid) out.push(toProductGid(pid));
              if (vid) out.push(toVariantGid(vid));
              return out;
            })
            .filter(Boolean),
        ),
      );

      if (!ids.length) return;

      const QUERY = `#graphql
        query TrackShipmentProducts($ids: [ID!]!) {
          nodes(ids: $ids) {
            __typename
            ... on Product {
              id
              handle
              featuredImage {
                url
                altText
              }
            }
            ... on ProductVariant {
              id
              image {
                url
                altText
              }
              product {
                handle
                featuredImage {
                  url
                  altText
                }
              }
            }
          }
        }
      `;

      const result: any = await context.storefront.query(QUERY, {
        variables: {ids},
      });

      const nodes: any[] = Array.isArray(result?.nodes) ? result.nodes : [];
      const productByNumericId = new Map<string, any>();
      const variantByNumericId = new Map<string, any>();

      for (const n of nodes) {
        const gid = typeof n?.id === 'string' ? n.id : '';
        const numericId = gid.split('/').pop() || '';
        if (!numericId) continue;
        if (n?.__typename === 'Product') {
          productByNumericId.set(numericId, n);
        }
        if (n?.__typename === 'ProductVariant') {
          variantByNumericId.set(numericId, n);
        }
      }

      for (const li of lineItems) {
        const pid = li?.product_id ? String(li.product_id) : '';
        const vid = li?.variant_id ? String(li.variant_id) : '';

        const vNode = vid ? variantByNumericId.get(vid) : null;
        const pNode = pid ? productByNumericId.get(pid) : null;
        const handle = vNode?.product?.handle || pNode?.handle || li?.handle;
        const imageUrl =
          vNode?.image?.url || vNode?.product?.featuredImage?.url || pNode?.featuredImage?.url || li?.product_image;

        if (handle) li.handle = handle;
        if (imageUrl) li.product_image = imageUrl;
      }
    } catch {
      // ignore enrichment failures
    }
  }

  if (data?.order) {
    await enrichLineItemsWithShopify();
  }

  return json({email, orderNumber, data, error});
}

function formatDate(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function formatShortDate(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

function normalizeStatus(value?: string | null) {
  return String(value || '').trim().toLowerCase();
}

function humanizeStatus(value?: string | null) {
  const v = normalizeStatus(value);
  if (!v) return '';
  return v
    .replace(/_/g, ' ')
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
}

function statusToStepIndex(value?: string | null) {
  const v = normalizeStatus(value);
  if (!v) return -1;
  if (v.includes('ordered')) return 0;
  if (v.includes('order ready') || v.includes('order_ready') || v.includes('ready')) return 1;
  if (v.includes('in transit') || v.includes('in_transit')) return 2;
  if (v.includes('out for delivery') || v.includes('out_for_delivery')) return 3;
  if (v.includes('delivered')) return 4;
  return -1;
}

function getProgressIndex(orderStatus?: string | null, transitStatus?: string | null) {
  const ts = normalizeStatus(transitStatus);
  if (ts.includes('delivered')) return 4;
  if (ts.includes('out for delivery')) return 3;
  if (ts.includes('in transit')) return 2;
  if (ts.includes('order_ready') || ts.includes('order ready') || ts === 'ready') return 1;
  if (ts.includes('info received') || ts.includes('pending')) return 1;

  const os = normalizeStatus(orderStatus);
  if (os.includes('ready')) return 1;
  if (os.includes('ordered')) return 0;
  return 1;
}

function StepIcon({active, done}: {active: boolean; done: boolean}) {
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
        done
          ? 'bg-emerald-500 border-emerald-500 text-white'
          : active
            ? 'bg-white border-emerald-500 text-emerald-600'
            : 'bg-white border-stone-200 text-stone-300'
      }`}
    >
      {done ? (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 011.415-1.414l2.793 2.793 6.793-6.793a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <div className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-stone-200'}`} />
      )}
    </div>
  );
}

function StatusStepper({
  currentIndex,
  dates,
}: {
  currentIndex: number;
  dates: Array<string | null>;
}) {
  const steps = ['Ordered', 'Order Ready', 'In Transit', 'Out for Delivery', 'Delivered'];
  return (
    <div className="mt-8">
      <div className="flex items-center">
        {steps.map((label, idx) => {
          const done = idx < currentIndex;
          const active = idx === currentIndex;
          return (
            <Fragment key={label}>
              <div className="w-16 sm:w-24 flex justify-center">
                <StepIcon active={active} done={done} />
              </div>
              {idx < steps.length - 1 ? (
                <div
                  className={`h-1 flex-1 rounded-full ${
                    idx < currentIndex ? 'bg-emerald-500' : 'bg-emerald-100'
                  }`}
                />
              ) : null}
            </Fragment>
          );
        })}
      </div>

      <div className="mt-4 flex">
        {steps.map((label, idx) => {
          const active = idx === currentIndex;
          return (
            <Fragment key={label}>
              <div className="w-16 sm:w-24 text-center">
                <div className={`text-xs sm:text-sm ${active ? 'text-stone-900' : 'text-stone-500'}`}>{label}</div>
                <div className="mt-1 text-[10px] sm:text-xs text-stone-400">{dates[idx] || ''}</div>
              </div>
              {idx < steps.length - 1 ? <div className="flex-1" /> : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackShipmentPage() {
  useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const email = actionData?.email || '';
  const orderNumber = actionData?.orderNumber || '';
  const data = actionData?.data || null;
  const error = actionData?.error || null;
  const order = data?.order;
  const fulfillments = order?.fulfillments || [];
  const primary = fulfillments[0] || null;
  const packageStatus =
    (primary as any)?.transit_display_status || (primary as any)?.transit_status || order?.status || null;
  const progressIndex =
    statusToStepIndex(packageStatus) >= 0
      ? statusToStepIndex(packageStatus)
      : getProgressIndex(order?.status || null, packageStatus);
  const trackingDetails = Array.isArray((primary as any)?.tracking_details)
    ? ((primary as any).tracking_details as any[])
    : [];
  const statusEvents = Array.isArray((primary as any)?._status_events)
    ? (((primary as any)._status_events as any[]) || [])
    : [];
  const lineItems = Array.isArray((primary as any)?.line_items) ? ((primary as any).line_items as any[]) : [];

  const stepDates: Array<string | null> = (() => {
    const dates: Array<string | null> = [null, null, null, null, null];
    if (order?.order_create_at) dates[0] = formatShortDate(order.order_create_at);
    const dateSource = trackingDetails.length > 0 ? trackingDetails : statusEvents;
    for (const ev of dateSource) {
      const idx = statusToStepIndex(ev?.event_detail);
      if (idx >= 0 && idx <= 4 && !dates[idx]) {
        dates[idx] = formatShortDate(ev?.event_time || ev?.event_time_utc || null);
      }
    }
    return dates;
  })();

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const trackingNumber = useMemo(() => String((primary as any)?.tracking_number || ''), [primary]);
  const courierUrl = useMemo(() => {
    const template = String((primary as any)?.courier?.query_link || '');
    const tn = String((primary as any)?.tracking_number || '');
    if (!template || !tn) return '';
    return template.replace(/#\{trackingNo\}/g, encodeURIComponent(tn));
  }, [primary]);
  const courierLogo = useMemo(() => {
    const c: any = (primary as any)?.courier;
    return String(c?.pic_url || c?.courier_logo || '');
  }, [primary]);
  const courierName = useMemo(() => {
    const c: any = (primary as any)?.courier;
    return String(c?.name || c?.courier_name_e_n || c?.courier_name_c_n || (primary as any)?.tracking_company || 'Carrier');
  }, [primary]);
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (order && resultsRef.current) {
      resultsRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  }, [order]);

  async function onCopyTrackingNumber() {
    if (!trackingNumber) return;
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mt-8">
          <div className="mx-auto max-w-xl rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-stone-100 overflow-hidden">
            <div className="p-6 sm:p-7">
              <div className="text-center">
                <div className="text-3xl font-medium text-stone-900">Track Shipment</div>
                <div className="mt-1 text-sm text-stone-500">Enter your details to see tracking updates</div>
              </div>

              <Form method="post" className="mt-6 space-y-5">
                <input
                  name="orderNumber"
                  defaultValue={orderNumber}
                  placeholder="Order Number"
                  className="w-full rounded-xl border border-stone-800/90 bg-white px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  autoComplete="off"
                />
                <input
                  name="identity"
                  defaultValue={email}
                  placeholder="Email or Phone Number"
                  className="w-full rounded-xl border border-stone-800/90 bg-white px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  autoComplete="email"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-xl px-6 py-4 text-white text-base font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-black/30 ${
                    isSubmitting ? 'bg-neutral-700 cursor-not-allowed' : 'bg-black hover:bg-neutral-900'
                  }`}
                >
                  {isSubmitting ? 'Tracking…' : 'Track Your Order'}
                </button>
              </Form>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}
        </div>

        {order ? (
          <div className="mt-12" ref={resultsRef}>
            <div className="text-center text-sm text-stone-500">Order: {order.order_name || `#${order.order_number || orderNumber}`}</div>
            <div className="mt-3 text-center text-3xl sm:text-4xl font-medium text-stone-900">
              {humanizeStatus(packageStatus) || 'Order Update'}
            </div>

            <StatusStepper currentIndex={progressIndex} dates={stepDates} />

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <div className="text-sm font-medium text-stone-800">Shipping Details</div>
                <div className="mt-4 text-sm text-stone-500">
                  {trackingDetails.length === 0
                    ? 'Waiting for carrier to update tracking information, please try again later.'
                    : null}
                </div>

                {trackingDetails.length > 0 ? (
                  <details className="mt-6" open>
                    <summary className="cursor-pointer select-none text-sm text-stone-700 hover:text-stone-900">
                      Tracking history
                    </summary>
                    <ol className="mt-4 space-y-4">
                      {trackingDetails.map((d: any, idx: number) => (
                        <li key={idx} className="flex gap-3">
                          <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          <div>
                            <div className="text-sm text-stone-800">{d?.event_detail || 'Update'}</div>
                            <div className="mt-1 text-xs text-stone-400">
                              {[d?.event_time || d?.event_time_utc, d?.event_location].filter(Boolean).join(' · ')}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </details>
                ) : null}
              </div>

              <div>
                <div className="text-sm font-medium text-stone-800">Package Info</div>

                <div className="mt-6">
                  <div className="text-xs font-medium text-stone-500">Package Contents</div>
                  <div className="mt-4 space-y-5">
                    {lineItems.length > 0 ? (
                      lineItems.map((li: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-4 min-w-0">
                            {li?.product_image ? (
                              <img
                                src={String(li.product_image)}
                                alt={String(li?.title || 'Item')}
                                className="h-16 w-16 rounded-lg border border-stone-200 bg-white object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-lg border border-stone-200 bg-white" />
                            )}

                            <div className="min-w-0">
                              {(() => {
                                const raw = String(li?.title || 'Item');
                                const parts = raw.split(' - ');
                                const title = parts[0] || raw;
                                const variant = parts.length > 1 ? parts.slice(1).join(' - ') : '';
                                const qty = typeof li?.quantity === 'number' ? `x${li.quantity}` : '';

                                return (
                                  <>
                                    <div className="text-sm text-stone-900 truncate">{title}</div>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                      {variant ? (
                                        <span className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-xs text-stone-600">
                                          {variant}
                                        </span>
                                      ) : null}
                                      {qty ? <span className="text-xs text-stone-500">{qty}</span> : null}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          <a
                            href={li?.handle ? `/products/${String(li.handle)}` : '#'}
                            aria-disabled={!li?.handle}
                            className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-6 py-2 text-sm font-medium transition-colors ${
                              li?.handle
                                ? 'border-stone-800 text-stone-800 hover:bg-stone-50'
                                : 'border-stone-200 text-stone-400 pointer-events-none'
                            }`}
                          >
                            Reorder
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-stone-500">Package contents unavailable.</div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <div className="text-xs font-medium text-stone-500">Carrier</div>
                  <div className="mt-3 flex items-center gap-3">
                    {courierLogo ? (
                      <a
                        href={courierUrl || undefined}
                        target={courierUrl ? '_blank' : undefined}
                        rel={courierUrl ? 'noreferrer' : undefined}
                        aria-label={`Track shipment with ${courierName || 'carrier'}`}
                        title={courierName || 'Carrier'}
                        className={courierUrl ? 'block' : 'pointer-events-none'}
                      >
                        <img
                          src={courierLogo}
                          alt={courierName}
                          className="h-10 w-10 rounded border border-stone-200 object-contain bg-white"
                          loading="lazy"
                        />
                      </a>
                    ) : (
                      <div className="h-10 w-10 rounded border border-stone-200 bg-white" />
                    )}
                    <div>
                      <div className="text-sm text-stone-900">{courierName}</div>
                      {trackingNumber ? (
                        <div className="mt-1 flex items-center gap-2">
                          {courierUrl ? (
                            <a
                              href={courierUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-stone-500 underline hover:text-stone-700"
                            >
                              {trackingNumber}
                            </a>
                          ) : (
                            <div className="text-xs text-stone-500">{trackingNumber}</div>
                          )}
                          <button
                            type="button"
                            onClick={onCopyTrackingNumber}
                            className="text-xs text-stone-700 underline hover:text-stone-900"
                          >
                            {copied ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
