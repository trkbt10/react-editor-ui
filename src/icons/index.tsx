/**
 * @file Centralized icon exports
 *
 * Standard icons use react-icons (Lucide).
 * Domain-specific icons (stroke caps, fill types, etc.) use custom SVGs.
 */

import type { FC, CSSProperties } from "react";
import {
  LuCheck,
  LuX,
  LuGrid3X3,
  LuLink,
  LuRefreshCw,
  LuUndo2,
  LuSearch,
  LuSettings,
  LuArrowLeftRight,
  LuClock,
  LuHourglass,
  LuChevronUp,
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuArrowLeft,
  LuArrowRight,
  LuEye,
  LuEyeOff,
  LuLock,
  LuLockOpen,
  LuGripVertical,
  LuFlipHorizontal2,
  LuFlipVertical2,
  LuRotateCw,
  LuAlignLeft,
  LuAlignCenter,
  LuAlignRight,
  LuAlignJustify,
  LuAlignVerticalJustifyStart,
  LuAlignVerticalJustifyCenter,
  LuAlignVerticalJustifyEnd,
  LuAlignHorizontalJustifyStart,
  LuAlignHorizontalJustifyCenter,
  LuAlignHorizontalJustifyEnd,
  // Distribute icons
  LuAlignHorizontalDistributeStart,
  LuAlignHorizontalDistributeCenter,
  LuAlignHorizontalDistributeEnd,
  LuAlignVerticalDistributeStart,
  LuAlignVerticalDistributeCenter,
  LuAlignVerticalDistributeEnd,
  LuAlignHorizontalSpaceBetween,
  LuAlignVerticalSpaceBetween,
  // List icons
  LuList,
  LuListOrdered,
  // Indent icons
  LuIndentIncrease,
  LuIndentDecrease,
  // Fill types
  LuImage,
  LuVideo,
  // Scale/stretch
  LuStretchVertical,
  LuStretchHorizontal,
  // Action icons
  LuPlus,
  LuMinus,
  LuEllipsis,
  // Text style icons
  LuCaseUpper,
  LuSuperscript,
  LuSubscript,
  LuUnderline,
  LuStrikethrough,
} from "react-icons/lu";

import {
  MdFormatColorFill,
  MdGradient,
  MdTexture,
  MdTextRotateUp,
} from "react-icons/md";

import {
  TbLayoutAlignTop,
  TbLayoutAlignMiddle,
  TbLayoutAlignBottom,
  TbAB2,
  TbWaveSine,
  TbWaveSquare,
  TbAngle,
  TbArtboard,
  TbCircleKey,
} from "react-icons/tb";

import { LuBaseline } from "react-icons/lu";
import { RiLetterSpacing2 } from "react-icons/ri";
import { BiSelection } from "react-icons/bi";

import { createIcon, type IconProps } from "./Icon";

// Re-export types
export type { IconProps, IconSize } from "./Icon";
export { createIcon } from "./Icon";

// ============================================================================
// Icon wrapper for react-icons (to match IconProps interface)
// ============================================================================
type LucideIcon = FC<{ size?: number | string; color?: string }>;

function wrapLucideIcon(Icon: LucideIcon, displayName: string): FC<IconProps> {
  const WrappedIcon: FC<IconProps> = ({
    size = "md",
    color = "currentColor",
    style,
    className,
    "aria-label": ariaLabel,
  }) => {
    const sizeMap = { sm: 12, md: 14, lg: 18 };
    const resolvedSize = typeof size === "number" ? size : sizeMap[size];
    const combinedStyle: CSSProperties = {
      display: "inline-flex",
      width: resolvedSize,
      height: resolvedSize,
      flexShrink: 0,
      ...style,
    };
    return (
      <span
        style={combinedStyle}
        className={className}
        aria-hidden={!ariaLabel}
        aria-label={ariaLabel}
      >
        <Icon size={resolvedSize} color={color} />
      </span>
    );
  };
  WrappedIcon.displayName = displayName;
  return WrappedIcon;
}

// ============================================================================
// Action icons (from react-icons/lu)
// ============================================================================
export const CheckIcon = wrapLucideIcon(LuCheck, "CheckIcon");
export const CloseIcon = wrapLucideIcon(LuX, "CloseIcon");
export const GridIcon = wrapLucideIcon(LuGrid3X3, "GridIcon");
export const LinkIcon = wrapLucideIcon(LuLink, "LinkIcon");
export const RefreshIcon = wrapLucideIcon(LuRefreshCw, "RefreshIcon");
export const ResetIcon = wrapLucideIcon(LuUndo2, "ResetIcon");
export const SearchIcon = wrapLucideIcon(LuSearch, "SearchIcon");
export const SettingsIcon = wrapLucideIcon(LuSettings, "SettingsIcon");
export const SwapIcon = wrapLucideIcon(LuArrowLeftRight, "SwapIcon");
export const PlusIcon = wrapLucideIcon(LuPlus, "PlusIcon");
export const MinusIcon = wrapLucideIcon(LuMinus, "MinusIcon");
export const EllipsisIcon = wrapLucideIcon(LuEllipsis, "EllipsisIcon");

