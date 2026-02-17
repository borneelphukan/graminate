// Use the SWC-based React plugin for faster builds
import react from "@vitejs/plugin-react-swc";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tailwindcss from "@tailwindcss/vite";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode }) => ({
  plugins: [
    // React SWC plugin
    react(),
    dts({
      tsconfigPath: "tsconfig.app.json",
      exclude: ["**/*.stories.{ts,tsx,mdx}"],
    }),
    tailwindcss(),
  ],
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          "react": "React",
          "react-dom": "React-dom",
          "react/jsx-runtime": "react/jsx-runtime",
        },
      },
    },
  },
}));
