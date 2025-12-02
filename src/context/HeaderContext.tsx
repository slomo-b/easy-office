import React, { createContext, useState, useContext, ReactNode } from 'react';

interface HeaderContextProps {
  setHeader: (headerConfig: HeaderConfig | null) => void;
  headerConfig: HeaderConfig | null;
}

interface HeaderConfig {
  title: string;
  icon: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

const HeaderContext = createContext<HeaderContextProps | undefined>(undefined);

export const HeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | null>(null);

  return (
    <HeaderContext.Provider value={{ headerConfig, setHeader }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};
