import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
   plugins: [
      react({
         babel: {
            plugins: [["babel-plugin-react-compiler"]],
         },
      }),
      // @ts-expect-error Latest Vite breaks this
      tailwindcss(),
   ],
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "./src"),
      },
   },
   server: {
      proxy: {
         "/api": {
            target: "http://localhost:5000",
            rewrite(path) {
               return path.replace("/api", "");
            },
            changeOrigin: true,
            secure: false,
         },
      },
   },
});
