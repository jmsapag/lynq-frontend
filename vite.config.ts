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
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log(
                "Sending Request to the Target:",
                req.method,
                req.url,
              );
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log(
                "Received Response from the Target:",
                proxyRes.statusCode,
                req.url,
              );
              // Handle binary responses
              if (
                proxyRes.headers["content-type"] &&
                (proxyRes.headers["content-type"].includes("application/pdf") ||
                  proxyRes.headers["content-type"].includes(
                    "application/octet-stream",
                  ))
              ) {
                proxyRes.headers["content-disposition"] =
                  proxyRes.headers["content-disposition"] || "attachment";
              }
            });
          },
        },
      },
    },
  };
});
