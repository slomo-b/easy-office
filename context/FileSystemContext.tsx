import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { initializeFileSystem, isSupported } from '../services/fileSystemService';

interface FileSystemContextType {
  isReady: boolean;
  error: string | null;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const FileSystemProvider = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      setError(null);
      if (!isSupported()) {
          setError('Dein Browser unterstützt das Origin Private File System nicht. Bitte nutze einen modernen Browser wie Chrome oder Edge.');
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