/**
 * @file DistributeObjectsSection component - Object distribution controls
 *
 * @description
 * Section for distributing objects horizontally and vertically. Uses action buttons
 * that trigger distribution operations.
 *
 * @example
 * ```tsx
 * import { DistributeObjectsSection } from "react-editor-ui/sections";
 *
 * <DistributeObjectsSection
 *   onDistributeHorizontal={(dist) => console.log("Distribute H:", dist)}
 *   onDistributeVertical={(dist) => console.log("Distribute V:", dist)}
 * />
 * ```
 */

import { memo, useCallback } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { FlexWrap, FlexGroup } from "../shared/SectionLayouts";
import { TooltipIconButton } from "../../components/TooltipIconButton/TooltipIconButton";
import {
  DistributeHorizontalStartIcon,
  DistributeHorizontalCenterIcon,
  DistributeHorizontalEndIcon,
  DistributeVerticalStartIcon,
  DistributeVerticalCenterIcon,
  DistributeVerticalEndIcon,
} from "../../icons";
import type { DistributeObjectsSectionProps } from "./types";

/**
 * Section for object distribution operations.
 */
export const DistributeObjectsSection = memo(function DistributeObjectsSection({
  onDistributeHorizontal,
  onDistributeVertical,
  disabled = false,
  size = "md",
  className,
}: DistributeObjectsSectionProps) {
  const handleDistributeLeft = useCallback(() => {
    onDistributeHorizontal("left");
  }, [onDistributeHorizontal]);

  const handleDistributeCenterH = useCallback(() => {
    onDistributeHorizontal("center");
  }, [onDistributeHorizontal]);

  const handleDistributeRight = useCallback(() => {
    onDistributeHorizontal("right");
  }, [onDistributeHorizontal]);

  const handleDistributeTop = useCallback(() => {
    onDistributeVertical("top");
  }, [onDistributeVertical]);

  const handleDistributeCenterV = useCallback(() => {
    onDistributeVertical("center");
  }, [onDistributeVertical]);

  const handleDistributeBottom = useCallback(() => {
    onDistributeVertical("bottom");
  }, [onDistributeVertical]);

  return (
    <SectionLayout title="Distribute Objects" className={className}>
      <FlexWrap>
        <FlexGroup>
          <TooltipIconButton
            icon={<DistributeHorizontalStartIcon />}
            tooltip="Distribute left edges"
            size={size}
            onClick={handleDistributeLeft}
            disabled={disabled}
          />
          <TooltipIconButton
            icon={<DistributeHorizontalCenterIcon />}
            tooltip="Distribute horizontal centers"
            size={size}
            onClick={handleDistributeCenterH}
            disabled={disabled}
          />
          <TooltipIconButton
            icon={<DistributeHorizontalEndIcon />}
            tooltip="Distribute right edges"
            size={size}
            onClick={handleDistributeRight}
            disabled={disabled}
          />
        </FlexGroup>
        <FlexGroup>
          <TooltipIconButton
            icon={<DistributeVerticalStartIcon />}
            tooltip="Distribute top edges"
            size={size}
            onClick={handleDistributeTop}
            disabled={disabled}
          />
          <TooltipIconButton
            icon={<DistributeVerticalCenterIcon />}
            tooltip="Distribute vertical centers"
            size={size}
            onClick={handleDistributeCenterV}
            disabled={disabled}
          />
          <TooltipIconButton
            icon={<DistributeVerticalEndIcon />}
            tooltip="Distribute bottom edges"
            size={size}
            onClick={handleDistributeBottom}
            disabled={disabled}
          />
        </FlexGroup>
      </FlexWrap>
    </SectionLayout>
  );
});
