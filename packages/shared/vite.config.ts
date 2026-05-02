import dts from "vite-plugin-dts";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "shared",
      formats: ["es", "cjs"],
      fileName: (format) => `shared.${format === 'es' ? 'js' : 'cjs'}`,
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
