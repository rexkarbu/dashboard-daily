import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import './styles/components.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found in document');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
