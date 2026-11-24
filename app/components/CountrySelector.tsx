import {useRouteLoaderData} from '@remix-run/react';

import {Heading} from '~/components/Text';
import {IconCheck} from '~/components/Icon';
import {DEFAULT_LOCALE} from '~/lib/utils';
import type {RootLoader} from '~/root';

export function CountrySelector() {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;

  return (
    <section className="grid w-full gap-4">
      <Heading size="lead" className="cursor-default" as="h3">
        Country
      </Heading>
      <div className="w-full border rounded border-contrast/30 dark:border-white overflow-clip">
        <div className="flex items-center justify-between w-full px-4 py-3">
          {selectedLocale.label}
          <span className="ml-2">
            <IconCheck />
          </span>
        </div>
      </div>
    </section>
  );
}
