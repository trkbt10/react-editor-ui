/**
 * @file Vite build configuration for library
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

interface ComponentEntry {
  name: string;
  entryType: "index" | "named";
  entryPath: string;
  relativePath: string;
}

interface EntryCatalog {
  generatedAt: string;
  components: ComponentEntry[];
}

/**
 * Loads entry points from generated catalog
 * Falls back to base entries if catalog doesn't exist
 */
function loadEntries(): Record<string, string> {
  const baseEntries: Record<string, string> = {
    index: resolve(__dirname, "src/index.tsx"),
    "themes/index": resolve(__dirname, "src/themes/index.ts"),
  };

  const catalogPath = resolve(__dirname, "scripts/entry-catalog.json");

  if (!existsSync(catalogPath)) {
    console.warn("⚠ entry-catalog.json not found. Run: bun scripts/sync-exports.ts --write");
    return baseEntries;
  }

  const catalog: EntryCatalog = JSON.parse(readFileSync(catalogPath, "utf-8"));

  for (const component of catalog.components) {
    baseEntries[`components/${component.name}`] = resolve(__dirname, component.relativePath);
  }

  return baseEntries;
}

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to prevent CSS file emission
    {
      name: 'remove-css-emission',
      enforce: 'post',
      generateBundle(options, bundle) {
        // Remove CSS files from the bundle
        const filesToDelete: string[] = [];
        for (const fileName in bundle) {
          if (fileName.endsWith('.css')) {
            filesToDelete.push(fileName);
          }
        }
        filesToDelete.forEach(fileName => {
          delete bundle[fileName];
        });
      },
    },
  ],
  build: {
    outDir: "dist",
    lib: {
      entry: loadEntries(),
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: [
        {
          format: "es",
          // Preserve the entry names for subpath exports
          entryFileNames: "[name].js",
          chunkFileNames: "[name]-[hash].js",
          // Preserve module structure for better tree-shaking
          preserveModules: false,
        },
        {
          format: "cjs",
          // Use .cjs extension for CommonJS files
          entryFileNames: "[name].cjs",
          chunkFileNames: "[name]-[hash].cjs",
          preserveModules: false,
        },
      ],
    },
    sourcemap: true,
    // Do not emit CSS files - styles use CSS variable fallbacks in TypeScript
    cssCodeSplit: false,
  },
  css: {
    modules: {
      // Generate scoped class names for CSS modules
      localsConvention: "camelCaseOnly",
    },
  },
});
