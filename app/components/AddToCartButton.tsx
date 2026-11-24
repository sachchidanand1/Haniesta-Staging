import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useParams} from '@remix-run/react';
import type {FetcherWithComponents} from '@remix-run/react';
import {useEffect, useRef} from 'react';

import {Button} from '~/components/Button';

export function AddToCartButton({
  children,
  lines,
  className = '',
  variant = 'primary',
  width = 'full',
  disabled,
  ...props
}: {
  children: React.ReactNode;
  lines: Array<OptimisticCartLineInput>;
  className?: string;
  variant?: 'primary' | 'secondary' | 'inline';
  width?: 'auto' | 'full';
  disabled?: boolean;
  [key: string]: any;
}) {
  const params = useParams();
  const routePath = params.locale ? `/${params.locale}/cart` : '/cart';
  const lastAddToCartRef = useRef<{variantId: string; time: number} | null>(null);

  function fireAddToCartPixel(variantId: string) {
    const now = Date.now();
    const last = lastAddToCartRef.current;
    if (last && last.variantId === variantId && now - last.time < 2000) return;
    lastAddToCartRef.current = {variantId, time: now};
    
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', {
        content_ids: [variantId],
        content_type: 'product',
      });
    }
  }
  return (
    <CartForm
      route={routePath}
      inputs={{
        lines,
      }}
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        useEffect(() => {
          if (fetcher.state === 'idle' && fetcher.data?.cart) {
            const variantId = lines[0]?.merchandiseId;
            if (variantId) {
              fireAddToCartPixel(variantId);
            }
          }
        }, [fetcher.state, fetcher.data, lines]);

        return (
          <>
            <Button
              as="button"
              type="submit"
              width={width}
              variant={variant}
              className={className}
              disabled={disabled ?? fetcher.state !== 'idle'}
              onClick={() => {
                const variantId = lines[0]?.merchandiseId;
                if (variantId) {
                  fireAddToCartPixel(variantId);
                }
              }}
              {...props}
            >
              {children}
            </Button>
          </>
        );
      }}
    </CartForm>
  );
}
