/**
 * @file Badge demo page
 */

import { DemoContainer, DemoSection, DemoRow } from "../../components";
import { Badge } from "../../../components/Badge/Badge";

export function BadgeDemo() {
  return (
    <DemoContainer title="Badge">
      <DemoSection label="Variants">
        <DemoRow>
          <Badge>Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
        </DemoRow>
      </DemoSection>

      <DemoSection label="Sizes">
        <DemoRow>
          <Badge size="sm">Small</Badge>
          <Badge size="md">Medium</Badge>
        </DemoRow>
      </DemoSection>

      <DemoSection label="Numeric">
        <DemoRow>
          <Badge variant="error">3</Badge>
          <Badge variant="primary">42</Badge>
          <Badge variant="warning">99+</Badge>
        </DemoRow>
      </DemoSection>
    </DemoContainer>
  );
}
