/**
 * @file TooltipIconButton component - IconButton with integrated Tooltip
 *
 * @description
 * Combines Tooltip and IconButton for consistent icon-only button UX.
 * The tooltip prop serves as both the tooltip content and aria-label.
 *
 * @example
 * ```tsx
 * import { TooltipIconButton } from "react-editor-ui/TooltipIconButton";
 * import { SettingsIcon } from "react-editor-ui/icons";
 *
 * <TooltipIconButton
 *   icon={<SettingsIcon />}
 *   tooltip="Settings"
 *   onClick={() => console.log("open settings")}
 * />
 * ```
 */

import { memo, forwardRef } from "react";
import type { ReactNode, MouseEvent, Ref } from "react";
import { Tooltip, type TooltipPlacement } from "../Tooltip/Tooltip";
import { IconButton } from "../IconButton/IconButton";

export type TooltipIconButtonProps = {
  /** Icon element to display */
  icon: ReactNode;
  /** Tooltip content and aria-label */
  tooltip: string;
  /** Click handler */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Button size */
  size?: "sm" | "md" | "lg" | "xl";
  /** Button variant */
  variant?: "default" | "ghost" | "filled" | "minimal" | "selected";
  /** Disabled state */
  disabled?: boolean;
  /** Active state (shows highlighted color) */
  active?: boolean;
  /** Tooltip placement */
  tooltipPlacement?: TooltipPlacement;
  /** Tooltip delay in ms */
  tooltipDelay?: number;
  /** Additional class name */
  className?: string;
};

/**
 * TooltipIconButton combines IconButton with Tooltip.
 * Use this for icon-only buttons that need contextual hints.
 */
export const TooltipIconButton = memo(
  forwardRef(function TooltipIconButton(
    {
      icon,
      tooltip,
      onClick,
      size = "md",
      variant = "default",
      disabled = false,
      active = false,
      tooltipPlacement = "bottom",
      tooltipDelay = 300,
      className,
    }: TooltipIconButtonProps,
    ref: Ref<HTMLButtonElement>,
  ) {
    return (
      <Tooltip
        content={tooltip}
        placement={tooltipPlacement}
        delay={tooltipDelay}
        disabled={disabled}
      >
        <IconButton
          ref={ref}
          icon={icon}
          aria-label={tooltip}
          size={size}
          variant={variant}
          disabled={disabled}
          active={active}
          onClick={onClick}
          className={className}
        />
      </Tooltip>
    );
  }),
);
