import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const S3_KAIRA_ORIGIN = 'https://kairafabrics.s3.ap-south-1.amazonaws.com'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/s3proxy': {
        target: S3_KAIRA_ORIGIN,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3proxy/, ''),
      },
      '/s3kaira': {
        target: S3_KAIRA_ORIGIN,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3kaira/, ''),
      },
    },
  },
})
