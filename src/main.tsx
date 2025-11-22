import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { FileSystemProvider } from './context/FileSystemContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <FileSystemProvider>
        <App />
      </FileSystemProvider>
    </BrowserRouter>
  </React.StrictMode>
);