/**
 * @file StatusBar demo page
 */

import {
  demoContainerStyle,
  demoSectionStyle,
  demoLabelStyle,
} from "../../components";
import { StatusBar } from "../../../components/StatusBar/StatusBar";
import { StatusBarItem } from "../../../components/StatusBar/StatusBarItem";
import { Badge } from "../../../components/Badge/Badge";

export function StatusBarDemo() {
  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>StatusBar</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic StatusBar</div>
        <StatusBar>
          <StatusBarItem>Ln 42, Col 10</StatusBarItem>
          <StatusBarItem>Spaces: 2</StatusBarItem>
          <StatusBarItem>UTF-8</StatusBarItem>
          <StatusBarItem onClick={() => alert("LF clicked")}>LF</StatusBarItem>
        </StatusBar>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Badges</div>
        <StatusBar>
          <StatusBarItem>
            <Badge variant="error" size="sm">2</Badge>
            Errors
          </StatusBarItem>
          <StatusBarItem>
            <Badge variant="warning" size="sm">5</Badge>
            Warnings
          </StatusBarItem>
          <StatusBarItem>Ready</StatusBarItem>
        </StatusBar>
      </div>
    </div>
  );
}
