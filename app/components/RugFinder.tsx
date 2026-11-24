import {Link} from '~/components/Link';

type RugFinderMetaobject = {
  heading?: {value?: string | null} | null;
  subHeading?: {value?: string | null} | null;
  link?: {value?: string | null} | null;
  buttonText?: {value?: string | null} | null;
  image?: {
    reference?: {
      __typename?: string;
      image?: {url: string; altText?: string | null; width?: number | null; height?: number | null} | null;
    } | null;
  } | null;
};

export function RugFinder({data}: {data?: RugFinderMetaobject | {metaobject?: RugFinderMetaobject} | null}) {
  const mo: RugFinderMetaobject | null | undefined =
    data && (data as any).metaobject ? (data as any).metaobject : (data as RugFinderMetaobject | null | undefined);

  if (!mo) return null;
  const heading = mo?.heading?.value ?? null;
  const subheading = mo?.subHeading?.value ?? null;
  // Parse link value strictly from metafield; if label is absent, omit the button
  let href: string | null = null;
  let ctaLabel: string | null = mo?.buttonText?.value?.toString().trim() || null;
  if (mo?.link?.value) {
    const raw = mo.link.value as string;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object') {
        const url = parsed['url'];
        if (typeof url === 'string' && url.length > 0) href = url;
      } else if (typeof raw === 'string' && raw.length > 0) {
        // If only a string URL is provided with no label, use href but keep label null to avoid fallback text
        href = raw;
      }
    } catch (_e) {
      // Not JSON – assume it's a direct URL string without label
      if (typeof raw === 'string' && raw.length > 0) href = raw;
    }
  }
  const imageUrl = mo?.image?.reference?.image?.url ?? null;
  const imageAlt = mo?.image?.reference?.image?.altText ?? '';
  return (
    <section className="relative py-10 sm:py-12 bg-white overflow-hidden">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="relative isolate md:flex md:items-center md:justify-center md:gap-0">
          {/* Grey panel with copy */}
          <div className="relative z-0 bg-[#F2F2F2] px-6 sm:px-10 md:px-12 lg:px-16 py-14 md:py-20 lg:py-24 w-full md:w-[70%] lg:w-[60%] xl:w-[56%] text-left">
            {heading && (
              <h2 className="font-cormorant text-haniesta-brown text-4xl sm:text-5xl lg:text-6xl font-light leading-tight">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="font-cormorant text-haniesta-brown text-3xl sm:text-4xl lg:text-5xl font-light leading-snug mt-3">
                {subheading}
              </p>
            )}

            {href && ctaLabel && (
              <Link
                to={href}
                prefetch="intent"
                className="inline-flex items-center mt-10 px-6 py-3 bg-haniesta-brown text-white text-sm font-medium hover:bg-haniesta-brown/90 transition-colors"
              >
                {ctaLabel}
              </Link>
            )}
          </div>

          {/* Right image, touching the grey panel on desktop */}
          {imageUrl && (
            <div className="hidden md:block md:w-[32%] lg:w-[30%] xl:w-[28%] shrink-0">
              <img
                src={imageUrl}
                alt={imageAlt || ''}
                className="w-full h-auto block"
                loading="lazy"
              />
            </div>
          )}


          {/* Mobile image below panel */}
          {imageUrl && (
            <div className="md:hidden mt-6">
              <img
                src={imageUrl}
                alt={imageAlt || ''}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
