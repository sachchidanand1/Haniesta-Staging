import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData, useParams} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {getSeoMeta} from '@shopify/hydrogen';

import {PageHeader, Section} from '~/components/Text';
import {Button} from '~/components/Button';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {formatContactInfo} from '~/lib/utils';

export const headers = routeHeaders;

export async function loader({request, params, context}: LoaderFunctionArgs) {
  invariant(params.policyHandle, 'Missing policy handle');

  const policyName = params.policyHandle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as 'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy';

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');
  const rawPolicy = data.shop?.[policyName];

  if (!rawPolicy) {
    throw new Response(null, {status: 404});
  }

  const policy = { ...rawPolicy };
  if (policyName === 'shippingPolicy') {
    policy.title = 'Shipping Policy';
    policy.body = `<div style="font-family: 'Cormorant Garamond', Georgia, serif; color: #000000; font-size: 1.2rem; line-height: 1.6; font-weight: 600; margin-bottom: 0.5rem;">Free UK delivery</div>We currently deliver across the United Kingdom. All orders are dispatched from our UK-based fulfilment center. Estimated delivery: 2–7 business days. Tracking details will be shared by email once dispatched.`;
  } else if (policyName === 'refundPolicy') {
    policy.title = 'Return Policy';
    policy.body = `<div style="font-family: 'Cormorant Garamond', Georgia, serif; color: #000000; font-size: 1.2rem; line-height: 1.6; font-weight: 600; margin-bottom: 0.5rem;">14-day no-fuss returns</div>Changed your mind? You can return unused rugs within 14 days in their original condition and packaging. Refunds are processed within 5–7 business days after inspection.`;
  }

  const seo = seoPayload.policy({policy, url: request.url});

  return json({policy, seo});
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  const seoEntries = (matches || [])
    .map((m) => (m.data as any)?.seo)
    .filter(Boolean) as any[];
  if (seoEntries.length > 0) return getSeoMeta(...seoEntries);
  return [
    {title: 'Policy'},
    {name: 'description', content: 'Policy page'},
  ];
};

function appendHelpCta(bodyHtml: string, policyHandle: string): string {
  if (!bodyHtml) return bodyHtml;

  let contactText = 'Our customer service team is here to help with any questions you may have';
  const handle = policyHandle.toLowerCase();

  if (handle.includes('privacy')) {
    contactText = 'Our customer service team is here to help with any privacy questions';
  } else if (handle.includes('terms') || handle.includes('conditions')) {
    contactText = 'Our customer service team is here to help with any questions about our terms';
  } else if (handle.includes('shipping') || handle.includes('delivery')) {
    contactText = 'Our customer service team is here to help with any shipping or delivery questions';
  } else if (handle.includes('refund') || handle.includes('return')) {
    contactText = 'Our customer service team is here to help with any refund or return questions';
  }

  const helpCtaHtml = `
<style>
/* ===== FULL WIDTH HELP CTA ===== */
.help-cta-wrapper {
  width: 100%;
  padding: 40px 0 20px;
}

.help-cta {
  width: 100%;
  background: linear-gradient(135deg, #d1c2a0, #e8dcc0);
  border-radius: 24px;
  padding: 48px 24px;
  text-align: center;
  color: #000000;
  box-shadow: 0 20px 40px rgba(11, 19, 36, 0.15);
}

.help-cta h2 {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 700;
  margin-top: 0 !important;
  margin-bottom: 12px !important;
  color: #000000 !important;
}

.help-cta p {
  font-size: 1rem;
  opacity: 0.95;
  margin-bottom: 30px !important;
  color: #000000 !important;
}

.help-cta-contacts {
  display: flex;
  justify-content: center;
  gap: 36px;
  flex-wrap: wrap;
}

.help-cta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #000000 !important;
}

/* Mobile improvements: stack contacts and avoid breaking the phone/email */
@media (max-width: 640px) {
  .help-cta {
    padding: 32px 16px;
    border-radius: 16px;
  }

  .help-cta h2 {
    font-size: 1.6rem;
  }

  .help-cta-contacts {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .help-cta-item {
    white-space: nowrap;
  }

  .help-cta-item a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
}
</style>

<section class="help-cta-wrapper">
  <div class="help-cta">
    <h2>Need Help?</h2>
    <p>${contactText}</p>
    <div class="help-cta-contacts">
      <div class="help-cta-item">📧 support@haniesta.com</div>
      <div class="help-cta-item">📞 +44-XXXX-XXXXXX</div>
      <div class="help-cta-item">⏰ Mon–Fri: 9AM–6PM</div>
    </div>
  </div>
</section>
`;

  return bodyHtml + helpCtaHtml;
}

export default function Policies() {
  const {policy} = useLoaderData<typeof loader>();
  const params = useParams();
  const policyHandle = params.policyHandle || '';

  const finalBody = formatContactInfo(appendHelpCta(policy.body, policyHandle));

  return (
    <>
      <Section
        padding="all"
        display="flex"
        className="flex-col items-baseline w-full gap-8 md:flex-row"
      >
        <PageHeader
          heading={policy.title}
          className="grid items-start flex-grow gap-4 md:sticky top-36 md:w-5/12"
        >
          <Button
            className="justify-self-start"
            variant="inline"
            to={'/policies'}
          >
            &larr; Back to Policies
          </Button>
        </PageHeader>
        <div className="flex-grow w-full md:w-7/12 policy-content-wrapper">
          <style dangerouslySetInnerHTML={{__html: `
            .policy-content-wrapper {
              font-family: 'Cormorant Garamond', Georgia, serif !important;
              color: #A07F5C !important;
              font-size: 1.15rem !important;
              line-height: 1.75 !important;
            }
            .policy-content-wrapper p, 
            .policy-content-wrapper span, 
            .policy-content-wrapper strong,
            .policy-content-wrapper li,
            .policy-content-wrapper h1,
            .policy-content-wrapper h2,
            .policy-content-wrapper h3,
            .policy-content-wrapper h4 {
              font-family: 'Cormorant Garamond', Georgia, serif !important;
              color: #A07F5C !important;
            }
            .policy-content-wrapper strong {
              font-weight: 700 !important;
            }
            /* Restore original help CTA box styles */
            .policy-content-wrapper .help-cta h2 {
              font-family: 'Playfair Display', serif !important;
              color: #000000 !important;
            }
            .policy-content-wrapper .help-cta p,
            .policy-content-wrapper .help-cta-item,
            .policy-content-wrapper .help-cta-item a {
              font-family: ui-sans-serif, system-ui, sans-serif !important;
              color: #000000 !important;
            }
          `}} />
          <div
            dangerouslySetInnerHTML={{__html: finalBody}}
            className="prose dark:prose-invert max-w-none"
          />
        </div>
      </Section>
    </>
  );
}

const POLICY_CONTENT_QUERY = `#graphql
  fragment PolicyHandle on ShopPolicy {
    body
    handle
    id
    title
    url
  }

  query PoliciesHandle(
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
    $refundPolicy: Boolean!
  ) @inContext(language: $language) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...PolicyHandle
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...PolicyHandle
      }
      termsOfService @include(if: $termsOfService) {
        ...PolicyHandle
      }
      refundPolicy @include(if: $refundPolicy) {
        ...PolicyHandle
      }
    }
  }
`;
