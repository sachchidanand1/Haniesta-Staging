import {json, type MetaArgs, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {getSeoMeta} from '@shopify/hydrogen';

import {FaqPageContent} from '~/components/FaqPageContent';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';

export const headers = routeHeaders;

export async function loader({request}: LoaderFunctionArgs) {
  const seo = seoPayload.faq({url: request.url});

  return json({seo});
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  const seoEntries = (matches || [])
    .map((m) => (m.data as any)?.seo)
    .filter(Boolean) as any[];
  if (seoEntries.length > 0) return getSeoMeta(...seoEntries);
  return [
    {title: 'FAQ'},
    {
      name: 'description',
      content:
        'Answers to common questions about Haniesta handmade rugs, shipping, care, and returns.',
    },
  ];
};

export default function FaqPage() {
  return <FaqPageContent />;
}
