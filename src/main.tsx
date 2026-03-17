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
    
    root.render(
      <App />
    );
    console.log('⚛️ React Render Invoked');
  } catch (error: any) {
    console.error('❌ Critical Error in main.tsx:', error);
    rootElement.innerHTML = `<div style="padding:40px;color:red;background:white;height:100vh;"><h1>Mount Error</h1><p>${error.message}</p></div>`;
  }
}

