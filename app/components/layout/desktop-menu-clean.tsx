import { useState } from "react";
import { Link } from "~/components/Link";
import { RevealUnderline } from "~/components/reveal-underline";
import { useShopMenu } from "~/hooks/use-shop-menu";
import type { SingleMenuItem } from "~/types/menu";
import { toSingleMenuItem } from "~/types/menu";
import { cn } from "~/lib/utils";
import { IconCaret } from "~/components/Icon";

/**
 * DesktopMenu component - renders a horizontal navigation menu for desktop
 * Features dropdown submenus on hover
 */
export function DesktopMenu() {
  const { headerMenu } = useShopMenu();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (!headerMenu?.items?.length) {
    return null;
  }

  return (
    <nav
      className="hidden lg:flex items-center gap-6"
      onMouseLeave={() => setOpenMenuId(null)}
    >
      {headerMenu.items.map((menuItem) => {
        const item = toSingleMenuItem(menuItem);
        const hasSubmenu = item.items && item.items.length > 0;
        const isOpen = openMenuId === item.id;

        return (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => hasSubmenu && setOpenMenuId(item.id)}
          >
            {hasSubmenu ? (
              <button
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-[15px] font-medium tracking-wide",
                  "hover:text-haniesta-brown/70 transition-colors uppercase"
                )}
              >
                <span>{item.title}</span>
                <IconCaret direction={isOpen ? "up" : "down"} />
              </button>
            ) : (
              <Link
                to={item.to}
                prefetch="intent"
                className="px-3 py-2 text-[15px] font-medium tracking-wide hover:text-haniesta-brown/70 transition-colors uppercase"
              >
                {item.title}
              </Link>
            )}

            {hasSubmenu && isOpen && (
              <div className="absolute top-full left-0 pt-2 z-50">
                <div className="bg-haniesta-cream border border-haniesta-brown/10 shadow-lg rounded-lg py-4 px-6 min-w-[200px]">
                  <DropdownSubMenu items={item.items} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function DropdownSubMenu({ items }: { items: SingleMenuItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map(({ id, to, title }) => (
        <li key={id}>
          <Link
            to={to}
            prefetch="intent"
            className="block text-sm hover:text-haniesta-brown/70 transition-colors"
          >
            <RevealUnderline>{title}</RevealUnderline>
          </Link>
        </li>
      ))}
    </ul>
  );
}
