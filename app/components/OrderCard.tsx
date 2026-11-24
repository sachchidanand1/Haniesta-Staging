import {flattenConnection} from '@shopify/hydrogen';
import {Image} from '~/components/Image';

import type {OrderCardFragment} from 'customer-accountapi.generated';
import {Heading, Text} from '~/components/Text';
import {Link} from '~/components/Link';
import {statusMessage} from '~/lib/utils';

export function OrderCard({order}: {order: OrderCardFragment}) {
  if (!order?.id) return null;

  const [legacyOrderId, key] = order!.id!.split('/').pop()!.split('?');
  const lineItems = flattenConnection(order?.lineItems);
  const fulfillmentStatus = flattenConnection(order?.fulfillments)[0]?.status;
  const url = key
    ? `/account/orders/${legacyOrderId}?${key}`
    : `/account/orders/${legacyOrderId}`;

  return (
    <li className="border border-primary/10 bg-white/95 shadow-sm transition-colors hover:bg-[#f7f4ec]">
      <Link
        className="flex items-center justify-between gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-5"
        to={url}
        prefetch="intent"
      >
        <div className="flex items-center gap-4 md:gap-6">
          {lineItems[0].image && (
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#f0e6d4] md:h-20 md:w-20">
              <Image
                width={120}
                height={120}
                className="h-full w-full object-cover fadeIn"
                alt={lineItems[0].image?.altText ?? 'Order image'}
                src={lineItems[0].image.url}
                sizes="120px"
              />
            </div>
          )}
          <div className="space-y-1 text-left">
            <Heading as="h3" format size="copy" className="text-base md:text-[1.02rem]">
              {lineItems.length > 1
                ? `${lineItems[0].title} +${lineItems.length - 1} more`
                : lineItems[0].title}
            </Heading>
            <div className="flex flex-wrap items-center gap-3 text-xs text-primary/70">
              <span>Order No. {order.number}</span>
              <span className="hidden h-3 w-px bg-primary/15 md:inline-block" />
              <span>{new Date(order.processedAt).toDateString()}</span>
              {fulfillmentStatus && (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
                    fulfillmentStatus === 'SUCCESS'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-[#f7f4ec] text-primary/70'
                  }`}
                >
                  {statusMessage(fulfillmentStatus)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-primary/80">
          <span className="hidden text-[11px] uppercase tracking-[0.18em] md:inline">
            View details
          </span>
          <span className="inline-flex h-8 w-8 items-center justify-center border border-primary/20 bg-white text-primary/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      </Link>
    </li>
  );
}

export const ORDER_CARD_FRAGMENT = `#graphql
  fragment OrderCard on Order {
    id
    orderNumber
    processedAt
    financialStatus
    fulfillmentStatus
    currentTotalPrice {
      amount
      currencyCode
    }
    lineItems(first: 2) {
      edges {
        node {
          variant {
            image {
              url
              altText
              height
              width
            }
          }
          title
        }
      }
    }
  }
`;
