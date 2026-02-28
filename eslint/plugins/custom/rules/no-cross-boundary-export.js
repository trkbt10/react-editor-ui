/**
 * @file Rule: no-cross-boundary-export
 * Disallows export entry points from re-exporting across top-level src/ boundaries.
 *
 * Each top-level directory (components, panels, canvas, editors, sections, viewers, parsers)
 * is an independent module boundary. Entry point files (index.ts, [Name].tsx) must only
 * export from within their own boundary — never re-export from another boundary.
 *
 * This prevents "proxy" modules that create a mismatch between the source location
 * and the package export path (e.g., src/parsers/ re-exporting from src/viewers/).
 */

const TOP_LEVEL_DIRS = [
  "components",
  "panels",
  "canvas",
  "editors",
  "sections",
  "viewers",
  "parsers",
];

/**
 * Extract the top-level src/ boundary from a file path.
 * Returns e.g. "components" for "src/components/Button/Button.tsx"
 */
function getBoundary(filepath) {
  const normalized = filepath.replace(/\\/g, "/");
  for (const dir of TOP_LEVEL_DIRS) {
    if (
      normalized.includes(`/src/${dir}/`) ||
      normalized.includes(`src/${dir}/`)
    ) {
      return dir;
    }
  }
  return null;
}

/**
 * Resolve relative import to determine which boundary it targets.
 * Returns the boundary name or null if not crossing boundaries.
 */
function getImportBoundary(importPath, fileBoundary) {
  if (typeof importPath !== "string") {
    return null;
  }

  // Only check relative imports
  if (!importPath.startsWith(".")) {
    return null;
  }

  for (const dir of TOP_LEVEL_DIRS) {
    // Match patterns like "../../viewers/", "../viewers/"
    if (
      importPath.includes(`/${dir}/`) ||
      importPath.endsWith(`/${dir}`)
    ) {
      if (dir !== fileBoundary) {
        return dir;
      }
    }
  }

  return null;
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow re-exporting from a different top-level src/ boundary",
    },
    messages: {
      noCrossBoundaryExport:
        "Cross-boundary export: '{{from}}' must not re-export from '{{target}}'. Move the source code instead of creating proxy re-exports.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    const boundary = getBoundary(filename);

    // Only apply to files within a known boundary
    if (!boundary) {
      return {};
    }

    const check = (node) => {
      if (!node.source) {
        return;
      }

      const target = getImportBoundary(node.source.value, boundary);
      if (target) {
        context.report({
          node,
          messageId: "noCrossBoundaryExport",
          data: { from: boundary, target },
        });
      }
    };

    return {
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
    };
  },
};
