import {Money} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';

interface ProductSectionsProps {
  product: ProductFragment;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}

export function ProductSections({product, selectedVariant}: ProductSectionsProps) {
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;

  const priceAmt = price?.amount ? Number(price.amount) : 0;
  const compareAmt = compareAtPrice?.amount ? Number(compareAtPrice.amount) : 0;
  const isOnSale = priceAmt > 0 && compareAmt > 0 && priceAmt < compareAmt;
  const discountPct = isOnSale ? Math.round((1 - priceAmt / compareAmt) * 100) : 0;
  const savedAmount = isOnSale ? parseFloat((compareAmt - priceAmt).toFixed(2)).toString() : '0';

  const customPriceNote = (product as any)?.metafields?.find(
    (m: any) => m?.key === 'price_note' || m?.key === 'priceNote',
  )?.value;

  return (
    <div className="space-y-2 my-2">
      {/* Price Section */}
      <div className="grid gap-1">
        {/* Sale banner - only shows when on sale */}
        {isOnSale && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: '#3a3a3a',
              color: '#fff',
              borderRadius: 4,
              padding: '3px 9px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase' as const,
              width: 'fit-content',
              marginBottom: 2,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <span>Sale — {discountPct}% Off</span>
          </div>
        )}

        {/* Price row: current price + compare-at price inline */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-sans text-[#463925]" style={{fontWeight: 600, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' as const, opacity: 0.65}}>
            Price
          </span>
          {price && (
            <span
              className="font-sans"
              style={{
                fontSize: isOnSale ? 22 : 20,
                fontWeight: 700,
                color: '#463925',
                lineHeight: 1.2,
              }}
            >
              <Money withoutTrailingZeros data={price} />
            </span>
          )}
          {isOnSale && compareAtPrice && (
            <span
              className="font-sans"
              style={{
                fontSize: 15,
                color: '#9b9083',
                textDecoration: 'line-through',
                textDecorationColor: '#c4a98a',
                fontWeight: 400,
                lineHeight: 1.15,
              }}
            >
              <Money withoutTrailingZeros data={compareAtPrice} />
            </span>
          )}
        </div>

        {/* "You save" callout */}
        {isOnSale && (
          <div
            className="font-sans"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#5d7a3a',
              background: '#f0f5ea',
              borderRadius: 5,
              padding: '4px 10px',
              width: 'fit-content',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            You save {price?.currencyCode === 'GBP' ? '£' : price?.currencyCode === 'EUR' ? '€' : '$'}{savedAmount}
          </div>
        )}

        {customPriceNote && (
          <p className="text-sm mt-1 font-sans text-[#463925]">{customPriceNote}</p>
        )}
      </div>
    </div>
  );
}
