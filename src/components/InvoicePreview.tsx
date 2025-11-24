import React, { useRef, useState, useLayoutEffect } from 'react';
import { ZoomIn } from 'lucide-react';

interface InvoicePreviewProps {
  processedTemplate: string;
  onZoomClick: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ processedTemplate, onZoomClick }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.1);

  useLayoutEffect(() => {
    const calculateScale = () => {
      if (!viewportRef.current) return;

      const viewportWidth = viewportRef.current.offsetWidth;
      const viewportHeight = viewportRef.current.offsetHeight;

      if (viewportWidth <= 0 || viewportHeight <= 0) return;

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      document.body.appendChild(tempDiv);
      
      tempDiv.style.width = '210mm';
      const contentWidthPx = tempDiv.offsetWidth;
      tempDiv.style.width = '0';

      tempDiv.style.height = '297mm';
      const contentHeightPx = tempDiv.offsetHeight;
      
      document.body.removeChild(tempDiv);

      if (contentWidthPx <= 0 || contentHeightPx <= 0) return;

      const scaleX = viewportWidth / contentWidthPx;
      const scaleY = viewportHeight / contentHeightPx;
      
      setScale(Math.min(scaleX, scaleY));
    };

    const observer = new ResizeObserver(calculateScale);
    if (viewportRef.current) {
        observer.observe(viewportRef.current);
    }
    
    const timeoutId = setTimeout(calculateScale, 50);
    
    return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
    }
  }, [processedTemplate]);

  return (
    <div className="bg-content1 p-4 rounded-lg shadow-md sticky top-6 flex flex-col h-[calc(100vh-4rem-1.5rem)]">
      <div className="flex justify-between items-center border-b border-divider pb-2 mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-primary">Vorschau</h3>
        <button
            onClick={onZoomClick}
            className="p-1 text-default-500 rounded-full hover:bg-content2 hover:text-foreground transition-all"
            title="Vorschau vergrössern"
            aria-label="Vorschau vergrössern"
        >
            <ZoomIn size={20} />
        </button>
      </div>
      
      <div 
        ref={viewportRef}
        className="flex-grow overflow-hidden flex justify-center items-center bg-background/50 rounded-sm p-2"
      >
        <div style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          width: '210mm',
          height: '297mm',
        }}>
          <div className="bg-white shadow-lg w-full h-full overflow-hidden">
            <div dangerouslySetInnerHTML={{ __html: processedTemplate }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;