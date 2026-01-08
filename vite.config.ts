import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import packageJson from './package.json'

// https://vite.dev/config/
export default defineConfig({
  // Base path for GitHub Pages deployment
  base: process.env.GITHUB_ACTIONS ? '/hawkbit-updater-ui/' : '/',
  envPrefix: ['VITE_', 'API_'],
  plugins: [react()],
  define: {
    // Inject version info from package.json
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_NAME__: JSON.stringify(packageJson.name),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/rest': {
        target: 'http://110.110.10.102:9200',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            if (proxyRes.statusCode === 401) {
              // Remove WWW-Authenticate header to prevent browser popup
              delete proxyRes.headers['www-authenticate'];
            }
          });
        },
      },
    },
  },
})
