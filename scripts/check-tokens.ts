#!/usr/bin/env bun
/**
 * @file CSS Token Validator
 *
 * Detects undefined CSS tokens (--rei-*) used in the codebase.
 * Compares usage against definitions in src/constants/styles.ts.
 *
 * Usage:
 *   bun scripts/check-tokens.ts [options]
 *
 * Options:
 *   --fix         Show suggestions for fixing undefined tokens
 *   --json        Output results as JSON
 *   --strict      Include demo tokens in validation (default: exclude)
 *   --demo-only   Only check demo tokens (src/demo/**)
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const PROJECT_ROOT = join(import.meta.dir, "..");
const STYLES_PATH = join(PROJECT_ROOT, "src/constants/styles.ts");
const SRC_PATH = join(PROJECT_ROOT, "src");

// File extensions to scan
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".css", ".scss"]);

// Directories to skip
const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".git"]);

// Pattern to match CSS variable usage: var(--rei-*)
const VAR_USAGE_PATTERN = /var\(--rei-([a-zA-Z0-9-]+)(?:,\s*[^)]+)?\)/g;

// Pattern to extract token definitions from styles.ts
const TOKEN_DEFINITION_PATTERN = /var\(--rei-([a-zA-Z0-9-]+),/g;

// Demo-specific token prefix (excluded by default)
const DEMO_TOKEN_PREFIX = "demo-";

type TokenUsage = {
  token: string;
  file: string;
  line: number;
  context: string;
};

type ValidationOptions = {
  strict: boolean;
  demoOnly: boolean;
};

type ValidationResult = {
  definedTokens: Set<string>;
  usedTokens: Map<string, TokenUsage[]>;
  undefinedTokens: Map<string, TokenUsage[]>;
  skippedDemoTokens: Map<string, TokenUsage[]>;
};

/**
 * Extract defined tokens from styles.ts
 */
function extractDefinedTokens(): Set<string> {
  const content = readFileSync(STYLES_PATH, "utf-8");
  const tokens = new Set<string>();

  // eslint-disable-next-line no-restricted-syntax -- Required for RegExp.exec loop
  let match: RegExpExecArray | null;
  while ((match = TOKEN_DEFINITION_PATTERN.exec(content)) !== null) {
    tokens.add(match[1]);
  }

  return tokens;
}

/**
 * Recursively find all files to scan
 */
