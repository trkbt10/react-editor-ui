/**
 * @file Tooltip demo page
 */

import { DemoContainer, DemoSection, DemoRow, PlayIcon, PauseIcon } from "../../components";
import { Tooltip } from "../../../components/Tooltip/Tooltip";
import { IconButton } from "../../../components/IconButton/IconButton";
import { Button } from "../../../components/Button/Button";

export function TooltipDemo() {
  return (
    <DemoContainer title="Tooltip">
      <DemoSection label="Basic Tooltip">
        <DemoRow>
          <Tooltip content="Click to play">
            <IconButton icon={<PlayIcon />} aria-label="Play" />
          </Tooltip>
          <Tooltip content="Pause playback">
            <IconButton icon={<PauseIcon />} aria-label="Pause" />
          </Tooltip>
        </DemoRow>
      </DemoSection>

      <DemoSection label="Placement">
        <DemoRow>
          <Tooltip content="Top tooltip" placement="top">
            <Button size="sm">Top</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" placement="bottom">
            <Button size="sm">Bottom</Button>
          </Tooltip>
          <Tooltip content="Left tooltip" placement="left">
            <Button size="sm">Left</Button>
          </Tooltip>
          <Tooltip content="Right tooltip" placement="right">
            <Button size="sm">Right</Button>
          </Tooltip>
        </DemoRow>
      </DemoSection>

      <DemoSection label="Custom Delay">
        <DemoRow>
          <Tooltip content="Instant (0ms)" delay={0}>
            <Button size="sm">Instant</Button>
          </Tooltip>
          <Tooltip content="Default (300ms)" delay={300}>
            <Button size="sm">Default</Button>
          </Tooltip>
          <Tooltip content="Slow (800ms)" delay={800}>
            <Button size="sm">Slow</Button>
          </Tooltip>
        </DemoRow>
      </DemoSection>

      <DemoSection label="Disabled">
        <Tooltip content="This won't show" disabled>
          <Button size="sm">Disabled Tooltip</Button>
        </Tooltip>
      </DemoSection>

      <DemoSection label="Arrow Size">
        <DemoRow>
          <Tooltip content="Small arrow (4px)" arrowSize={4}>
            <Button size="sm">Small</Button>
          </Tooltip>
          <Tooltip content="Default arrow (6px)" arrowSize={6}>
            <Button size="sm">Default</Button>
          </Tooltip>
          <Tooltip content="Large arrow (10px)" arrowSize={10}>
            <Button size="sm">Large</Button>
          </Tooltip>
        </DemoRow>
      </DemoSection>
    </DemoContainer>
  );
}
