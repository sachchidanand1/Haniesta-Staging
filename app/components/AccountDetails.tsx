import type {CustomerDetailsFragment} from 'customer-accountapi.generated';
import {Heading} from '~/components/Text';
import {Link} from '~/components/Link';

export function AccountDetails({
  customer,
}: {
  customer: CustomerDetailsFragment;
}) {
  const {firstName, lastName, emailAddress, phoneNumber} = customer;

  return (
    <>
      <div className="px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="mb-6 flex items-center justify-between">
          <Heading
            as="h1"
            size="heading"
            className="text-2xl md:text-3xl lg:text-4xl"
          >
            Profile
          </Heading>
          <Link
            prefetch="intent"
            className="text-xs font-medium tracking-[0.18em] uppercase text-primary/70 hover:text-primary"
            to="/account/edit"
          >
            Edit
          </Link>
        </div>

        <div className="space-y-5 text-sm">
          <div>
            <div className="text-primary/50">Name</div>
            <p className="mt-1">
              {firstName || lastName
                ? (firstName ? firstName + ' ' : '') + lastName
                : 'Add name'}{' '}
            </p>
          </div>

          <div>
            <div className="text-primary/50">Phone number</div>
            <p className="mt-1">{phoneNumber?.phoneNumber ?? 'N/A'}</p>
          </div>

          <div>
            <div className="text-primary/50">Email address</div>
            <p className="mt-1">{emailAddress?.emailAddress ?? 'N/A'}</p>
          </div>
        </div>
      </div>
    </>
  );
}
