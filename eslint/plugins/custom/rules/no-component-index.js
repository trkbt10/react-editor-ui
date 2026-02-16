/**
 * @file Rule: no-component-index
 * Disallows index.ts files in src/components directories (except allowlisted modules).
 *
 * Component entry points must follow the [ComponentName].tsx pattern:
 *   src/components/Button/Button.tsx ✓
 *   src/components/Button/index.ts   ✗
 *
 * This ensures consistent exports in package.json and Vite build configuration.
 *
 * Allowlisted exceptions (complex modules with many submodules):
 *   - Editor (has code/, core/, text/, styles/ subdirectories)
 */

/**
 * Components allowed to use index.ts as entry point.
 * Must be kept in sync with scripts/sync-exports.ts ALLOWED_INDEX_ENTRIES
 */
const ALLOWED_INDEX_ENTRIES = new Set(["Editor"]);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow index.ts in src/components (entry point must be [ComponentName].tsx)",
    },
    messages: {
      noComponentIndex:
        "Component entry point must be {{componentName}}.tsx, not index.ts. " +
        "Rename this file or merge exports into the main component file.",
      noComponentIndexAllowed:
        "index.ts is only allowed for: {{allowedList}}. " +
        "Rename to {{componentName}}.ts or use {{componentName}}.tsx as entry point.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();

    // Only check files in src/components/*/index.ts
    const match = filename.match(
      /[/\\]src[/\\]components[/\\]([^/\\]+)[/\\]index\.ts$/
    );

    if (!match) {
      return {};
    }

    const componentName = match[1];

    // Skip allowlisted components
    if (ALLOWED_INDEX_ENTRIES.has(componentName)) {
      return {};
    }

    return {
      Program(node) {
        context.report({
          node,
          messageId: "noComponentIndex",
          data: {
            componentName,
            allowedList: Array.from(ALLOWED_INDEX_ENTRIES).join(", "),
          },
        });
      },
    };
  },
};
