import clsx from 'clsx';
import {useEffect, useRef} from 'react';
import {
  useActionData,
  useFetcher,
  useFetchers,
  useRevalidator,
  useRouteLoaderData,
} from '@remix-run/react';
import useScroll from 'react-use/esm/useScroll';
import {
  flattenConnection,
  CartForm,
  Image,
  Money,
  useOptimisticData,
  OptimisticInput,
  type CartReturn,
} from '@shopify/hydrogen';
import type {
  Cart as CartType,
  CartCost,
  CartLine,
  CartLineUpdateInput,
} from '@shopify/hydrogen/storefront-api-types';

import {Button} from '~/components/Button';
import {Text, Heading} from '~/components/Text';
import {Link} from '~/components/Link';
import {IconRemove} from '~/components/Icon';
import {FeaturedProducts} from '~/components/FeaturedProducts';
import {getInputStyleClasses} from '~/lib/utils';
import {createSafeCheckoutUrl} from '~/lib/checkout-utils';
import type {RootLoader} from '~/root';
import {useCartInFlight} from '~/hooks/useCartInFlight';
import {CartSkeleton} from '~/components/CartSkeleton';

type Layouts = 'page' | 'drawer';

export function Cart({
  layout,
  onClose,
  cart,
}: {
  layout: Layouts;
  onClose?: () => void;
  cart: CartReturn | null;
}) {
  const linesCount = Boolean(cart?.lines?.edges?.length || 0);
  const inFlight = useCartInFlight();

  return (
    <>
      {inFlight ? (
        <CartSkeleton layout={layout} />
      ) : (
        <>
          <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} />
          <CartDetails cart={cart} layout={layout} />
        </>
      )}
    </>
  );
}

export function CartDetails({
  layout,
  cart,
}: {
  layout: Layouts;
  cart: CartType | null;
}) {
  // @todo: get optimistic cart cost
  const cartHasItems = !!cart && cart.totalQuantity > 0;
  const container = {
    drawer: 'grid grid-cols-1 h-screen-no-nav grid-rows-[1fr_auto]',
    page: 'w-full pb-12 grid md:grid-cols-2 md:items-start gap-8 md:gap-8 lg:gap-12',
  };

  return (
    <div className={container[layout]}>
      <CartLines lines={cart?.lines} layout={layout} />
      {cartHasItems && (
        <CartSummary cart={cart} layout={layout}>
          <CartDiscounts discountCodes={cart.discountCodes} />
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
        </CartSummary>
      )}
    </div>
  );
}

/**
 * Temporary discount UI
 * @param discountCodes the current discount codes applied to the cart
 * @todo rework when a design is ready
 */
