/**
 * @file AlignObjectsSection component - Object alignment controls
 *
 * @description
 * Section for aligning objects horizontally and vertically. Uses action buttons
 * that trigger alignment operations rather than maintaining state.
 *
 * @example
 * ```tsx
 * import { AlignObjectsSection } from "react-editor-ui/sections";
 *
 * <AlignObjectsSection
 *   onAlignHorizontal={(align) => console.log("Align H:", align)}
 *   onAlignVertical={(align) => console.log("Align V:", align)}
 * />
 * ```
 */

import { memo, useCallback } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { FlexWrap, FlexGroup } from "../shared/SectionLayouts";
import { TooltipIconButton } from "../../components/TooltipIconButton/TooltipIconButton";
import {
  AlignLeftIcon,
  AlignCenterHIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignMiddleIcon,
  AlignBottomIcon,
} from "../../icons";
import type { AlignObjectsSectionProps } from "./types";

/**
 * Section for object alignment operations.
 */
export const AlignObjectsSection = memo(function AlignObjectsSection({
  onAlignHorizontal,
  onAlignVertical,
  disabled = false,
  size = "md",
  className,
}: AlignObjectsSectionProps) {
  const handleAlignLeft = useCallback(() => {
    onAlignHorizontal("left");
  }, [onAlignHorizontal]);

  const handleAlignCenterH = useCallback(() => {
    onAlignHorizontal("center");
  }, [onAlignHorizontal]);

  const handleAlignRight = useCallback(() => {
    onAlignHorizontal("right");
  }, [onAlignHorizontal]);

  const handleAlignTop = useCallback(() => {
    onAlignVertical("top");
  }, [onAlignVertical]);

  const handleAlignMiddle = useCallback(() => {
    onAlignVertical("middle");
  }, [onAlignVertical]);

  const handleAlignBottom = useCallback(() => {
    onAlignVertical("bottom");
  }, [onAlignVertical]);

  return (
    <SectionLayout title="Align Objects" className={className}>
      <FlexWrap>
        <FlexGroup>
          <TooltipIconButton
            icon={<AlignLeftIcon />}
            tooltip="Align left"
            size={size}
            onClick={handleAlignLeft}
            disabled={disabled}
          />
          <TooltipIconButton
            icon={<AlignCenterHIcon />}
            tooltip="Align center horizontally"
            size={size}
            onClick={handleAlignCenterH}
            disabled={disabled}
          />
          <TooltipIconButton
            icon={<AlignRightIcon />}
            tooltip="Align right"
            size={size}
            onClick={handleAlignRight}
            disabled={disabled}
          />
        </FlexGroup>
        <FlexGroup>
          <TooltipIconButton
            icon={<AlignTopIcon />}
            tooltip="Align top"
            size={size}
            onClick={handleAlignTop}
            disabled={disabled}
          />
          <TooltipIconButton
            icon={<AlignMiddleIcon />}
            tooltip="Align center vertically"
            size={size}
            onClick={handleAlignMiddle}
            disabled={disabled}
          />
          <TooltipIconButton
            icon={<AlignBottomIcon />}
            tooltip="Align bottom"
            size={size}
            onClick={handleAlignBottom}
            disabled={disabled}
          />
        </FlexGroup>
      </FlexWrap>
    </SectionLayout>
  );
});
