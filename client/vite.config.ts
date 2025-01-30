import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/dicey-chess-web/',
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
