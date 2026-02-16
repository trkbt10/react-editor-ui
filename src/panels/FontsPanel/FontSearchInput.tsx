/**
 * @file Search input component for filtering fonts
 */

import type { CSSProperties } from "react";
import { Input } from "../../components/Input/Input";
import { SearchIcon } from "../../icons";
import { COLOR_BORDER, SPACE_MD } from "../../constants/styles";

export type FontSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

const containerStyle: CSSProperties = {
  padding: SPACE_MD,
  borderBottom: `1px solid ${COLOR_BORDER}`,
  flexShrink: 0,
};

/** Search input for filtering fonts by name */
export function FontSearchInput({ value, onChange }: FontSearchInputProps) {
  return (
    <div style={containerStyle}>
      <Input
        value={value}
        onChange={onChange}
        placeholder="Search fonts..."
        iconStart={<SearchIcon size="sm" />}
        clearable
        aria-label="Search fonts"
      />
    </div>
  );
}
