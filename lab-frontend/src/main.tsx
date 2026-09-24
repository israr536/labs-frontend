import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './index.css';
import './styles/saas.css';
import './styles/typography.css';
import './styles/layout-fixes.css';
import './styles/production-overrides.css';
import './styles/accessibility-saas.css';
import './styles/premium-saas-redesign.css';
import './styles/theme-refinement.css';
import './styles/responsive.css';
import App from './App.tsx';
import SEO from './components/SEO.tsx';
import AnalyticsTracker from './components/AnalyticsTracker.tsx';
import AppErrorBoundary from './components/AppErrorBoundary.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
    mutations: { retry: 0 },
  },
});

const rootElement = document.getElementById('root');

if (!rootElement) throw new Error('PathMLT root element was not found.');

const app = (
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppErrorBoundary>
          <SEO />
          <AnalyticsTracker />
          <App />
        </AppErrorBoundary>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);

if (rootElement.dataset.prerendered === 'true') {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
