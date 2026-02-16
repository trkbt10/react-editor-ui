/**
 * @file Library entry point
 * Re-exports all public components and style constants
 *
 * Theme utilities are available via separate import:
 * import { injectTheme, ThemeSelector } from "react-editor-ui/themes"
 */

// Components - Direct imports (no barrel)
export { IconButton } from "./components/IconButton/IconButton";
export { Button } from "./components/Button/Button";
export { Input } from "./components/Input/Input";
export { Badge } from "./components/Badge/Badge";
export { Toolbar } from "./components/Toolbar/Toolbar";
export { ToolbarGroup } from "./components/Toolbar/ToolbarGroup";
export { ToolbarDivider } from "./components/Toolbar/ToolbarDivider";
export { PropertyRow } from "./components/PropertyRow/PropertyRow";
export { SectionHeader } from "./components/SectionHeader/SectionHeader";
export { TreeItem } from "./components/TreeItem/TreeItem";
export { Select } from "./components/Select/Select";
export { StatusBar } from "./components/StatusBar/StatusBar";
export { StatusBarItem } from "./components/StatusBar/StatusBarItem";
export { LogEntry } from "./components/LogEntry/LogEntry";

// Types - Direct imports (no barrel)
export type { IconButtonProps } from "./components/IconButton/IconButton";
export type { ButtonProps } from "./components/Button/Button";
export type { InputProps } from "./components/Input/Input";
export type { BadgeProps } from "./components/Badge/Badge";
export type { ToolbarProps } from "./components/Toolbar/Toolbar";
export type { ToolbarGroupProps } from "./components/Toolbar/ToolbarGroup";
export type { ToolbarDividerProps } from "./components/Toolbar/ToolbarDivider";
export type { PropertyRowProps } from "./components/PropertyRow/PropertyRow";
export type { SectionHeaderProps } from "./components/SectionHeader/SectionHeader";
export type { TreeItemProps } from "./components/TreeItem/TreeItem";
export type { SelectProps, SelectOption } from "./components/Select/Select";
export type { StatusBarProps } from "./components/StatusBar/StatusBar";
export type { StatusBarItemProps } from "./components/StatusBar/StatusBarItem";
export type { LogEntryProps } from "./components/LogEntry/LogEntry";

// Style constants
export { CSS_VAR_PREFIX } from "./constants/styles";
