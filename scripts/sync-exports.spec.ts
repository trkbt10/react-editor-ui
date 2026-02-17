/**
 * @file Tests for sync-exports.ts
 */

import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";

const ROOT_DIR = resolve(import.meta.dirname, "..");
const TEST_COMPONENT_DIR = join(ROOT_DIR, "src/components/TestSyncComponent");
const SCRIPT_PATH = join(ROOT_DIR, "scripts/sync-exports.ts");

describe("sync-exports", () => {
  describe("component detection", () => {
    beforeAll(() => {
      // Create test component
      mkdirSync(TEST_COMPONENT_DIR, { recursive: true });
      writeFileSync(
        join(TEST_COMPONENT_DIR, "TestSyncComponent.tsx"),
        'export function TestSyncComponent() { return null; }'
      );
    });

    afterAll(() => {
      // Clean up test component
      if (existsSync(TEST_COMPONENT_DIR)) {
        rmSync(TEST_COMPONENT_DIR, { recursive: true });
      }
    });

    it("detects new components in check mode", () => {
      const result = execSync(`bun ${SCRIPT_PATH} --json`, {
        encoding: "utf-8",
        cwd: ROOT_DIR,
      });

      const parsed = JSON.parse(result);
      const componentNames = parsed.catalog.components.map(
        (c: { name: string }) => c.name
      );

      expect(componentNames).toContain("TestSyncComponent");
    });

    it("generates correct export path for named entry", () => {
      const result = execSync(`bun ${SCRIPT_PATH} --json`, {
        encoding: "utf-8",
        cwd: ROOT_DIR,
      });

      const parsed = JSON.parse(result);
      const testExport = parsed.exports["./TestSyncComponent"];

      expect(testExport).toEqual({
        source: "./src/components/TestSyncComponent/TestSyncComponent.tsx",
        types: "./dist/components/TestSyncComponent/TestSyncComponent.d.ts",
        import: "./dist/components/TestSyncComponent.js",
        require: "./dist/components/TestSyncComponent.cjs",
      });
    });

    it("generates correct vite entry for named entry", () => {
      const result = execSync(`bun ${SCRIPT_PATH} --json`, {
        encoding: "utf-8",
        cwd: ROOT_DIR,
      });

      const parsed = JSON.parse(result);
      const viteEntry = parsed.viteEntries["components/TestSyncComponent"];

      expect(viteEntry).toBe(
        "src/components/TestSyncComponent/TestSyncComponent.tsx"
      );
    });
  });

  describe("index.ts entry detection", () => {
    it("detects index.ts as entry when present", () => {
      const result = execSync(`bun ${SCRIPT_PATH} --json`, {
        encoding: "utf-8",
        cwd: ROOT_DIR,
      });

      const parsed = JSON.parse(result);
      const editor = parsed.catalog.components.find(
        (c: { name: string }) => c.name === "RichTextEditors"
      );

      expect(editor).toBeDefined();
      expect(editor.entryType).toBe("index");
      expect(editor.relativePath).toBe("src/editors/RichTextEditors/index.ts");
    });

    it("generates correct export path for index entry", () => {
      const result = execSync(`bun ${SCRIPT_PATH} --json`, {
        encoding: "utf-8",
        cwd: ROOT_DIR,
      });

      const parsed = JSON.parse(result);
      const editorExport = parsed.exports["./editors/RichTextEditors"];

      expect(editorExport.types).toBe("./dist/editors/RichTextEditors/index.d.ts");
    });
  });

  describe("base exports", () => {
    it("always includes root export", () => {
      const result = execSync(`bun ${SCRIPT_PATH} --json`, {
        encoding: "utf-8",
        cwd: ROOT_DIR,
      });

      const parsed = JSON.parse(result);

      expect(parsed.exports["."]).toEqual({
        source: "./src/index.tsx",
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
        require: "./dist/index.cjs",
      });
    });

    it("always includes themes export", () => {
      const result = execSync(`bun ${SCRIPT_PATH} --json`, {
        encoding: "utf-8",
        cwd: ROOT_DIR,
      });

      const parsed = JSON.parse(result);

      expect(parsed.exports["./themes"]).toEqual({
        source: "./src/themes/index.ts",
        types: "./dist/themes/index.d.ts",
        import: "./dist/themes/index.js",
        require: "./dist/themes/index.cjs",
      });
    });

    it("always includes package.json export", () => {
      const result = execSync(`bun ${SCRIPT_PATH} --json`, {
        encoding: "utf-8",
        cwd: ROOT_DIR,
      });

      const parsed = JSON.parse(result);

      expect(parsed.exports["./package.json"]).toBe("./package.json");
    });
  });
});
