import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Explizite PostCSS-Konfiguration direkt in Vite.
  // Das ist der robusteste Weg, um sicherzustellen, dass Tailwind geladen wird.
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  base: './', // Wichtig für Electron: Relative Pfade für Assets
})