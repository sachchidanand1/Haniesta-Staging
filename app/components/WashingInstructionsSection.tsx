import type {ProductFragment} from 'storefrontapi.generated';

interface WashingInstructionsSectionProps {
  product: ProductFragment;
}

export function WashingInstructionsSection({product}: WashingInstructionsSectionProps) {
  const mfv = (ns: string, key: string) => {
    // Metafields come as a direct array from Shopify GraphQL
    const metafields = (product as any)?.metafields || [];
    const metafield = metafields.find((m: any) => m?.namespace === ns && m?.key === key);
    if (!metafield?.value) return undefined;
    
    // Try to parse JSON if it looks like JSON
    try {
      if (typeof metafield.value === 'string' && (metafield.value.startsWith('{') || metafield.value.startsWith('['))) {
        return JSON.parse(metafield.value);
      }
    } catch (e) {
      // If parsing fails, return the original value
      console.warn(`Failed to parse JSON for metafield ${ns}.${key}:`, e);
    }
    
    return metafield.value;
  };

  // Try custom namespace first, then fall back to existing namespaces
  const customWashing = mfv('custom', 'washing_instructions');
  const legacyWashingText = mfv('care', 'washing_instructions');
  
  // Use custom metafields if available, otherwise fall back to legacy
  const washingText = customWashing || legacyWashingText;
  
  // Handle washing instructions - could be string or JSON array
  let washingItems: string[] = [];
  
  if (washingText) {
    if (typeof washingText === 'string') {
      // If it's a string, split by newlines
      washingItems = washingText
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (Array.isArray(washingText)) {
      // If it's already an array (parsed JSON)
      washingItems = washingText.map(item => String(item)).filter(Boolean);
    } else if (typeof washingText === 'object') {
      // If it's an object, convert values to array
      washingItems = Object.values(washingText).map(item => String(item)).filter(Boolean);
    }
  }

  // Don't render if no washing instructions
  if (washingItems.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-2xl md:text-3xl font-sans text-[#463925]">Washing Instructions</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {washingItems.map((item, idx) => (
          <div key={idx} className="border border-stone-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow duration-200 flex">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#DAC6A7] flex items-center justify-center">
                  {idx === 0 && <VacuumIcon />}
                  {idx === 1 && <HandWashIcon />}
                  {idx === 2 && <RinseIcon />}
                  {idx >= 3 && (
                    <span className="text-[#463925] text-sm font-medium">{idx + 1}</span>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed font-sans text-[#463925]">
                  {item}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Icon components for washing instructions
function VacuumIcon() {
  return (
    <svg className="w-5 h-5 text-[#463925]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
    </svg>
  );
}

function HandWashIcon() {
  return (
    <svg className="w-5 h-5 text-[#463925]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3V1M13 7h8a2 2 0 012 2v6a2 2 0 01-2 2h-8"/>
    </svg>
  );
}

function RinseIcon() {
  return (
    <svg className="w-5 h-5 text-[#463925]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
    </svg>
  );
}
