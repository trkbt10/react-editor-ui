/**
 * @file ListSection component - List style controls
 *
 * @description
 * Section for controlling list type (none, bulleted, numbered) and
 * list style options.
 *
 * @example
 * ```tsx
 * import { ListSection } from "react-editor-ui/sections";
 *
 * const [data, setData] = useState({ type: "none" as const, style: "" });
 *
 * <ListSection data={data} onChange={setData} />
 * ```
 */

import { memo, useCallback, useMemo } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { FlexColumn } from "../shared/SectionLayouts";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl";
import { Select, type SelectOption } from "../../components/Select/Select";
import { ListIcon, ListOrderedIcon } from "../../icons";
import type { ListSectionProps, ListType, BulletedListStyle, NumberedListStyle } from "./types";

const typeOptions = [
  { value: "none" as const, label: "None", "aria-label": "No list" },
  { value: "bulleted" as const, icon: <ListIcon />, "aria-label": "Bulleted list" },
  { value: "numbered" as const, icon: <ListOrderedIcon />, "aria-label": "Numbered list" },
];

const bulletedStyleOptions: SelectOption<BulletedListStyle>[] = [
  { value: "disc", label: "Disc (•)" },
  { value: "circle", label: "Circle (○)" },
  { value: "square", label: "Square (■)" },
];

const numberedStyleOptions: SelectOption<NumberedListStyle>[] = [
  { value: "decimal", label: "1, 2, 3..." },
  { value: "lower-alpha", label: "a, b, c..." },
  { value: "upper-alpha", label: "A, B, C..." },
  { value: "lower-roman", label: "i, ii, iii..." },
  { value: "upper-roman", label: "I, II, III..." },
];

/**
 * Section for list style controls.
 */
export const ListSection = memo(function ListSection({
  data,
  onChange,
  disabled = false,
  size = "md",
  className,
}: ListSectionProps) {
  const handleTypeChange = useCallback(
    (type: ListType) => {
      const defaultStyle = type === "bulleted" ? "disc" : type === "numbered" ? "decimal" : "";
      onChange({ type, style: defaultStyle });
    },
    [onChange],
  );

  const handleStyleChange = useCallback(
    (style: string) => {
      onChange({ ...data, style: style as BulletedListStyle | NumberedListStyle });
    },
    [data, onChange],
  );

  const styleOptions = useMemo(() => {
    if (data.type === "bulleted") {
      return bulletedStyleOptions;
    }
    if (data.type === "numbered") {
      return numberedStyleOptions;
    }
    return [];
  }, [data.type]);

  const showStyleSelect = data.type !== "none";

  return (
    <SectionLayout title="List" className={className}>
      <FlexColumn>
        <SegmentedControl
          options={typeOptions}
          value={data.type}
          onChange={(v) => handleTypeChange(v as ListType)}
          size={size}
          disabled={disabled}
          aria-label="List type"
        />
        {showStyleSelect && (
          <Select
            options={styleOptions}
            value={data.style}
            onChange={handleStyleChange}
            disabled={disabled}
            aria-label="List style"
          />
        )}
      </FlexColumn>
    </SectionLayout>
  );
});
