import {Link} from '@remix-run/react';
import {type MappedProductOptions} from '@shopify/hydrogen';
import {clsx} from 'clsx';
import defaultSizeThumbnail from '~/assets/sizepics/80x80round.png';

// Configure how different product option types are rendered
const OPTIONS_AS_SWATCH: string[] = [
  'Color',
  'Colors', 
  'Colour',
  'Colours',
];
const OPTIONS_AS_BUTTON: string[] = ['Size', 'Sizes'];

type SizeImageMap = Record<string, Record<string, string>>;

type GroupProductItem = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {url: string; altText?: string | null} | null;
  colorLabel?: {value?: string | null} | null;
  colorFamilyKey?: {value?: string | null} | null;
  swatchImage?: {
    reference?: {image?: {url: string; altText?: string | null} | null} | null;
  } | null;
};

interface ProductOptionValuesProps {
  option: MappedProductOptions;
  selectedValue?: string;
  colorSwatchData?: any;
  sizeImageMap?: SizeImageMap;
  onOptionSelected?: () => void;
  onSizePreviewSelected?: (next: {name: string; to: string}) => void;
  groupProducts?: GroupProductItem[];
  currentProductHandle?: string;
  productSwatchImageMap?: Record<string, string>;
  currentProductSwatchUrl?: string;
}

