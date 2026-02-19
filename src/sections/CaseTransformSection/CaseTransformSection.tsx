/**
 * @file CaseTransformSection component - Text case and style controls
 *
 * @description
 * Section for controlling text case transformation and text styles
 * (superscript, subscript, underline, strikethrough).
 *
 * @example
 * ```tsx
 * import { CaseTransformSection } from "react-editor-ui/sections";
 *
 * const [data, setData] = useState({
 *   case: "normal" as const,
 *   styles: [],
 * });
 *
 * <CaseTransformSection data={data} onChange={setData} />
 * ```
 */

import { memo, useCallback } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { FlexWrap } from "../shared/SectionLayouts";
import {
  CaseTransformSelect,
  TextStyleSelect,
  type CaseTransform,
  type TextStyle,
} from "../../components/CaseTransformSelect/CaseTransformSelect";
import type { CaseTransformSectionProps } from "./types";

/**
 * Section for text case and style controls.
 */
export const CaseTransformSection = memo(function CaseTransformSection({
  data,
  onChange,
  disabled = false,
  size = "md",
  className,
}: CaseTransformSectionProps) {
  const handleCaseChange = useCallback(
    (caseTransform: CaseTransform) => {
      onChange({ ...data, case: caseTransform });
    },
    [data, onChange],
  );

  const handleStylesChange = useCallback(
    (styles: TextStyle[]) => {
      onChange({ ...data, styles });
    },
    [data, onChange],
  );

  return (
    <SectionLayout title="Case & Style" className={className}>
      <FlexWrap>
        <CaseTransformSelect
          value={data.case}
          onChange={handleCaseChange}
          disabled={disabled}
          size={size}
        />
        <TextStyleSelect
          value={data.styles}
          onChange={handleStylesChange}
          disabled={disabled}
          size={size}
        />
      </FlexWrap>
    </SectionLayout>
  );
});
