import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css'
import App from './app'
import './index.css'

// Set document title from environment variable
document.title = import.meta.env.VITE_APP_TITLE || 'Updater UI';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
