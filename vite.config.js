import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    {
      name: 'block-sensitive-files',
      configureServer(server) {
        // Insert middleware at the beginning but only block specific files
        // This ensures Vite's SPA routing still works
        server.middlewares.use((req, res, next) => {
          const url = req.url.split('?')[0]; // Remove query params
          
          // Only block if it's a direct file request (has file extension)
          // Don't block routes, API calls, or assets served by Vite
          const isFileRequest = /\.[a-zA-Z0-9]+$/.test(url) && !url.startsWith('/src/') && !url.startsWith('/@') && !url.startsWith('/api');
          
          if (!isFileRequest) {
            // Not a file request, let Vite handle it (SPA routing, etc.)
            return next();
          }
          
          // List of exact file paths to block
          const blockedFiles = [
            '/package.json',
            '/package-lock.json',
            '/README.md',
            '/.gitignore',
            '/.gitattributes',
            '/vite.config.js',
            '/vite.config.ts',
            '/tsconfig.json',
            '/jsconfig.json',
          ];

          // Block exact file matches - serve index.html instead to show 404 page
          if (blockedFiles.includes(url)) {
            // Serve index.html so React Router can handle it and show 404 page
            const indexHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(indexHtml);
            return;
          }

          // Block .env files - serve index.html instead
          if (url.startsWith('/.env')) {
            const indexHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(indexHtml);
            return;
          }

          // Don't block node_modules - Vite needs access to it for dependencies
          // Only block direct access to sensitive files at root level
          
          // Block .git directory - serve index.html instead
          if (url.startsWith('/.git/')) {
            const indexHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(indexHtml);
            return;
          }

          // Not a blocked file, let it through
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/law.md': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/constitution.md': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
