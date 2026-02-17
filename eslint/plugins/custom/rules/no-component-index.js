/**
 * @file Rule: no-component-index
 * Disallows index.ts files in src/components directories.
 *
 * Component entry points must follow the [ComponentName].tsx pattern:
 *   src/components/Button/Button.tsx ✓
 *   src/components/Button/index.ts   ✗
 *
 * This ensures consistent exports in package.json and Vite build configuration.
 *
 * Note: src/editors/ modules are allowed to use index.ts (complex modules with submodules)
 */

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
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();

    // Only check files in src/components/*/index.ts
    // src/editors/ modules are allowed to use index.ts
    const match = filename.match(
      /[/\\]src[/\\]components[/\\]([^/\\]+)[/\\]index\.ts$/
    );

    if (!match) {
      return {};
    }

    const componentName = match[1];

    return {
      Program(node) {
        context.report({
          node,
          messageId: "noComponentIndex",
          data: {
            componentName,
          },
        });
      },
    };
  },
};
