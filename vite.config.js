import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'bundle-visualizer.html',
      open: true,
    }),
  ],
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    minify: 'esbuild',
    cssCodeSplit: true,
  },
  server: {
    port: 3009,
    open: true,
  },
});
