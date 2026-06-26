import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Respect the PORT env var (used by the preview harness); fall back to Vite's default.
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    open: false,
  },
})
