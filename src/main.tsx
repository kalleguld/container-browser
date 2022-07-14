import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import * as rq from 'react-query';

const queryClient = new rq.QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <rq.QueryClientProvider client={queryClient}>
      <App />
    </rq.QueryClientProvider>
  </React.StrictMode>
)
