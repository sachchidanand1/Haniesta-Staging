// This file extends the menu types from ~/lib/utils
// Import the base types from utils
import type { ParentEnhancedMenuItem } from "~/lib/utils";

// SingleMenuItem interface for recursive menu structures
export interface SingleMenuItem {
  id: string;
  title: string;
  items: SingleMenuItem[];
  to: string;
  target?: string;
  resource?: {
    image?: {
      altText: string;
      height: number;
      id: string;
      url: string;
      width: number;
    };
  };
}

// Helper to convert ParentEnhancedMenuItem to SingleMenuItem
export function toSingleMenuItem(item: any): SingleMenuItem {
  return {
    id: item.id,
    title: item.title,
    to: item.to,
    target: item.target || '_self',
    items: item.items?.map((child: any) => toSingleMenuItem(child)) || [],
    resource: item.resource || undefined,
  };
}
