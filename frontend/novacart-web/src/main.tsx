import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import './index.css';
import { bootstrapAuth } from './lib/api-client';

// Attempt to restore an existing httpOnly refresh-token session. AuthGuard
// renders its loading state until this settles, then routes normally.
void bootstrapAuth();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
