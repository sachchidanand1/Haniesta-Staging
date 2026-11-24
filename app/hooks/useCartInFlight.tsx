import {useFetchers} from '@remix-run/react';
import {CartForm} from '@shopify/hydrogen';

/**
 * Returns true when any cart mutation is currently in-flight (submitting/loading).
 * Covers LinesAdd, LinesUpdate, LinesRemove, DiscountCodesUpdate, BuyerIdentityUpdate.
 */
export function useCartInFlight(): boolean {
  const fetchers = useFetchers();
  for (const f of fetchers) {
    // Only care about active fetchers
    if (!f || f.state === 'idle') continue;
    if (!f.formData) continue;
    try {
      const {action} = CartForm.getFormInput(f.formData as FormData);
      if (
        action === CartForm.ACTIONS.LinesAdd ||
        action === CartForm.ACTIONS.LinesUpdate ||
        action === CartForm.ACTIONS.LinesRemove ||
        action === CartForm.ACTIONS.DiscountCodesUpdate ||
        action === CartForm.ACTIONS.BuyerIdentityUpdate
      ) {
        return true;
      }
    } catch {}
  }
  return false;
}
