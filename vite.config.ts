import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  if (!env.VITE_API_URL) {
    throw new Error("VITE_API_URL is not defined in the .env file");
  }

  console.log("VITE_API_URL:", env.VITE_API_URL);

  return {
    plugins: [react()],
    base: "/",
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
