#!/usr/bin/env bun
/**
 * @file Component and panel exports synchronization script
 *
 * Scans src/components and src/panels directories and updates:
 * - package.json exports field
 * - vite.config.ts entry points (via generated file)
 *
 * Entry point detection rules:
 * 1. If index.ts exists in component folder -> use index.ts
 * 2. Otherwise -> use [ComponentName].tsx
 *
 * Usage:
 *   bun scripts/sync-exports.ts          # Check mode (shows diff)
 *   bun scripts/sync-exports.ts --write  # Write changes
 *   bun scripts/sync-exports.ts --json   # Output as JSON
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT_DIR = resolve(import.meta.dirname, "..");
const COMPONENTS_DIR = join(ROOT_DIR, "src/components");
const PANELS_DIR = join(ROOT_DIR, "src/panels");
const PACKAGE_JSON_PATH = join(ROOT_DIR, "package.json");
const ENTRY_CATALOG_PATH = join(ROOT_DIR, "scripts/entry-catalog.json");

type EntryCategory = "component" | "panel";

interface ComponentEntry {
  name: string;
  entryType: "index" | "named";
  relativePath: string;
  category: EntryCategory;
}

interface EntryCatalog {
  generatedAt: string;
  components: ComponentEntry[];
}

interface PackageJson {
  exports: Record<string, unknown>;
  [key: string]: unknown;
}

interface ExportEntry {
  source: string;
  types: string;
  import: string;
  require: string;
}

/**
 * Components that are allowed to use index.ts as entry point.
 * These are complex modules with many submodules (e.g., Editor with code/, core/, text/, etc.)
 */
const ALLOWED_INDEX_ENTRIES = new Set(["Editor"]);

/**
 * Detects the entry point for a component or panel directory
 *
 * Priority:
 * 1. [ComponentName].ts (re-export file)
 * 2. [ComponentName].tsx (direct component)
 * 3. index.ts (only allowed for ALLOWED_INDEX_ENTRIES)
 */
function detectEntryPoint(
  dir: string,
  name: string,
  category: EntryCategory,
): ComponentEntry | null {
  const namedTsPath = join(dir, `${name}.ts`);
  const namedTsxPath = join(dir, `${name}.tsx`);
  const indexPath = join(dir, "index.ts");
  const categoryDir = category === "component" ? "components" : "panels";

  // Priority 1: [Name].ts (re-export file)
  if (existsSync(namedTsPath)) {
    return {
      name,
      entryType: "named",
      relativePath: `src/${categoryDir}/${name}/${name}.ts`,
      category,
    };
  }

  // Priority 2: [Name].tsx (direct component)
  if (existsSync(namedTsxPath)) {
    // Warn if index.ts also exists but is not allowed
    if (existsSync(indexPath) && !ALLOWED_INDEX_ENTRIES.has(name)) {
      console.warn(
        `⚠ ${name}: has both ${name}.tsx and index.ts. ` +
        `Rename index.ts to ${name}.ts to follow the naming convention.`
      );
    }
    return {
      name,
      entryType: "named",
      relativePath: `src/${categoryDir}/${name}/${name}.tsx`,
      category,
    };
  }

  // Priority 3: index.ts (only for allowed components)
  if (existsSync(indexPath)) {
    if (ALLOWED_INDEX_ENTRIES.has(name)) {
      return {
        name,
        entryType: "index",
        relativePath: `src/${categoryDir}/${name}/index.ts`,
        category,
      };
    }
    console.error(
      `✗ ${name}: index.ts is not allowed. ` +
      `Rename to ${name}.ts to follow the naming convention.`
    );
    return null;
  }

  return null;
}

/**
 * Scans a directory and collects entries
 */
function scanDirectory(
  dir: string,
  category: EntryCategory,
): ComponentEntry[] {
  if (!existsSync(dir)) {
    return [];
  }
  const entries = readdirSync(dir);
  const result: ComponentEntry[] = [];

  for (const entry of entries) {
    const entryDir = join(dir, entry);
    const stat = statSync(entryDir);

    if (!stat.isDirectory()) {
      continue;
    }

    const componentEntry = detectEntryPoint(entryDir, entry, category);
    if (componentEntry) {
      result.push(componentEntry);
    } else {
      console.warn(`⚠ No entry point found for ${category}: ${entry}`);
    }
  }

  return result;
}

/**
 * Scans components and panels directories and builds entry catalog
 */
function buildEntryCatalog(): EntryCatalog {
  const components = scanDirectory(COMPONENTS_DIR, "component");
  const panels = scanDirectory(PANELS_DIR, "panel");
  const allEntries = [...components, ...panels];

  allEntries.sort((a, b) => a.name.localeCompare(b.name));

  return {
    generatedAt: new Date().toISOString(),
    components: allEntries,
  };
}

/**
 * Generates package.json exports field
 */
