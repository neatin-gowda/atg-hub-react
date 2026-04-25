import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { loadConfig } from './config';
import App from './App';
import './styles/tokens.css';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// Load config then render
loadConfig('/api').then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <div className="app-shell">
              <App />
            </div>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>
  );
});
