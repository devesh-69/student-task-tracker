import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Main Application Entry Point
// Guest-first approach - no login required, optional auth for cloud sync
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <div className="antialiased text-slate-900">
            <Routes>
              {/* All users (guest or authenticated) go directly to Home */}
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;