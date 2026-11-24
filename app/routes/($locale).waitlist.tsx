import { json, type MetaArgs, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { useFetcher } from '@remix-run/react';
import { getSeoMeta } from '@shopify/hydrogen';
import WaitlistImage from '~/assets/Washable Rug.svg';

const WAITLIST_VARIANTS_COUNT = 530;
const WAITLIST_DESIGNS_COUNT = 53;

export async function loader({ context }: LoaderFunctionArgs) {
  const env = (context as any)?.env;
  return json({
    seo: {
      title: 'Waitlist',
      description: 'Join the private launch list.',
    },
    storeDomain: env?.PUBLIC_STORE_DOMAIN,
  });
}

export const meta = ({ matches }: MetaArgs) => {
  const seoEntries = (matches || [])
    .map((m) => (m.data as any)?.seo)
    .filter(Boolean) as any[];
  if (seoEntries.length > 0) return getSeoMeta(...seoEntries);
  return [
    { title: 'Waitlist' },
    { name: 'description', content: 'Join the private launch list.' },
  ];
};

export default function WaitlistPage() {
  const fetcher = useFetcher<
    | { success: true; message: string }
    | { error: string }
    | undefined
  >();

  const isSubmitting = fetcher.state !== 'idle';
  const successMessage =
    fetcher.data && 'success' in fetcher.data ? fetcher.data.message : null;
  const errorMessage =
    fetcher.data && 'error' in fetcher.data ? fetcher.data.error : null;

  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        <div className="text-center">
          <h1 className="font-cormorant text-5xl sm:text-5xl lg:text-6xl text-haniesta-brown tracking-wide font-medium leading-tight">
            The First Haniesta Collection Arrives Soon.
          </h1>
          <p className="mt-4 text-sm sm:text-sm text-haniesta-brown/80 font-base italic">
            <span className="font-medium">{WAITLIST_VARIANTS_COUNT}</span>{' '}
            <span className="italic">Variants</span>.{' '}
            <span className="font-medium">{WAITLIST_DESIGNS_COUNT}</span>{' '}
            <span className="italic">Designs</span>.
          </p>
          <p className="mt-2 text-sm sm:text-base text-[#A77A3A]">
            Crafted for homes that value quiet luxury.
          </p>
        </div>

        <section className="mt-16">
          <div className="relative">
            <div className="flex justify-end">
              <div className="w-full lg:w-[78%] h-[620px] sm:h-[680px] lg:h-[740px]">
                <img
                  src={WaitlistImage}
                  alt="Waitlist"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-6 sm:mt-0 sm:absolute sm:left-0 sm:top-[48%] sm:-translate-y-[48%] w-full sm:w-[420px] md:w-[520px] z-10">
              <div
                className="p-10 sm:p-12 lg:p-16"
                style={{ backgroundColor: 'rgba(234, 216, 187, 0.8)' }}
              >
                {successMessage ? (
                  <div className="min-h-[420px] flex flex-col items-center justify-center text-center">
                    <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center text-haniesta-brown/80">
                      <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.146624 46.6931L7.99499 23.564C8.19296 23.028 8.48522 22.6231 8.87174 22.3491C9.25827 22.0771 9.67968 21.9411 10.136 21.9411C10.4414 21.9411 10.7224 21.9871 10.9788 22.0791C11.2352 22.1711 11.4879 22.3481 11.7367 22.6101L25.8214 37.5494C26.0684 37.8134 26.2352 38.0814 26.322 38.3534C26.4106 38.6274 26.4549 38.9254 26.4549 39.2474C26.4549 39.7333 26.3258 40.1803 26.0674 40.5883C25.8091 40.9963 25.4283 41.3063 24.9248 41.5183L3.11627 49.8459C2.6581 50.0179 2.21501 50.0459 1.787 49.9299C1.36088 49.8119 0.995095 49.5919 0.689645 49.2699C0.384195 48.946 0.17679 48.557 0.0674318 48.103C-0.0438122 47.649 -0.0174143 47.179 0.146624 46.6931ZM49.6352 13.0825C49.39 13.3784 49.1035 13.5264 48.7754 13.5264C48.4473 13.5264 48.1607 13.3974 47.9156 13.1395L47.7572 12.9745C46.8805 12.0425 45.8387 11.5765 44.632 11.5765C43.4234 11.5765 42.3807 12.0425 41.504 12.9745L27.2044 28.1388C26.9612 28.3968 26.6746 28.5358 26.3446 28.5558C26.0146 28.5758 25.7101 28.4368 25.4311 28.1388C25.152 27.8408 25.0125 27.5279 25.0125 27.1999C25.0125 26.8719 25.152 26.5579 25.4311 26.2579L39.7307 11.0935C41.0562 9.6856 42.6711 8.98163 44.5754 8.98163C46.4798 8.98163 48.0957 9.6856 49.423 11.0935L49.6323 11.3185C49.8774 11.5765 50 11.8705 50 12.2005C50 12.5305 49.8803 12.8245 49.6352 13.0825ZM16.0442 4.8298C16.3232 4.53381 16.6183 4.38582 16.9294 4.38582C17.2405 4.38582 17.5356 4.53381 17.8146 4.8298L18.6603 5.72376C20.1687 7.3237 20.9229 9.26261 20.9229 11.5405C20.9229 13.8184 20.1687 15.7563 18.6603 17.3543L17.8486 18.2152C17.6053 18.4732 17.3187 18.6112 16.9888 18.6292C16.6588 18.6472 16.3543 18.5092 16.0753 18.2152C15.7962 17.9213 15.6567 17.6073 15.6567 17.2733C15.6567 16.9393 15.7962 16.6263 16.0753 16.3343L16.887 15.4734C17.9089 14.3894 18.4199 13.0785 18.4199 11.5405C18.4199 10.0026 17.9089 8.69064 16.887 7.60468L16.0442 6.71072C15.799 6.45273 15.668 6.14874 15.651 5.79876C15.6341 5.44877 15.7651 5.12579 16.0442 4.8298ZM26.4097 0.443982C26.6887 0.147994 26.9847 0 27.2977 0C27.6088 0 27.9039 0.147994 28.183 0.443982L31.1696 3.61185C32.5328 5.05779 33.2144 6.79072 33.2144 8.81063C33.2144 10.8306 32.5328 12.5625 31.1696 14.0064L22.5265 23.177C22.2833 23.433 21.9967 23.571 21.6667 23.591C21.3367 23.611 21.0322 23.473 20.7532 23.177C20.4741 22.881 20.3346 22.5671 20.3346 22.2351C20.3346 21.9031 20.4741 21.5901 20.7532 21.2961L29.3963 12.1285C30.273 11.1965 30.7114 10.0906 30.7114 8.81063C30.7114 7.53069 30.273 6.42473 29.3963 5.49277L26.4097 2.3279C26.1664 2.06791 26.0363 1.76393 26.0194 1.41594C26.0005 1.06596 26.1306 0.739969 26.4097 0.443982ZM44.0296 33.0976C43.7524 33.3936 43.4583 33.5416 43.1472 33.5416C42.8342 33.5416 42.5382 33.3936 42.2591 33.0976L40.9044 31.6607C39.8466 30.5387 38.5683 29.9778 37.0693 29.9778C35.5703 29.9778 34.2929 30.5387 33.237 31.6607L31.8795 33.0976C31.6381 33.3556 31.3525 33.4946 31.0225 33.5146C30.6926 33.5346 30.388 33.3956 30.109 33.0976C29.8299 32.7996 29.6904 32.4867 29.6904 32.1587C29.6904 31.8307 29.8299 31.5167 30.109 31.2167L31.4637 29.7798C33.0079 28.1418 34.8765 27.3229 37.0693 27.3229C39.2621 27.3229 41.1316 28.1428 42.6777 29.7828L44.0324 31.2167C44.2756 31.4747 44.4057 31.7787 44.4227 32.1287C44.4397 32.4786 44.3096 32.8016 44.0324 33.0976" fill="#302719" />
                      </svg>
                    </div>
                    <h3 className="font-cormorant text-3xl sm:text-4xl text-haniesta-brown font-medium">
                      You're on the list!
                    </h3>
                    <p className="mt-3 text-sm sm:text-base text-haniesta-brown/70 max-w-md mx-auto">
                      If selected within the first 100, your private access will be emailed
                      before launch!
                    </p>
                    <p className="mt-12 text-[11px] sm:text-xs text-haniesta-brown/60">
                      Stay updated by subscribing to our newsletter.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl lg:text-3xl font-cormorant font-medium mb-4 text-haniesta-brown">
                      Join the Private Launch List.
                    </h2>
                    <p className="text-haniesta-brown/80 leading-relaxed text-sm sm:text-base font-base max-w-md">
                      The first 100 members will receive 20% Reserved Launch Privilege,
                      before the collection opens to the public.
                    </p>

                    <div className="mt-8">
                      <fetcher.Form
                        method="post"
                        action="/api/waitlist"
                        className="flex flex-col sm:flex-row gap-0 w-full sm:w-[440px]"
                      >
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="Enter your Email"
                          className="h-12 w-full sm:w-[260px] rounded-none border border-haniesta-brown/40 bg-transparent px-3 text-xs text-haniesta-brown placeholder:text-haniesta-brown/55 focus:outline-none focus:border-haniesta-brown/60"
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="h-12 w-full sm:w-[180px] whitespace-nowrap rounded-none border border-l-0 border-haniesta-brown/40 bg-[#4a4032] px-5 text-xs font-medium text-white transition-colors hover:bg-[#3f362a] disabled:opacity-60"
                        >
                          {isSubmitting ? 'Submitting...' : 'Request Private Access'}
                        </button>
                      </fetcher.Form>

                      {errorMessage ? (
                        <div className="mt-2 text-xs text-red-700">{errorMessage}</div>
                      ) : null}

                      <div className="mt-3 text-[10px] text-haniesta-brown/70">
                        *Only 100 invitations will be confirmed.
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
