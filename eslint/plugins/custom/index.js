/**
 * @file Local ESLint plugin: custom rules for this repository.
 */
import ternaryLength from "./rules/ternary-length.js";
import preferNodeProtocol from "./rules/prefer-node-protocol.js";
import noEmptyJsdoc from "./rules/no-empty-jsdoc.js";
import noAsOutsideGuard from "./rules/no-as-outside-guard.js";
import noNestedTry from "./rules/no-nested-try.js";
import noIifeInAnonymous from "./rules/no-iife-in-anonymous.js";
import noExportStar from "./rules/no-export-star.js";
import noParentReexport from "./rules/no-parent-reexport.js";

export default {
  rules: {
    "ternary-length": ternaryLength,
    "prefer-node-protocol": preferNodeProtocol,
    "no-empty-jsdoc": noEmptyJsdoc,
    "no-as-outside-guard": noAsOutsideGuard,
    "no-nested-try": noNestedTry,
    "no-iife-in-anonymous": noIifeInAnonymous,
    "no-export-star": noExportStar,
    "no-parent-reexport": noParentReexport,
  },
};
