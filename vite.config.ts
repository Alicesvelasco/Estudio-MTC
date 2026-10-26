/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages sirve el sitio en https://<usuario>.github.io/<repositorio>/,
// así que todos los assets deben colgar de "/<repositorio>/".
export default defineConfig({
  base: '/Estudio-MTC/',
  plugins: [react(), tailwindcss()],
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
