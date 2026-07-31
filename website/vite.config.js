import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages base URL matching exact repository name
export default defineConfig({
  plugins: [react()],
  base: '/Guardian-Sync-Full/',
})
