import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": "http://localhost:8000",
      "/boards": "http://localhost:8000",
      "/goals": "http://localhost:8000",
      "/ping": "http://localhost:8000",
    },
  },
});

