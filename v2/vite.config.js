import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: '../site/assets/images',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2022'
  }
});
