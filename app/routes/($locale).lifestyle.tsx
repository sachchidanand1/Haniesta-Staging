import {json, type LoaderFunctionArgs, type MetaFunction} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import {Image} from '~/components/Image';
import {routeHeaders} from '~/data/cache';
import {getLifestyleCollections, type FeaturedCollection} from '~/lib/metafields';

export const headers = routeHeaders;

export const meta: MetaFunction = () => {
  return [
    {title: 'Lifestyle | Curated Spaces'},
    {name: 'description', content: 'Explore our curated lifestyle collections, featuring handcrafted rugs in modern home settings.'},
  ];
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const lifestyleCollections = await getLifestyleCollections(storefront);

  return json({
    lifestyleCollections,
    seo: {
      title: 'Lifestyle Collections',
      description: 'Explore our curated lifestyle collections',
    },
  });
}

export default function LifestyleCollectionsPage() {
  const {lifestyleCollections} = useLoaderData<typeof loader>();

  if (!lifestyleCollections || lifestyleCollections.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <p className="font-serif text-lg text-stone-500 italic">No collections found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2420] pb-24 sm:pb-32">
      
      {/* ── Editorial Page Header ── */}
      <header className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        {/* Subtle background overlay grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54 48v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4z' fill='%232C2420' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="max-w-[70rem] mx-auto px-6 text-center relative z-10 space-y-6">
          <span className="font-jost text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] text-[#463925] uppercase block">
            Curated Living
          </span>
          <h1 className="font-cormorant text-5xl sm:text-6xl lg:text-7xl font-light tracking-wide leading-none text-stone-900">
            Spaces with Soul
          </h1>
          <div className="w-16 h-[1.5px] bg-[#C4A882] mx-auto" />
          <p className="font-jost text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed font-light">
            A study of light, texture, and natural fibers. We design our collections to bring warmth, history, and raw craftsmanship into the heart of the modern home.
          </p>
        </div>
      </header>

      {/* ── Asymmetric Layout Flow ── */}
      <main className="max-w-[85rem] mx-auto px-6 sm:px-12 lg:px-16">
        <div className="space-y-24 sm:space-y-36">
          
          {lifestyleCollections.map((collection: FeaturedCollection, idx: number) => {
            const linkTo = collection.collectionHandle
              ? `/collections/${collection.collectionHandle}?from=lifestyle&mo=${encodeURIComponent(collection.id)}`
              : '#';
            const clickable = Boolean(collection.collectionHandle);
            
            // Layout modes for premium editorial feel
            // Mode 0: Full width Hero Split (Image left, text card floating right)
            // Mode 1: Split balanced cards (Left-align & Right-align offset grids)
            // Mode 2: Minimal overlapping banner
            const mode = idx % 3;

            if (mode === 0) {
              return (
                <section key={collection.id} className="relative group">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-0 lg:gap-8 items-center">
                    
                    {/* Big Visual (Image) */}
                    <div className="lg:col-span-8 overflow-hidden relative aspect-[16/10] bg-stone-100 shadow-md">
                      {collection.image ? (
                        <Image
                          data={collection.image}
                          alt={collection.image.altText || collection.name}
                          className="w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105"
                          loading={idx === 0 ? "eager" : "lazy"}
                        />
                      ) : collection.imageUrl ? (
                        <img
                          src={collection.imageUrl}
                          alt={collection.name}
                          className="w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-200" />
                      )}
                      {/* Frosted vignette */}
                      <div className="absolute inset-0 bg-black/5" />
                    </div>

                    {/* Editorial Description Card */}
                    <div className="-mt-12 sm:-mt-16 lg:mt-0 mx-4 sm:mx-8 lg:mx-0 lg:col-span-4 lg:-ml-16 bg-[#FBF8F3] border border-[#E8E1D6] p-8 sm:p-10 lg:p-12 relative z-10 space-y-6 shadow-xl lg:translate-x-0 group-hover:-translate-y-1 transition-all duration-500">
                      <span className="font-jost text-[9px] font-semibold tracking-[0.25em] text-[#463925] uppercase block">
                        Featured Design
                      </span>
                      <h2 className="font-cormorant text-3xl sm:text-4xl text-stone-900 font-light leading-snug">
                        {collection.name}
                      </h2>
                      {collection.description && (
                        <p className="font-jost text-stone-600 text-sm leading-relaxed font-light">
                          {collection.description}
                        </p>
                      )}
                      <div className="pt-2">
                        {clickable ? (
                          <Link
                            to={linkTo}
                            className="inline-flex items-center gap-2.5 font-jost text-xs font-semibold tracking-[0.18em] uppercase text-stone-900 border-b border-stone-900/30 pb-1.5 hover:text-[#463925] hover:border-[#463925] transition-all duration-300"
                          >
                            Explore Collection <span>→</span>
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-2.5 font-jost text-xs font-semibold tracking-[0.18em] uppercase text-stone-400">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </section>
              );
            }

            if (mode === 1) {
              const imageRight = idx % 2 === 0;
              return (
                <section key={collection.id} className="relative group">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    
                    {/* Image Block */}
                    <div className={`overflow-hidden aspect-[4/3] bg-stone-100 shadow-md ${imageRight ? 'lg:order-2' : ''}`}>
                      {collection.image ? (
                        <Image
                          data={collection.image}
                          alt={collection.image.altText || collection.name}
                          className="w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : collection.imageUrl ? (
                        <img
                          src={collection.imageUrl}
                          alt={collection.name}
                          className="w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-200" />
                      )}
                    </div>

                    {/* Text Block */}
                    <div className={`space-y-6 max-w-md ${imageRight ? 'lg:pr-8' : 'lg:pl-8'}`}>
                      <span className="font-jost text-[9px] font-semibold tracking-[0.25em] text-[#463925] uppercase block">
                        Space Study
                      </span>
                      <h2 className="font-cormorant text-3xl sm:text-4xl text-stone-900 font-light leading-snug">
                        {collection.name}
                      </h2>
                      {collection.description && (
                        <p className="font-jost text-stone-600 text-sm leading-relaxed font-light">
                          {collection.description}
                        </p>
                      )}
                      <div className="pt-2">
                        {clickable ? (
                          <Link
                            to={linkTo}
                            className="inline-flex items-center gap-2.5 font-jost text-xs font-semibold tracking-[0.18em] uppercase text-stone-900 border-b border-stone-900/30 pb-1.5 hover:text-[#463925] hover:border-[#463925] transition-all duration-300"
                          >
                            View Collection <span>→</span>
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-2.5 font-jost text-xs font-semibold tracking-[0.18em] uppercase text-stone-400">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </section>
              );
            }

            // Mode 2: Overlapping Banner layout
            return (
              <section key={collection.id} className="relative group">
                <div className="relative overflow-hidden w-full h-[400px] sm:h-[480px] lg:h-[540px] shadow-md bg-stone-100">
                  {/* Background Image */}
                  {collection.image ? (
                    <Image
                      data={collection.image}
                      alt={collection.image.altText || collection.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : collection.imageUrl ? (
                    <img
                      src={collection.imageUrl}
                      alt={collection.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-stone-200" />
                  )}
                  {/* Subtle Dark Vignette */}
                  <div className="absolute inset-0 bg-[#2C2420]/15 group-hover:bg-[#2C2420]/25 transition-colors duration-500" />

                  {/* Overlaid Card (Glassmorphic look) */}
                  <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-auto max-w-md bg-white/90 backdrop-blur-md border border-white/20 p-8 sm:p-10 space-y-5 shadow-2xl transition-transform duration-500 group-hover:-translate-y-1">
                    <span className="font-jost text-[9px] font-semibold tracking-[0.25em] text-[#463925] uppercase block">
                      Limited Edition
                    </span>
                    <h2 className="font-cormorant text-2xl sm:text-3xl text-stone-900 font-light leading-snug">
                      {collection.name}
                    </h2>
                    {collection.description && (
                      <p className="font-jost text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
                        {collection.description}
                      </p>
                    )}
                    <div className="pt-1">
                      {clickable ? (
                        <Link
                          to={linkTo}
                          className="inline-flex items-center gap-2.5 font-jost text-xs font-semibold tracking-[0.18em] uppercase text-stone-900 border-b border-stone-900/30 pb-1.5 hover:text-[#463925] hover:border-[#463925] transition-all duration-300"
                        >
                          Explore <span>→</span>
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-2.5 font-jost text-xs font-semibold tracking-[0.18em] uppercase text-stone-400">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}

        </div>
      </main>

    </div>
  );
}
