import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import App from './App';
import './index.css';

// Auto-switch between HashRouter (for file:// protocol offline double-click) and BrowserRouter (for http://)
const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';
const RouterComponent = isFileProtocol ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterComponent>
      <AppProvider>
        <App />
      </AppProvider>
    </RouterComponent>
  </React.StrictMode>
);
