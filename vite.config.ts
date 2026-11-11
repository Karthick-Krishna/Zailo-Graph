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

function copyToolsToDistRootPlugin() {
  return {
    name: 'copy-tools-to-dist-root',
    closeBundle() {
      const distToolsDir = fileURLToPath(new URL('./dist/tools', import.meta.url));
      const distDir = fileURLToPath(new URL('./dist', import.meta.url));
      if (fs.existsSync(distToolsDir)) {
        const files = fs.readdirSync(distToolsDir);
        for (const file of files) {
          if (file.endsWith('.html')) {
            fs.copyFileSync(path.join(distToolsDir, file), path.join(distDir, file));
          }
        }
      }
    }
  };
}

function toolDevRewritePlugin() {
  return {
    name: 'tool-dev-rewrite',
    configureServer(server: any) {
      server.middlewares.use((req: any, _res: any, next: any) => {
        if (req.url) {
          const match = req.url.match(/^\/([a-z0-9-]+)(\.html)?(\?.*)?$/i);
          if (
            match &&
            match[1] !== 'index' &&
            !match[1].startsWith('@') &&
            !match[1].startsWith('src') &&
            !match[1].startsWith('node_modules') &&
            !match[1].startsWith('assets') &&
            !match[1].startsWith('public')
          ) {
            const toolFile = fileURLToPath(new URL(`./tools/${match[1]}.html`, import.meta.url));
            if (fs.existsSync(toolFile)) {
              req.url = `/tools/${match[1]}.html${match[3] || ''}`;
            }
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    toolDevRewritePlugin(),
    copyToolsToDistRootPlugin(),
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
