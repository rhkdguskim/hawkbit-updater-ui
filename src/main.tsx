import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css'
import App from './app'
import './index.css'

(window as any).global = window;

document.title = import.meta.env.VITE_APP_TITLE || 'Updater UI';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
