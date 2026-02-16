/**
 * @file StatusBar demo page
 */

import {
  DemoContainer,
  DemoSection,
} from "../../components";
import { StatusBar } from "../../../components/StatusBar/StatusBar";
import { StatusBarItem } from "../../../components/StatusBar/StatusBarItem";
import { Badge } from "../../../components/Badge/Badge";

export function StatusBarDemo() {
  return (
    <DemoContainer title="StatusBar">
      <DemoSection label="Basic StatusBar">
        <StatusBar>
          <StatusBarItem>Ln 42, Col 10</StatusBarItem>
          <StatusBarItem>Spaces: 2</StatusBarItem>
          <StatusBarItem>UTF-8</StatusBarItem>
          <StatusBarItem onClick={() => alert("LF clicked")}>LF</StatusBarItem>
        </StatusBar>
      </DemoSection>

      <DemoSection label="With Badges">
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
      </DemoSection>
    </DemoContainer>
  );
}
