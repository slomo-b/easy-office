
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
      if (viewportRef.current) {
        const viewportWidth = viewportRef.current.offsetWidth;
        if (viewportWidth > 0) {
            const tempDiv = document.createElement('div');
            tempDiv.style.width = '210mm';
            tempDiv.style.position = 'absolute';
            tempDiv.style.visibility = 'hidden';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);
            const contentWidthPx = tempDiv.offsetWidth;
            document.body.removeChild(tempDiv);
            
            if(contentWidthPx > 0) {
                 setScale(viewportWidth / contentWidthPx);
            }
        }
      }
    };
    
    const timeoutId = setTimeout(calculateScale, 50);

    window.addEventListener('resize', calculateScale);
    
    return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', calculateScale);
    }
  }, [processedTemplate]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
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
      <div 
        ref={viewportRef}
        className="bg-white rounded-sm overflow-hidden" 
        style={{ aspectRatio: '210 / 297' }}
      >
        <div style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `calc(100% / ${scale})`,
          height: `calc(100% / ${scale})`,
        }}>
          <div dangerouslySetInnerHTML={{ __html: processedTemplate }} />
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;