import {Image} from '~/components/Image';
import type {HomepageFeaturedCollectionsQuery} from 'storefrontapi.generated';
import {Link} from '~/components/Link';

type LifestyleCollectionsProps = {
  collections: HomepageFeaturedCollectionsQuery['collections'];
  title?: string;
};

export function LifestyleCollections({
  collections,
  title = 'Featured Collections',
}: LifestyleCollectionsProps) {
  if (!collections?.nodes?.length) return null;

  const collectionsWithImage = collections.nodes.filter((item) => item.image);

  // Prepare deterministic image selection based on desired themes
  const used = new Set<string>();

  // Helper to find a collection by candidate handles and return its image and link
  function pickFromHandles(handles: string[]) {
    const found = collectionsWithImage.find((c) =>
      handles.some((h) => c.handle.toLowerCase() === h.toLowerCase()),
    );
    if (found) {
      used.add(found.id);
      return {image: found.image, to: `/collections/${found.handle}`};
    }
    return null;
  }

  const cards = [
    (() => {
      const chosen = pickFromHandles(['shopify-products-collections']);
      return {
        id: 'featured',
        title: 'Featured Collections',
        subtitle: 'Our Signature Designs',
        to: '/featured',
        image: chosen?.image,
      };
    })(),
    (() => {
      const chosen = pickFromHandles(['lifestyle']);
      return {
        id: 'lifestyle',
        title: 'Lifestyle & Context',
        subtitle: 'Inspiration for your home',
        to: '/lifestyle',
        image: chosen?.image,
      };
    })(),
    (() => {
      const chosen = pickFromHandles(['eco-friendly']);
      return {
        id: 'pet',
        title: 'Pet-Friendly Luxury',
        subtitle: 'Durability meets high design',
        to: chosen?.to || '/collections/eco-friendly',
        image: chosen?.image,
      };
    })(),
    (() => {
      const chosen = pickFromHandles(['sustainability']);
      return {
        id: 'sustainability',
        title: 'Sustainability & Origin',
        subtitle: 'Responsibly sourced materials',
        to: chosen?.to || '/collections/sustainability',
        image: chosen?.image,
      };
    })(),
  ];

  return (
    <section className="py-12 bg-[#FBF8F3]/40">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="font-cormorant text-4xl sm:text-5xl font-light text-gray-900 mb-4">
            {title}
          </h2>
          <div className="w-20 h-0.5 bg-stone-900/10 mx-auto mb-4"></div>
          <p className="max-w-md mx-auto text-sm text-stone-500 font-sans tracking-wide">
            Explore curated collections designed to elevate your living spaces with timeless textures and sustainable craftsmanship.
          </p>
        </div>

        {/* 2x2 Collection Cards Grid with asymmetric layout */}
        <div className="space-y-8 w-full max-w-full mx-auto">
          {/* Row 1: 60% | 40% */}
          <div className="grid grid-cols-1 md:grid-cols-10 gap-8">
            {cards[0] && (
              <Link
                key={cards[0].id}
                to={cards[0].to}
                className="group md:col-span-6 block relative overflow-hidden rounded-2xl bg-stone-100 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-700"
                prefetch="intent"
              >
                <div className="relative w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[440px] xl:h-[480px]">
                  {/* Image */}
                  {cards[0].image ? (
                    <Image
                      data={cards[0].image}
                      alt={cards[0].title}
                      className="absolute inset-0 w-full h-full object-cover transform scale-100 transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                      sizes="(min-width: 1024px) 60vw, (min-width: 768px) 60vw, 100vw"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-100/50 to-orange-100/50" />
                  )}
                  {/* Overlays */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-black/10 to-transparent z-10" />

                  {/* Text & CTA */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10 z-20 text-[#FBF8F3]">
                    {/* Bottom Row */}
                    <div>
                      <h3 className="font-cormorant text-2xl sm:text-4xl font-light mb-4 drop-shadow-sm">
                        {cards[0].title}
                      </h3>
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EAD8BB] border-b border-[#EAD8BB]/30 pb-1.5 hover:border-[#EAD8BB] transition-all duration-300">
                        <span>Shop Now</span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="h-3.5 w-3.5 transform transition-transform duration-300 group-hover:translate-x-1"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {cards[1] && (
              <Link
                key={cards[1].id}
                to={cards[1].to}
                className="group md:col-span-4 block relative overflow-hidden rounded-2xl bg-stone-100 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-700"
                prefetch="intent"
              >
                <div className="relative w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[440px] xl:h-[480px]">
                  {/* Image */}
                  {cards[1].image ? (
                    <Image
                      data={cards[1].image}
                      alt={cards[1].title}
                      className="absolute inset-0 w-full h-full object-cover transform scale-100 transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                      sizes="(min-width: 1024px) 40vw, (min-width: 768px) 40vw, 100vw"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-100/50 to-orange-100/50" />
                  )}
                  {/* Overlays */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-black/10 to-transparent z-10" />

                  {/* Text & CTA */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10 z-20 text-[#FBF8F3]">
                    {/* Bottom Row */}
                    <div>
                      <h3 className="font-cormorant text-2xl sm:text-4xl font-light mb-4 drop-shadow-sm">
                        {cards[1].title}
                      </h3>
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EAD8BB] border-b border-[#EAD8BB]/30 pb-1.5 hover:border-[#EAD8BB] transition-all duration-300">
                        <span>Shop Now</span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="h-3.5 w-3.5 transform transition-transform duration-300 group-hover:translate-x-1"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Row 2: 40% | 60% */}
          <div className="grid grid-cols-1 md:grid-cols-10 gap-8">
            {cards[2] && (
              <Link
                key={cards[2].id}
                to={cards[2].to}
                className="group md:col-span-4 block relative overflow-hidden rounded-2xl bg-stone-100 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-700"
                prefetch="intent"
              >
                <div className="relative w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[440px] xl:h-[480px]">
                  {/* Image */}
                  {cards[2].image ? (
                    <Image
                      data={cards[2].image}
                      alt={cards[2].title}
                      className="absolute inset-0 w-full h-full object-cover transform scale-100 transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                      sizes="(min-width: 1024px) 40vw, (min-width: 768px) 40vw, 100vw"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-100/50 to-orange-100/50" />
                  )}
                  {/* Overlays */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-black/10 to-transparent z-10" />

                  {/* Text & CTA */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10 z-20 text-[#FBF8F3]">
                    {/* Bottom Row */}
                    <div>
                      <h3 className="font-cormorant text-2xl sm:text-4xl font-light mb-4 drop-shadow-sm">
                        {cards[2].title}
                      </h3>
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EAD8BB] border-b border-[#EAD8BB]/30 pb-1.5 hover:border-[#EAD8BB] transition-all duration-300">
                        <span>Shop Now</span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="h-3.5 w-3.5 transform transition-transform duration-300 group-hover:translate-x-1"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {cards[3] && (
              <Link
                key={cards[3].id}
                to={cards[3].to}
                className="group md:col-span-6 block relative overflow-hidden rounded-2xl bg-stone-100 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-700"
                prefetch="intent"
              >
                <div className="relative w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[440px] xl:h-[480px]">
                  {/* Image */}
                  {cards[3].image ? (
                    <Image
                      data={cards[3].image}
                      alt={cards[3].title}
                      className="absolute inset-0 w-full h-full object-cover transform scale-100 transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                      sizes="(min-width: 1024px) 60vw, (min-width: 768px) 60vw, 100vw"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-100/50 to-orange-100/50" />
                  )}
                  {/* Overlays */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-black/10 to-transparent z-10" />

                  {/* Text & CTA */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10 z-20 text-[#FBF8F3]">
                    {/* Bottom Row */}
                    <div>
                      <h3 className="font-cormorant text-2xl sm:text-4xl font-light mb-4 drop-shadow-sm">
                        {cards[3].title}
                      </h3>
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EAD8BB] border-b border-[#EAD8BB]/30 pb-1.5 hover:border-[#EAD8BB] transition-all duration-300">
                        <span>Shop Now</span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="h-3.5 w-3.5 transform transition-transform duration-300 group-hover:translate-x-1"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
