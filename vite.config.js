import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/TaskM/",
  plugins: [react()],
  build: {
    outDir: 'dist'
<<<<<<< HEAD
  },
  define: {
    'process.env': {
      VITE_BACKEND_URL: JSON.stringify(process.env.VITE_BACKEND_URL),
    },
  },
=======
  }
>>>>>>> 9c4d15ce76ac0a79db52aff9fcebf482731eec02
})
