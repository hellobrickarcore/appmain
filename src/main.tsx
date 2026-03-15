import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
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
  console.error('❌ Error loading app:', error);
  console.error('Error stack:', error?.stack);
  
  // Show error in UI
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; background: linear-gradient(to bottom right, #fff7ed, #fef3c7);">
        <h1 style="color: #dc2626; margin-bottom: 10px;">Error Loading App</h1>
        <p style="color: #6b7280; margin-bottom: 20px;">${error?.message || 'Unknown error'}</p>
        <pre style="background: #f3f4f6; padding: 10px; border-radius: 8px; font-size: 12px; text-align: left; max-width: 600px; overflow: auto;">${error?.stack || 'No stack trace'}</pre>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #fb923c; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">Reload App</button>
      </div>
    `;
  }
  throw error;
}