function CartDiscounts({
  discountCodes,
}: {
  discountCodes: CartType['discountCodes'];
}) {
  const discountFetcher = useFetcher() as any;
  const FetcherForm = discountFetcher.Form as unknown as React.ComponentType<any>;
  const codeRef = useRef<HTMLInputElement | null>(null);
  const revalidator = useRevalidator();
  const lastRevalidatedCartIdRef = useRef<string | undefined>(undefined);
  const actionData = useActionData() as
    | {
        userErrors?: Array<{message?: string}>;
        errors?: Array<{message?: string} | string>;
      }
    | undefined;

  const rawMessages: string[] = [];
  if (Array.isArray(actionData?.userErrors)) {
    for (const ue of actionData!.userErrors!) {
      const msg = (ue as any)?.message;
      if (typeof msg === 'string' && msg.trim()) rawMessages.push(msg.trim());
    }
  }
  if (Array.isArray(actionData?.errors)) {
    for (const e of actionData!.errors!) {
      const msg = typeof e === 'string' ? e : (e as any)?.message;
      if (typeof msg === 'string' && msg.trim()) rawMessages.push(msg.trim());
    }
  }

  if (Array.isArray(discountFetcher?.data?.userErrors)) {
    for (const ue of discountFetcher.data.userErrors) {
      const msg = (ue as any)?.message;
      if (typeof msg === 'string' && msg.trim()) rawMessages.push(msg.trim());
    }
  }
  if (Array.isArray(discountFetcher?.data?.errors)) {
    for (const e of discountFetcher.data.errors) {
      const msg = typeof e === 'string' ? e : (e as any)?.message;
      if (typeof msg === 'string' && msg.trim()) rawMessages.push(msg.trim());
    }
  }

  const errorMessage = rawMessages.length ? rawMessages.join(' | ') : null;

  const effectiveDiscountCodes =
    discountFetcher?.state === 'idle' && discountFetcher?.data?.cart?.discountCodes
      ? (discountFetcher.data.cart.discountCodes as CartType['discountCodes'])
      : discountCodes;

  const codes: string[] =
    effectiveDiscountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  const allCodes: string[] =
    effectiveDiscountCodes?.map((d) => d?.code).filter(Boolean) as string[];

  const hasApplicableDiscountCode = codes.length > 0;

  const discountInputs = {
    discountCodes: [] as string[],
  };

  const appliedMessage =
    discountFetcher?.state === 'idle' &&
    discountFetcher?.data?.cart?.discountCodes?.some((d: any) => d?.applicable)
      ? 'Discount applied'
      : null;

  const nonApplicableMessage =
    discountFetcher?.state === 'idle' &&
    discountFetcher?.data?.cart?.discountCodes?.length &&
    !discountFetcher?.data?.cart?.discountCodes?.some((d: any) => d?.applicable)
      ? "Discount code isn't valid"
      : null;

  useEffect(() => {
    if (discountFetcher?.state !== 'idle') return;
    const nextId = discountFetcher?.data?.cart?.id as string | undefined;
    if (!nextId) return;
    if (lastRevalidatedCartIdRef.current === nextId) return;
    lastRevalidatedCartIdRef.current = nextId;
    try {
      revalidator.revalidate();
    } catch {}
  }, [discountFetcher?.state, discountFetcher?.data, revalidator]);

  return (
    <>
      {/* Have existing discount, display it with a remove option */}
      <dl className={hasApplicableDiscountCode ? 'grid' : 'hidden'}>
        <div className="flex items-center justify-between font-medium">
          <Text as="dt" className="text-[10px]">Discount(s)</Text>
          <div className="flex items-center justify-between">
            <UpdateDiscountForm discountCodes={[]}>
              <button type="submit">
                <IconRemove
                  aria-hidden="true"
                  style={{height: 18, marginRight: 4}}
                />
              </button>
            </UpdateDiscountForm>
            <Text as="dd" className="text-[10px]">{codes?.join(', ')}</Text>
          </div>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      {!hasApplicableDiscountCode && (
        <FetcherForm
          method="post"
          action="/cart"
          onSubmit={(e: any) => {
            try {
              const el = codeRef.current;
              const code = (el?.value || '').trim();
              if (!code) return;

              const nextInputs = {
                ...discountInputs,
                discountCode: code,
              };

              const inputsEl = (e.currentTarget as HTMLFormElement)?.querySelector(
                'input[name="inputs"]',
              ) as HTMLInputElement | null;

              if (inputsEl) inputsEl.value = JSON.stringify(nextInputs);
            } catch {}
          }}
        >
          <input
            type="hidden"
            name="cartAction"
            value={CartForm.ACTIONS.DiscountCodesUpdate}
          />
          <input
            type="hidden"
            name="inputs"
            value={JSON.stringify(discountInputs)}
          />
          <div
            className={clsx(
              'flex',
              'items-center gap-3 justify-between text-copy',
            )}
          >
            <input
              className={clsx(getInputStyleClasses(), 'text-sm py-2')}
              type="text"
              name="discountCode"
              placeholder="Discount code"
              ref={codeRef}
            />
            <button
              className="bg-haniesta-brown text-white px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap hover:bg-haniesta-brown/90 transition-colors disabled:opacity-60"
              type="submit"
              disabled={discountFetcher.state !== 'idle'}
            >
              Apply
            </button>
          </div>
        </FetcherForm>
      )}

      {errorMessage && (
        <Text className="mt-2 text-sm text-red-600">{errorMessage}</Text>
      )}

      {appliedMessage ? (
        <Text className="mt-2 text-sm text-green-700">{appliedMessage}</Text>
      ) : nonApplicableMessage ? (
        <Text className="mt-2 text-sm text-red-600">{nonApplicableMessage}</Text>
      ) : null}
    </>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartLines({
  layout = 'drawer',
  lines: cartLines,
}: {
  layout: Layouts;
  lines: CartType['lines'] | undefined;
}) {
  const currentLines = cartLines ? flattenConnection(cartLines) : [];
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  const className = clsx([
    y > 0 ? 'border-t' : '',
    layout === 'page'
      ? 'flex-grow md:translate-y-4'
      : 'px-6 pb-6 sm-max:pt-2 overflow-auto transition md:px-12',
  ]);

  return (
    <section
      ref={scrollRef}
      aria-labelledby="cart-contents"
      className={className}
    >
      <ul className="grid gap-6 md:gap-10">
        {currentLines.map((line) => (
          <CartLineItem key={line.id} line={line as CartLine} />
        ))}
      </ul>
    </section>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl: string}) {
  if (!checkoutUrl) return null;

  // Use the safer checkout URL creation with expected domain from root loader
  const rootData = useRouteLoaderData<RootLoader>('root');
  const expectedDomain = (rootData as any)?.consent?.checkoutDomain as string | undefined;
  const safeCheckoutUrl = createSafeCheckoutUrl(checkoutUrl, expectedDomain);
  
  if (!safeCheckoutUrl) {
    console.error('Invalid checkout URL:', checkoutUrl);
    return null;
  }

  return (
    <div className="flex flex-col mt-2">
      <a 
        href={safeCheckoutUrl} 
        target="_self"
        onClick={() => {
          // Meta Pixel InitiateCheckout tracking
          if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'InitiateCheckout');
          }
        }}
      >
        <Button as="span" width="full">
          Continue to Checkout
        </Button>
      </a>
      {/* @todo: <CartShopPayButton cart={cart} /> */}
    </div>
  );
}

