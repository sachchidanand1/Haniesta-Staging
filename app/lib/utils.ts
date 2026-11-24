import {useLocation, useRouteLoaderData} from '@remix-run/react';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import type {FulfillmentStatus} from '@shopify/hydrogen/customer-account-api-types';
import typographicBase from 'typographic-base';

import type {
  ChildMenuItemFragment,
  MenuFragment,
  ParentMenuItemFragment,
} from 'storefrontapi.generated';
import type {RootLoader} from '~/root';
import {countries} from '~/data/countries';

import type {I18nLocale} from './type';

type EnhancedMenuItemProps = {
  to: string;
  target: string;
  isExternal?: boolean;
};

export type ChildEnhancedMenuItem = ChildMenuItemFragment &
  EnhancedMenuItemProps;

export type ParentEnhancedMenuItem = (ParentMenuItemFragment &
  EnhancedMenuItemProps) & {
  items: ChildEnhancedMenuItem[];
};

export type EnhancedMenu = Pick<MenuFragment, 'id'> & {
  items: ParentEnhancedMenuItem[];
};

export function missingClass(string?: string, prefix?: string) {
  if (!string) {
    return true;
  }

  const regex = new RegExp(` ?${prefix}`, 'g');
  return string.match(regex) === null;
}

export function formatText(input?: string | React.ReactNode) {
  if (!input) {
    return;
  }

  if (typeof input !== 'string') {
    return input;
  }

  return typographicBase(input, {locale: 'en-us'}).replace(
    /\s([^\s<]+)\s*$/g,
    '\u00A0$1',
  );
}

export function getExcerpt(text: string) {
  const regex = /<p.*>(.*?)<\/p>/;
  const match = regex.exec(text);
  return match?.length ? match[0] : text;
}

export function isNewArrival(date: string, daysOld = 30) {
  return (
    new Date(date).valueOf() >
    new Date().setDate(new Date().getDate() - daysOld).valueOf()
  );
}

export function isDiscounted(price: MoneyV2, compareAtPrice: MoneyV2) {
  if (
    compareAtPrice?.amount &&
    price?.amount &&
    Number(compareAtPrice.amount) > Number(price.amount)
  ) {
    return true;
  }
  return false;
}

function resolveToFromType(
  {
    customPrefixes,
    pathname,
    type,
  }: {
    customPrefixes: Record<string, string>;
    pathname?: string;
    type?: string;
  } = {
    customPrefixes: {},
  },
) {
  if (!pathname || !type) return '';

  /*
    MenuItemType enum
    @see: https://shopify.dev/api/storefront/2025-07/enums/MenuItemType
  */
  const defaultPrefixes = {
    BLOG: 'blogs',
    COLLECTION: 'collections',
    COLLECTIONS: 'collections', // Collections All (not documented)
    FRONTPAGE: 'frontpage',
    HTTP: '',
    PAGE: 'pages',
    CATALOG: 'collections/all', // Products All
    PRODUCT: 'products',
    SEARCH: 'search',
    SHOP_POLICY: 'policies',
  };

  const pathParts = pathname.split('/');
  const handle = pathParts.pop() || '';
  const routePrefix: Record<string, string> = {
    ...defaultPrefixes,
    ...customPrefixes,
  };

  switch (true) {
    // special cases
    case type === 'FRONTPAGE':
      return '/';

    case type === 'ARTICLE': {
      const blogHandle = pathParts.pop();
      return routePrefix.BLOG
        ? `/${routePrefix.BLOG}/${blogHandle}/${handle}/`
        : `/${blogHandle}/${handle}/`;
    }

    case type === 'COLLECTIONS':
      return `/${routePrefix.COLLECTIONS}`;

    case type === 'SEARCH':
      return `/${routePrefix.SEARCH}`;

    case type === 'CATALOG':
      return `/${routePrefix.CATALOG}`;

    // common cases: BLOG, PAGE, COLLECTION, PRODUCT, SHOP_POLICY, HTTP
    default:
      return routePrefix[type]
        ? `/${routePrefix[type]}/${handle}`
        : `/${handle}`;
  }
}

