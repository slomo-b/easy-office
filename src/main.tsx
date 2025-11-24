import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import App from './App';
import './index.css';
import { FileSystemProvider } from './context/FileSystemContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <BrowserRouter>
        <FileSystemProvider>
          <App />
        </FileSystemProvider>
      </BrowserRouter>
    </HeroUIProvider>
  </React.StrictMode>
);