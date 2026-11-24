import {json, type LoaderFunctionArgs, type MetaFunction} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import {Image} from '~/components/Image';
import {routeHeaders} from '~/data/cache';
import {getFeaturedCollections} from '~/lib/metafields';

export const headers = routeHeaders;

type Collection = {
  id: string;
  title: string;
  handle: string;
  description: string;
};

export const meta: MetaFunction = () => {
  return [
    {title: 'Featured Collections'},
    {name: 'description', content: 'Discover our featured collections of premium rugs and home decor.'},
  ];
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const featuredCollections = await getFeaturedCollections(storefront, 8);
  
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
      <section className="relative h-[50vh] flex items-center justify-center bg-gray-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 z-10"></div>
          <div className="w-full h-full bg-gray-200"></div>
        </div>
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white mb-6">
            Featured Collections
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Discover our curated selection of premium rug collections
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {featuredCollections.map(({collection, imageUrl}) => (
            <div key={collection.id} className="group relative overflow-hidden rounded-lg">
              <Link to={`/collections/${collection.handle}`} className="block h-full">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={collection.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      width={400}
                      height={400}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-1">
                    {collection.title}
                  </h2>
                  {collection.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-medium">
                    View Collection
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