// ============================================================================
// Animation icons (from react-icons/lu)
// ============================================================================
export const ClockIcon = wrapLucideIcon(LuClock, "ClockIcon");
export const HourglassIcon = wrapLucideIcon(LuHourglass, "HourglassIcon");

// ============================================================================
// Navigation icons (from react-icons/lu)
// ============================================================================
export const ChevronUpIcon = wrapLucideIcon(LuChevronUp, "ChevronUpIcon");
export const ChevronDownIcon = wrapLucideIcon(LuChevronDown, "ChevronDownIcon");
export const ChevronLeftIcon = wrapLucideIcon(LuChevronLeft, "ChevronLeftIcon");
export const ChevronRightIcon = wrapLucideIcon(LuChevronRight, "ChevronRightIcon");
export const ArrowLeftIcon = wrapLucideIcon(LuArrowLeft, "ArrowLeftIcon");
export const ArrowRightIcon = wrapLucideIcon(LuArrowRight, "ArrowRightIcon");

// ============================================================================
// Layer icons (from react-icons/lu)
// ============================================================================
export const EyeVisibleIcon = wrapLucideIcon(LuEye, "EyeVisibleIcon");
export const EyeHiddenIcon = wrapLucideIcon(LuEyeOff, "EyeHiddenIcon");
export const LockLockedIcon = wrapLucideIcon(LuLock, "LockLockedIcon");
export const LockUnlockedIcon = wrapLucideIcon(LuLockOpen, "LockUnlockedIcon");
export const DragHandleIcon = wrapLucideIcon(LuGripVertical, "DragHandleIcon");

// Stateful wrapper components
export type EyeIconProps = IconProps & { visible: boolean };
export const EyeIcon: FC<EyeIconProps> = ({ visible, ...props }) =>
  visible ? <EyeVisibleIcon {...props} /> : <EyeHiddenIcon {...props} />;

export type LockIconProps = IconProps & { locked: boolean };
export const LockIcon: FC<LockIconProps> = ({ locked, ...props }) =>
  locked ? <LockLockedIcon {...props} /> : <LockUnlockedIcon {...props} />;

// ============================================================================
// Transform icons (from react-icons/lu)
// ============================================================================
export const FlipHorizontalIcon = wrapLucideIcon(LuFlipHorizontal2, "FlipHorizontalIcon");
export const FlipVerticalIcon = wrapLucideIcon(LuFlipVertical2, "FlipVerticalIcon");
export const RotationIcon = wrapLucideIcon(LuRotateCw, "RotationIcon");

// ============================================================================
// Alignment icons (from react-icons/lu)
// ============================================================================
export const AlignLeftIcon = wrapLucideIcon(LuAlignHorizontalJustifyStart, "AlignLeftIcon");
export const AlignCenterHIcon = wrapLucideIcon(LuAlignHorizontalJustifyCenter, "AlignCenterHIcon");
export const AlignRightIcon = wrapLucideIcon(LuAlignHorizontalJustifyEnd, "AlignRightIcon");
export const AlignTopIcon = wrapLucideIcon(LuAlignVerticalJustifyStart, "AlignTopIcon");
export const AlignMiddleIcon = wrapLucideIcon(LuAlignVerticalJustifyCenter, "AlignMiddleIcon");
export const AlignBottomIcon = wrapLucideIcon(LuAlignVerticalJustifyEnd, "AlignBottomIcon");

// ============================================================================
// Typography alignment icons (from react-icons/lu)
// ============================================================================
export const TextAlignLeftIcon = wrapLucideIcon(LuAlignLeft, "TextAlignLeftIcon");
export const TextAlignCenterIcon = wrapLucideIcon(LuAlignCenter, "TextAlignCenterIcon");
export const TextAlignRightIcon = wrapLucideIcon(LuAlignRight, "TextAlignRightIcon");
export const TextAlignJustifyIcon = wrapLucideIcon(LuAlignJustify, "TextAlignJustifyIcon");

// ============================================================================
// Text style icons (from react-icons/lu)
// ============================================================================
export const CaseUpperIcon = wrapLucideIcon(LuCaseUpper, "CaseUpperIcon");
export const SuperscriptIcon = wrapLucideIcon(LuSuperscript, "SuperscriptIcon");
export const SubscriptIcon = wrapLucideIcon(LuSubscript, "SubscriptIcon");
export const UnderlineIcon = wrapLucideIcon(LuUnderline, "UnderlineIcon");
export const StrikethroughIcon = wrapLucideIcon(LuStrikethrough, "StrikethroughIcon");

