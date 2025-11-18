import React from 'react';
import { Minus, Square, X } from 'lucide-react';

// Declare electron window.require for TypeScript
declare global {
    interface Window {
        require: any;
    }
}

const WindowControls: React.FC = () => {
    const isElectron = !!window.require;

    if (!isElectron) return null;

    const { ipcRenderer } = window.require('electron');

    const minimize = () => ipcRenderer.send('minimize-window');
    const maximize = () => ipcRenderer.send('maximize-window');
    const close = () => ipcRenderer.send('close-window');

    return (
        <div className="absolute top-0 right-0 p-3 flex gap-2 z-50 pointer-events-auto no-drag">
            <button onClick={minimize} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
                <Minus size={18} />
            </button>
            <button onClick={maximize} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
                <Square size={16} />
            </button>
            <button onClick={close} className="p-1.5 text-gray-400 hover:text-white hover:bg-red-600 rounded-md transition-colors">
                <X size={18} />
            </button>
        </div>
    );
};

export default WindowControls;