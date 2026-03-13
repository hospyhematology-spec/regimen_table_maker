import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pagesのサブディレクトリ配下で動作させるための設定
  base: './', 
  build: {
    outDir: 'dist',
  }
});