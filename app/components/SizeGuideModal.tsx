import {useState, useEffect} from 'react';
import {clsx} from 'clsx';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
  sizeGuideData?: any;
}

export function SizeGuideModal({isOpen, onClose, triggerRef, sizeGuideData}: SizeGuideModalProps) {
  // Process size guide data from metaobjects
  const sizeGuides = sizeGuideData?.nodes || [];
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  
  // Debug: log the metaobject data
  // console.log('Size Guide Data:', sizeGuideData);
  // console.log('Size Guides:', sizeGuides);
  
  // Helper function to get field value
  const getFieldValue = (fields: any[], key: string) => {
    const field = fields.find((f: any) => f.key === key);
    if (!field) return null;
    
    // For image fields, extract URL from reference
    if (field.reference?.image?.url) {
      return field.reference.image.url;
    }
    
    // For text fields (like 'size'), return the value
    if (field.value && !field.value.startsWith('gid://')) {
      return field.value;
    }
    
    // Debug: log the field structure
    //console.log(`Field "${key}":`, field);
    
    return null;
  };

  // Get current selected size data
  const currentSizeGuide = sizeGuides[selectedSizeIndex];
  const thumbnailImage = currentSizeGuide ? getFieldValue(currentSizeGuide.fields, 'thumbnail') : null;
  const detailedImage = currentSizeGuide ? getFieldValue(currentSizeGuide.fields, 'detailedimage') : null;
  const thumbnailTitle = currentSizeGuide ? getFieldValue(currentSizeGuide.fields, 'thumbnail_title') : null;
  
  // Debug: log extracted image URLs
  // console.log('Thumbnail Image URL:', thumbnailImage);
  // console.log('Detailed Image URL:', detailedImage);
  // console.log('Thumbnail Title:', thumbnailTitle);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Dialog */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-lg bg-white shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-[#463925]" style={{fontFamily: 'Source Sans Pro'}}>
              Size Guide
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Size Options */}
            <div className="flex flex-wrap gap-2 mb-4">
              {sizeGuides.map((sizeGuide: any, index: number) => {
                // Try multiple possible field keys for size name
                const sizeName = getFieldValue(sizeGuide.fields, 'size') || 
                                 getFieldValue(sizeGuide.fields, 'Size') || 
                                 getFieldValue(sizeGuide.fields, 'name') ||
                                 getFieldValue(sizeGuide.fields, 'title');
                
                // Debug: log the fields to see what's available
                if (index === 0) {
                  // console.log('Size Guide Fields:', sizeGuide.fields);
                }
                
                return (
                  <button
                    key={sizeGuide.id || index}
                    onClick={() => setSelectedSizeIndex(index)}
                    className={clsx(
                      'px-4 py-2 text-sm border rounded transition-colors duration-200',
                      index === selectedSizeIndex 
                        ? 'bg-[#463925] text-white border-[#463925]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#463925]'
                    )}
                    style={{fontFamily: 'Source Sans Pro'}}
                  >
                    {sizeName || `Size ${index + 1}`}
                  </button>
                );
              })}
            </div>

            {/* Room Layout - Stacked with Overlap */}
            <div className="relative">
              {/* Thumbnail - Top Left with Label */}
              <div className="relative z-10 inline-flex flex-col items-start gap-2 mb-[-40px]">
                <div className="w-24 h-24 border-2 border-gray-300 rounded bg-white flex items-center justify-center overflow-hidden shadow-lg">
                  {thumbnailImage ? (
                    <img
                      src={thumbnailImage}
                      alt="Room Layout"
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">Room</span>
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-[#B8956A] ml-2" style={{fontFamily: 'Source Sans Pro'}}>
                  {thumbnailTitle || 'Living Room'}
                </span>
              </div>

              {/* Main Room Diagram - Below with Overlap */}
              <div className="relative bg-white pt-1 ml-[-0px]">
                <div className="relative w-full aspect-square max-w-xs mx-auto">
                  {detailedImage ? (
                    <img
                      src={detailedImage}
                      alt="Room Layout Diagram"
                      className="w-full h-full object-contain rounded"
                    />
                  ) : (
                    <>
                      {/* Fallback Room outline */}
                      <div className="absolute inset-0 border-2 border-gray-400 bg-gray-50">
                        {/* Furniture items */}
                        <div className="absolute top-4 left-4 w-16 h-12 bg-gray-300 rounded shadow-sm"></div>
                        <div className="absolute top-4 right-4 w-12 h-12 bg-gray-300 rounded shadow-sm"></div>
                        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-20 h-12 bg-white border border-gray-300 rounded shadow-sm"></div>
                        <div className="absolute bottom-4 left-4 w-14 h-10 bg-gray-300 rounded shadow-sm"></div>
                        <div className="absolute bottom-4 right-4 w-10 h-10 bg-gray-300 rounded shadow-sm"></div>
                        
                        {/* Rug area - highlighted */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-16 bg-[#DAC6A7] bg-opacity-50 border-2 border-[#836E4C] rounded"></div>
                      </div>

                      {/* Dimension labels */}
                      <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-gray-400"></div>
                          <span className="text-xs text-gray-600" style={{fontFamily: 'Source Sans Pro'}}>9 ft</span>
                          <div className="w-4 h-0.5 bg-gray-400"></div>
                        </div>
                      </div>
                      
                      <div className="absolute -right-6 top-0 bottom-0 flex items-center">
                        <div className="flex flex-col items-center gap-2 transform rotate-90">
                          <div className="w-4 h-0.5 bg-gray-400"></div>
                          <span className="text-xs text-gray-600" style={{fontFamily: 'Source Sans Pro'}}>6 ft</span>
                          <div className="w-4 h-0.5 bg-gray-400"></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Size recommendations */}
            {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-[#463925] mb-2" style={{fontFamily: 'Source Sans Pro'}}>
                Size Recommendations:
              </h3>
              <ul className="text-sm text-gray-700 space-y-1" style={{fontFamily: 'Source Sans Pro'}}>
                <li>• Living Room: 6 ft x 9 ft or larger</li>
                <li>• Bedroom: 5 ft x 8 ft recommended</li>
                <li>• Dining Room: 8 ft x 10 ft for table seating</li>
              </ul>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}
