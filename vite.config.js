import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,        // ← вот здесь
    strictPort: true  // падать, если порт занят, а не искать другой
  },
  customLogger: {
    info(msg) { console.log('[info]', msg); },
    warn(msg) { console.warn('[warn]', msg); },
    warnOnce(msg) { console.warn('[warn]', msg); },
    error(msg) { console.error('[error]', msg); },
    clearScreen() { },
    hasErrorLogged() { return false; },
    hasWarned: false,
  }
});
