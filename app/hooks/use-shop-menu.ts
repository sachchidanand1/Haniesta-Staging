import { useRouteLoaderData } from "@remix-run/react";
import type { RootLoader } from "~/root";
import type { EnhancedMenu } from "~/lib/utils";

export function useShopMenu() {
  const rootData = useRouteLoaderData<RootLoader>("root");
  const layout = rootData?.layout;
  const shopName = layout?.shop?.name;
  const headerMenu = layout?.headerMenu as EnhancedMenu | undefined;
  const footerMenu = layout?.footerMenu as EnhancedMenu | undefined;
  
  return {
    shopName,
    headerMenu,
    footerMenu,
  };
}