export function ProductOptionValues({
  option,
  selectedValue,
  colorSwatchData,
  sizeImageMap,
  onOptionSelected,
  onSizePreviewSelected,
  groupProducts,
  currentProductHandle,
  productSwatchImageMap,
  currentProductSwatchUrl,
}: ProductOptionValuesProps) {
  const {name: optionName, optionValues} = option;

  if (!optionName) {
    return null;
  }

  if (
    OPTIONS_AS_SWATCH.includes(optionName) &&
    Array.isArray(groupProducts) &&
    groupProducts.length > 1
  ) {
    const normalizeColorKey = (str?: string) =>
      String(str || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const normalized = groupProducts
      .filter((p) => p?.handle)
      .sort((a, b) =>
        String(a.colorLabel?.value || a.title || '').localeCompare(
          String(b.colorLabel?.value || b.title || ''),
        ),
      );

    return (
      <div className="flex flex-wrap gap-3">
        {normalized.map((p) => {
          const isActive = p.handle === currentProductHandle;
          const label = p.colorLabel?.value || p.title;

          const familyKey = p.colorFamilyKey?.value
            ? String(p.colorFamilyKey.value)
            : undefined;
          const normalizedFamilyKey = familyKey
            ? normalizeColorKey(familyKey)
            : undefined;
          const normalizedLabelKey = normalizeColorKey(label);

          const colorMetaobject = colorSwatchData?.nodes?.find((meta: any) => {
            const labelField = meta.fields?.find(
              (field: any) =>
                field.key === 'label' ||
                field.key === 'name' ||
                field.key === 'title',
            );
            const metaLabel = labelField?.value || meta.handle;
            const handleKey = normalizeColorKey(meta.handle);
            const metaLabelKey = normalizeColorKey(metaLabel);

            if (normalizedFamilyKey) {
              return handleKey === normalizedFamilyKey;
            }

            return handleKey === normalizedLabelKey || metaLabelKey === normalizedLabelKey;
          });

          const colorField = colorMetaobject?.fields?.find(
            (field: any) => field.key === 'color',
          );
          const imageField = colorMetaobject?.fields?.find(
            (field: any) => field.key === 'image' || field.key === 'swatch_image',
          );

          const swatchUrl =
            imageField?.reference?.image?.url ||
            p.swatchImage?.reference?.image?.url;

          const swatchColor =
            typeof colorField?.value === 'string' ? colorField.value : undefined;

          return (
            <Link
              key={p.id}
              to={`/products/${p.handle}`}
              preventScrollReset
              prefetch="intent"
              replace
              onClick={onOptionSelected}
              aria-current={isActive ? 'page' : undefined}
              className={clsx(
                'flex aspect-square w-10 h-10 rounded-full border-2 transition-all duration-200 overflow-hidden',
                'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#463925]',
                isActive
                  ? 'border-[#463925] ring-2 ring-[#463925] ring-offset-2'
                  : 'border-gray-300 hover:border-gray-400',
              )}
              style={{
                backgroundColor:
                  !swatchUrl && swatchColor && isValidColor(swatchColor)
                    ? swatchColor
                    : undefined,
              }}
              title={label}
            >
              {swatchUrl ? (
                <img
                  src={swatchUrl}
                  alt={label}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-[#f3f4f6]">
                  <span className="sr-only">{label}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {optionValues.map((optionValue) => (
        <OptionValue
          key={optionValue.name}
          optionName={optionName}
          value={optionValue}
          selectedValue={selectedValue}
          colorSwatchData={colorSwatchData}
          sizeImageMap={sizeImageMap}
          onOptionSelected={onOptionSelected}
          onSizePreviewSelected={onSizePreviewSelected}
          productSwatchImageMap={productSwatchImageMap}
          currentProductSwatchUrl={currentProductSwatchUrl}
        />
      ))}
    </div>
  );
}

function OptionValue({
  optionName,
  value,
  selectedValue,
  colorSwatchData,
  sizeImageMap,
  onOptionSelected,
  onSizePreviewSelected,
  productSwatchImageMap,
  currentProductSwatchUrl,
}: {
  optionName: string;
  value: MappedProductOptions['optionValues'][number];
  selectedValue?: string;
  colorSwatchData?: any;
  sizeImageMap?: SizeImageMap;
  onOptionSelected?: () => void;
  onSizePreviewSelected?: (next: {name: string; to: string}) => void;
  productSwatchImageMap?: Record<string, string>;
  currentProductSwatchUrl?: string;
}) {
  const {
    name,
    variantUriQuery,
    selected,
    available,
    isDifferentProduct,
    handle,
    swatch,
  } = value;

  const to = isDifferentProduct
    ? `/products/${handle}?${variantUriQuery}`
    : `?${variantUriQuery}`;

  // In the size drawer, `selected` reflects the loaded product variant while
  // `selectedValue` tracks the user's preview pick — use only `selectedValue`.
  const isSelected = onSizePreviewSelected
    ? selectedValue === name
    : selected || selectedValue === name;

  // Color Swatch Rendering
  if (OPTIONS_AS_SWATCH.includes(optionName)) {
    const variantSwatchRef = (value as any)?.firstSelectableVariant?.variantSwatch
      ?.reference as any;
    const variantSwatchUrl = variantSwatchRef?.image?.url || variantSwatchRef?.url;

    const variantImagesNodes = (value as any)?.firstSelectableVariant?.metafield
      ?.references?.nodes as any[] | undefined;
    const hasVariantImages =
      Array.isArray(variantImagesNodes) && variantImagesNodes.length > 0;

    const swatchImageUrl =
      hasVariantImages
        ? variantSwatchUrl
        : variantSwatchUrl ||
          (isDifferentProduct && handle
            ? productSwatchImageMap?.[String(handle)]
            : currentProductSwatchUrl);
    
    return (
      <Link
        to={to}
        preventScrollReset
        prefetch="intent"
        replace
        onClick={onOptionSelected}
        className={clsx(
          'flex aspect-square w-10 h-10 rounded-full border-2 transition-all duration-200 overflow-hidden',
          'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#463925]',
          isSelected 
            ? 'border-[#463925] ring-2 ring-[#463925] ring-offset-2' 
            : 'border-gray-300 hover:border-gray-400',
          !available && 'opacity-50 cursor-not-allowed relative'
        )}
        style={{
          backgroundColor: !swatchImageUrl ? '#f3f4f6' : undefined,
        }}
        title={name}
      >
        {swatchImageUrl ? (
          <img
            src={swatchImageUrl}
            alt={name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full rounded-full flex items-center justify-center">
            <span className="sr-only">{name}</span>
          </div>
        )}
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-0.5 bg-red-500 rotate-45 transform"></div>
          </div>
        )}
      </Link>
    );
  }

  // Size Button Rendering
  if (OPTIONS_AS_BUTTON.includes(optionName)) {
    const resolvedSizeImageUrl =
      (sizeImageMap && sizeImageMap[optionName]?.[name]) ||
      defaultSizeThumbnail;

    // if (process.env.NODE_ENV === 'development') {
    //   console.log('📏 Size Image Debug:', {
    //     optionName,
    //     name,
    //     resolvedSizeImageUrl,
    //     fromMap: !!(sizeImageMap && sizeImageMap[optionName]?.[name]),
    //     fromLocalAsset: resolvedSizeImageUrl === defaultSizeThumbnail,
    //   });
    // }

    const content = (
      <>
        <div
          className={clsx(
            'w-28 h-28 md:w-40 md:h-40 lg:w-42 lg:h-42 border-2 rounded bg-white flex items-center justify-center transition-all duration-200',
            'hover:border-[#463925]',
            isSelected
              ? 'border-[#463925] ring-2 ring-[#463925] ring-offset-1'
              : 'border-gray-300',
            !available && 'bg-gray-100',
          )}
        >
          <img
            src={resolvedSizeImageUrl}
            alt={name}
            className="w-full h-full object-cover rounded"
          />
        </div>

        <span
          className={clsx(
            'text-xs font-medium text-center',
            isSelected ? 'text-[#463925]' : 'text-gray-600',
          )}
        >
          {name}
        </span>
      </>
    );

    if (onSizePreviewSelected) {
      return (
        <button
          type="button"
          onClick={() => {
            if (!available) return;
            onSizePreviewSelected({name, to});
          }}
          disabled={!available}
          className={clsx(
            'flex flex-col items-center gap-2 transition-all duration-200',
            'hover:opacity-80 focus:outline-none',
            !available && 'opacity-50 cursor-not-allowed',
          )}
          style={{fontFamily: 'Source Sans Pro'}}
          aria-label={name}
          aria-pressed={isSelected}
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        to={to}
        preventScrollReset
        prefetch="intent"
        replace
        onClick={onOptionSelected}
        className={clsx(
          'flex flex-col items-center gap-2 transition-all duration-200',
          'hover:opacity-80 focus:outline-none',
          !available && 'opacity-50 cursor-not-allowed',
        )}
        style={{fontFamily: 'Source Sans Pro'}}
        aria-label={name}
      >
        {content}
      </Link>
    );
  }

  // Default rendering for other options
  return (
    <Link
      to={to}
      preventScrollReset
      prefetch="intent"
      replace
      onClick={onOptionSelected}
      className={clsx(
        'border-b py-1 transition-colors duration-200',
        isSelected
          ? 'border-[#463925] text-[#463925] font-medium'
          : 'border-transparent hover:border-[#463925] text-gray-700',
        !available && 'opacity-50 cursor-not-allowed line-through'
      )}
    >
      {name}
    </Link>
  );
}

// Helper function to check if a string is a valid color
function isValidColor(color: string): boolean {
  if (!color) return false;
  
  // Check for hex colors
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return true;
  }
  
  // Check for named colors (basic set)
  const namedColors = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
    'black', 'white', 'gray', 'grey', 'navy', 'teal', 'olive', 'lime',
    'aqua', 'silver', 'maroon', 'fuchsia'
  ];
  
  return namedColors.includes(color.toLowerCase());
}
