/**
 * @file TransformButtons demo page
 */

import {
  LuRotateCw,
  LuRotateCcw,
  LuFlipHorizontal,
  LuFlipVertical,
  LuAlignStartVertical,
  LuAlignCenterVertical,
  LuAlignEndVertical,
  LuAlignStartHorizontal,
  LuAlignCenterHorizontal,
  LuAlignEndHorizontal,
} from "react-icons/lu";
import {
  DemoContainer,
  DemoSection,
  DemoSurface,
  DemoVerticalStack,
} from "../../components";
import { TransformButtons } from "../../../components/TransformButtons/TransformButtons";

export function TransformButtonsDemo() {
  const handleAction = (actionId: string) => {
    console.log("Transform action:", actionId);
  };

  const fullGroups = [
    {
      id: "rotate",
      actions: [
        { id: "rotate-cw", icon: <LuRotateCw size={14} />, label: "Rotate 90° right" },
        { id: "rotate-ccw", icon: <LuRotateCcw size={14} />, label: "Rotate 90° left" },
      ],
    },
    {
      id: "flip",
      actions: [
        { id: "flip-h", icon: <LuFlipHorizontal size={14} />, label: "Flip horizontal" },
        { id: "flip-v", icon: <LuFlipVertical size={14} />, label: "Flip vertical" },
      ],
    },
    {
      id: "align",
      actions: [
        { id: "align-left", icon: <LuAlignStartVertical size={14} />, label: "Align left" },
        { id: "align-center-h", icon: <LuAlignCenterVertical size={14} />, label: "Align center" },
        { id: "align-right", icon: <LuAlignEndVertical size={14} />, label: "Align right" },
        { id: "align-top", icon: <LuAlignStartHorizontal size={14} />, label: "Align top" },
        { id: "align-center-v", icon: <LuAlignCenterHorizontal size={14} />, label: "Align middle" },
        { id: "align-bottom", icon: <LuAlignEndHorizontal size={14} />, label: "Align bottom" },
      ],
    },
  ];

  return (
    <DemoContainer title="TransformButtons">
      <DemoSection label="Full Transform Toolbar (react-icons)">
        <DemoSurface padding={8}>
          <TransformButtons groups={fullGroups} onAction={handleAction} />
        </DemoSurface>
      </DemoSection>

      <DemoSection label="Rotate Only">
        <DemoSurface padding={8}>
          <TransformButtons
            groups={[
              {
                id: "rotate",
                actions: [
                  { id: "rotate-cw", icon: <LuRotateCw size={14} />, label: "Rotate 90° right" },
                  { id: "rotate-ccw", icon: <LuRotateCcw size={14} />, label: "Rotate 90° left" },
                ],
              },
            ]}
            onAction={handleAction}
          />
        </DemoSurface>
      </DemoSection>

      <DemoSection label="Flip Only">
        <DemoSurface padding={8}>
          <TransformButtons
            groups={[
              {
                id: "flip",
                actions: [
                  { id: "flip-h", icon: <LuFlipHorizontal size={14} />, label: "Flip horizontal" },
                  { id: "flip-v", icon: <LuFlipVertical size={14} />, label: "Flip vertical" },
                ],
              },
            ]}
            onAction={handleAction}
          />
        </DemoSurface>
      </DemoSection>

      <DemoSection label="Custom Actions">
        <DemoSurface padding={8}>
          <TransformButtons
            groups={[
              {
                id: "custom",
                actions: [
                  { id: "rotate-45", icon: <LuRotateCw size={14} />, label: "Rotate 45°" },
                  { id: "rotate-180", icon: <LuRotateCw size={14} />, label: "Rotate 180°" },
                ],
              },
              {
                id: "scale",
                actions: [
                  { id: "scale-up", icon: <span style={{ fontSize: 12 }}>+</span>, label: "Scale up" },
                  { id: "scale-down", icon: <span style={{ fontSize: 12 }}>-</span>, label: "Scale down" },
                ],
              },
            ]}
            onAction={handleAction}
          />
        </DemoSurface>
      </DemoSection>

      <DemoSection label="Different Sizes">
        <DemoVerticalStack gap={8}>
          <DemoSurface padding={8}>
            <TransformButtons
              groups={[
                {
                  id: "tools",
                  actions: [
                    { id: "rotate", icon: <LuRotateCw size={12} />, label: "Rotate" },
                    { id: "flip", icon: <LuFlipHorizontal size={12} />, label: "Flip" },
                  ],
                },
              ]}
              onAction={handleAction}
              size="sm"
            />
          </DemoSurface>
          <DemoSurface padding={8}>
            <TransformButtons
              groups={[
                {
                  id: "tools",
                  actions: [
                    { id: "rotate", icon: <LuRotateCw size={14} />, label: "Rotate" },
                    { id: "flip", icon: <LuFlipHorizontal size={14} />, label: "Flip" },
                  ],
                },
              ]}
              onAction={handleAction}
              size="md"
            />
          </DemoSurface>
          <DemoSurface padding={8}>
            <TransformButtons
              groups={[
                {
                  id: "tools",
                  actions: [
                    { id: "rotate", icon: <LuRotateCw size={18} />, label: "Rotate" },
                    { id: "flip", icon: <LuFlipHorizontal size={18} />, label: "Flip" },
                  ],
                },
              ]}
              onAction={handleAction}
              size="lg"
            />
          </DemoSurface>
        </DemoVerticalStack>
      </DemoSection>

      <DemoSection label="With Disabled Action">
        <DemoSurface padding={8}>
          <TransformButtons
            groups={[
              {
                id: "tools",
                actions: [
                  { id: "rotate", icon: <LuRotateCw size={14} />, label: "Rotate (enabled)" },
                  { id: "flip", icon: <LuFlipHorizontal size={14} />, label: "Flip (disabled)", disabled: true },
                ],
              },
            ]}
            onAction={handleAction}
          />
        </DemoSurface>
      </DemoSection>

      <DemoSection label="All Disabled">
        <DemoSurface padding={8}>
          <TransformButtons
            groups={[
              {
                id: "tools",
                actions: [
                  { id: "rotate", icon: <LuRotateCw size={14} />, label: "Rotate" },
                  { id: "flip", icon: <LuFlipHorizontal size={14} />, label: "Flip" },
                ],
              },
            ]}
            onAction={handleAction}
            disabled
          />
        </DemoSurface>
      </DemoSection>
    </DemoContainer>
  );
}
