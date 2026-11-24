import {Link} from '~/components/Link';
import {useFetcher} from '@remix-run/react';
import {useEffect, useMemo, useState} from 'react';
import {useShopMenu} from '~/hooks/use-shop-menu';
import type {ChildEnhancedMenuItem, ParentEnhancedMenuItem} from '~/lib/utils';

type NewsletterResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

export function ModernFooter() {
  const {footerMenu} = useShopMenu();
  const fetcher = useFetcher<NewsletterResponse>();
  const [email, setEmail] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const menuColumns = useMemo(() => {
    return (footerMenu?.items || []).slice(0, 3);
  }, [footerMenu]);

  const connectColumn = useMemo(() => {
    const items = footerMenu?.items || [];
    return items.find((it) => String(it?.title || '').trim().toLowerCase() === 'connect') || null;
  }, [footerMenu]);

  const socialIcon = (title: string) => {
    const t = String(title || '').trim().toLowerCase();
    if (t.includes('facebook')) {
      return (
        <svg className="w-6 h-6 text-haniesta-cream" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 3.667h-3.533v7.98H9.101z" />
        </svg>
      );
    }
    if (t.includes('instagram')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    }
    if (t === 'x' || t.includes('twitter') || t.includes('x (twitter)') || t.includes('x/twitter') || t.includes('x -')) {
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    }
    if (t.includes('pinterest')) {
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.04 2C6.58 2 3 5.62 3 10.43c0 3.28 1.84 5.16 2.95 5.16.46 0 .73-1.29.73-1.65 0-.43-1.16-1.43-1.16-3.33 0-3.94 2.99-6.7 6.95-6.7 3.37 0 5.87 1.9 5.87 5.43 0 2.62-1.05 7.54-4.46 7.54-1.23 0-2.28-.88-2.28-2.15 0-1.85 1.29-3.64 1.29-5.57 0-3.25-4.6-2.66-4.6.63 0 .97.12 2.05.56 2.93l-2.25 9.52c-.07.3-.04.67-.02.98.01.12.07.48.23.48.19 0 .26-.22.33-.37.09-.17.13-.3.2-.49l2.18-8.93c.41.78 1.59 1.47 2.55 1.47 3.36 0 5.64-3.06 5.64-6.78C21.92 5.1 18.36 2 12.04 2z" />
        </svg>
      );
    }
    if (t.includes('youtube')) {
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21.8 8.001a2.74 2.74 0 0 0-1.93-1.94C18.17 5.6 12 5.6 12 5.6s-6.17 0-7.87.46A2.74 2.74 0 0 0 2.2 8.001 28.64 28.64 0 0 0 1.8 12c0 1.34.1 2.68.4 3.999a2.74 2.74 0 0 0 1.93 1.94c1.7.46 7.87.46 7.87.46s6.17 0 7.87-.46a2.74 2.74 0 0 0 1.93-1.94c.3-1.32.4-2.66.4-3.999 0-1.34-.1-2.68-.4-3.999zM10 15.5v-7l6 3.5-6 3.5z" />
        </svg>
      );
    }
    if (t.includes('tiktok')) {
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.4 3c.2 1.7 1.6 3.1 3.3 3.3v3.2c-1.3 0-2.5-.4-3.5-1.1v7c0 3.4-2.8 6.2-6.2 6.2S4.8 19 4.8 15.6c0-3.4 2.8-6.2 6.2-6.2.3 0 .6 0 .9.1v3.4c-.3-.1-.6-.2-.9-.2-1.6 0-2.9 1.3-2.9 2.9S9.4 18.5 11 18.5s2.9-1.3 2.9-2.9V3h3.5z" />
        </svg>
      );
    }
    if (t.includes('linkedin')) {
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.001V9h3.112v1.561h.044c.434-.824 1.494-1.692 3.073-1.692 3.287 0 3.894 2.164 3.894 4.977v6.606zM5.337 7.433A1.806 1.806 0 1 1 5.34 3.82a1.806 1.806 0 0 1-.003 3.613zM6.956 20.452H3.713V9h3.243v11.452z" />
        </svg>
      );
    }

    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M10.5 13.5 21 3" />
        <path d="M15 3h6v6" />
        <path d="M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
      </svg>
    );
  };

  // Handle form submission state
  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success;
  const errorMessage = fetcher.data?.error;

  // Show success/error message and reset form
  useEffect(() => {
    if (fetcher.data) {
      setShowMessage(true);
      
      // Clear email on success
      if (isSuccess) {
        setEmail('');
      }

      // Hide message after 5 seconds
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [fetcher.data, isSuccess]);

  return (
    <footer className="bg-haniesta-cream text-haniesta-brown">
      {/* Main Footer Content */}
      <div className="mx-auto px-6 sm:px-12 lg:px-16 xl:px-24 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {menuColumns.length > 0 ? (
            menuColumns.map((column: ParentEnhancedMenuItem) => (
              <div key={column.id} className="lg:col-span-1">
                <h3 className="font-cormorant text-lg font-medium mb-6 uppercase tracking-wide">
                  {column.title}
                </h3>
                <ul className="space-y-3">
                  {(column.items || []).map((item: ChildEnhancedMenuItem) => {
                    const cleanTitle = String(item.title || '').trim().toLowerCase();
                    const displayTitle = 
                      cleanTitle === 'shipping' ? 'Shipping Policy' :
                      (cleanTitle === 'return' || cleanTitle === 'returns') ? 'Return Policy' :
                      item.title;

                    return (
                      <li key={item.id}>
                        {item.isExternal ? (
                          <a
                            href={item.to}
                            target={item.target}
                            rel="noopener noreferrer"
                            className="text-haniesta-brown/80 hover:text-haniesta-brown transition-colors"
                          >
                            {displayTitle}
                          </a>
                        ) : (
                          <Link
                            to={item.to}
                            target={item.target}
                            className="text-haniesta-brown/80 hover:text-haniesta-brown transition-colors"
                          >
                            {displayTitle}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          ) : (
            <>
              <h3 className="font-cormorant text-lg font-medium mb-4">
                No menu items found, Configure at Shopify Admin Footer Menu...
              </h3>
            </>
          )}

          {/* Connect Column */}
          <div className="lg:col-span-1">
            <h3 className="font-cormorant text-lg font-medium mb-6 uppercase tracking-wide">
              Connect
            </h3>
            <div className="flex space-x-4 mb-6">
              {(connectColumn?.items || []).map((item: ChildEnhancedMenuItem) => {
                const icon = socialIcon(item.title);
                const href = item.to;
                const title = item.title;
                const isFacebook = String(title || '').trim().toLowerCase().includes('facebook');
                return (
                  <a
                    key={item.id}
                    href={href}
                    target={item.target || '_blank'}
                    rel="noopener noreferrer"
                    aria-label={title}
                    title={title}
                    className="group"
                  >
                    {isFacebook ? (
                      <div className="w-6 h-6 bg-haniesta-brown rounded-full flex items-center justify-center transition-colors">
                        {icon}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-haniesta-brown hover:text-haniesta-brown/80 transition-colors">
                        {icon}
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:col-span-1">
            <h3 className="font-cormorant text-lg font-medium mb-4">
              Join the Haniesta Circle
            </h3>
            <p className="text-haniesta-brown/70 text-sm mb-4 leading-relaxed">
              Subscribe to receive <strong>10% off</strong> your first order. 
              Get all the updates on the exclusive offers and new designs.
            </p>
            
            {/* Success/Error Messages */}
            {showMessage && isSuccess && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded">
                {fetcher.data?.message || 'Successfully subscribed!'}
              </div>
            )}
            {showMessage && errorMessage && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
                {errorMessage}
              </div>
            )}

            {/* <fetcher.Form 
              method="post" 
              action="/api/newsletter/subscribe"
              className="space-y-3"
            >
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email Address"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white border border-haniesta-brown/30 rounded-none text-haniesta-brown placeholder-haniesta-brown/50 focus:outline-none focus:border-haniesta-brown/60 focus:ring-1 focus:ring-haniesta-brown/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-haniesta-brown text-white py-3 px-6 font-medium hover:bg-haniesta-brown/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Subscribing...' : 'Sign Up'}
              </button>
            </fetcher.Form> */}

            <button
              type="button"
              className="klaviyo_form_trigger w-full bg-white text-haniesta-brown py-3 px-6 font-medium border border-haniesta-brown/30 hover:border-haniesta-brown/60 hover:bg-white/70 transition-colors"
            >
              Get 10% Off
            </button>
            <p className="text-xs text-haniesta-brown/60 mt-3 leading-relaxed">
              By subscribing, you agree to our{' '}
              <Link to="/pages/privacy-policy" className="underline hover:no-underline">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link to="/pages/terms-conditions" className="underline hover:no-underline">
                Terms of Service
              </Link>
              . You may unsubscribe at any time. This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
            </p>
          </div>
        </div>

        {/* Disclaimer Text */}
        <div className="mt-12 pt-8 border-t border-haniesta-brown/20">
          <p className="text-haniesta-brown/60 text-sm leading-relaxed max-w-4xl">
            Every effort has been made to ensure that colors displayed are accurate. However, actual colors may vary from those shown on your monitor. 
            Since we are not responsible for monitor variations, we recommend ordering a sample prior to purchase to ensure satisfaction.
          </p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-haniesta-brown/5 px-6 sm:px-12 lg:px-16 xl:px-24 py-6">
        <div className="mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm">
            <Link 
              to="/pages/privacy-policy" 
              className="text-haniesta-brown/70 hover:text-haniesta-brown transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/pages/terms-conditions" 
              className="text-haniesta-brown/70 hover:text-haniesta-brown transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link 
              to="/pages/cookie-policy" 
              className="text-haniesta-brown/70 hover:text-haniesta-brown transition-colors"
            >
              Cookie Policy
            </Link>
            {/* <Link 
              to="/pages/warranty" 
              className="text-haniesta-brown/70 hover:text-haniesta-brown transition-colors"
            >
              Warranty Policy
            </Link>
            <Link 
              to="/pages/trademark" 
              className="text-haniesta-brown/70 hover:text-haniesta-brown transition-colors"
            >
              Trademark & Copyright Guidelines
            </Link> */}
          </div>
          <div className="text-sm text-haniesta-brown/70">
            © {new Date().getFullYear()} Haniesta. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
