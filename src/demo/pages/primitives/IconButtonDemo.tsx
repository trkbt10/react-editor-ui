/**
 * @file IconButton demo page
 */

import { DemoContainer, DemoSection, DemoRow, PlayIcon, PauseIcon } from "../../components";
import { IconButton } from "../../../components/IconButton/IconButton";

export function IconButtonDemo() {
  return (
    <DemoContainer title="IconButton">
      <DemoSection label="Sizes">
        <DemoRow>
          <IconButton icon={<PlayIcon />} aria-label="Play" size="sm" />
          <IconButton icon={<PlayIcon />} aria-label="Play" size="md" />
          <IconButton icon={<PlayIcon />} aria-label="Play" size="lg" />
          <IconButton icon={<PlayIcon />} aria-label="Play" size="xl" />
        </DemoRow>
      </DemoSection>

      <DemoSection label="Variants">
        <DemoRow>
          <IconButton icon={<PlayIcon />} aria-label="Play" variant="default" />
          <IconButton icon={<PlayIcon />} aria-label="Play" variant="ghost" />
          <IconButton icon={<PlayIcon />} aria-label="Play" variant="filled" />
          <IconButton icon={<PlayIcon />} aria-label="Play" variant="minimal" />
        </DemoRow>
      </DemoSection>

      <DemoSection label="States">
        <DemoRow>
          <IconButton icon={<PlayIcon />} aria-label="Play" />
          <IconButton icon={<PauseIcon />} aria-label="Pause" active />
          <IconButton icon={<PlayIcon />} aria-label="Play" disabled />
        </DemoRow>
      </DemoSection>
    </DemoContainer>
  );
}
