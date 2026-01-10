
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // This allows the app to access process.env.API_KEY as requested by the Gemini SDK
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
    },
    server: {
      port: 3000,
      open: true,
      host: true
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      // Ensure the build target supports modern JS used in React 19
      target: 'esnext'
    }
  };
});
