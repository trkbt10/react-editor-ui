/**
 * @file Vite build configuration for library
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

interface ComponentEntry {
  name: string;
  entryType: "index" | "named";
  relativePath: string;
  category: "component" | "panel" | "canvas" | "editor" | "section" | "viewer" | "parser" | "chat";
}

interface EntryCatalog {
  generatedAt: string;
  components: ComponentEntry[];
}

function getCategoryDir(category: ComponentEntry["category"]): string {
  switch (category) {
    case "component":
      return "components";
    case "panel":
      return "panels";
    case "canvas":
      return "canvas";
    case "editor":
      return "editors";
    case "section":
      return "sections";
    case "viewer":
      return "viewers";
    case "parser":
      return "parsers";
    case "chat":
      return "chat";
  }
}

/**
 * Loads entry points from generated catalog
 * Falls back to base entries if catalog doesn't exist
 */
function loadEntries(): Record<string, string> {
  const baseEntries: Record<string, string> = {
    index: resolve(__dirname, "src/index.tsx"),
    "themes/index": resolve(__dirname, "src/themes/index.ts"),
    "hooks/index": resolve(__dirname, "src/hooks/index.ts"),
  };

  const catalogPath = resolve(__dirname, "scripts/entry-catalog.json");

  if (!existsSync(catalogPath)) {
    console.warn("⚠ entry-catalog.json not found. Run: bun scripts/sync-exports.ts --write");
    return baseEntries;
  }

  const catalog: EntryCatalog = JSON.parse(readFileSync(catalogPath, "utf-8"));

  for (const entry of catalog.components) {
    const categoryDir = getCategoryDir(entry.category);
    baseEntries[`${categoryDir}/${entry.name}`] = resolve(__dirname, entry.relativePath);
  }

  return baseEntries;
}

export default defineConfig({
  plugins: [
    react(),
    svgr(),
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
