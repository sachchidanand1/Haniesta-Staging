import {Form} from '@remix-run/react';
import type {CustomerAddress} from '@shopify/hydrogen/customer-account-api-types';

import type {CustomerDetailsFragment} from 'customer-accountapi.generated';
import {Button} from '~/components/Button';
import {Heading, Text} from '~/components/Text';
import {Link} from '~/components/Link';

export function AccountAddressBook({
  customer,
  addresses,
}: {
  customer: CustomerDetailsFragment;
  addresses: CustomerAddress[];
}) {
  return (
    <>
      <div className="px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="mb-6 flex items-center justify-between">
          <Heading
            as="h1"
            size="heading"
            className="text-2xl md:text-3xl lg:text-4xl"
          >
            Address Book
          </Heading>
        </div>

        {!addresses?.length && (
          <Text className="mb-1" width="narrow" as="p" size="copy">
            You haven&apos;t saved any addresses yet.
          </Text>
        )}
        <div className="w-48">
          <Button
            to="address/add"
            className="mt-2 text-sm w-full mb-6"
            variant="secondary"
          >
            Add an Address
          </Button>
        </div>
        {Boolean(addresses?.length) && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {customer.defaultAddress && (
              <Address address={customer.defaultAddress} defaultAddress />
            )}
            {addresses
              .filter((address) => address.id !== customer.defaultAddress?.id)
              .map((address) => (
                <Address key={address.id} address={address} />
              ))}
          </div>
        )}
      </div>
    </>
  );
}

function Address({
  address,
  defaultAddress,
}: {
  address: CustomerAddress;
  defaultAddress?: boolean;
}) {
  return (
    <div className="lg:p-8 p-6 border border-primary/10 flex flex-col">
      {defaultAddress && (
        <div className="mb-3 flex flex-row">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary/50">
            Default
          </span>
        </div>
      )}
      <ul className="flex-1 flex-row">
        {(address.firstName || address.lastName) && (
          <li>
            {'' +
              (address.firstName && address.firstName + ' ') +
              address?.lastName}
          </li>
        )}
        {address.formatted &&
          address.formatted.map((line: string) => <li key={line}>{line}</li>)}
      </ul>

      <div className="flex flex-row font-medium mt-6 items-baseline">
        <Link
          to={`/account/address/${encodeURIComponent(address.id)}`}
          className="text-left underline text-sm"
          prefetch="intent"
        >
          Edit
        </Link>
        <Form action="address/delete" method="delete">
          <input type="hidden" name="addressId" value={address.id} />
          <button className="text-left text-primary/50 ml-6 text-sm">
            Remove
          </button>
        </Form>
      </div>
    </div>
  );
}
