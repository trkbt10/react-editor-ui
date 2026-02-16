/**
 * @file PropertyGrid demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoSurface,
  RotateIcon,
} from "../../components";
import { Input } from "../../../components/Input/Input";
import { PropertyGrid } from "../../../components/PropertyGrid/PropertyGrid";
import { PropertyGridItem } from "../../../components/PropertyGrid/PropertyGridItem";

export function PropertyGridDemo() {
  const [xValue, setXValue] = useState("0");
  const [yValue, setYValue] = useState("0");
  const [widthValue, setWidthValue] = useState("1920");
  const [heightValue, setHeightValue] = useState("1080");
  const [rotateValue, setRotateValue] = useState("0");

  return (
    <DemoContainer title="PropertyGrid">
      <DemoSection label="2 Column (Default)">
        <DemoSurface padding={8}>
          <PropertyGrid>
            <PropertyGridItem>
              <Input value={xValue} onChange={setXValue} prefix="X" aria-label="X position" />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value={yValue} onChange={setYValue} prefix="Y" aria-label="Y position" />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value={widthValue} onChange={setWidthValue} prefix="W" aria-label="Width" />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value={heightValue} onChange={setHeightValue} prefix="H" aria-label="Height" />
            </PropertyGridItem>
          </PropertyGrid>
        </DemoSurface>
      </DemoSection>

      <DemoSection label="Full Span Item">
        <DemoSurface padding={8}>
          <PropertyGrid>
            <PropertyGridItem span="full">
              <Input
                value={rotateValue}
                onChange={setRotateValue}
                prefix={<RotateIcon />}
                suffix="°"
                aria-label="Rotation"
              />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value="100" onChange={() => {}} suffix="%" aria-label="Scale X" />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value="100" onChange={() => {}} suffix="%" aria-label="Scale Y" />
            </PropertyGridItem>
          </PropertyGrid>
        </DemoSurface>
      </DemoSection>

      <DemoSection label="4 Columns">
        <DemoSurface padding={8}>
          <PropertyGrid columns={4}>
            <PropertyGridItem>
              <Input value="0" onChange={() => {}} prefix="T" aria-label="Top" />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value="0" onChange={() => {}} prefix="R" aria-label="Right" />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value="0" onChange={() => {}} prefix="B" aria-label="Bottom" />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value="0" onChange={() => {}} prefix="L" aria-label="Left" />
            </PropertyGridItem>
          </PropertyGrid>
        </DemoSurface>
      </DemoSection>
    </DemoContainer>
  );
}