// ============================================================================
// Distribute icons (from react-icons/lu)
// ============================================================================
export const DistributeHorizontalStartIcon = wrapLucideIcon(LuAlignHorizontalDistributeStart, "DistributeHorizontalStartIcon");
export const DistributeHorizontalCenterIcon = wrapLucideIcon(LuAlignHorizontalDistributeCenter, "DistributeHorizontalCenterIcon");
export const DistributeHorizontalEndIcon = wrapLucideIcon(LuAlignHorizontalDistributeEnd, "DistributeHorizontalEndIcon");
export const DistributeVerticalStartIcon = wrapLucideIcon(LuAlignVerticalDistributeStart, "DistributeVerticalStartIcon");
export const DistributeVerticalCenterIcon = wrapLucideIcon(LuAlignVerticalDistributeCenter, "DistributeVerticalCenterIcon");
export const DistributeVerticalEndIcon = wrapLucideIcon(LuAlignVerticalDistributeEnd, "DistributeVerticalEndIcon");
export const SpaceHorizontalIcon = wrapLucideIcon(LuAlignHorizontalSpaceBetween, "SpaceHorizontalIcon");
export const SpaceVerticalIcon = wrapLucideIcon(LuAlignVerticalSpaceBetween, "SpaceVerticalIcon");

// ============================================================================
// List icons (from react-icons/lu)
// ============================================================================
export const ListIcon = wrapLucideIcon(LuList, "ListIcon");
export const ListOrderedIcon = wrapLucideIcon(LuListOrdered, "ListOrderedIcon");

// ============================================================================
// Indent icons (from react-icons/lu)
// ============================================================================
export const IndentIncreaseIcon = wrapLucideIcon(LuIndentIncrease, "IndentIncreaseIcon");
export const IndentDecreaseIcon = wrapLucideIcon(LuIndentDecrease, "IndentDecreaseIcon");

// ============================================================================
// Fill type icons (from react-icons)
// ============================================================================
export const FillSolidIcon = wrapLucideIcon(MdFormatColorFill, "FillSolidIcon");
export const FillGradientIcon = wrapLucideIcon(MdGradient, "FillGradientIcon");
export const FillImageIcon = wrapLucideIcon(LuImage, "FillImageIcon");
export const FillPatternIcon = wrapLucideIcon(MdTexture, "FillPatternIcon");
export const FillVideoIcon = wrapLucideIcon(LuVideo, "FillVideoIcon");

// ============================================================================
// Domain-specific icons (custom SVGs) - Gradient types
// ============================================================================
import GradientLinearSvg from "./svg/fill/gradient-linear.svg?react";
import GradientRadialSvg from "./svg/fill/gradient-radial.svg?react";
import GradientAngularSvg from "./svg/fill/gradient-angular.svg?react";
import GradientDiamondSvg from "./svg/fill/gradient-diamond.svg?react";

export const GradientLinearIcon = createIcon(GradientLinearSvg, "GradientLinearIcon");
export const GradientRadialIcon = createIcon(GradientRadialSvg, "GradientRadialIcon");
export const GradientAngularIcon = createIcon(GradientAngularSvg, "GradientAngularIcon");
export const GradientDiamondIcon = createIcon(GradientDiamondSvg, "GradientDiamondIcon");

// ============================================================================
// Domain-specific icons (custom SVGs) - Stroke styles
// ============================================================================
import CapButtSvg from "./svg/stroke/cap-butt.svg?react";
import CapRoundSvg from "./svg/stroke/cap-round.svg?react";
import CapSquareSvg from "./svg/stroke/cap-square.svg?react";
import JoinMiterSvg from "./svg/stroke/join-miter.svg?react";
import JoinRoundSvg from "./svg/stroke/join-round.svg?react";
import JoinBevelSvg from "./svg/stroke/join-bevel.svg?react";
import StrokeAlignInsideSvg from "./svg/stroke/align-inside.svg?react";
import StrokeAlignCenterSvg from "./svg/stroke/align-center.svg?react";
import StrokeAlignOutsideSvg from "./svg/stroke/align-outside.svg?react";
import ArrowNoneSvg from "./svg/stroke/arrow-none.svg?react";
import ArrowTriangleSvg from "./svg/stroke/arrow-triangle.svg?react";
import ArrowOpenSvg from "./svg/stroke/arrow-open.svg?react";
import ArrowCircleSvg from "./svg/stroke/arrow-circle.svg?react";
import ArrowSquareSvg from "./svg/stroke/arrow-square.svg?react";
import ArrowDiamondSvg from "./svg/stroke/arrow-diamond.svg?react";
import ArrowBarSvg from "./svg/stroke/arrow-bar.svg?react";
import SmoothSvg from "./svg/stroke/smooth.svg?react";

