import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base path ensures GitHub Pages assets load correctly under any repository name
export default defineConfig({
  plugins: [react()],
  base: './',
})
