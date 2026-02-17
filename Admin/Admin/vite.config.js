import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    esbuild: {
      // mode is 'production' when you run 'vite build' (which Vercel does)
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  }
})