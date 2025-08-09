import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';

// Initialize the React app
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(<App />);
