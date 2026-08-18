import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Font via @fontsource-variable (bukan CDN — Rules.md)
import '@fontsource-variable/mulish';
import '@fontsource-variable/montserrat';
import '@fontsource/martel/400.css';
import '@fontsource/martel/600.css';

import './index.css';
import App from './App';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

async function bootstrap() {
  await useAuthStore.getState().hydrate();
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Root element #root tidak ditemukan');
  createRoot(rootEl).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void bootstrap();