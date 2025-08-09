import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { App } from './components/App';

// Initialize the React app
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// Debug: surface mock shape during tests
 
console.debug('[index.tsx] ReactDOMClient keys:', Object.keys(ReactDOMClient));
 
console.debug('[index.tsx] typeof createRoot:', typeof (ReactDOMClient as any).createRoot);
 
console.debug('[index.tsx] container exists:', !!container);
const root = (ReactDOMClient as any).createRoot(container);
root.render(<App />);
