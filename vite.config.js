const path = require("path");
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),        
      },
      output: {
        // Control how chunks are emitted
        manualChunks(id) {
            if (id.includes('node_modules')) {
                return 'vendor'; // all vendors in one chunk
            }
        }
      }
    },
  },
});
