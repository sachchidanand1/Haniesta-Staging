import { useState } from "react";
import { Link } from "~/components/Link";
import { useShopMenu } from "~/hooks/use-shop-menu";
import type { SingleMenuItem } from "~/types/menu";
import { toSingleMenuItem } from "~/types/menu";
import { cn } from "~/lib/utils";
import { IconCaret } from "~/components/Icon";

/**
 * MobileMenu component - renders a collapsible menu for mobile devices
 * This is designed to be used within a Drawer component from PageLayout
 */
export function MobileMenu({ onClose }: { onClose?: () => void }) {
  const { headerMenu } = useShopMenu();

  if (!headerMenu?.items) {
    return null;
  }

  return (
    <nav className="grid gap-2 p-6">
      {headerMenu.items.map((item) => (
        <CollapsibleMenuItem
          key={item.id}
          item={toSingleMenuItem(item)}
          onClose={onClose}
        />
      ))}
    </nav>
  );
}

function CollapsibleMenuItem({
  item,
  onClose,
}: {
  item: SingleMenuItem;
  onClose?: () => void;
}) {
  const { title, to, items } = item;
  const [isOpen, setIsOpen] = useState(false);

  if (!items?.length) {
    return (
      <Link
        to={to}
        onClick={onClose}
        className="block py-3 text-base font-medium hover:text-haniesta-brown/70 transition-colors"
      >
        {title}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 py-3 text-base font-medium hover:text-haniesta-brown/70 transition-colors"
      >
        <span>{title}</span>
        <IconCaret direction={isOpen ? "up" : "down"} />
      </button>
      {isOpen && (
        <div className="border-l border-haniesta-brown/20 pl-4 ml-2">
          {items.map((childItem) => (
            <CollapsibleMenuItem
              key={childItem.id}
              item={childItem}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
}
