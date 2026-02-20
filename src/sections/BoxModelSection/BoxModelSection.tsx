/**
 * @file BoxModelSection component - Section wrapper for BoxModelEditor
 */

import { memo } from "react";
import type { CSSProperties } from "react";
import { BoxModelEditor } from "../../components/BoxModelEditor/BoxModelEditor";
import { SPACE_MD } from "../../themes/styles";
import type { BoxModelSectionProps } from "./types";

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_MD,
};

/**
 * Section wrapper for BoxModelEditor with optional controls.
 */
export const BoxModelSection = memo(function BoxModelSection({
  data,
  onChange,
  displayMode = "proportional",
  editable,
  showMargin = true,
  showRadius = true,
  className,
}: BoxModelSectionProps) {
  return (
    <div className={className} style={containerStyle}>
      <BoxModelEditor
        value={data}
        onChange={onChange}
        displayMode={displayMode}
        editable={editable}
        showMargin={showMargin}
        showRadius={showRadius}
      />
    </div>
  );
});
