import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  // Ladda miljövariabler från .env
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [vue()],
    define: {
      'process.env.VITE_BREVO_API_KEY': JSON.stringify(env.VITE_BREVO_API_KEY),
    },
  };
});
