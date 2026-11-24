import {
  json,
  redirect,
  type ActionFunction,
  type AppLoadContext,
} from '@shopify/remix-oxygen';
import {
  Form,
  useActionData,
  useOutletContext,
  useParams,
  useNavigation,
} from '@remix-run/react';
import {flattenConnection} from '@shopify/hydrogen';
import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import invariant from 'tiny-invariant';

import {Button} from '~/components/Button';
import {Text} from '~/components/Text';
import {Link} from '~/components/Link';
import {IconClose} from '~/components/Icon';
import {getInputStyleClasses} from '~/lib/utils';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

import {doLogout} from './($locale).account_.logout';
import type {AccountOutletContext} from './($locale).account.edit';

interface ActionData {
  formError?: string;
}

export const handle = {
  renderInModal: true,
};

export const action: ActionFunction = async ({request, context, params}) => {
  const {customerAccount} = context;
  const formData = await request.formData();

  // Double-check current user is logged in.
  // Will throw a logout redirect if not.
  if (!(await customerAccount.isLoggedIn())) {
    throw await doLogout(context);
  }

  const addressId = formData.get('addressId');
  invariant(typeof addressId === 'string', 'You must provide an address id.');

  if (request.method === 'DELETE') {
    try {
      const {data, errors} = await customerAccount.mutate(
        DELETE_ADDRESS_MUTATION,
        {variables: {addressId}},
      );

      if (errors?.length) {
        throw new Error(errors[0].message || 'An API error occurred');
      }

      if (data?.customerAddressUpdate?.userErrors?.length) {
        throw new Error(
          data.customerAddressUpdate.userErrors
            .map((error: any) => error.message)
            .join(', ') || 'A validation error occurred',
        );
      }

      return redirect(
        params?.locale ? `${params?.locale}/account` : '/account',
      );
    } catch (error: any) {
      return json(
        {formError: error.message},
        {
          status: 400,
        },
      );
    }
  }

  const address: CustomerAddressInput = {};

  const keys: (keyof CustomerAddressInput)[] = [
    'lastName',
    'firstName',
    'address1',
    'address2',
    'city',
    'zoneCode',
    'territoryCode',
    'zip',
    'phoneNumber',
    'company',
  ];

  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === 'string') {
      address[key] = value;
    }
  }

  const defaultAddress = formData.has('defaultAddress')
    ? String(formData.get('defaultAddress')) === 'on'
    : false;

  if (addressId === 'add') {
    try {
      const {data, errors} = await customerAccount.mutate(
        CREATE_ADDRESS_MUTATION,
        {variables: {address, defaultAddress}},
      );

      if (errors?.length) {
        throw new Error(errors[0].message || 'An API error occurred');
      }

      if (data?.customerAddressCreate?.userErrors?.length) {
        throw new Error(
          data.customerAddressCreate.userErrors
            .map((error: any) => error.message)
            .join(', ') || 'A validation error occurred',
        );
      }

      if (!data?.customerAddressCreate?.customerAddress?.id) {
        throw new Error('Expected customer address to be created');
      }

      return redirect(
        params?.locale ? `${params?.locale}/account` : '/account',
      );
    } catch (error: any) {
      return json(
        {formError: error.message},
        {
          status: 400,
        },
      );
    }
  } else {
    try {
      const {data, errors} = await customerAccount.mutate(
        UPDATE_ADDRESS_MUTATION,
        {
          variables: {
            address,
            addressId,
            defaultAddress,
          },
        },
      );

      if (errors?.length) {
        throw new Error(errors[0].message || 'An API error occurred');
      }

      if (data?.customerAddressUpdate?.userErrors?.length) {
        throw new Error(
          data.customerAddressUpdate.userErrors
            .map((error: any) => error.message)
            .join(', ') || 'A validation error occurred',
        );
      }

      return redirect(
        params?.locale ? `${params?.locale}/account` : '/account',
      );
    } catch (error: any) {
      return json(
        {formError: error.message},
        {
          status: 400,
        },
      );
    }
  }
};

