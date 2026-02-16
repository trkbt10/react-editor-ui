#!/usr/bin/env bun
/**
 * @file README.md generation script
 *
 * Generates README.md from templates and component documentation.
 *
 * Usage:
 *   bun scripts/build-readme.ts          # Generate README.md
 *   bun scripts/build-readme.ts --check  # Check if README.md is up to date
 *   bun scripts/build-readme.ts --json   # Output parsed data as JSON
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT_DIR = resolve(import.meta.dirname, "..");
const DOCS_DIR = join(ROOT_DIR, "docs");
const TEMPLATES_DIR = join(DOCS_DIR, "readme");
const CATEGORIES_PATH = join(DOCS_DIR, "component-categories.json");
const ENTRY_CATALOG_PATH = join(ROOT_DIR, "scripts/entry-catalog.json");
const README_PATH = join(ROOT_DIR, "README.md");

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface Category {
  id: string;
  label: string;
  description: string;
  components: string[];
}

interface CategoriesConfig {
  categories: Category[];
}

interface ComponentEntry {
  name: string;
  entryType: "index" | "named";
  relativePath: string;
  category: "component" | "panel";
}

interface EntryCatalog {
  generatedAt: string;
  components: ComponentEntry[];
}

interface ComponentDoc {
  name: string;
  file: string;
  description: string;
  details?: string;
  example?: string;
  exportPath: string;
}

// -----------------------------------------------------------------------------
// JSDoc Comment Parsing
// -----------------------------------------------------------------------------

/**
 * Parses JSDoc comment block and extracts @file, @description, and @example tags
 */
export function parseJSDocComment(content: string): {
  file?: string;
  description?: string;
  example?: string;
} {
  // Find the first JSDoc comment block
  const jsdocMatch = content.match(/\/\*\*[\s\S]*?\*\//);
  if (!jsdocMatch) {
    return {};
  }

  const comment = jsdocMatch[0];
  const result: { file?: string; description?: string; example?: string } = {};

  // Parse @file tag (single line after @file)
  const fileMatch = comment.match(/@file\s+(.+?)(?:\n|\*\/)/);
  if (fileMatch) {
    result.file = fileMatch[1].trim().replace(/\s*\*\s*$/, "");
  }

  // Parse @description tag (multi-line support)
  const descMatch = comment.match(/@description\s+([\s\S]*?)(?=@\w+|\*\/)/);
  if (descMatch) {
    result.description = descMatch[1]
      .split("\n")
      .map((line) => line.replace(/^\s*\*\s?/, "").trim())
      .filter((line) => line.length > 0)
      .join(" ");
  }

  // Parse @example tag (code block)
  const exampleMatch = comment.match(/@example\s+([\s\S]*?)(?=@\w+|\*\/)/);
  if (exampleMatch) {
    const exampleContent = exampleMatch[1];
    // Extract code block if present
    const codeBlockMatch = exampleContent.match(/```[\s\S]*?```/);
    if (codeBlockMatch) {
      result.example = codeBlockMatch[0]
        .split("\n")
        .map((line) => line.replace(/^\s*\*\s?/, ""))
        .join("\n")
        .trim();
    } else {
      // Plain code without backticks
      result.example = exampleContent
        .split("\n")
        .map((line) => line.replace(/^\s*\*\s?/, ""))
        .join("\n")
        .trim();
    }
  }

  return result;
}

// -----------------------------------------------------------------------------
// Data Loading
// -----------------------------------------------------------------------------

function loadCategories(): CategoriesConfig {
  const content = readFileSync(CATEGORIES_PATH, "utf-8");
  return JSON.parse(content) as CategoriesConfig;
}

function loadEntryCatalog(): EntryCatalog {
  const content = readFileSync(ENTRY_CATALOG_PATH, "utf-8");
  return JSON.parse(content) as EntryCatalog;
}

function getExportPath(entry: ComponentEntry): string {
  if (entry.category === "panel") {
    return `react-editor-ui/panels/${entry.name}`;
  }
  return `react-editor-ui/${entry.name}`;
}

function loadComponentDoc(entry: ComponentEntry): ComponentDoc {
  const sourcePath = join(ROOT_DIR, entry.relativePath);

  if (!existsSync(sourcePath)) {
    return {
      name: entry.name,
      file: sourcePath,
      description: "",
      exportPath: getExportPath(entry),
    };
  }

  const content = readFileSync(sourcePath, "utf-8");
  const parsed = parseJSDocComment(content);

  // Extract description from @file tag
  let description = "";
  if (parsed.file) {
    // Remove component name prefix if present
    const fileDesc = parsed.file.replace(
      new RegExp(`^${entry.name}\\s+component\\s*[-–]?\\s*`, "i"),
      ""
    );
    description = fileDesc.charAt(0).toUpperCase() + fileDesc.slice(1);
  }

  return {
    name: entry.name,
    file: entry.relativePath,
    description,
    details: parsed.description,
    example: parsed.example,
    exportPath: getExportPath(entry),
  };
}

// -----------------------------------------------------------------------------
// Template Processing
// -----------------------------------------------------------------------------

function loadTemplates(): Map<string, string> {
  const templates = new Map<string, string>();

  if (!existsSync(TEMPLATES_DIR)) {
    return templates;
  }

  const files = readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".md.tpl"))
    .sort();

  for (const file of files) {
    const content = readFileSync(join(TEMPLATES_DIR, file), "utf-8");
    templates.set(file, content);
  }

  return templates;
}

