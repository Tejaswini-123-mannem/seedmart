import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Plugins extend Vite's behavior.
  // - react(): enables JSX + React Fast Refresh (instant updates)
  // - tailwindcss(): processes Tailwind's utility classes at build time
  plugins: [react(), tailwindcss()],
})
