/**
 * @file Panel component - Deprecated alias for PanelFrame
 *
 * @deprecated Use PanelFrame from react-editor-ui/PanelFrame instead.
 * This export is maintained for backward compatibility.
 *
 * @example
 * ```tsx
 * // Old usage (deprecated)
 * import { Panel } from "react-editor-ui/panels/Panel";
 *
 * // New usage (recommended)
 * import { PanelFrame } from "react-editor-ui/PanelFrame";
 * ```
 */

export {
  PanelFrame as Panel,
  type PanelFrameProps as PanelProps,
} from "../../components/PanelFrame/PanelFrame";
