import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// #region agent log
fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:ENTRY','message':'Main.tsx entry point','data':{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'load',hypothesisId:'L1'})}).catch(()=>{});
// #endregion

const rootElement = document.getElementById('root');
if (!rootElement) {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:NO_ROOT','message':'Root element not found','data':{},timestamp:Date.now(),sessionId:'debug-session',runId:'load',hypothesisId:'L2'})}).catch(()=>{});
  // #endregion
  throw new Error("Could not find root element to mount to");
}

try {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:BEFORE_CREATE_ROOT','message':'Before createRoot','data':{},timestamp:Date.now(),sessionId:'debug-session',runId:'load',hypothesisId:'L3'})}).catch(()=>{});
  // #endregion
  
  const root = ReactDOM.createRoot(rootElement);
  
  // Initialize RevenueCat
  import('./services/subscriptionService').then(({ subscriptionService }) => {
    subscriptionService.initialize();
  }).catch(err => {
    console.error('Failed to initialize subscription service:', err);
  });
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:BEFORE_RENDER','message':'Before render','data':{},timestamp:Date.now(),sessionId:'debug-session',runId:'load',hypothesisId:'L3'})}).catch(()=>{});
  // #endregion
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:AFTER_RENDER','message':'After render','data':{},timestamp:Date.now(),sessionId:'debug-session',runId:'load',hypothesisId:'L3'})}).catch(()=>{});
  // #endregion
} catch (error: any) {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:ERROR','message':'Error in main.tsx','data':{message:error?.message,stack:error?.stack,name:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'load',hypothesisId:'L4'})}).catch(()=>{});
  // #endregion
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

