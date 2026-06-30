import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRoutes from './routes/AppRoutes'
import './styles/index.css'

// Global fetch interceptor to route relative api requests to the Render backend in production
const API_URL = "https://construction-labour-management-system.onrender.com";
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  if (typeof url === 'string' && url.startsWith('/api')) {
    const baseUrl = import.meta.env.PROD ? API_URL : '';
    url = `${baseUrl}${url}`;
  }
  return originalFetch(url, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>,
)