function generateComponentSection(
  category: Category,
  docs: Map<string, ComponentDoc>
): string {
  const lines: string[] = [];
  lines.push(`### ${category.label}`);
  lines.push("");
  lines.push(`> ${category.description}`);
  lines.push("");

  for (const componentName of category.components) {
    const doc = docs.get(componentName);
    if (!doc) {
      continue;
    }

    lines.push(`#### ${componentName}`);
    lines.push("");

    if (doc.description) {
      lines.push(doc.description);
      lines.push("");
    }

    if (doc.details) {
      lines.push(doc.details);
      lines.push("");
    }

    if (doc.example) {
      lines.push(doc.example);
      lines.push("");
    } else {
      // Generate minimal import example
      lines.push("```tsx");
      lines.push(`import { ${componentName} } from "${doc.exportPath}";`);
      lines.push("```");
      lines.push("");
    }
  }

  return lines.join("\n");
}

function generateComponentsMarkdown(
  categories: CategoriesConfig,
  docs: Map<string, ComponentDoc>
): string {
  const sections: string[] = [];

  for (const category of categories.categories) {
    sections.push(generateComponentSection(category, docs));
  }

  return sections.join("\n");
}

function processTemplate(
  template: string,
  componentsMarkdown: string
): string {
  // Replace AUTO:COMPONENTS placeholder
  return template.replace(
    /<!--\s*AUTO:COMPONENTS\s*-->[\s\S]*?<!--\s*\/AUTO:COMPONENTS\s*-->/g,
    `<!-- AUTO:COMPONENTS -->\n${componentsMarkdown}<!-- /AUTO:COMPONENTS -->`
  );
}

// -----------------------------------------------------------------------------
// Main Build Logic
// -----------------------------------------------------------------------------

export function buildReadme(): string {
  const categories = loadCategories();
  const catalog = loadEntryCatalog();

  // Build component docs map
  const docs = new Map<string, ComponentDoc>();
  for (const entry of catalog.components) {
    const doc = loadComponentDoc(entry);
    docs.set(entry.name, doc);
  }

  // Load and combine templates
  const templates = loadTemplates();
  const sections: string[] = [];

  // Generate components markdown
  const componentsMarkdown = generateComponentsMarkdown(categories, docs);

  // Process templates in order
  for (const [filename, content] of templates) {
    let processed = content;

    // Process .tpl files with replacements
    if (filename.endsWith(".md.tpl")) {
      processed = processTemplate(content, componentsMarkdown);
    }

    sections.push(processed);
  }

  return sections.join("\n");
}

// -----------------------------------------------------------------------------
// CLI
// -----------------------------------------------------------------------------

function main(): void {
  const args = process.argv.slice(2);
  const checkMode = args.includes("--check");
  const jsonMode = args.includes("--json");

  // Ensure entry catalog exists
  if (!existsSync(ENTRY_CATALOG_PATH)) {
    console.error("Error: entry-catalog.json not found. Run sync-exports first.");
    process.exit(1);
  }

  if (jsonMode) {
    const categories = loadCategories();
    const catalog = loadEntryCatalog();
    const docs = new Map<string, ComponentDoc>();

    for (const entry of catalog.components) {
      const doc = loadComponentDoc(entry);
      docs.set(entry.name, doc);
    }

    console.log(
      JSON.stringify(
        {
          categories: categories.categories,
          components: Object.fromEntries(docs),
        },
        null,
        2
      )
    );
    return;
  }

  const newContent = buildReadme();

  if (checkMode) {
    if (!existsSync(README_PATH)) {
      console.log("README.md does not exist. Run without --check to generate.");
      process.exit(1);
    }

    const currentContent = readFileSync(README_PATH, "utf-8");
    if (currentContent === newContent) {
      console.log("README.md is up to date.");
      process.exit(0);
    } else {
      console.log("README.md is out of date. Run without --check to update.");
      process.exit(1);
    }
  }

  writeFileSync(README_PATH, newContent);
  console.log("README.md generated successfully.");
}

main();
