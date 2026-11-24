import clsx from 'clsx';
import {json, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, useOutletContext, type MetaFunction} from '@remix-run/react';
import {CartForm, Money, flattenConnection} from '@shopify/hydrogen';
import {useEffect} from 'react';
import {Image} from '~/components/Image';
import type {FulfillmentStatus} from '@shopify/hydrogen/customer-account-api-types';

import type {OrderFragment} from 'customer-accountapi.generated';
import type {CustomerDetailsFragment} from 'customer-accountapi.generated';
import {statusMessage, usePrefixPathWithLocale} from '~/lib/utils';
import {Link} from '~/components/Link';
import {Heading, Text} from '~/components/Text';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {adminGraphQL} from '~/lib/admin.server';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({request, context, params}: LoaderFunctionArgs) {
  if (!params.id) {
    return redirect(params?.locale ? `${params.locale}/account` : '/account');
  }

  // Validate that the ID is a valid order ID (numeric or alphanumeric, not a file extension)
  if (params.id.includes('.') || params.id.includes('css') || params.id.includes('map')) {
    throw new Response('Invalid order ID', {status: 404});
  }

  const queryParams = new URL(request.url).searchParams;
  const orderToken = queryParams.get('key');

  try {
    const orderId = orderToken
      ? `gid://shopify/Order/${params.id}?key=${orderToken}`
      : `gid://shopify/Order/${params.id}`;

    const {data, errors} = await context.customerAccount.query(
      CUSTOMER_ORDER_QUERY,
      {variables: {orderId}},
    );

    if (errors?.length || !data?.order || !data?.order?.lineItems) {
      throw new Error('order information');
    }

    const order: OrderFragment = data.order;

    const lineItems = flattenConnection(order.lineItems);

    const discountApplications = flattenConnection(order.discountApplications);

    const firstDiscountApplication: any = discountApplications[0];
    const firstDiscount = firstDiscountApplication?.value;

    const discountCode: string | null =
      typeof firstDiscountApplication?.code === 'string' && firstDiscountApplication.code.length
        ? firstDiscountApplication.code
        : null;

    const discountValue =
      firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

    const discountPercentage =
      firstDiscount?.__typename === 'PricingPercentageValue' &&
      firstDiscount?.percentage;

    const fulfillments = flattenConnection(order.fulfillments);

    const fulfillmentStatus =
      fulfillments.length > 0
        ? fulfillments[0].status
        : ('OPEN' as FulfillmentStatus);

    let adminTracking: {
      company?: string | null;
      number?: string | null;
      url?: string | null;
      deliveredAt?: string | null;
      updatedAt?: string | null;
    } | null = null;

    let buyAgainProductHandle: string | null = null;
    let buyAgainVariantId: string | null = null;

    try {
      const ADMIN_ORDER_QUERY = `
        query AdminOrderTracking($id: ID!) {
          order(id: $id) {
            id
            lineItems(first: 1) {
              edges {
                node {
                  product {
                    handle
                  }
                  variant {
                    id
                    legacyResourceId
                    product {
                      handle
                    }
                  }
                }
              }
            }
            fulfillments {
              id
              status
              deliveredAt
              updatedAt
              trackingInfo {
                company
                number
                url
              }
            }
          }
        }
      `;

      const adminOrderGid = `gid://shopify/Order/${params.id}`;
      const adminRes: any = await adminGraphQL(context as any, ADMIN_ORDER_QUERY, {id: adminOrderGid});

      const firstLine: any = adminRes?.order?.lineItems?.edges?.[0]?.node ?? null;

      buyAgainProductHandle =
        (typeof firstLine?.variant?.product?.handle === 'string' && firstLine.variant.product.handle) ||
        (typeof firstLine?.product?.handle === 'string' && firstLine.product.handle) ||
        null;

      const variantGid = typeof firstLine?.variant?.id === 'string' ? firstLine.variant.id : null;
      const legacyVariantId = firstLine?.variant?.legacyResourceId;
      buyAgainVariantId =
        (typeof legacyVariantId === 'string' && legacyVariantId ? legacyVariantId : null) ||
        (typeof legacyVariantId === 'number' ? String(legacyVariantId) : null) ||
        (variantGid ? String(variantGid).split('/').pop()?.split('?')[0] || null : null);

      const nodes: any[] = Array.isArray(adminRes?.order?.fulfillments)
        ? adminRes.order.fulfillments
        : Array.isArray(adminRes?.order?.fulfillments?.nodes)
          ? adminRes.order.fulfillments.nodes
          : Array.isArray(adminRes?.order?.fulfillments?.edges)
            ? adminRes.order.fulfillments.edges.map((e: any) => e?.node).filter(Boolean)
            : [];

      const firstWithTracking =
        nodes.find((f) => Array.isArray(f?.trackingInfo) && f.trackingInfo.length > 0) ||
        nodes[0];
      const ti = Array.isArray(firstWithTracking?.trackingInfo) ? firstWithTracking.trackingInfo[0] : null;
      if (ti || firstWithTracking?.deliveredAt || firstWithTracking?.updatedAt) {
        adminTracking = {
          company: ti?.company ?? null,
          number: ti?.number ?? null,
          url: ti?.url ?? null,
          deliveredAt: firstWithTracking?.deliveredAt ?? null,
          updatedAt: firstWithTracking?.updatedAt ?? null,
        };
      }
    } catch (e) {
      console.error('Admin API order lookup failed', e);
      adminTracking = null;
      buyAgainProductHandle = null;
      buyAgainVariantId = null;
    }

    return json({
      order,
      lineItems,
      discountValue,
      discountPercentage,
      discountCode,
      fulfillmentStatus,
      adminTracking,
      buyAgainProductHandle,
      buyAgainVariantId,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    });
  } catch (error) {
    throw new Response(error instanceof Error ? error.message : undefined, {
      status: 404,
    });
  }
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    discountCode,
    fulfillmentStatus,
    adminTracking,
    buyAgainProductHandle,
    buyAgainVariantId,
    storeDomain,
  } = useLoaderData<typeof loader>();

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const gtagFn = (window as any).gtag as undefined | ((...args: any[]) => void);
      if (!gtagFn) return;
      if (!order) return;

      const transactionId = (order as any).name || (order as any).id;
      if (!transactionId) return;

      const firedKey = `gtag_purchase_fired_${transactionId}`;
      if (window.sessionStorage.getItem(firedKey)) return;
      window.sessionStorage.setItem(firedKey, '1');

      const value = Number((order as any)?.totalPrice?.amount ?? 0);
      const currency = (order as any)?.totalPrice?.currencyCode ?? 'INR';

      gtagFn('event', 'conversion', {
        send_to: 'AW-18009274701/d0ntCLyT74YcEM3yvotD',
        value,
        currency,
        transaction_id: transactionId,
      });
    } catch {}
  }, [order]);

  const {customer} = useOutletContext<{customer: CustomerDetailsFragment}>();
  const accountOverviewUrl = usePrefixPathWithLocale('/account?section=orders');
  const trackShipmentUrl = usePrefixPathWithLocale('/track-shipment');
  const productsBaseUrl = usePrefixPathWithLocale('/products');
  const cartRoute = usePrefixPathWithLocale('/cart');

  const buyAgainProductUrl = buyAgainProductHandle
    ? `${productsBaseUrl}/${buyAgainProductHandle}`
    : null;
  const buyAgainMerchandiseId = buyAgainVariantId
    ? `gid://shopify/ProductVariant/${buyAgainVariantId}`
    : null;

  const trackingUrl = typeof adminTracking?.url === 'string' && adminTracking.url ? adminTracking.url : null;
  const trackingNumber = typeof adminTracking?.number === 'string' && adminTracking.number ? adminTracking.number : null;
  const trackingCompany = typeof adminTracking?.company === 'string' && adminTracking.company ? adminTracking.company : null;
  const deliveredAt = typeof adminTracking?.deliveredAt === 'string' && adminTracking.deliveredAt ? adminTracking.deliveredAt : null;
  const hasTracking = Boolean(trackingUrl || trackingNumber || trackingCompany);

  const timelineSteps = (() => {
    const base = [
      {key: 'confirmed', label: 'Confirmed'},
      {key: 'in_transit', label: 'On its way'},
      {key: 'out_for_delivery', label: 'Out for delivery'},
      {key: 'delivered', label: 'Delivered'},
    ] as const;

    const status = fulfillmentStatus;
    const delivered = Boolean(deliveredAt);
    const failed = status === 'FAILURE' || status === 'ERROR' || status === 'CANCELLED';

    const activeIndex = (() => {
      if (delivered) return 3;
      if (failed) return 1;
      if (status === 'SUCCESS') return 1;
      if (status === 'OPEN' || status === 'PENDING') return 0;
      return 0;
    })();

    return {
      steps: base,
      activeIndex,
      delivered,
      failed,
    };
  })();

  const statusLabel = timelineSteps.delivered
    ? 'Delivered'
    : hasTracking
      ? 'Shipped'
      : fulfillmentStatus === 'SUCCESS'
        ? null
        : statusMessage(fulfillmentStatus!);

  const contactName = [customer?.firstName, customer?.lastName]
    .filter(Boolean)
    .join(' ');
  const contactEmail = customer?.emailAddress?.emailAddress;
  const contactPhone = customer?.phoneNumber?.phoneNumber;

  const shippingCostMoney = (() => {
    const total = Number(order?.totalPrice?.amount ?? 0);
    const subtotal = Number(order?.subtotal?.amount ?? 0);
    const tax = Number(order?.totalTax?.amount ?? 0);
    const computed = Math.max(0, total - subtotal - tax);
    const currencyCode = order?.totalPrice?.currencyCode;
    return {amount: computed.toFixed(2), currencyCode};
  })();

  return (
    <div className="bg-[#f7f4ec]">
      <div className="px-4 md:px-8 lg:px-16 py-8">
        <div className="max-w-6xl mx-auto">
          <Heading
            as="h1"
            size="heading"
            className="mb-2 text-2xl md:text-3xl lg:text-4xl"
          >
            Order detail
          </Heading>
          <Link 
            to={accountOverviewUrl}
            className="inline-flex items-center gap-1.5 text-sm text-[#4a4032] font-medium hover:text-[#5a4a3a] transition-colors border-b border-[#4a4032] hover:border-[#5a4a3a] pb-0.5"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              className="w-3.5 h-3.5"
            >
              <path 
                fillRule="evenodd" 
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Return to Account Overview
          </Link>
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-16 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <Heading as="h1" size="heading" className="text-2xl md:text-3xl lg:text-4xl">
                Order {order.name}
              </Heading>
              <Text className="text-sm text-primary/60" as="p">
                Confirmed {new Date(order.processedAt!).toDateString()}
              </Text>
            </div>
            <div className="flex items-center gap-3">
              {buyAgainMerchandiseId ? (
                <CartForm
                  route={cartRoute}
                  inputs={{lines: [{merchandiseId: buyAgainMerchandiseId, quantity: 1}]}}
                  action={CartForm.ACTIONS.LinesAdd}
                >
                  {(fetcher) => (
                    <button
                      type="submit"
                      disabled={fetcher.state !== 'idle'}
                      className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-6 py-2 text-sm font-medium transition-colors ${
                        fetcher.state === 'idle'
                          ? 'border-stone-800 text-stone-800 hover:bg-stone-50'
                          : 'border-stone-200 text-stone-400 pointer-events-none'
                      }`}
                    >
                      Buy again
                    </button>
                  )}
                </CartForm>
              ) : (
                <a
                  href={buyAgainProductUrl || '#'}
                  aria-disabled={!buyAgainProductUrl}
                  target={buyAgainProductUrl ? '_blank' : undefined}
                  rel={buyAgainProductUrl ? 'noreferrer' : undefined}
                  className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-6 py-2 text-sm font-medium transition-colors ${
                    buyAgainProductUrl
                      ? 'border-stone-800 text-stone-800 hover:bg-stone-50'
                      : 'border-stone-200 text-stone-400 pointer-events-none'
                  }`}
                >
                  Buy again
                </a>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="bg-white/95 border border-primary/10 shadow-sm px-5 py-5 md:px-6 md:py-6 lg:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Text as="p" size="lead" className="font-medium">
                    {timelineSteps.delivered ? `Arrived ${new Date(deliveredAt!).toDateString()}` : 'Delivery'}
                  </Text>
                  <div className="mt-1">
                    <Link
                      to={trackingUrl || trackShipmentUrl}
                      target={trackingUrl ? '_blank' : undefined}
                      rel={trackingUrl ? 'noreferrer' : undefined}
                      className="text-sm text-[#4a4032] hover:text-[#5a4a3a] border-b border-[#4a4032] hover:border-[#5a4a3a]"
                    >
                      Track shipment
                    </Link>
                  </div>

                  {trackingCompany || trackingNumber ? (
                    <div className="mt-3 space-y-0.5">
                      {trackingCompany ? (
                        <Text as="p" size="fine" className="text-primary/60">
                          {trackingCompany}
                        </Text>
                      ) : null}
                      {trackingNumber ? (
                        <Text as="p" size="fine" className="text-primary/60">
                          {trackingNumber}
                        </Text>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                {statusLabel ? (
                  <Text size="fine" className="text-primary/60">
                    {statusLabel}
                  </Text>
                ) : null}
              </div>

              <div className="mt-5">
                <ol className="space-y-3">
                  {timelineSteps.steps.map((step, idx) => {
                    const isDone = idx < timelineSteps.activeIndex || timelineSteps.delivered;
                    const isActive = idx === timelineSteps.activeIndex && !timelineSteps.delivered;
                    const dotClass = isDone
                      ? 'bg-emerald-600 border-emerald-600'
                      : isActive
                        ? 'bg-white border-[#4a4032]'
                        : 'bg-white border-primary/30';
                    const textClass = isDone
                      ? 'text-primary'
                      : isActive
                        ? 'text-primary'
                        : 'text-primary/60';

                    return (
                      <li key={step.key} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={clsx('mt-0.5 h-3 w-3 rounded-full border', dotClass)}
                          />
                          {idx < timelineSteps.steps.length - 1 ? (
                            <div
                              className={clsx(
                                'mt-1 h-7 w-px',
                                isDone ? 'bg-emerald-600' : 'bg-primary/15',
                              )}
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <Text as="p" size="fine" className={clsx('font-medium', textClass)}>
                            {step.label}
                          </Text>
                          {step.key === 'confirmed' && order?.processedAt ? (
                            <Text as="p" size="fine" className="text-primary/50">
                              {new Date(order.processedAt).toDateString()}
                            </Text>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {timelineSteps.failed ? (
                  <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                    <Text size="fine" className="text-amber-900">
                      There was an issue with this fulfillment.
                    </Text>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="bg-white/95 border border-primary/10 shadow-sm px-5 py-5 md:px-6 md:py-6 lg:col-span-3">
              {lineItems?.length ? (
                <div className="space-y-3">
                  {lineItems.map((li) => (
                    <div key={li.id} className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        {li?.image ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded-md bg-[#f0e6d4] flex-shrink-0">
                            <Image
                              data={li.image}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="min-w-0">
                          <Text as="p" className="font-medium truncate">
                            {li.title}
                          </Text>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            {li.variantTitle ? (
                              <Text as="p" size="fine" className="text-primary/60">
                                {li.variantTitle}
                              </Text>
                            ) : null}
                            <Text as="p" size="fine" className="text-primary/60">
                              Qty {li.quantity}
                            </Text>
                          </div>
                        </div>
                      </div>
                      <Text as="p" className="font-medium whitespace-nowrap">
                        <Money data={li.price!} />
                      </Text>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <Text as="p" className="text-primary/70">
                    Subtotal
                  </Text>
                  <Text as="p" className="text-primary/80">
                    <Money data={order.subtotal!} />
                  </Text>
                </div>
                {((discountValue && discountValue.amount) || discountPercentage) ? (
                  <div className="flex items-center justify-between">
                    <Text as="p" className="text-primary/70">
                      Discount
                    </Text>
                    <Text as="p" className="text-primary/80">
                      {discountPercentage ? (
                        <span>-{discountPercentage}%</span>
                      ) : (
                        discountValue && <Money data={discountValue!} />
                      )}
                    </Text>
                  </div>
                ) : null}
                {discountCode ? (
                  <div className="flex items-center justify-between">
                    <Text as="p" className="text-primary/70">
                      Discount code
                    </Text>
                    <Text as="p" className="text-primary/80">
                      {discountCode}
                    </Text>
                  </div>
                ) : null}
                {order?.financialStatus ? (
                  <div className="flex items-center justify-between">
                    <Text as="p" className="text-primary/70">
                      Payment status
                    </Text>
                    <Text as="p" className="text-primary/80">
                      {String(order.financialStatus).replace(/_/g, ' ')}
                    </Text>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <Text as="p" className="text-primary/70">
                    Shipping
                  </Text>
                  <Text as="p" className="text-primary/80">
                    <Money data={shippingCostMoney as any} />
                  </Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text as="p" className="text-primary/70">
                    Tax
                  </Text>
                  <Text as="p" className="text-primary/80">
                    <Money data={order.totalTax!} />
                  </Text>
                </div>
                <div className="pt-3 border-t border-primary/10 flex items-baseline justify-between">
                  <Text as="p" className="text-base font-semibold">
                    Total
                  </Text>
                  <Text as="p" className="text-base font-semibold">
                    <Money data={order.totalPrice!} />
                  </Text>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white/95 border border-primary/10 shadow-sm px-5 py-5 md:px-6 md:py-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <Heading size="copy" className="font-semibold" as="h3">
                  Contact information
                </Heading>
                <div className="mt-4 space-y-1">
                  {contactName ? <Text as="p">{contactName}</Text> : null}
                  {contactEmail ? <Text as="p">{contactEmail}</Text> : null}
                  {contactPhone ? <Text as="p">{contactPhone}</Text> : null}
                </div>
              </div>

              <div>
                <Heading size="copy" className="font-semibold" as="h3">
                  Shipping address
                </Heading>
                {order?.shippingAddress ? (
                  <div className="mt-4 space-y-1">
                    <Text as="p">{order.shippingAddress.name}</Text>
                    {order?.shippingAddress?.formatted
                      ? order.shippingAddress.formatted.map((line: string) => (
                          <Text as="p" key={line}>
                            {line}
                          </Text>
                        ))
                      : null}
                  </div>
                ) : (
                  <Text as="p" className="mt-4 text-primary/60">
                    No shipping address defined
                  </Text>
                )}
              </div>

              <div>
                <Heading size="copy" className="font-semibold" as="h3">
                  Billing address
                </Heading>
                {order?.shippingAddress ? (
                  <div className="mt-4 space-y-1">
                    <Text as="p">{order.shippingAddress.name}</Text>
                    {order?.shippingAddress?.formatted
                      ? order.shippingAddress.formatted.map((line: string) => (
                          <Text as="p" key={line}>
                            {line}
                          </Text>
                        ))
                      : null}
                  </div>
                ) : (
                  <Text as="p" className="mt-4 text-primary/60">
                    No billing address defined
                  </Text>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