function findFiles(dir: string): string[] {
  const files: string[] = [];

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) {
        files.push(...findFiles(fullPath));
      }
    } else if (SCAN_EXTENSIONS.has(extname(entry))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Scan a file for token usage
 */
function scanFile(filePath: string): TokenUsage[] {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const usages: TokenUsage[] = [];

  lines.forEach((line, index) => {
    // eslint-disable-next-line no-restricted-syntax -- Required for RegExp.exec loop
    let match: RegExpExecArray | null;

    // Reset regex lastIndex for each line
    VAR_USAGE_PATTERN.lastIndex = 0;

    while ((match = VAR_USAGE_PATTERN.exec(line)) !== null) {
      usages.push({
        token: match[1],
        file: relative(PROJECT_ROOT, filePath),
        line: index + 1,
        context: line.trim().slice(0, 100),
      });
    }
  });

  return usages;
}

/**
 * Check if a token is a demo-specific token
 */
function isDemoToken(token: string): boolean {
  return token.startsWith(DEMO_TOKEN_PREFIX);
}

/**
 * Check if a file is in the demo directory
 */
function isDemoFile(filePath: string): boolean {
  return filePath.includes("/demo/") || filePath.includes("\\demo\\");
}

/**
 * Validate all token usage in the project
 */
function validateTokens(options: ValidationOptions): ValidationResult {
  const definedTokens = extractDefinedTokens();
  const usedTokens = new Map<string, TokenUsage[]>();
  const undefinedTokens = new Map<string, TokenUsage[]>();
  const skippedDemoTokens = new Map<string, TokenUsage[]>();

  const files = findFiles(SRC_PATH);

  for (const file of files) {
    // In demo-only mode, skip non-demo files
    if (options.demoOnly && !isDemoFile(file)) {
      continue;
    }

    const usages = scanFile(file);

    for (const usage of usages) {
      // Track all usages
      if (!usedTokens.has(usage.token)) {
        usedTokens.set(usage.token, []);
      }
      usedTokens.get(usage.token)!.push(usage);

      // Skip demo tokens unless in strict mode
      if (!options.strict && isDemoToken(usage.token)) {
        if (!skippedDemoTokens.has(usage.token)) {
          skippedDemoTokens.set(usage.token, []);
        }
        skippedDemoTokens.get(usage.token)!.push(usage);
        continue;
      }

      // Track undefined tokens
      if (!definedTokens.has(usage.token)) {
        if (!undefinedTokens.has(usage.token)) {
          undefinedTokens.set(usage.token, []);
        }
        undefinedTokens.get(usage.token)!.push(usage);
      }
    }
  }

  return { definedTokens, usedTokens, undefinedTokens, skippedDemoTokens };
}

/**
 * Find similar defined tokens for suggestions
 */
function findSimilarTokens(token: string, definedTokens: Set<string>): string[] {
  const similar: string[] = [];
  const tokenParts = token.split("-");

  for (const defined of definedTokens) {
    const definedParts = defined.split("-");

    // Check if first part matches (e.g., "color", "space", "size")
    if (tokenParts[0] === definedParts[0]) {
      similar.push(defined);
    }
  }

  return similar.slice(0, 5); // Limit suggestions
}

/**
 * Format output for console
 */
function formatConsoleOutput(
  result: ValidationResult,
  showFix: boolean,
  options: ValidationOptions
): void {
  const { definedTokens, undefinedTokens, skippedDemoTokens } = result;

  console.log("\n🔍 CSS Token Validation Report");
  console.log("================================\n");
  console.log(`Defined tokens: ${definedTokens.size}`);
  console.log(`Undefined tokens found: ${undefinedTokens.size}`);

  if (!options.strict && skippedDemoTokens.size > 0) {
    console.log(`Skipped demo tokens: ${skippedDemoTokens.size} (use --strict to include)`);
  }

  if (undefinedTokens.size === 0) {
    console.log("\n✅ All tokens are properly defined!\n");
    return;
  }

  console.log("\n❌ Undefined Tokens:\n");

  const sortedTokens = Array.from(undefinedTokens.keys()).sort();

  for (const token of sortedTokens) {
    const usages = undefinedTokens.get(token)!;
    console.log(`  --rei-${token}`);
    console.log(`    Used ${usages.length} time(s):`);

    for (const usage of usages) {
      console.log(`      ${usage.file}:${usage.line}`);
    }

    if (showFix) {
      const similar = findSimilarTokens(token, definedTokens);
      if (similar.length > 0) {
        console.log(`    💡 Similar defined tokens: ${similar.map((s) => `--rei-${s}`).join(", ")}`);
      }
    }

    console.log();
  }

  console.log(
    "\n💡 To fix: Add missing tokens to src/constants/styles.ts or use existing defined tokens.\n"
  );
}

/**
 * Format output as JSON
 */
function formatJsonOutput(result: ValidationResult, options: ValidationOptions): void {
  const { definedTokens, undefinedTokens, skippedDemoTokens } = result;

  const skippedTokensList = options.strict ? [] : Array.from(skippedDemoTokens.keys()).sort();
  const output = {
    summary: {
      definedCount: definedTokens.size,
      undefinedCount: undefinedTokens.size,
      skippedDemoCount: options.strict ? 0 : skippedDemoTokens.size,
      valid: undefinedTokens.size === 0,
    },
    definedTokens: Array.from(definedTokens).sort(),
    undefinedTokens: Object.fromEntries(
      Array.from(undefinedTokens.entries()).map(([token, usages]) => [
        token,
        usages.map((u) => ({ file: u.file, line: u.line })),
      ])
    ),
    ...(skippedTokensList.length > 0 ? { skippedDemoTokens: skippedTokensList } : {}),
  };

  console.log(JSON.stringify(output, null, 2));
}

// Main execution
const args = process.argv.slice(2);
const showFix = args.includes("--fix");
const jsonOutput = args.includes("--json");
const strict = args.includes("--strict");
const demoOnly = args.includes("--demo-only");

const options: ValidationOptions = { strict, demoOnly };
const result = validateTokens(options);

if (jsonOutput) {
  formatJsonOutput(result, options);
} else {
  formatConsoleOutput(result, showFix, options);
}

// Exit with error code if undefined tokens found
process.exit(result.undefinedTokens.size > 0 ? 1 : 0);
