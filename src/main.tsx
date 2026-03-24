import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Global error logger for native debugging
window.onerror = (message, source, lineno, colno, error) => {
  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:white;color:red;padding:20px;z-index:99999;overflow:auto;font-family:monospace;';
  errDiv.innerHTML = `<h1>Fatal Error</h1><p>${message}</p><pre>${error?.stack || ''}</pre>`;
  document.body.appendChild(errDiv);
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  const bodyErr = document.createElement('div');
  bodyErr.innerHTML = '<h1 style="color:red">Root element not found!</h1>';
  document.body.appendChild(bodyErr);
} else {
  try {
    console.log('⚛️ React Mounting Starting...');
    const root = ReactDOM.createRoot(rootElement);
    
    // Initialize RevenueCat
    import('./services/subscriptionService').then(({ subscriptionService }) => {
      subscriptionService.initialize();
    }).catch(err => {
      console.error('Failed to initialize subscription service:', err);
    });

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error: any) {
    console.error('Fatal Mount Error:', error);
    const errDiv = document.createElement('div');
    errDiv.innerHTML = `<h1 style="color:red">Mount Failed</h1><pre>${error.message}</pre>`;
    document.body.appendChild(errDiv);
  }
}
