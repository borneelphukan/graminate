import dts from "vite-plugin-dts";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "shared",
      fileName: () => "shared.js",
      formats: ["es"],
    },
    sourcemap: true,
    rollupOptions: {
      external: ["zod"],
    },
    emptyOutDir: true,
  },
  plugins: [
    dts({
      include: ["src"],
      outDir: "dist",
      rollupTypes: true,
      insertTypesEntry: true,
    }),
  ],
});
