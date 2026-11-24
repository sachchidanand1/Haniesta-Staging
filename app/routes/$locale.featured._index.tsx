import {json, type LoaderFunctionArgs, type MetaFunction} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import {Image} from '~/components/Image';
import {routeHeaders} from '~/data/cache';
import {getFeaturedCollections, type FeaturedCollection} from '~/lib/metafields';

export const headers = routeHeaders;

export const meta: MetaFunction = () => {
  return [
    {title: 'Featured Collections'},
    {name: 'description', content: 'Discover our featured collections of premium rugs and home decor.'},
  ];
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const featuredCollections = await getFeaturedCollections(storefront);
  
  return json({
    featuredCollections,
    seo: {
      title: 'Featured Collections',
      description: 'Explore our curated selection of featured rug collections',
    },
  });
}

export default function FeaturedCollections() {
  const {featuredCollections} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1616486338815-3e98d524d111?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Luxury living room with designer furniture"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 leading-tight">
            Featured Collections
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Discover our curated selection of premium collections
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {featuredCollections.map((collection: FeaturedCollection) => (
            <div key={collection.id} className="group relative">
              <Link to={`/collections/${collection.handle}`} className="block h-full">
                <div className="aspect-square overflow-hidden bg-gray-100 mb-4">
                  {collection.image ? (
                    <Image
                      data={collection.image}
                      alt={collection.image.altText || collection.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33.33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-medium text-gray-900 mb-1">
                    {collection.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    View Collection
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
