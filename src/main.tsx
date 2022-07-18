import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {QueryClient, QueryClientProvider} from 'react-query';
import { HashRouter } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchInterval: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
