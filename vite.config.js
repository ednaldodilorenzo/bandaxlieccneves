const path = require("path");
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  build: {
    emptyOutDir: true,
    outDir: "../dist",
    rollupOptions: {
      input: {
        app: path.resolve(__dirname, "src/index.html"),
        sw: path.resolve(__dirname, "src/sw.js"),
      },
      output: {
        // Control how chunks are emitted
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor"; // all vendors in one chunk
          }
        },
        // Organize JavaScript files under static/js
        entryFileNames: (chunkInfo) => {
          // Place service worker at the root
          if (chunkInfo.name === "sw") {
            return "sw.js"; // This ensures the SW is output at the root of the dist folder
          }
          return "js/[name].js"; // Other JS files are placed in the assets folder
        },
        chunkFileNames: "js/[name].js",
        // Organize CSS files under static/css
        assetFileNames: (chunkInfo) => {
          if (chunkInfo.name.endsWith(".css")) {
            return "css/[name][extname]";
          }

          // Other assets like images can be organized in another folder or the root
          return "assets/[name][extname]";
        },
      },
    },
  },
});
