import React, { createContext, useState, useContext, useEffect, ReactNode, PropsWithChildren } from 'react';
import { initializeFileSystem, isSupported } from '../services/fileSystem';

interface FileSystemContextType {
  isReady: boolean;
  error: string | null;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

// FIX: Use PropsWithChildren for components that accept children.
export const FileSystemProvider = ({ children }: PropsWithChildren) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      setError(null);
      if (!isSupported()) {
          setError('Dein Browser unterstützt das benötigte Dateisystem API nicht. Bitte nutze einen modernen Browser wie Chrome oder Edge. Im Electron-Modus wird das lokale Dateisystem verwendet.');
          return;
      }
      try {
        await initializeFileSystem();
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize file system:', err);
        setError('Das Dateisystem konnte nicht initialisiert werden.');
        setIsReady(false);
      }
    };
    init();
  }, []);

  return (
    <FileSystemContext.Provider value={{ isReady, error }}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};