function CartSummary({
  cart,
  layout,
  children = null,
}: {
  children?: React.ReactNode;
  cart: CartType;
  layout: Layouts;
}) {
  const fetchers = useFetchers();
  const discountUpdating = fetchers.some((f) => {
    if (!f || f.state === 'idle') return false;
    const fd = (f as any).formData as FormData | undefined;
    if (!fd) return false;
    const action = fd.get('cartAction') ?? fd.get('action');
    return action === CartForm.ACTIONS.DiscountCodesUpdate;
  });
  const cost = cart.cost;
  const summary = {
    drawer: 'grid gap-3 p-4 border-t md:px-12',
    page: 'sticky top-nav grid gap-4 p-4 md:px-6 md:translate-y-4 bg-primary/5 rounded w-full',
  };

  const currencyCode = cost?.totalAmount?.currencyCode;
  const subtotalAmount = Number(cost?.subtotalAmount?.amount ?? 0);
  const totalAmount = Number(cost?.totalAmount?.amount ?? 0);
  const taxAmount = Number(cost?.totalTaxAmount?.amount ?? 0);

  const hasApplicableDiscount =
    Array.isArray(cart?.discountCodes) &&
    cart.discountCodes.some((d) => Boolean(d?.applicable));

  const rawSavings = subtotalAmount - totalAmount;
  const savingsAmount = hasApplicableDiscount && rawSavings > 0 ? rawSavings : 0;

  const savingsMoney =
    currencyCode && savingsAmount
      ? ({amount: savingsAmount.toFixed(2), currencyCode} as any)
      : null;

  return (
    <section aria-labelledby="summary-heading" className={summary[layout]}>
      <h2 id="summary-heading" className="sr-only">
        Order summary
      </h2>
      <dl className="grid text-xs leading-tight">
        {discountUpdating ? (
          <>
            <div className="flex items-center justify-between font-medium">
              <span className="inline-block h-3 w-20 rounded bg-primary/10 animate-pulse" />
              <span className="inline-block h-3 w-16 rounded bg-primary/10 animate-pulse" />
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="inline-block h-3 w-24 rounded bg-primary/10 animate-pulse" />
              <span className="inline-block h-3 w-16 rounded bg-primary/10 animate-pulse" />
            </div>
            <div className="flex items-center justify-between mt-0.5 font-semibold text-xs">
              <span className="inline-block h-3 w-14 rounded bg-primary/10 animate-pulse" />
              <span className="inline-block h-3 w-14 rounded bg-primary/10 animate-pulse" />
            </div>
            <div className="flex items-center justify-between mt-0.5 text-xs text-primary/70">
              <span className="inline-block h-3 w-16 rounded bg-primary/10 animate-pulse" />
              <span className="inline-block h-3 w-20 rounded bg-primary/10 animate-pulse" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between font-medium">
              <Text as="dt" className="text-[10px]">Subtotal{cart?.totalQuantity ? ` · ${cart.totalQuantity} item${cart.totalQuantity === 1 ? '' : 's'}` : ''}</Text>
              <Text as="dd" data-test="subtotal" className="text-[10px]">
                {cost?.subtotalAmount?.amount ? (
                  <Money data={cost?.subtotalAmount} />
                ) : (
                  '-'
                )}
              </Text>
            </div>

            {savingsMoney && (
              <div className="flex items-center justify-between mt-0.5">
                <Text as="dt" className="text-[10px]">Order discount</Text>
                <Text as="dd" className="text-green-700 whitespace-nowrap flex items-center justify-end gap-1 text-[10px]">
                  <span>-</span>
                  <Money data={savingsMoney} />
                </Text>
              </div>
            )}

            <div className="flex items-center justify-between mt-0.5 font-semibold text-xs">
              <Text as="dt" className="text-[10px]">Total</Text>
              <Text as="dd" className="text-[10px]">
                {cost?.totalAmount?.amount ? <Money data={cost.totalAmount} /> : '-'}
              </Text>
            </div>

            {taxAmount > 0 && currencyCode && (
              <div className="flex items-center justify-between mt-0.5 text-xs text-primary/70">
                <Text as="dt" className="text-[10px]">Including</Text>
                <Text as="dd" className="text-[10px]">
                  <Money data={{amount: taxAmount.toFixed(2), currencyCode} as any} /> in taxes
                </Text>
              </div>
            )}

            {/* {savingsMoney && (
              <div className="flex items-center justify-between mt-1 text-xs font-semibold">
                <Text as="dt">Total savings</Text>
                <Text as="dd">
                  <Money data={savingsMoney} />
                </Text>
              </div>
            )} */}
          </>
        )}
      </dl>
      {children}
    </section>
  );
}

