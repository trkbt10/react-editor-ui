/**
 * @file SVG icons for stroke settings components
 * @deprecated Import icons from "../../icons" instead
 *
 * This file re-exports icons from the centralized icon library for backward compatibility.
 */

// Cap icons
export { CapButtIcon, CapRoundIcon, CapSquareIcon } from "../../icons";

// Join icons
export { JoinMiterIcon, JoinRoundIcon, JoinBevelIcon } from "../../icons";

// Align stroke icons (renamed for backward compatibility)
export {
  StrokeAlignInsideIcon as AlignInsideIcon,
  StrokeAlignCenterIcon as AlignCenterIcon,
  StrokeAlignOutsideIcon as AlignOutsideIcon,
} from "../../icons";

// Arrowhead icons
export {
  ArrowNoneIcon,
  ArrowTriangleIcon,
  ArrowOpenIcon,
  ArrowCircleIcon,
  ArrowSquareIcon,
  ArrowDiamondIcon,
  ArrowBarIcon,
} from "../../icons";

// Utility icons
export {
  SwapIcon,
  LinkIcon,
} from "../../icons";

// FlipIcon - using FlipVerticalIcon as the original had vertical flip semantics
export { FlipVerticalIcon as FlipIcon } from "../../icons";
