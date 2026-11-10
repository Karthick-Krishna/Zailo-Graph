import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

function getMultiPageInputs() {
  const rootDir = fileURLToPath(new URL('.', import.meta.url));
  const inputs: Record<string, string> = {
    main: path.resolve(rootDir, 'index.html'),
  };
  if (fs.existsSync(rootDir)) {
    const files = fs.readdirSync(rootDir);
    for (const f of files) {
      if (f.endsWith('.html') && f !== 'index.html' && !f.includes('report')) {
        const key = path.basename(f, '.html');
        inputs[key] = path.resolve(rootDir, f);
      }
    }
  }
  return inputs;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  worker: {
    format: 'es',
  },
  server: {
    port: 5001,
    host: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  preview: {
    port: 5001,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: getMultiPageInputs(),
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('heic2any')) {
              return 'heic2any';
            }
            if (id.includes('exifr')) {
              return 'exifr';
            }
            if (id.includes('jszip')) {
              return 'jszip';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
