import React, { useRef, useState, useLayoutEffect } from 'react';
import { ZoomIn } from 'lucide-react';

interface InvoicePreviewProps {
  mainContent: string;
  qrBill: string;
  onZoomClick: () => void;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const GUTTER_MM = 8;

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ mainContent, qrBill, onZoomClick }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentMeasureRef = useRef<HTMLDivElement>(null);

  const [pageCount, setPageCount] = useState(1);
  const [a4HeightPx, setA4HeightPx] = useState(1123); // Default, will be recalculated

  useLayoutEffect(() => {
    // We create a temporary, off-screen element to measure the pixel dimensions of an A4 page.
    // This is more reliable than assuming a fixed DPI.
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    tempDiv.style.height = `${A4_HEIGHT_MM}mm`;
    const pageHeightPx = tempDiv.offsetHeight;
    setA4HeightPx(pageHeightPx);
    
    document.body.removeChild(tempDiv);

    // Calculate page count based on the measured height of the main content.
    if (contentMeasureRef.current && pageHeightPx > 0) {
      const contentHeightPx = contentMeasureRef.current.offsetHeight;
      const count = Math.max(1, Math.ceil(contentHeightPx / pageHeightPx));
      setPageCount(count);
    }
  }, [mainContent]);
  
  const pages = Array.from({ length: pageCount }, (_, i) => i);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md sticky top-6">
      <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
        <h3 className="text-lg font-semibold text-emerald-400">Vorschau</h3>
        <button
            onClick={onZoomClick}
            className="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition-all"
            title="Vorschau vergrössern"
            aria-label="Vorschau vergrössern"
        >
            <ZoomIn size={20} />
        </button>
      </div>

      {/* This invisible element is used to accurately measure the true height of the invoice content. */}
      <div style={{ position: 'absolute', visibility: 'hidden', left: -9999, width: `${A4_WIDTH_MM}mm` }}>
          <div ref={contentMeasureRef} dangerouslySetInnerHTML={{ __html: mainContent }} />
      </div>
      
      {/* This container scales down the entire multi-page preview to fit the available width. */}
      <div ref={viewportRef} className="overflow-hidden bg-gray-500 rounded-sm p-4">
          <div className="mx-auto" style={{ width: `${A4_WIDTH_MM}mm` }}>
              {pages.map((pageIndex) => (
                  <div
                      key={pageIndex}
                      className="bg-white shadow-lg overflow-hidden relative"
                      style={{
                          width: `${A4_WIDTH_MM}mm`,
                          height: `${A4_HEIGHT_MM}mm`,
                          marginTop: pageIndex > 0 ? `${GUTTER_MM}mm` : '0', // Gutter between pages
                      }}
                  >
                      {/* The full content is rendered inside, but a CSS transform shifts it up to show the correct "slice" for each page. */}
                      <div
                          style={{
                              transform: `translateY(-${pageIndex * a4HeightPx}px)`,
                          }}
                          dangerouslySetInnerHTML={{ __html: mainContent }}
                      />

                      {/* The QR Bill is absolutely positioned at the bottom of the very last page. */}
                      {pageIndex === pages.length - 1 && (
                          <div
                              style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '105mm'
                              }}
                              dangerouslySetInnerHTML={{ __html: qrBill }}
                          />
                      )}
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