function generateExports(catalog: EntryCatalog): Record<string, ExportEntry | string> {
  const exports: Record<string, ExportEntry | string> = {
    ".": {
      source: "./src/index.tsx",
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
      require: "./dist/index.cjs",
    },
    "./themes": {
      source: "./src/themes/index.ts",
      types: "./dist/themes/index.d.ts",
      import: "./dist/themes/index.js",
      require: "./dist/themes/index.cjs",
    },
  };

  for (const entry of catalog.components) {
    const categoryDir = entry.category === "component" ? "components" : "panels";
    // Components: ./ComponentName, Panels: ./panels/PanelName
    const exportKey = entry.category === "component"
      ? `./${entry.name}`
      : `./panels/${entry.name}`;

    // Type definition path matches source structure
    // For index.ts entries (Editor only): dist/components/Editor/index.d.ts
    // For named entries: dist/components/Badge/Badge.d.ts
    const typeFileName = entry.entryType === "index" ? "index" : entry.name;
    const typesPath = `./dist/${categoryDir}/${entry.name}/${typeFileName}.d.ts`;

    exports[exportKey] = {
      source: `./${entry.relativePath}`,
      types: typesPath,
      import: `./dist/${categoryDir}/${entry.name}.js`,
      require: `./dist/${categoryDir}/${entry.name}.cjs`,
    };
  }

  exports["./package.json"] = "./package.json";

  return exports;
}

/**
 * Generates vite entry points object
 */
function generateViteEntries(catalog: EntryCatalog): Record<string, string> {
  const entries: Record<string, string> = {
    index: "src/index.tsx",
    "themes/index": "src/themes/index.ts",
  };

  for (const entry of catalog.components) {
    const categoryDir = entry.category === "component" ? "components" : "panels";
    entries[`${categoryDir}/${entry.name}`] = entry.relativePath;
  }

  return entries;
}

/**
 * Reads current package.json
 */
function readPackageJson(): PackageJson {
  const content = readFileSync(PACKAGE_JSON_PATH, "utf-8");
  return JSON.parse(content) as PackageJson;
}

/**
 * Writes package.json with proper formatting
 */
function writePackageJson(pkg: PackageJson): void {
  const content = JSON.stringify(pkg, null, 2) + "\n";
  writeFileSync(PACKAGE_JSON_PATH, content);
}

/**
 * Writes entry catalog JSON
 */
function writeEntryCatalog(catalog: EntryCatalog): void {
  const content = JSON.stringify(catalog, null, 2) + "\n";
  writeFileSync(ENTRY_CATALOG_PATH, content);
}

/**
 * Compares two objects for deep equality
 */
function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Main execution
 */
function main(): void {
  const args = process.argv.slice(2);
  const writeMode = args.includes("--write");
  const jsonMode = args.includes("--json");

  const catalog = buildEntryCatalog();
  const newExports = generateExports(catalog);
  const viteEntries = generateViteEntries(catalog);

  if (jsonMode) {
    console.log(JSON.stringify({
      catalog,
      exports: newExports,
      viteEntries,
    }, null, 2));
    return;
  }

  const components = catalog.components.filter(c => c.category === "component");
  const panels = catalog.components.filter(c => c.category === "panel");

  console.log(`📦 Found ${catalog.components.length} entries (${components.length} components, ${panels.length} panels)\n`);

  // Show component breakdown
  const indexEntries = catalog.components.filter(c => c.entryType === "index");
  const namedEntries = catalog.components.filter(c => c.entryType === "named");

  console.log(`  index.ts entries: ${indexEntries.length}`);
  indexEntries.forEach(c => console.log(`    - ${c.name} (${c.category})`));

  console.log(`\n  [Name].tsx entries: ${namedEntries.length}`);
  namedEntries.forEach(c => console.log(`    - ${c.name} (${c.category})`));

  // Check for changes
  const currentPkg = readPackageJson();
  const exportsChanged = !deepEqual(currentPkg.exports, newExports);

  let catalogChanged = true;
  if (existsSync(ENTRY_CATALOG_PATH)) {
    const currentCatalog = JSON.parse(readFileSync(ENTRY_CATALOG_PATH, "utf-8")) as EntryCatalog;
    catalogChanged = !deepEqual(
      currentCatalog.components,
      catalog.components
    );
  }

  console.log("\n📋 Status:");

  if (!exportsChanged && !catalogChanged) {
    console.log("  ✅ All exports are up to date");
    return;
  }

  if (exportsChanged) {
    console.log("  ⚠ package.json exports need update");
  }
  if (catalogChanged) {
    console.log("  ⚠ entry-catalog.json needs update");
  }

  if (!writeMode) {
    console.log("\n💡 Run with --write to apply changes");
    console.log("\nPreview of package.json exports:");
    console.log(JSON.stringify(newExports, null, 2));
    process.exit(1);
  }

  // Write changes
  console.log("\n✍️ Writing changes...");

  if (exportsChanged) {
    currentPkg.exports = newExports;
    writePackageJson(currentPkg);
    console.log("  ✅ Updated package.json");
  }

  writeEntryCatalog(catalog);
  console.log("  ✅ Updated entry-catalog.json");

  console.log("\n✅ Sync complete!");
}

main();