export default function EditAddress() {
  const {id: addressId} = useParams();
  const isNewAddress = addressId === 'add';
  const actionData = useActionData<ActionData>();
  const {state} = useNavigation();
  const {customer} = useOutletContext<AccountOutletContext>();
  const addresses = flattenConnection(customer.addresses);
  const defaultAddress = customer.defaultAddress;
  /**
   * When a refresh happens (or a user visits this link directly), the URL
   * is actually stale because it contains a special token. This means the data
   * loaded by the parent and passed to the outlet contains a newer, fresher token,
   * and we don't find a match. We update the `find` logic to just perform a match
   * on the first (permanent) part of the ID.
   */
  const normalizedAddress = decodeURIComponent(addressId ?? '').split('?')[0];
  const address = addresses.find((address) =>
    address.id!.startsWith(normalizedAddress),
  );

  return (
    <>
      <div className="max-w-lg mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Text
            className="text-2xl md:text-3xl lg:text-4xl text-left"
            as="h3"
            size="lead"
          >
            {isNewAddress ? 'New Shipping Address' : 'Edit Shipping Address'}
          </Text>
          <Link
            to="/account"
            aria-label="Close address form and return to account overview"
            title="Close"
            className="p-4 -m-4 transition text-primary hover:text-primary/50"
          >
            <IconClose aria-label="Close panel" />
          </Link>
        </div>
        <Form method="post">
          <input
            type="hidden"
            name="addressId"
            value={address?.id ?? addressId}
          />
          {actionData?.formError && (
            <div className="flex items-center justify-center mb-6 bg-red-100 rounded">
              <p className="m-4 text-sm text-red-900">{actionData.formError}</p>
            </div>
          )}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className={getInputStyleClasses()}
                id="firstName"
                name="firstName"
                required
                type="text"
                autoComplete="given-name"
                placeholder="First Name*"
                aria-label="First Name"
                defaultValue={address?.firstName ?? ''}
              />
              <input
                className={getInputStyleClasses()}
                id="lastName"
                name="lastName"
                required
                type="text"
                autoComplete="family-name"
                placeholder="Last Name*"
                aria-label="Last Name"
                defaultValue={address?.lastName ?? ''}
              />
            </div>

            <div>
              <input
                className={getInputStyleClasses()}
                id="address1"
                name="address1"
                type="text"
                autoComplete="address-line1"
                placeholder="Street Address 1*"
                required
                aria-label="Street Address 1"
                defaultValue={address?.address1 ?? ''}
              />
            </div>

            <div>
              <input
                className={getInputStyleClasses()}
                id="address2"
                name="address2"
                type="text"
                autoComplete="address-line2"
                placeholder="Street Address 2"
                aria-label="Street Address 2"
                defaultValue={address?.address2 ?? ''}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                className={getInputStyleClasses()}
                id="city"
                name="city"
                type="text"
                required
                autoComplete="address-level2"
                placeholder="City*"
                aria-label="City"
                defaultValue={address?.city ?? ''}
              />
              <input
                className={getInputStyleClasses()}
                id="zoneCode"
                name="zoneCode"
                type="text"
                autoComplete="address-level1"
                placeholder="State/Territory*"
                required
                aria-label="State/Territory"
                defaultValue={address?.zoneCode ?? ''}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                className={getInputStyleClasses()}
                id="zip"
                name="zip"
                type="text"
                autoComplete="postal-code"
                placeholder="Postcode*"
                required
                aria-label="Postcode"
                defaultValue={address?.zip ?? ''}
              />
              <input
                className={getInputStyleClasses()}
                id="territoryCode"
                name="territoryCode"
                type="text"
                autoComplete="country"
                placeholder="Country/Region"
                required
                aria-label="Country/Region"
                defaultValue={address?.territoryCode ?? ''}
              />
            </div>

            <div>
              <input
                className={getInputStyleClasses()}
                id="phone"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                placeholder="Phone Number"
                aria-label="Phone Number"
                defaultValue={address?.phoneNumber ?? ''}
              />
            </div>

            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                name="defaultAddress"
                id="defaultAddress"
                defaultChecked={defaultAddress?.id === address?.id}
                className="border-gray-500 rounded-sm cursor-pointer border-1"
              />
              <label
                className="inline-block ml-2 text-sm cursor-pointer"
                htmlFor="defaultAddress"
              >
                Make this my default address
              </label>
            </div>

            <div className="pt-4">
              <Button
                className="w-full rounded focus:shadow-outline tracking-[0.18em] uppercase text-sm py-3"
                type="submit"
                variant="primary"
                disabled={state !== 'idle'}
              >
                {state !== 'idle' ? 'Saving' : 'Save Address'}
              </Button>
            </div>

            <div>
              <Button
                to=".."
                className="w-full mt-2 rounded focus:shadow-outline"
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </>
  );
}