/*
  Parse each menu link and adding, isExternal, to and target
*/
function parseItem(primaryDomain: string, env: Env, customPrefixes = {}) {
  return function (
    item:
      | MenuFragment['items'][number]
      | MenuFragment['items'][number]['items'][number],
  ):
    | EnhancedMenu['items'][0]
    | EnhancedMenu['items'][number]['items'][0]
    | null {
    if (!item?.url || !item?.type) {
      if ('items' in item && Array.isArray(item.items) && item.items.length > 0) {
        return {
          ...item,
          isExternal: false,
          target: '_self',
          to: '',
          items: item.items
            .map(parseItem(primaryDomain, env, customPrefixes))
            .filter(Boolean),
        } as EnhancedMenu['items'][number];
      }

      // eslint-disable-next-line no-console
      console.warn('Invalid menu item.  Must include a url and type.');
      return null;
    }

    // extract path from url because we don't need the origin on internal to attributes
    const {host, pathname} = new URL(item.url);

    const isInternalLink =
      host === new URL(primaryDomain).host || host === env.PUBLIC_STORE_DOMAIN;

    const parsedItem = isInternalLink
      ? // internal links
        {
          ...item,
          isExternal: false,
          target: '_self',
          to: resolveToFromType({type: item.type, customPrefixes, pathname}),
        }
      : // external links
        {
          ...item,
          isExternal: true,
          target: '_blank',
          to: item.url,
        };

    if ('items' in item) {
      return {
        ...parsedItem,
        items: item.items
          .map(parseItem(primaryDomain, env, customPrefixes))
          .filter(Boolean),
      } as EnhancedMenu['items'][number];
    } else {
      return parsedItem as EnhancedMenu['items'][number]['items'][number];
    }
  };
}

/*
  Recursively adds `to` and `target` attributes to links based on their url
  and resource type.
  It optionally overwrites url paths based on item.type
*/
export function parseMenu(
  menu: MenuFragment,
  primaryDomain: string,
  env: Env,
  customPrefixes = {},
): EnhancedMenu | null {
  if (!menu?.items) {
    // eslint-disable-next-line no-console
    console.warn('Invalid menu passed to parseMenu');
    return null;
  }

  const parser = parseItem(primaryDomain, env, customPrefixes);

  const parsedMenu = {
    ...menu,
    items: menu.items.map(parser).filter(Boolean),
  } as EnhancedMenu;

  return parsedMenu;
}

export const INPUT_STYLE_CLASSES =
  'appearance-none rounded dark:bg-transparent border focus:border-primary/50 focus:ring-0 w-full py-2 px-3 text-primary/90 placeholder:text-primary/50 leading-tight focus:shadow-outline';

export const getInputStyleClasses = (isError?: string | null) => {
  return `${INPUT_STYLE_CLASSES} ${
    isError ? 'border-red-500' : 'border-primary/20'
  }`;
};

export function statusMessage(status: FulfillmentStatus) {
  const translations: Record<FulfillmentStatus, string> = {
    SUCCESS: 'Success',
    PENDING: 'Pending',
    OPEN: 'Open',
    FAILURE: 'Failure',
    ERROR: 'Error',
    CANCELLED: 'Cancelled',
  };
  try {
    return translations?.[status];
  } catch (error) {
    return status;
  }
}

export const DEFAULT_LOCALE: I18nLocale = Object.freeze({
  ...countries.default,
  pathPrefix: '',
});

export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  const firstPathPart =
    '/' + url.pathname.substring(1).split('/')[0].toLowerCase();

  return countries[firstPathPart]
    ? {
        ...countries[firstPathPart],
        pathPrefix: firstPathPart,
      }
    : {
        ...countries['default'],
        pathPrefix: '',
      };
}

export function usePrefixPathWithLocale(path: string) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;

  return `${selectedLocale.pathPrefix}${
    path.startsWith('/') ? path : '/' + path
  }`;
}

export function useIsHomePath() {
  const {pathname} = useLocation();
  const rootData = useRouteLoaderData<RootLoader>('root');
  const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  const strippedPathname = pathname.replace(selectedLocale.pathPrefix, '');
  return strippedPathname === '/';
}

export function parseAsCurrency(value: number, locale: I18nLocale) {
  return new Intl.NumberFormat(locale.language + '-' + locale.country, {
    style: 'currency',
    currency: locale.currency,
  }).format(value);
}

/**
 * Validates that a url is local
 * @param url
 * @returns `true` if local `false`if external domain
 */
export function isLocalPath(url: string) {
  try {
    // We don't want to redirect cross domain,
    // doing so could create fishing vulnerability
    // If `new URL()` succeeds, it's a fully qualified
    // url which is cross domain. If it fails, it's just
    // a path, which will be the current domain.
    new URL(url);
  } catch (e) {
    return true;
  }

  return false;
}

/**
 * Gets the Shopify Customer Account API version from environment variables
 * @param env - Environment variables object
 * @returns The API version string, defaults to '2025-07' if not set
 */
export function getShopifyCustomerApiVersion(env: Env): string {
  return env.SHOPIFY_CUSTOMER_API_VERSION || '2025-07';
}

/**
 * Utility function to merge class names
 * @param inputs - Class names to merge
 * @returns Merged class names string
 */
