/**
 * @file Rule: no-redundant-type-alias
 * Disallows redundant type alias re-exports that could be simplified.
 * Example violation:
 *   import type { Foo as FooImport } from "./types";
 *   export type Foo = FooImport;
 *
 * Should be:
 *   export type { Foo } from "./types";
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow redundant type alias re-exports that rename on import then alias back",
    },
    messages: {
      noRedundantTypeAlias:
        'Redundant type alias. Use `export type { {{originalName}} } from "{{source}}"` instead.',
    },
    schema: [],
  },
  create(context) {
    // Track renamed type imports: Map<localName, { originalName, source, node }>
    const renamedImports = new Map();

    return {
      // Track `import type { X as Y } from "path"`
      ImportDeclaration(node) {
        if (!node.source) {
          return;
        }

        const source = node.source.value;

        for (const specifier of node.specifiers) {
          if (specifier.type !== "ImportSpecifier") {
            continue;
          }

          // Check if this is a type import with renaming
          const isTypeImport =
            node.importKind === "type" || specifier.importKind === "type";

          if (!isTypeImport) {
            continue;
          }

          const importedName = specifier.imported.name;
          const localName = specifier.local.name;

          // Only track if renamed (X as Y where X !== Y)
          if (importedName !== localName) {
            renamedImports.set(localName, {
              originalName: importedName,
              source,
              node: specifier,
            });
          }
        }
      },

      // Check `export type X = Y` where Y is a renamed import
      ExportNamedDeclaration(node) {
        // Must have a declaration (not just specifiers)
        if (!node.declaration) {
          return;
        }

        // Must be a type alias declaration
        if (node.declaration.type !== "TSTypeAliasDeclaration") {
          return;
        }

        const declaration = node.declaration;
        const exportedName = declaration.id.name;
        const typeAnnotation = declaration.typeAnnotation;

        // Must be a simple type reference (not union, intersection, etc.)
        if (typeAnnotation.type !== "TSTypeReference") {
          return;
        }

        // Must reference a simple identifier (not qualified name)
        if (typeAnnotation.typeName.type !== "Identifier") {
          return;
        }

        const referencedName = typeAnnotation.typeName.name;

        // Check if the referenced name is a renamed import
        const importInfo = renamedImports.get(referencedName);
        if (!importInfo) {
          return;
        }

        // Check if we're exporting with the original name
        if (exportedName === importInfo.originalName) {
          context.report({
            node: declaration,
            messageId: "noRedundantTypeAlias",
            data: {
              originalName: importInfo.originalName,
              source: importInfo.source,
            },
          });
        }
      },
    };
  },
};
