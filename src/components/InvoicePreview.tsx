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
  
  const [layout, setLayout] = useState({
      pageCount: 1,
      scale: 1,
      a4HeightPx: 1123,
  });

  useLayoutEffect(() => {
    // This function calculates all necessary dimensions and the final scale.
    const calculateLayout = () => {
      if (!viewportRef.current || !contentMeasureRef.current) return;

      // 1. Measure pixel dimensions of A4 and gutter
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      
      tempDiv.style.height = `${A4_HEIGHT_MM}mm`;
      const pageHeightPx = tempDiv.offsetHeight;
      
      tempDiv.style.height = '0'; // reset
      tempDiv.style.width = `${A4_WIDTH_MM}mm`;
      const pageWidthPx = tempDiv.offsetWidth;

      tempDiv.style.width = '0'; // reset
      tempDiv.style.marginTop = `${GUTTER_MM}mm`;
      const gutterPx = tempDiv.offsetTop;
      
      document.body.removeChild(tempDiv);

      if (pageHeightPx <= 0 || pageWidthPx <= 0) return;

      // 2. Calculate number of pages needed
      const contentHeightPx = contentMeasureRef.current.offsetHeight;
      const calculatedPageCount = Math.max(1, Math.ceil(contentHeightPx / pageHeightPx));

      // 3. Calculate total height of the multi-page preview content in pixels
      const totalContentHeightPx = (calculatedPageCount * pageHeightPx) + ((calculatedPageCount - 1) * gutterPx);
      
      // 4. Get viewport dimensions (the available space)
      const viewportWidth = viewportRef.current.offsetWidth;
      const viewportHeight = viewportRef.current.offsetHeight;
      
      if (viewportWidth <= 0 || viewportHeight <= 0 || totalContentHeightPx <= 0) return;

      // 5. Calculate scale based on both width and height to fit everything ("letterboxing")
      const scaleX = viewportWidth / pageWidthPx;
      const scaleY = viewportHeight / totalContentHeightPx;
      const newScale = Math.min(scaleX, scaleY);
      
      setLayout({
          pageCount: calculatedPageCount,
          scale: newScale,
          a4HeightPx: pageHeightPx
      });
    };
    
    // We use a ResizeObserver to recalculate whenever the viewport size changes.
    // This is more reliable than the 'resize' window event.
    const observer = new ResizeObserver(calculateLayout);
    if (viewportRef.current) {
        observer.observe(viewportRef.current);
    }
    
    // Initial calculation. A small delay can help if CSS is slow to apply.
    const timeoutId = setTimeout(calculateLayout, 50);
    
    return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
    };
  }, [mainContent]); // Recalculate if the content itself changes
  
  const { pageCount, scale, a4HeightPx } = layout;
  const pages = Array.from({ length: pageCount }, (_, i) => i);

  return (
    // Make the outer container a flex column that takes up available height
    <div className="bg-gray-800 p-4 rounded-lg shadow-md sticky top-6 flex flex-col h-[calc(100vh-4rem-1.5rem)]">
      <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4 flex-shrink-0">
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
      
      {/* Viewport: This is the container that defines the available space and centers the scaled content. */}
      <div ref={viewportRef} className="flex-grow overflow-hidden flex justify-center items-center bg-gray-900/50 rounded-sm p-2">
          {/* Transform Wrapper: This element is scaled down */}
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
              {/* Content Wrapper: This has the real A4 width and contains all pages */}
              <div style={{ width: `${A4_WIDTH_MM}mm` }}>
                  {pages.map((pageIndex) => (
                      <div
                          key={pageIndex}
                          className="bg-white shadow-lg overflow-hidden relative"
                          style={{
                              width: `${A4_WIDTH_MM}mm`,
                              height: `${A4_HEIGHT_MM}mm`,
                              marginTop: pageIndex > 0 ? `${GUTTER_MM}mm` : '0',
                          }}
                      >
                          <div
                              style={{ transform: `translateY(-${pageIndex * a4HeightPx}px)` }}
                              dangerouslySetInnerHTML={{ __html: mainContent }}
                          />
                          {pageIndex === pages.length - 1 && (
                              <div
                                  style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '105mm' }}
                                  dangerouslySetInnerHTML={{ __html: qrBill }}
                              />
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
