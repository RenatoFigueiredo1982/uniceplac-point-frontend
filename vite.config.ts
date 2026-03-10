import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    },
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebase.com https://*.firebaseio.com https://*.googleapis.com https://*.googletagmanager.com https://www.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com https://www.gstatic.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https://*.googleapis.com https://*.google.com",
        "connect-src 'self' http://localhost:3000 https://*.firebase.com https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com ws://localhost:5173",
        "frame-src 'self' https://*.firebaseapp.com"
      ].join('; ')
    }
  }
})