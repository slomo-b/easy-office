import React from 'react';
import { Button } from '@heroui/react';
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
    <div className="flex-shrink-0 h-10 flex items-center space-x-2 px-4 titlebar-no-drag">
      <Button
        isIconOnly
        variant="light"
        size="sm"
        onClick={handleMinimize}
        className="min-w-0 w-6 h-6"
      >
        <Minimize size={16} />
      </Button>
      <Button
        isIconOnly
        variant="light"
        size="sm"
        onClick={handleMaximize}
        className="min-w-0 w-6 h-6"
      >
        <Maximize size={16} />
      </Button>
      <Button
        isIconOnly
        variant="light"
        size="sm"
        onClick={handleClose}
        className="min-w-0 w-6 h-6 text-danger hover:bg-danger hover:text-danger-foreground"
      >
        <X size={16} />
      </Button>
    </div>
  );
};

export default WindowControls;