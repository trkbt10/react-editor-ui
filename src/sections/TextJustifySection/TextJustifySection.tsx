/**
 * @file TextJustifySection component - Text justification controls
 *
 * @description
 * Section for controlling text justification with options for left, center,
 * right, and various justify modes.
 *
 * @example
 * ```tsx
 * import { TextJustifySection } from "react-editor-ui/sections";
 *
 * const [data, setData] = useState({ align: "left" as const });
 *
 * <TextJustifySection data={data} onChange={setData} />
 * ```
 */

import { memo, useCallback } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import {
  TextJustifySelect,
  type TextJustify,
} from "../../components/TextJustifySelect/TextJustifySelect";
import type { TextJustifySectionProps } from "./types";

/**
 * Section for text justification controls.
 */
export const TextJustifySection = memo(function TextJustifySection({
  data,
  onChange,
  extended = false,
  disabled = false,
  size = "md",
  className,
}: TextJustifySectionProps) {
  const handleAlignChange = useCallback(
    (align: TextJustify) => {
      onChange({ ...data, align });
    },
    [data, onChange],
  );

  return (
    <SectionLayout title="Text Alignment" className={className}>
      <TextJustifySelect
        value={data.align}
        onChange={handleAlignChange}
        extended={extended}
        disabled={disabled}
        size={size}
        fullWidth
      />
    </SectionLayout>
  );
});
