import {
  Form,
  Outlet,
  useLoaderData,
  useLocation,
  useMatches,
  useOutlet,
} from '@remix-run/react';
import {useState} from 'react';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {decodeIdTokenClaims, extractCustomerFromClaims} from '~/lib/idtoken.server';
import {flattenConnection} from '@shopify/hydrogen';

import type {
  CustomerDetailsFragment,
  OrderCardFragment,
} from 'customer-accountapi.generated';
import {Heading, Text} from '~/components/Text';
import {Button} from '~/components/Button';
import {OrderCard} from '~/components/OrderCard';
import {AccountDetails} from '~/components/AccountDetails';
import {AccountAddressBook} from '~/components/AccountAddressBook';
import {Modal} from '~/components/Modal';
import {usePrefixPathWithLocale} from '~/lib/utils';
import {CACHE_NONE, routeHeaders} from '~/data/cache';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {findAdminCustomerIdByEmail} from '~/lib/customer-admin.server';

import {doLogout} from './($locale).account_.logout';

export const headers = routeHeaders;

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
  );

  /**
   * If the customer failed to load, we assume their access token is invalid.
   */
  if (errors?.length || !data?.customer) {
    throw await doLogout(context);
  }

  const customer = data?.customer;

  // Ensure Admin customerId is available in session for favorites metafield sync
  try {
    const existing = context.session.get('customerId') as string | undefined;
    if (!existing) {
      // 1) Try to seed from Customer Account API's customer.id if it looks like a numeric id
      const caId = (customer as any)?.id as string | undefined;
      if (caId && /^\d+$/.test(caId)) {
        context.session.set('customerId', `gid://shopify/Customer/${caId}`);
      } else {
        // 2) Try to seed from id token cookie if present
        const cookie = request.headers.get('Cookie') || '';
        const idTokenMatch = /(?:^|;\s*)shopify_id_token=([^;]+)/.exec(cookie);
        const idToken = idTokenMatch ? decodeURIComponent(idTokenMatch[1]) : undefined;
        if (idToken) {
          const claims = decodeIdTokenClaims(idToken);
          const extracted = extractCustomerFromClaims(claims);
          const possibleId = extracted.id;
          if (possibleId) {
            const gid = possibleId.startsWith('gid://shopify/Customer/')
              ? possibleId
              : /^\d+$/.test(possibleId)
              ? `gid://shopify/Customer/${possibleId}`
              : possibleId;
            context.session.set('customerId', gid);
          }
        }
      }
    }
  } catch {}

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}.`
      : `Welcome to your account.`
    : 'Account Details';

  return defer(
    {
      customer,
      heading,
    },
    {
      headers: {
        'Cache-Control': CACHE_NONE,
      },
    },
  );
}

export default function Authenticated() {
  const data = useLoaderData<typeof loader>();
  const outlet = useOutlet();
  const matches = useMatches();

  // routes that export handle { renderInModal: true }
  const renderOutletInModal = matches.some((match) => {
    const handle = match?.handle as {renderInModal?: boolean};
    return handle?.renderInModal;
  });

  // If this route (or a child) wants to render its outlet in a modal,
  // always keep the main Account layout mounted, and layer the modal on top.
  // This avoids remounting Account when navigating between /account and
  // modal routes like /account/edit or /account/address/add, so the
  // selected sidebar tab (e.g. Shipping Info) remains active.
  if (!outlet || renderOutletInModal) {
    return (
      <>
        <Account {...data} />
        {outlet && renderOutletInModal && (
          <Modal cancelLink="/account">
            <Outlet context={{customer: data.customer}} />
          </Modal>
        )}
      </>
    );
  }

  // For non-modal child routes (e.g. full-page order detail), render the
  // outlet normally instead of the Account layout.
  return <Outlet context={{customer: data.customer}} />;
}

interface AccountType {
  customer: CustomerDetailsFragment;
  heading: string;
}

function Account({customer, heading}: AccountType) {
  const orders = flattenConnection(customer.orders);
  const addresses = flattenConnection(customer.addresses);

  type AccountSection = 'profile' | 'orders' | 'shipping';
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sectionParam = searchParams.get('section');

  const initialSection: AccountSection =
    sectionParam === 'orders' || sectionParam === 'shipping'
      ? (sectionParam as AccountSection)
      : 'profile';

  const [activeSection, setActiveSection] = useState<AccountSection>(
    initialSection,
  );

  const menuItems: {id: AccountSection; label: string}[] = [
    {id: 'profile', label: 'Profile'},
    {id: 'orders', label: 'Orders'},
    {id: 'shipping', label: 'Shipping Info'},
  ];

  const currentHeading = (() => {
    switch (activeSection) {
      case 'orders':
        return 'Orders';
      case 'shipping':
        return 'Shipping Info';
      case 'profile':
      default:
        return 'Profile';
    }
  })();

  return (
    <>
      <div className="px-4 md:px-8 lg:px-16 py-10 bg-[#f7f4ec]">
        <div className="max-w-6xl mx-auto flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-64 lg:shrink-0">
            <div className="bg-white/90 border border-primary/10 shadow-sm px-5 py-6 lg:px-6 lg:py-7">
              <Text
                as="p"
                size="copy"
                className="mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-primary/70"
              >
                {customer.firstName ? `Hi, ${customer.firstName}` : 'Hi,'}
              </Text>
              <nav className="flex flex-col gap-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`text-left text-sm px-3 py-2 transition-colors ${
                      activeSection === item.id
                        ? 'bg-primary text-contrast font-medium'
                        : 'text-primary/80 hover:bg-primary/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <Form
                  method="post"
                  action={usePrefixPathWithLocale('/account/logout')}
                  className="mt-4 pt-3 border-t border-primary/10"
                >
                  <button
                    type="submit"
                    className="text-left text-sm px-3 py-2 text-primary/60 hover:bg-primary/5"
                  >
                    Sign Out
                  </button>
                </Form>
              </nav>
            </div>
          </aside>

          <section className="flex-1">

            <div className="bg-white/95 border border-primary/10 shadow-sm">
              {activeSection === 'profile' && (
                <AccountDetails customer={customer} />
              )}

              {activeSection === 'orders' && orders && (
                <AccountOrderHistory orders={orders} />
              )}

              {activeSection === 'shipping' && (
                <AccountAddressBook
                  addresses={addresses}
                  customer={customer}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

type OrderCardsProps = {
  orders: OrderCardFragment[];
};

function AccountOrderHistory({orders}: OrderCardsProps) {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
      <div className="mb-6 flex items-baseline justify-between">
        <Heading
          as="h1"
          size="heading"
          className="text-2xl md:text-3xl lg:text-4xl"
        >
          Order History
        </Heading>
        {orders?.length ? (
          <Text size="fine" color="subtle">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </Text>
        ) : null}
      </div>
      {orders?.length ? <Orders orders={orders} /> : <EmptyOrders />}
    </div>
  );
}

function EmptyOrders() {
  return (
    <div>
      <Text className="mb-1" size="fine" width="narrow" as="p">
        You haven&apos;t placed any orders yet.
      </Text>
      <div className="w-48">
        <Button
          className="w-full mt-2 text-sm"
          variant="secondary"
          to={usePrefixPathWithLocale('/')}
        >
          Start Shopping
        </Button>
      </div>
    </div>
  );
}

function Orders({orders}: OrderCardsProps) {
  return (
    <ul className="border-t border-b border-primary/10 divide-y divide-primary/10">
      {orders.map((order) => (
        <OrderCard order={order} key={order.id} />
      ))}
    </ul>
  );
}