export const CapButtIcon = createIcon(CapButtSvg, "CapButtIcon");
export const CapRoundIcon = createIcon(CapRoundSvg, "CapRoundIcon");
export const CapSquareIcon = createIcon(CapSquareSvg, "CapSquareIcon");
export const JoinMiterIcon = createIcon(JoinMiterSvg, "JoinMiterIcon");
export const JoinRoundIcon = createIcon(JoinRoundSvg, "JoinRoundIcon");
export const JoinBevelIcon = createIcon(JoinBevelSvg, "JoinBevelIcon");
export const StrokeAlignInsideIcon = createIcon(StrokeAlignInsideSvg, "StrokeAlignInsideIcon");
export const StrokeAlignCenterIcon = createIcon(StrokeAlignCenterSvg, "StrokeAlignCenterIcon");
export const StrokeAlignOutsideIcon = createIcon(StrokeAlignOutsideSvg, "StrokeAlignOutsideIcon");
export const ArrowNoneIcon = createIcon(ArrowNoneSvg, "ArrowNoneIcon");
export const ArrowTriangleIcon = createIcon(ArrowTriangleSvg, "ArrowTriangleIcon");
export const ArrowOpenIcon = createIcon(ArrowOpenSvg, "ArrowOpenIcon");
export const ArrowCircleIcon = createIcon(ArrowCircleSvg, "ArrowCircleIcon");
export const ArrowSquareIcon = createIcon(ArrowSquareSvg, "ArrowSquareIcon");
export const ArrowDiamondIcon = createIcon(ArrowDiamondSvg, "ArrowDiamondIcon");
export const ArrowBarIcon = createIcon(ArrowBarSvg, "ArrowBarIcon");
export const SmoothIcon = createIcon(SmoothSvg, "SmoothIcon");

// Dynamic stroke icons (from react-icons)
export const FrequencyIcon = wrapLucideIcon(TbWaveSine, "FrequencyIcon");
export const WiggleIcon = wrapLucideIcon(TbWaveSquare, "WiggleIcon");
export const MiterAngleIcon = wrapLucideIcon(TbAngle, "MiterAngleIcon");

// ============================================================================
// Domain-specific icons (custom SVGs) - Alignment & Distribute
// ============================================================================
import AlignStartSvg from "./svg/alignment/align-start.svg?react";
import AlignEndSvg from "./svg/alignment/align-end.svg?react";
import ConstraintToggleSvg from "./svg/alignment/constraint-toggle.svg?react";

export const AlignStartIcon = createIcon(AlignStartSvg, "AlignStartIcon");
export const AlignEndIcon = createIcon(AlignEndSvg, "AlignEndIcon");
export const ConstraintToggleIcon = createIcon(ConstraintToggleSvg, "ConstraintToggleIcon");

// ============================================================================
// Typography details icons (from react-icons)
// ============================================================================
export const TextAlignTopIcon = wrapLucideIcon(TbLayoutAlignTop, "TextAlignTopIcon");
export const TextAlignMiddleIcon = wrapLucideIcon(TbLayoutAlignMiddle, "TextAlignMiddleIcon");
export const TextAlignBottomIcon = wrapLucideIcon(TbLayoutAlignBottom, "TextAlignBottomIcon");
export const KerningIcon = wrapLucideIcon(TbAB2, "KerningIcon");
export const TrackingIcon = wrapLucideIcon(RiLetterSpacing2, "TrackingIcon");
export const BaselineShiftIcon = wrapLucideIcon(LuBaseline, "BaselineShiftIcon");

// Scale/Rotation icons (from react-icons)
export const ScaleVerticalIcon = wrapLucideIcon(LuStretchVertical, "ScaleVerticalIcon");
export const ScaleHorizontalIcon = wrapLucideIcon(LuStretchHorizontal, "ScaleHorizontalIcon");
export const TextRotationIcon = wrapLucideIcon(MdTextRotateUp, "TextRotationIcon");

// ============================================================================
// Distribute/Align-To icons (from react-icons)
// ============================================================================
export const AlignToSelectionIcon = wrapLucideIcon(BiSelection, "AlignToSelectionIcon");
export const AlignToKeyObjectIcon = wrapLucideIcon(TbCircleKey, "AlignToKeyObjectIcon");
export const AlignToArtboardIcon = wrapLucideIcon(TbArtboard, "AlignToArtboardIcon");

// ============================================================================
// Cursor icons (raw SVG strings for CSS cursor values)
// ============================================================================
export {
  rotationCursorSvg,
  createCursorFromSvg,
  ROTATION_CURSOR,
} from "./cursor";
