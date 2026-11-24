import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import {Image} from '~/components/Image';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

type Collection = {
  id: string;
  title: string;
  handle: string;
  image?: {
    url: string;
    altText: string;
    width: number;
    height: number;
  };
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  
  const {collections} = await storefront.query(COLLECTIONS_QUERY, {
    variables: {
      first: 8,
    },
  });

  return json({
    collections: collections.nodes,
  });
}

const COLLECTIONS_QUERY = `#graphql
  query FeaturedCollections($first: Int) {
    collections(first: $first, sortKey: UPDATED_AT) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
            Featured Collections
          </h1>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {collections.map((collection: Collection) => (
            <div key={collection.id} className="group relative overflow-hidden">
              <Link to={`/collections/${collection.handle}`} className="block">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {collection.image ? (
                    <Image
                      data={collection.image}
                      alt={collection.image.altText || collection.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33.33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    {collection.title}
                  </h2>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-medium">
                    View All
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

// This is a route fragment that ensures this route is only available in the browser
// and not during server-side rendering
export function shouldRevalidate() {
  return false;
}
