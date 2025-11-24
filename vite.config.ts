import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcssPostcss from '@tailwindcss/postcss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // PostCSS-Konfiguration für Tailwind CSS v4
  css: {
    postcss: {
      plugins: [tailwindcssPostcss()],
    },
  },
  base: './', // Wichtig für Electron: Relative Pfade für Assets
})