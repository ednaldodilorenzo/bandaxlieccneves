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
        },
        // Organize JavaScript files under static/js
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        // Organize CSS files under static/css
        assetFileNames: (chunkInfo) => {
          if (chunkInfo.name.endsWith('.css')) {
            return 'css/[name].[hash][extname]';
          }
          // Other assets like images can be organized in another folder or the root
          return 'assets/[name].[hash][extname]';
        }
      }
    },
  },
});
