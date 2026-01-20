import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb', '**/*.hdr'],
  // Base path for GitHub Pages - update 'mnemosyne' to your repo name
  base: process.env.NODE_ENV === 'production' ? '/mnemosyne/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
