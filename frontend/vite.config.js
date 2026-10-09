import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, ""); },
            },
            "/event-api": {
                target: "http://localhost:8082",
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/event-api/, ""); },
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["react", "react-dom", "react-router"],
                    query: ["@tanstack/react-query"],
                    ui: ["lucide-react", "clsx", "tailwind-merge"]
                }
            }
        }
    }
});
