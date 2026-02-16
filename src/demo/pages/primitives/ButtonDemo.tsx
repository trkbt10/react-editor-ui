/**
 * @file Button demo page
 */

import { DemoContainer, DemoSection, DemoRow, PlayIcon, SearchIcon } from "../../components";
import { Button } from "../../../components/Button/Button";

export function ButtonDemo() {
  return (
    <DemoContainer title="Button">
      <DemoSection label="Variants">
        <DemoRow>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </DemoRow>
      </DemoSection>

      <DemoSection label="Sizes">
        <DemoRow>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </DemoRow>
      </DemoSection>

      <DemoSection label="With Icons">
        <DemoRow>
          <Button iconStart={<PlayIcon />}>Play</Button>
          <Button iconEnd={<SearchIcon />}>Search</Button>
        </DemoRow>
      </DemoSection>

      <DemoSection label="Disabled">
        <DemoRow>
          <Button disabled>Disabled</Button>
          <Button variant="primary" disabled>Disabled Primary</Button>
        </DemoRow>
      </DemoSection>
    </DemoContainer>
  );
}