type OptimisticData = {
  action?: string;
  quantity?: number;
};

function CartLineItem({line}: {line: CartLine}) {
  const optimisticData = useOptimisticData<OptimisticData>(line?.id);

  if (!line?.id) return null;

  const {id, quantity, merchandise} = line;

  if (typeof quantity === 'undefined' || !merchandise?.product) return null;

  return (
    <li
      key={id}
      className="flex gap-4"
      style={{
        // Hide the line item if the optimistic data action is remove
        // Do not remove the form from the DOM
        display: optimisticData?.action === 'remove' ? 'none' : 'flex',
      }}
    >
      <div className="flex-shrink">
        {merchandise.image && (
          <Image
            width={110}
            height={110}
            data={merchandise.image}
            className="object-cover object-center w-24 h-24 border rounded md:w-28 md:h-28"
            alt={merchandise.title}
            sizes="(min-width: 768px) 112px, 96px"
          />
        )}
      </div>

      <div className="flex justify-between flex-grow">
        <div className="grid gap-2">
          <Heading as="h3" size="copy">
            {merchandise?.product?.handle ? (
              <Link to={`/products/${merchandise.product.handle}`}>
                {merchandise?.product?.title || ''}
              </Link>
            ) : (
              <Text>{merchandise?.product?.title || ''}</Text>
            )}
          </Heading>

          <div className="grid pb-2">
            {(merchandise?.selectedOptions || []).map((option) => (
              <Text color="subtle" key={option.name}>
                {option.name}: {option.value}
              </Text>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex justify-start text-copy">
              <CartLineQuantityAdjust line={line} />
            </div>
            <ItemRemoveButton lineId={id} />
          </div>
        </div>
        <Text>
          <CartLinePrice line={line} as="span" />
        </Text>
      </div>
    </li>
  );
}

function ItemRemoveButton({lineId}: {lineId: CartLine['id']}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{
        lineIds: [lineId],
      }}
    >
      <button
        className="flex items-center justify-center w-10 h-10 border rounded"
        type="submit"
      >
        <span className="sr-only">Remove</span>
        <IconRemove aria-hidden="true" />
      </button>
      <OptimisticInput id={lineId} data={{action: 'remove'}} />
    </CartForm>
  );
}

function CartLineQuantityAdjust({line}: {line: CartLine}) {
  const optimisticId = line?.id;
  const optimisticData = useOptimisticData<OptimisticData>(optimisticId);

  if (!line || typeof line?.quantity === 'undefined') return null;

  const optimisticQuantity = optimisticData?.quantity || line.quantity;

  const {id: lineId} = line;
  const prevQuantity = Number(Math.max(0, optimisticQuantity - 1).toFixed(0));
  const nextQuantity = Number((optimisticQuantity + 1).toFixed(0));

  return (
    <>
      <label htmlFor={`quantity-${lineId}`} className="sr-only">
        Quantity, {optimisticQuantity}
      </label>
      <div className="flex items-center border rounded">
        <UpdateCartButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            name="decrease-quantity"
            aria-label="Decrease quantity"
            className="w-10 h-10 transition text-primary/50 hover:text-primary disabled:text-primary/10"
            value={prevQuantity}
            disabled={optimisticQuantity <= 1}
          >
            <span>&#8722;</span>
            <OptimisticInput
              id={optimisticId}
              data={{quantity: prevQuantity}}
            />
          </button>
        </UpdateCartButton>

        <div className="px-2 text-center" data-test="item-quantity">
          {optimisticQuantity}
        </div>

        <UpdateCartButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            className="w-10 h-10 transition text-primary/50 hover:text-primary"
            name="increase-quantity"
            value={nextQuantity}
            aria-label="Increase quantity"
          >
            <span>&#43;</span>
            <OptimisticInput
              id={optimisticId}
              data={{quantity: nextQuantity}}
            />
          </button>
        </UpdateCartButton>
      </div>
    </>
  );
}

function UpdateCartButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{
        lines,
      }}
    >
      {children}
    </CartForm>
  );
}