export function cn(...inputs: (string | string[] | undefined | null | false)[]): string {
  return inputs.flat().filter(Boolean).join(' ');
}

/**
 * Formats contact details in pages and policies to ensure links are clickable
 * and placeholder numbers are replaced with real ones + WhatsApp icon.
 * @param html - Original HTML string from Shopify body content
 * @returns Formatted HTML string
 */
export function formatContactInfo(html: string): string {
  if (!html) return html;

  let formatted = html;

  // WhatsApp SVG Icon
  const whatsappSvg = `<svg class="w-5 h-5 text-[#25D366] fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px; display: inline-block; width: 1.25rem; height: 1.25rem;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.463h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>`;

  // Replace footer "Need Help" call icon & placeholder phone (+44-XXXX-XXXXXX or +44-XXXX-XX000XX) in help-cta card
  formatted = formatted.replace(
    /<div class="help-cta-item">\s*📞\s*\+44-XXXX-XXXXXX\s*<\/div>/gi,
    `<div class="help-cta-item"><a href="https://wa.me/447542424785" class="hover:underline flex items-center gap-1.5 text-black hover:text-black/85" target="_blank" rel="noopener noreferrer">${whatsappSvg} +44 7542 424785</a></div>`
  );

  // Replace text email support@haniesta.com inside help-cta-item with a clickable link
  formatted = formatted.replace(
    /<div class="help-cta-item">\s*📧\s*support@haniesta\.com\s*<\/div>/gi,
    `<div class="help-cta-item"><a href="mailto:support@haniesta.com" class="hover:underline flex items-center gap-1.5 text-black hover:text-black/85">📧 support@haniesta.com</a></div>`
  );

  // Also replace any general placeholder +44-XXXX-XXXXXX or +44-XXXX-XX000XX or similar in text
  formatted = formatted.replace(
    /\+44-XXXX-[a-zA-Z0-9_-]+/g,
    `+44 7542 424785`
  );

  // In the privacy policy text, replace "call +447542424785" or "call +44 7542 424785" with a link
  formatted = formatted.replace(
    /call\s*\+?44\s*7542\s*424785/gi,
    `call <a href="https://wa.me/447542424785" class="underline" target="_blank" rel="noopener noreferrer">+44 7542 424785</a>`
  );

  // Add the email mailto link if it is just a plain text in the policy/page body: e.g. "email us at support@haniesta.com"
  formatted = formatted.replace(
    /email us at support@haniesta\.com/gi,
    `email us at <a href="mailto:support@haniesta.com" class="underline">support@haniesta.com</a>`
  );

  // Check if a phone number (+44 7542 424785 or +447542424785) is already present in the policy body
  const hasPhone = formatted.includes('447542424785') || formatted.includes('44 7542 424785');

  // Regex to match either a full anchor mailto link, or a raw support@haniesta.com (not inside attributes like href="mailto:...)
  const emailRegex = /(<a[^>]*href="mailto:support@haniesta\.com"[^>]*>[\s\S]*?support@haniesta\.com[\s\S]*?<\/a>)|((?<!mailto:|href="|=)support@haniesta\.com)/gi;

  formatted = formatted.replace(emailRegex, (match, anchorTag, plainEmail) => {
    if (anchorTag) {
      if (!hasPhone) {
        if (match.includes('wa.me')) {
          return match;
        }
        return `<span class="flex flex-col items-center justify-center text-center gap-y-2 sm:inline-flex sm:flex-row sm:items-center sm:gap-y-0 sm:gap-x-1.5 sm:align-middle">${match} <span class="text-[#8a8480] sm:text-inherit">or</span> <a href="https://wa.me/447542424785" class="underline inline-flex items-center gap-1 whitespace-nowrap align-middle" target="_blank" rel="noopener noreferrer">${whatsappSvg} +44 7542 424785</a></span>`;
      }
      return match;
    }

    if (!hasPhone) {
      return `<span class="flex flex-col items-center justify-center text-center gap-y-2 sm:inline-flex sm:flex-row sm:items-center sm:gap-y-0 sm:gap-x-1.5 sm:align-middle"><a href="mailto:support@haniesta.com" class="underline">support@haniesta.com</a> <span class="text-[#8a8480] sm:text-inherit">or</span> <a href="https://wa.me/447542424785" class="underline inline-flex items-center gap-1 whitespace-nowrap align-middle" target="_blank" rel="noopener noreferrer">${whatsappSvg} +44 7542 424785</a></span>`;
    } else {
      return `<a href="mailto:support@haniesta.com" class="underline">support@haniesta.com</a>`;
    }
  });

  return formatted;
}