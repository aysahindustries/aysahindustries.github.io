import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' + HashRouter = the site works at any address
// (yourname.github.io, a custom domain, or a sub-folder).
export default defineConfig({
  plugins: [react()],
  base: './',
})
