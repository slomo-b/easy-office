import React from 'react';
import { Minimize, Maximize, X } from 'lucide-react';

// Define the API that the preload script exposes
declare global {
  interface Window {
    api: {
      send: (channel: string, ...args: any[]) => void;
    };
  }
}

const WindowControls: React.FC = () => {
  const handleMinimize = () => {
    window.api.send('minimize-window');
  };

  const handleMaximize = () => {
    window.api.send('maximize-window');
  };

  const handleClose = () => {
    window.api.send('close-window');
  };

  return (
    // WICHTIG: Keine absolute Positionierung mehr.
    // `flex-shrink-0` verhindert, dass die Buttons bei Platzmangel kleiner werden.
    // Die Klasse `titlebar-no-drag` ist weiterhin entscheidend.
    <div className="flex-shrink-0 h-12 flex items-center space-x-2 px-4 titlebar-no-drag">
      <button onClick={handleMinimize} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
        <Minimize size={16} />
      </button>
      <button onClick={handleMaximize} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
        <Maximize size={16} />
      </button>
      <button onClick={handleClose} className="p-2 rounded-full hover:bg-red-500 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

export default WindowControls;