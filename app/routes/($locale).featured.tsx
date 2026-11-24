import {json, type LoaderFunctionArgs, type MetaFunction} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import {Image} from '~/components/Image';
import {routeHeaders} from '~/data/cache';
import {getFeaturedCollections, getFeaturedSpecificCollections, type FeaturedCollection} from '~/lib/metafields';

export const headers = routeHeaders;

export const meta: MetaFunction = () => {
  return [
    {title: 'Featured Collections'},
    {name: 'description', content: 'Discover our featured collections of premium rugs and home decor.'},
  ];
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const [featuredCollections, featuredSpecific] = await Promise.all([
    getFeaturedCollections(storefront),
    getFeaturedSpecificCollections(storefront, 2),
  ]);

  return json({
    featuredCollections,
    featuredSpecific,
    seo: {
      title: 'Featured Collections',
      description: 'Explore our curated selection of featured rug collections',
    },
  });
}

export default function FeaturedCollections() {
  const {featuredCollections, featuredSpecific} = useLoaderData<typeof loader>();
  const heroA = (featuredSpecific && featuredSpecific[0]) || featuredCollections[0];
  const heroB = (featuredSpecific && featuredSpecific[1]) || featuredCollections[1] || heroA;
  const heroALink = heroA?.collectionHandle ? `/collections/${heroA.collectionHandle}?from=featured&mo=${encodeURIComponent(heroA.id)}` : '#';
  const heroBLink = heroB?.collectionHandle ? `/collections/${heroB.collectionHandle}?from=featured&mo=${encodeURIComponent(heroB.id)}` : '#';

  return (
    <div className="min-h-screen bg-white">
      {/* Page Title */}
      <section className="py-12">
        <h1 className="text-center text-4xl md:text-5xl font-serif tracking-wide text-stone-800">
          Featured Collections
        </h1>
      </section>

      {/* Collections Grid - alternating split cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 lg:gap-8">
          {featuredCollections.map((collection: FeaturedCollection, idx: number) => {
            const linkTo = collection.collectionHandle ? `/collections/${collection.collectionHandle}?from=featured&mo=${encodeURIComponent(collection.id)}` : '#';
            const clickable = Boolean(collection.collectionHandle);
            const rowIndex = Math.floor(idx / 2);
            const imageFirst = rowIndex % 2 === 0; // alternate per row: row1 image->text, row2 text->image
            return (
              <div key={collection.id} className="group relative bg-white">
                <Link to={linkTo} className={`block h-full ${clickable ? '' : 'pointer-events-none'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 h-[360px] lg:h-[420px] overflow-hidden">
                    {/* Image half */}
                    <div className={`${imageFirst ? '' : 'md:order-2'} relative`}>
                      <div className="absolute inset-0 overflow-hidden">
                        {collection.image ? (
                          <Image
                            data={collection.image}
                            alt={collection.image.altText || collection.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                          />
                        ) : collection.imageUrl ? (
                          <img
                            src={collection.imageUrl}
                            alt={collection.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-stone-200" />
                        )}
                        {/* subtle half overlay like screenshot */}
                        <div className={`absolute inset-y-0 ${imageFirst ? 'right-0' : 'left-0'} w-1/2 bg-black/20`} />
                      </div>
                    </div>

                    {/* Text half */}
                    <div className={`${imageFirst ? 'md:order-2' : ''} bg-[#F3E8DC] flex items-center`}>
                      <div className="px-6 py-8 md:px-8 space-y-4">
                        <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl text-stone-800">{collection.name}</h3>
                        {collection.description && (
                          <p className="text-stone-700/90 text-base leading-relaxed max-w-[36ch]">{collection.description}</p>
                        )}
                        <div>
                          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-white text-stone-900 rounded shadow-sm border border-stone-200">
                            {clickable ? 'View Now' : 'Coming Soon'} <span aria-hidden>→</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Extra promotional rows below, as per design */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
        <div className="grid md:grid-cols-[0.55fr_0.45fr] items-center gap-0 relative">
          {/* Left green text slab */}
          <div className="relative bg-[#2F4F3E] text-white p-8 md:p-12 lg:p-14 md:pr-32 lg:pr-[17rem] flex items-center h-[380px] md:h-[480px]">
            <div className="space-y-6 max-w-prose">
              <p className="text-base md:text-lg leading-relaxed opacity-95 italic">
                See what everyone's loving. Our Bestsellers collection features our most popular and highly-rated rugs. These customer favorites are the perfect blend of style and quality, guaranteed to bring warmth and elegance to any room.
              </p>
            </div>
          </div>
          {/* Right image overlapping the green slab */}
          <div className="relative h-[320px] md:h-[420px] overflow-visible z-30 md:-ml-32 lg:-ml-40">
            {heroA?.image ? (
              <Image data={heroA.image} alt={heroA.image.altText || heroA.name} className="w-[180%] md:w-[200%] h-full object-cover" loading="lazy" sizes="(min-width: 1024px) 50vw, 100vw" />
            ) : heroA?.imageUrl ? (
              <img src={heroA.imageUrl} alt={heroA.name} className="w-[180%] md:w-[200%] h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full bg-stone-200" />
            )}
            <div className="absolute inset-0 flex items-end md:items-center justify-end p-6 md:p-10">
              <h2 className="font-serif uppercase text-white text-3xl md:text-5xl lg:text-6xl leading-tight tracking-wide text-right drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                <span className="block">BEST</span>
                <span className="block">SELLERS OF</span>
                <span className="block">THE SEASON</span>
              </h2>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
        <div className="grid md:grid-cols-[0.45fr_0.55fr] items-center gap-0 relative">
          {/* Left image overlapping the navy slab */}
          <div className="relative h-[320px] md:h-[420px] overflow-visible z-30 md:-mr-32 lg:-mr-40">
            {heroB?.image ? (
              <Image data={heroB.image} alt={heroB.image.altText || heroB.name} className="w-[180%] md:w-[200%] h-full object-cover" loading="lazy" sizes="(min-width: 1024px) 50vw, 100vw" />
            ) : heroB?.imageUrl ? (
              <img src={heroB.imageUrl} alt={heroB.name} className="w-[180%] md:w-[200%] h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full bg-stone-200" />
            )}
            <div className="absolute inset-0 flex items-start md:items-center justify-start p-6 md:p-10">
              <h2 className="font-serif uppercase text-white text-3xl md:text-5xl lg:text-6xl leading-tight tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                <span className="block">NEW</span>
                <span className="block">ARRIVALS</span>
                <span className="block">THE SEASON</span>
              </h2>
            </div>
          </div>
          {/* Right navy text slab */}
          <div className="relative bg-[#0B1F3A] text-white p-8 md:p-12 lg:p-14 md:pl-32 lg:pl-[17rem] flex items-center h-[380px] md:h-[480px]">
            <div className="space-y-6 max-w-prose">
              <p className="text-base md:text-lg leading-relaxed opacity-95 italic">
                Step into style with our New Arrivals. We've just added stunning new rugs to our collection, each one a unique find designed to elevate your space. Find the perfect piece to complete your home's look.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