function CartLinePrice({
  line,
  priceType = 'regular',
  ...passthroughProps
}: {
  line: CartLine;
  priceType?: 'regular' | 'compareAt';
  [key: string]: any;
}) {
  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

  const moneyV2 =
    priceType === 'regular'
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  return <Money withoutTrailingZeros {...passthroughProps} data={moneyV2} />;
}

export function CartEmpty({
  hidden = false,
  layout = 'drawer',
  onClose,
}: {
  hidden: boolean;
  layout?: Layouts;
  onClose?: () => void;
}) {
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  const container = {
    drawer: clsx([
      'content-start gap-4 px-6 pb-8 transition overflow-y-scroll md:gap-12 md:px-12 h-screen-no-nav md:pb-12',
      y > 0 ? 'border-t' : '',
    ]),
    page: clsx([
      hidden ? '' : 'grid',
      `pb-12 w-full md:items-start gap-4 md:gap-8 lg:gap-12`,
    ]),
  };

  return (
    <div ref={scrollRef} className={container[layout]} hidden={hidden}>
      <section className="grid gap-6">
        <Text format>
          Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
          started!
        </Text>
        <div>
          <Button onClick={onClose}>Continue shopping</Button>
        </div>
      </section>
      <section className="grid gap-8 pt-16">
        <FeaturedProducts
          count={4}
          heading="Shop Best Sellers"
          layout={layout}
          onClose={onClose}
          showReviewBadge={false}
          sortKey="BEST_SELLING"
        />
      </section>
    </div>
  );
}
