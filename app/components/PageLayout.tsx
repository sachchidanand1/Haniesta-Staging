import { useParams, Form, Await, useRouteLoaderData } from '@remix-run/react';
import useWindowScroll from 'react-use/esm/useWindowScroll';
import { Disclosure } from '@headlessui/react';
import { Suspense, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { CartForm } from '@shopify/hydrogen';

import { type LayoutQuery } from 'storefrontapi.generated';
import { Text, Heading, Section } from '~/components/Text';
import { Link } from '~/components/Link';
import { Cart } from '~/components/Cart';
import { CartLoading } from '~/components/CartLoading';
import { Input } from '~/components/Input';
import { Drawer, useDrawer } from '~/components/Drawer';
import { CountrySelector } from '~/components/CountrySelector';
import { ModernFooter } from '~/components/ModernFooter';
import {
  IconMenu,
  IconCaret,
  IconLogin,
  IconAccount,
  IconBag,
  IconSearch,
  IconClose,
  IconHeart,
} from '~/components/Icon';
import { useFavorites } from '~/hooks/useFavorites';
import {
  type EnhancedMenu,
  type ChildEnhancedMenuItem,
  useIsHomePath,
} from '~/lib/utils';
import type { AnnouncementBarConfig } from '~/lib/announcement-bar.server';
import { useIsHydrated } from '~/hooks/useIsHydrated';
import { useCartFetchers } from '~/hooks/useCartFetchers';
import { useCartInFlight } from '~/hooks/useCartInFlight';
import type { RootLoader } from '~/root';
import { useSyncCartOnLogin } from '~/hooks/useSyncCartOnLogin';
import { MobileMenu } from '~/components/layout/mobile-menu';
import { DesktopMenu } from '~/components/layout/desktop-menu';
import { persistAnnouncementClosed } from '~/lib/announcement-preferences';

type LayoutProps = {
  children: React.ReactNode;
  layout?: LayoutQuery & {
    headerMenu?: EnhancedMenu | null;
    footerMenu?: EnhancedMenu | null;
  };
};

export function PageLayout({ children, layout }: LayoutProps) {
  const { headerMenu, footerMenu } = layout || {};
  // Auto-restore saved cart (customer metafield) after login, once per session
  useSyncCartOnLogin();
  return (
    <>
      <div className="flex flex-col min-h-screen w-full mx-auto">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        {headerMenu && layout?.shop.name && (
          <Header title={layout.shop.name} menu={headerMenu} />
        )}
        <main role="main" id="mainContent" className="flex-grow w-full overflow-x-hidden">
          {children}
        </main>
      </div>
      <ModernFooter />
    </>
  );
}

function AnnouncementBar() {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const isHome = useIsHomePath();
  const closedFromServer = Boolean(rootData?.announcementClosed);
  const [open, setOpen] = useState(!closedFromServer);

  const config = rootData?.announcementBarConfig;

  const onClose = () => {
    setOpen(false);
    if (typeof window !== 'undefined') {
      persistAnnouncementClosed();
      // Dispatch custom event to notify header
      window.dispatchEvent(new CustomEvent('announcementBarClosed'));
    }
  };

  // Don't render if not enabled or config not available
  if (!config || !config.enabled) return null;

  // Don't render if showOnHomePageOnly is true and we're not on home page
  if (config.showOnHomePageOnly && !isHome) return null;

  // Don't render if user has dismissed it and it's not open
  if (!open) return null;

  // Don't render if no message text
  if (!config.messageText) return null;

  return (
    <div className="w-full bg-[#2E1D14] text-[#EFE2C8] text-[11px] tracking-[0.12em] py-2 uppercase sticky top-0 z-50 text-center font-jost">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 relative">
        <div className="text-center flex items-center justify-center gap-4">
          <p className="truncate">
            {config.messageText}
          </p>
          {config.buttonname && config.buttonlink && (
            <Link
              to={config.buttonlink}
              className="bg-[#EFE2C8] text-[#2E1D14] px-3 py-1 rounded text-xs font-medium hover:bg-white hover:text-[#2E1D14] transition-colors whitespace-nowrap font-jost uppercase tracking-wider ml-3"
            >
              {config.buttonname}
            </Link>
          )}
        </div>
        {config.dismissible && (
          <button
            onClick={onClose}
            aria-label="Close announcement"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#EFE2C8]/70 hover:text-white"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

function Header({ title, menu }: { title: string; menu?: EnhancedMenu }) {
  const isHome = useIsHomePath();
  const rootData = useRouteLoaderData<RootLoader>('root');
  const config = rootData?.announcementBarConfig;
  const closedFromServer = Boolean(rootData?.announcementClosed);
  const [isDismissed, setIsDismissed] = useState(closedFromServer);

  // Check dismissal state from localStorage and listen for changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Listen for storage changes (when announcement bar is dismissed in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'announcement_closed') {
        const saved = window.localStorage.getItem('announcement_closed');
        setIsDismissed(saved === '1');
      }
    };

    // Listen for custom event when announcement bar is closed in this tab
    const handleAnnouncementClose = () => {
      setIsDismissed(true);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('announcementBarClosed', handleAnnouncementClose);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('announcementBarClosed', handleAnnouncementClose);
    };
  }, []);

  // Check if announcement bar should be visible (accounting for dismissal)
  const shouldShowAnnouncementBar = Boolean(
    config?.enabled &&
    config?.messageText &&
    (!config?.showOnHomePageOnly || isHome) &&
    !isDismissed
  );

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);

  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <AnnouncementBar />
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
        hasAnnouncementBar={shouldShowAnnouncementBar}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        openCart={openCart}
        openMenu={openMenu}
        hasAnnouncementBar={shouldShowAnnouncementBar}
      />
    </>
  );
}

