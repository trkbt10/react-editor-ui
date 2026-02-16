/**
 * @file Rule: no-canvas-import
 * Disallows importing from src/canvas in src/components and src/panels code.
 *
 * Architecture: canvas is an isolated module that should not be depended on
 * by components or panels to maintain clean boundaries.
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow importing from src/canvas in components and panels code",
    },
    messages: {
      noCanvasImport:
        "Importing from 'src/canvas' is prohibited in {{layer}}. Canvas is an isolated module that should not be depended on by {{layer}}.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();

    // Determine which layer this file belongs to
    const isInComponents =
      filename.includes("/components/") || filename.includes("\\components\\");
    const isInPanels =
      filename.includes("/panels/") || filename.includes("\\panels\\");

    // Only apply to files in src/components or src/panels
    if (!isInComponents && !isInPanels) {
      return {};
    }

    const layer = isInComponents ? "components" : "panels";

    /**
     * Check if the import path references canvas directory
     */
    const isCanvasPath = (sourcePath) => {
      if (typeof sourcePath !== "string") {
        return false;
      }
      // Match paths like "../canvas", "./canvas", "src/canvas", etc.
      return (
        sourcePath.includes("/canvas/") ||
        sourcePath.includes("/canvas") ||
        sourcePath.endsWith("/canvas")
      );
    };

    const reportIfCanvasPath = (node) => {
      if (node.source && isCanvasPath(node.source.value)) {
        context.report({
          node,
          messageId: "noCanvasImport",
          data: { layer },
        });
      }
    };

    return {
      ImportDeclaration: reportIfCanvasPath,
      ExportNamedDeclaration: reportIfCanvasPath,
      ExportAllDeclaration: reportIfCanvasPath,
    };
  },
};
