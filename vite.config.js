import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
  server: {
    port: 3009,
    open: true,
  },
})