function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  if (!rootData) return null;
  const inFlight = useCartInFlight();

  // Toggle a body class while the cart drawer is open so other overlays can check it
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const cls = 'cart-open';
    if (isOpen) document.body.classList.add(cls);
    else document.body.classList.remove(cls);
    try {
      window.dispatchEvent(new CustomEvent('cart-open-changed', { detail: isOpen }));
    } catch { }
    return () => document.body.classList.remove(cls);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (inFlight) return;
    onClose();
  }, [inFlight, onClose]);

  return (
    <Drawer open={isOpen} onClose={handleClose} heading="Cart" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={rootData?.cart} errorElement={null}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}

export function MenuDrawer({
  isOpen,
  onClose,
  menu,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: EnhancedMenu;
}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menu">
      <div className="grid">
        <MobileMenu onClose={onClose} />
      </div>
    </Drawer>
  );
}
function MobileHeader({
  title,
  isHome,
  openCart,
  openMenu,
  hasAnnouncementBar,
}: {
  title: string;
  isHome: boolean;
  openCart: () => void;
  openMenu: () => void;
  hasAnnouncementBar?: boolean;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const params = useParams();
  const { y } = useWindowScroll();
  const scrolled = y > 30;
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    if (!isSearchOpen) return;
    const id = window.setTimeout(() => {
      try {
        searchInputRef.current?.focus();
      } catch { }
    }, 50);
    return () => window.clearTimeout(id);
  }, [isSearchOpen]);

  return (
    <header
      role="banner"
      className={`flex flex-col lg:hidden ${isTransparent ? 'fixed top-0 inset-x-0' : 'sticky top-0'} z-[100] transition-all duration-300 w-full max-w-full leading-none`}
      style={{
        background: isTransparent ? "transparent" : "#FAF7F2",
        borderBottom: isTransparent ? "none" : "1px solid #E8E3DA",
        boxShadow: scrolled ? "0 8px 24px -12px rgba(46,29,20,0.18)" : "0 0 0 rgba(0,0,0,0)",
      }}
    >
      <div className="flex items-center justify-between h-nav gap-2 px-3 sm:px-6 overflow-hidden">
        <div className="flex items-center justify-start w-auto min-w-0 gap-2 flex-shrink-0">
          <button
            onClick={openMenu}
            className={`relative flex items-center justify-center w-10 h-10 transition-colors ${
              isTransparent ? 'text-white hover:text-white/80 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]' : 'text-[#3A2A1D] hover:text-[#8A7259]'
            }`}
            aria-label="Open menu"
          >
            <IconMenu className="w-6 h-6" />
          </button>
          {isSearchOpen ? (
            <button
              onClick={() => setIsSearchOpen(false)}
              className={`relative group flex items-center justify-center w-10 h-10 transition-colors ${
                isTransparent ? 'text-white hover:text-white/80 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]' : 'text-[#3A2A1D] hover:text-[#8A7259]'
              }`}
              aria-label="Close search"
              type="button"
            >
              <IconClose className="w-6 h-6 header-action-icon" />
            </button>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`relative group flex items-center justify-center w-10 h-10 transition-colors ${
                isTransparent ? 'text-white hover:text-white/80 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]' : 'text-[#3A2A1D] hover:text-[#8A7259]'
              }`}
              aria-label="Open search"
              type="button"
            >
              <IconSearch className="w-5 h-5 header-action-icon" />
            </button>
          )}
        </div>

        <Link
          className="flex flex-col items-center justify-center min-w-0 select-none"
          to="/"
          prefetch="intent"
        >
          <div
            className={`text-[20px] sm:text-[22px] tracking-[0.18em] font-cinzel font-medium transition-colors ${
              isTransparent ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]' : 'text-[#2C2420]'
            }`}
          >
            HANIESTA
          </div>
        </Link>

        <div className="flex items-center justify-end w-auto min-w-0 gap-1.5 sm:gap-3 flex-shrink-0">
          <FavoriteCount isTransparent={isTransparent} />
          <AccountLink isTransparent={isTransparent} className={`${isTransparent ? 'text-white hover:text-white/80 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]' : 'text-[#3A2A1D] hover:text-[#8A7259]'} transition-colors relative flex items-center justify-center w-10 h-10`} />
          <CartCount isTransparent={isTransparent} isHome={isHome} openCart={openCart} />
        </div>
      </div>

      {isSearchOpen ? (
        <div className="px-3 sm:px-6 pb-3 pt-1">
          <div className="relative w-full">
            <Form
              method="get"
              action={params.locale ? `/${params.locale}/search` : '/search'}
              className="flex items-center bg-white border border-[#D9C7A8] rounded-full pl-5 pr-1.5 py-2 w-full focus-within:border-[#8A7259] transition-colors shadow-sm"
              onSubmit={(e) => {
                try {
                  const form = e.currentTarget as HTMLFormElement;
                  const fd = new FormData(form);
                  const raw = fd.get('q');
                  const q = typeof raw === 'string' ? raw.trim() : '';
                  if (!q) {
                    e.preventDefault();
                    searchInputRef.current?.focus();
                  }
                } catch { }
              }}
            >
              <input
                type="search"
                placeholder="Search luxury rugs..."
                name="q"
                ref={searchInputRef}
                className="bg-transparent outline-none border-none text-[13px] text-[#3A2A1D] placeholder-[#8A7259] w-full focus:ring-0 p-0 font-jost"
              />
              <button
                type="submit"
                aria-label="Submit search query"
                className="w-8 h-8 rounded-full bg-[#2E1D14] flex items-center justify-center flex-shrink-0 hover:bg-[#8A7259] transition-colors"
              >
                <IconSearch className="w-4 h-4 text-[#F5EDE0] header-action-icon" />
              </button>
            </Form>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function DesktopHeader({
  isHome,
  menu,
  openCart,
  title,
  hasAnnouncementBar,
}: {
  isHome: boolean;
  openCart: () => void;
  menu?: EnhancedMenu;
  title: string;
  hasAnnouncementBar?: boolean;
}) {
  const { y } = useWindowScroll();
  const scrolled = y > 30;
  const isTransparent = isHome && !scrolled;
  const params = useParams();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isSearchOpen) return;
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  return (
    <header
      role="banner"
      className={`hidden lg:flex items-center ${
        isTransparent ? 'fixed top-0 inset-x-0' : 'sticky top-0'
      } transition-all duration-400 z-[100] justify-between w-full leading-none gap-3 xl:gap-6 px-6 xl:px-12 py-4`}
      style={{
        background: isTransparent
          ? "linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.18) 60%, transparent 100%)"
          : "#FAF7F2",
        borderBottom: isTransparent ? "none" : "1px solid #E8E3DA",
        boxShadow: scrolled ? "0 8px 24px -12px rgba(46,29,20,0.18)" : "0 0 0 rgba(0,0,0,0)",
      }}
    >
      <div className="flex items-center flex-shrink-0">
        <Link className="flex-shrink-0 select-none block" to="/" prefetch="intent">
          <div
            className={`text-[26px] tracking-[0.18em] font-cinzel font-medium transition-colors ${
              isTransparent ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]' : 'text-[#2C2420]'
            }`}
          >
            HANIESTA
          </div>
        </Link>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2">
        <DesktopMenu isTransparent={isTransparent} />
      </div>

      <div className="flex items-center gap-1.5 xl:gap-2 flex-shrink-0 ml-2 mr-2">
        {/* Clean Luxury Search Action */}
        <div ref={searchContainerRef} className="relative flex items-center">
          {isSearchOpen ? (
            <Form
              method="get"
              action={params.locale ? `/${params.locale}/search` : '/search'}
              className={`flex items-center rounded-full pl-4 pr-1.5 py-1.5 w-[220px] xl:w-[300px] transition-all duration-300 ${
                isTransparent
                  ? 'bg-black/60 border border-white/50 text-white backdrop-blur-md shadow-xl'
                  : 'bg-white border border-[#D9C7A8] text-[#3A2A1D] shadow-md focus-within:border-[#2E1D14]'
              }`}
              onSubmit={(e) => {
                const fd = new FormData(e.currentTarget);
                const q = String(fd.get('q') || '').trim();
                if (!q) {
                  e.preventDefault();
                  searchInputRef.current?.focus();
                } else {
                  setIsSearchOpen(false);
                }
              }}
            >
              <IconSearch className={`w-4 h-4 mr-2 flex-shrink-0 ${isTransparent ? 'text-white/80' : 'text-[#8A7259]'}`} />
              <input
                ref={searchInputRef}
                type="search"
                name="q"
                placeholder="Search luxury rugs..."
                className={`bg-transparent outline-none border-none text-[13px] w-full focus:ring-0 p-0 font-jost ${
                  isTransparent ? 'text-white placeholder-white/70' : 'text-[#3A2A1D] placeholder-[#8A7259]'
                }`}
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  isTransparent
                    ? 'text-white/80 hover:text-white hover:bg-white/20'
                    : 'text-[#8A7259] hover:text-[#2E1D14] hover:bg-[#FAF7F2]'
                }`}
                aria-label="Close search"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            </Form>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search luxury rugs"
              title="Search"
              type="button"
              className={`${
                isTransparent
                  ? 'text-white hover:text-white/80 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]'
                  : 'text-[#3A2A1D] hover:text-[#8A7259]'
              } transition-colors relative flex items-center justify-center w-10 h-10 group`}
            >
              <IconSearch className="w-5 h-5 header-action-icon" />
              <span
                className={`absolute bottom-0 left-1.5 right-1.5 h-[1.5px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center ${
                  isTransparent ? 'bg-white' : 'bg-black'
                }`}
              />
            </button>
          )}
        </div>

        <FavoriteCount isTransparent={isTransparent} />
        <AccountLink isTransparent={isTransparent} className={`${isTransparent ? 'text-white hover:text-white/80 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]' : 'text-[#3A2A1D] hover:text-[#8A7259]'} transition-colors relative flex items-center justify-center w-10 h-10`} />
        <CartCount isTransparent={isTransparent} isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

function AccountLink({ className, isTransparent = false }: { className?: string; isTransparent?: boolean }) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const isLoggedIn = rootData?.isLoggedIn;

  return (
    <Link 
      to="/account" 
      aria-label="My Account" 
      title="My Account"
      className={`${className || ''} group`}
    >
      <Suspense fallback={<IconLogin className="w-6 h-6 header-action-icon" />}>
        <Await resolve={isLoggedIn} errorElement={<IconLogin className="w-6 h-6 header-action-icon" />}>
          {(isLoggedIn) => (isLoggedIn ? <IconAccount className="w-6 h-6 header-action-icon" /> : <IconLogin className="w-6 h-6 header-action-icon" />)}
        </Await>
      </Suspense>
      <span className={`absolute bottom-0 left-1.5 right-1.5 h-[1.5px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center ${
        isTransparent ? 'bg-white' : 'bg-black'
      }`} />
    </Link>
  );
}

function CartCount({
  isHome,
  isTransparent = false,
  openCart,
}: {
  isHome: boolean;
  isTransparent?: boolean;
  openCart: () => void;
}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  if (!rootData) return null;

  return (
    <Suspense fallback={<Badge count={0} dark={isHome} isTransparent={isTransparent} openCart={openCart} />}>
      <Await resolve={rootData?.cart} errorElement={null}>
        {(cart) => (
          <Badge
            dark={isHome}
            isTransparent={isTransparent}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
        )}
      </Await>
    </Suspense>
  );
}

function Badge({
  openCart,
  dark,
  isTransparent = false,
  count,
}: {
  count: number;
  dark: boolean;
  isTransparent?: boolean;
  openCart: () => void;
}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <IconBag className="w-6 h-6 header-action-icon" />
        {count > 0 && (
          <span className={`absolute -top-1 -right-1 ${
            isTransparent ? 'bg-white text-black' : 'bg-[#3A2A1D] text-white'
          } text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border border-white shadow-sm`}>
            {count}
          </span>
        )}
      </>
    ),
    [count, isTransparent],
  );

  return (
    <button
      onClick={openCart}
      aria-label={`Shopping bag containing ${count} items`}
      title="Shopping Bag"
      type="button"
      className={`relative group ${
        isTransparent ? 'text-white hover:text-white/80 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]' : 'text-[#3A2A1D] hover:text-[#8A7259]'
      } transition-colors flex items-center justify-center w-10 h-10`}
    >
      {BadgeCounter}
      <span className={`absolute bottom-0 left-1.5 right-1.5 h-[1.5px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center ${
        isTransparent ? 'bg-white' : 'bg-black'
      }`} />
    </button>
  );
}

function FavoriteCount({
  isTransparent = false,
}: {
  isTransparent?: boolean;
}) {
  const isHydrated = useIsHydrated();
  const { favorites } = useFavorites();
  const count = favorites?.length || 0;

  const HeartWithBadge = (
    <>
      <IconHeart className="w-6 h-6 header-action-icon" />
      {count > 0 && (
        <span className={`absolute -top-1 -right-1 ${
          isTransparent ? 'bg-white text-black' : 'bg-[#3A2A1D] text-white'
        } text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border border-white shadow-sm`}>
          {count}
        </span>
      )}
    </>
  );

  return (
    <Link
      to="/favorites"
      aria-label={`Saved favorites wishlist containing ${count} items`}
      title="Saved Favorites Wishlist"
      className={`relative group ${
        isTransparent ? 'text-white hover:text-white/80 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]' : 'text-[#3A2A1D] hover:text-[#8A7259]'
      } transition-colors flex items-center justify-center w-10 h-10`}
    >
      {HeartWithBadge}
      <span className={`absolute bottom-0 left-1.5 right-1.5 h-[1.5px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center ${
        isTransparent ? 'bg-white' : 'bg-black'
      }`} />
    </Link>
  );
}

function Footer({ menu }: { menu?: EnhancedMenu }) {
  const isHome = useIsHomePath();
  const itemsCount = menu
    ? menu?.items?.length + 1 > 4
      ? 4
      : menu?.items?.length + 1
    : [];

  return (
    <Section
      divider={isHome ? 'none' : 'top'}
      as="footer"
      role="contentinfo"
      className={`grid min-h-[25rem] items-start grid-flow-row w-full gap-6 py-8 px-6 md:px-8 lg:px-12 md:gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-${itemsCount}
        bg-primary dark:bg-contrast dark:text-primary text-contrast overflow-hidden`}
    >
      <FooterMenu menu={menu} />
      <CountrySelector />
      <div
        className={`self-end pt-8 opacity-50 md:col-span-2 lg:col-span-${itemsCount}`}
      >
        &copy; {new Date().getFullYear()} / Shopify, Inc. Hydrogen is an MIT
        Licensed Open Source project.
      </div>
    </Section>
  );
}

function FooterLink({ item }: { item: ChildEnhancedMenuItem }) {
  if (item.to.startsWith('http')) {
    return (
      <a href={item.to} target={item.target} rel="noopener noreferrer">
        {item.title}
      </a>
    );
  }

  return (
    <Link to={item.to} target={item.target} prefetch="intent">
      {item.title}
    </Link>
  );
}

function FooterMenu({ menu }: { menu?: EnhancedMenu }) {
  const styles = {
    section: 'grid gap-4',
    nav: 'grid gap-2 pb-6',
  };

  return (
    <>
      {(menu?.items || []).map((item) => (
        <section key={item.id} className={styles.section}>
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="text-left md:cursor-default">
                  <Heading className="flex justify-between" size="lead" as="h3">
                    {item.title}
                    {item?.items?.length > 0 && (
                      <span className="md:hidden">
                        <IconCaret direction={open ? 'up' : 'down'} />
                      </span>
                    )}
                  </Heading>
                </Disclosure.Button>
                {item?.items?.length > 0 ? (
                  <div
                    className={`${open ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`
                      } overflow-hidden transition-all duration-300`}
                  >
                    <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
                      <Disclosure.Panel static>
                        <nav className={styles.nav}>
                          {item.items.map((subItem: ChildEnhancedMenuItem) => (
                            <FooterLink key={subItem.id} item={subItem} />
                          ))}
                        </nav>
                      </Disclosure.Panel>
                    </Suspense>
                  </div>
                ) : null}
              </>
            )}
          </Disclosure>
        </section>
      ))}
    </>
  );
}
