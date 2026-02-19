/**
 * @file Rule group: Forbid direct imports from react-icons
 *
 * All icons should be imported from the centralized `src/icons` module.
 * This ensures consistent icon sizing, styling, and easier refactoring.
 *
 * @example
 * // ❌ Bad - direct import from react-icons
 * import { LuPlus } from "react-icons/lu";
 *
 * // ✅ Good - import from centralized icons module
 * import { PlusIcon } from "../../icons";
 */

export default {
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["react-icons", "react-icons/*"],
          message:
            'Import icons from "../../icons" (or appropriate relative path to src/icons) instead of react-icons directly. Add new icons to src/icons/index.tsx if needed.',
        },
      ],
    },
  ],
};
