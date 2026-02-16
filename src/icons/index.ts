/**
 * @file Centralized icon exports for react-editor-ui
 *
 * All icons are exported from this file for consistent usage across the library.
 * Icons support common props: size, color, style, className, aria-label
 */

// Types
export type { IconProps, StatefulIconProps } from "./types";

// Utilities
export { resolveSize } from "./utils";

// Navigation icons
export {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "./navigation";

// Action icons
export {
  CloseIcon,
  CheckIcon,
  SearchIcon,
  SettingsIcon,
  ResetIcon,
  RefreshIcon,
  SwapIcon,
  LinkIcon,
  GridIcon,
} from "./action";

// Transform icons
export {
  FlipHorizontalIcon,
  FlipVerticalIcon,
  RotationIcon,
} from "./transform";

// Alignment icons
export {
  AlignLeftIcon,
  AlignCenterHIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignMiddleIcon,
  AlignBottomIcon,
  ConstraintToggleIcon,
  AlignStartIcon,
  AlignEndIcon,
} from "./alignment";

// Layer icons (with state)
export {
  EyeIcon,
  LockIcon,
  DragHandleIcon,
} from "./layer";
export type { EyeIconProps, LockIconProps } from "./layer";

// Stroke icons
export {
  // Cap
  CapButtIcon,
  CapRoundIcon,
  CapSquareIcon,
  // Join
  JoinMiterIcon,
  JoinRoundIcon,
  JoinBevelIcon,
  // Stroke align
  StrokeAlignInsideIcon,
  StrokeAlignCenterIcon,
  StrokeAlignOutsideIcon,
  // Arrowheads
  ArrowNoneIcon,
  ArrowTriangleIcon,
  ArrowOpenIcon,
  ArrowCircleIcon,
  ArrowSquareIcon,
  ArrowDiamondIcon,
  ArrowBarIcon,
  // Dynamic stroke
  FrequencyIcon,
  WiggleIcon,
  SmoothIcon,
  MiterAngleIcon,
} from "./stroke";

// Fill icons
export {
  // Fill types
  FillSolidIcon,
  FillGradientIcon,
  FillImageIcon,
  FillPatternIcon,
  FillVideoIcon,
  // Gradient types
  GradientLinearIcon,
  GradientRadialIcon,
  GradientAngularIcon,
  GradientDiamondIcon,
} from "./fill";

// Typography icons
export {
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  TextAlignTopIcon,
  TextAlignMiddleIcon,
  TextAlignBottomIcon,
} from "./typography";
