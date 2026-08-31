import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,

    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    }
  }
});

/*
Now:

http://localhost:5173/api/places

will reach:

http://localhost:5000/api/places
*/ 