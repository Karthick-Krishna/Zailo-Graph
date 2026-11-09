import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

function getMultiPageInputs() {
  const toolsDir = fileURLToPath(new URL('./tools', import.meta.url));
  const inputs: Record<string, string> = {
    main: fileURLToPath(new URL('./index.html', import.meta.url)),
  };
  if (fs.existsSync(toolsDir)) {
    const files = fs.readdirSync(toolsDir);
    for (const f of files) {
      if (f.endsWith('.html')) {
        const key = `tools/${path.basename(f, '.html')}`;
        inputs[key] = path.join(toolsDir, f);
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
