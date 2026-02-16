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
import noUseStateInUseEffect from "./rules/no-use-state-in-use-effect.js";
import preferPointerEvents from "./rules/prefer-pointer-events.js";
import noIife from "./rules/no-iife.js";
import noDemoImport from "./rules/no-demo-import.js";
import noParentTypeReexport from "./rules/no-parent-type-reexport.js";
import noBarrelImport from "./rules/no-barrel-import.js";

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
    "no-use-state-in-use-effect": noUseStateInUseEffect,
    "prefer-pointer-events": preferPointerEvents,
    "no-iife": noIife,
    "no-demo-import": noDemoImport,
    "no-parent-type-reexport": noParentTypeReexport,
    "no-barrel-import": noBarrelImport,
  },
};
