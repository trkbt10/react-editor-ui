/**
 * @file CanvasRuler demo page
 */

import { useState, useCallback } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoMutedText,
} from "../../components";
import { Canvas } from "../../../canvas/Canvas/Canvas";
import {
  CanvasHorizontalRuler,
  CanvasVerticalRuler,
  CanvasRulerCorner,
} from "../../../canvas/CanvasRuler/CanvasRuler";
import { CanvasGridLayer } from "../../../canvas/CanvasGridLayer/CanvasGridLayer";
import { CanvasGuideLayer } from "../../../canvas/CanvasGuideLayer/CanvasGuideLayer";
import type { ViewportState, CanvasGuide } from "../../../canvas/core/types";

export function CanvasRulerDemo() {
  const [viewport, setViewport] = useState<ViewportState>({ x: -50, y: -50, scale: 1 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [guides, setGuides] = useState<CanvasGuide[]>([]);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / viewport.scale + viewport.x;
    const y = (e.clientY - rect.top) / viewport.scale + viewport.y;
    setMousePos({ x, y });
  };

  const handleAddGuide = useCallback((guide: CanvasGuide) => {
    setGuides((prev) => [...prev, guide]);
  }, []);

  const handleMoveGuide = useCallback((id: string, newPosition: number) => {
    setGuides((prev) =>
      prev.map((g) => (g.id === id && !g.locked ? { ...g, position: newPosition } : g)),
    );
  }, []);

  const handleDeleteGuide = useCallback((id: string) => {
    setGuides((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const handleToggleLock = useCallback((id: string) => {
    setGuides((prev) =>
      prev.map((g) => (g.id === id ? { ...g, locked: !g.locked } : g)),
    );
  }, []);

  return (
    <DemoContainer title="CanvasRuler">
      <DemoMutedText>
        Horizontal and vertical rulers for Canvas. Shows coordinate values with adaptive tick spacing.
      </DemoMutedText>

      <DemoSection label="Rulers with Canvas and Guides">
        <DemoMutedText>
          Pan/zoom the canvas to see rulers update. Double-click on rulers to add guides.
          Select a guide and press L to lock/unlock, Delete to remove.
        </DemoMutedText>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Horizontal ruler row */}
          <div style={{ display: "flex" }}>
            <CanvasRulerCorner size={20} />
            <CanvasHorizontalRuler
              viewport={viewport}
              width={500}
              indicatorPosition={mousePos?.x}
              onAddGuide={handleAddGuide}
            />
          </div>
          {/* Canvas row with vertical ruler */}
          <div style={{ display: "flex" }}>
            <CanvasVerticalRuler
              viewport={viewport}
              height={350}
              indicatorPosition={mousePos?.y}
              onAddGuide={handleAddGuide}
            />
            <div onMouseMove={handleMouseMove} onMouseLeave={() => setMousePos(null)}>
              <Canvas
                viewport={viewport}
                onViewportChange={setViewport}
                width={500}
                height={350}
                svgLayers={
                  <>
                    <CanvasGridLayer minorSize={10} majorSize={100} showOrigin />
                    <CanvasGuideLayer
                      guides={guides}
                      viewport={viewport}
                      selectedGuideId={selectedGuideId}
                      onSelectGuide={setSelectedGuideId}
                      onMoveGuide={handleMoveGuide}
                      onDeleteGuide={handleDeleteGuide}
                      onToggleLock={handleToggleLock}
                    />
                  </>
                }
              >
                <div
                  style={{
                    position: "absolute",
                    left: 100,
                    top: 100,
                    width: 150,
                    height: 100,
                    background: "var(--rei-color-primary)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  (100, 100)
                </div>
              </Canvas>
            </div>
          </div>
        </div>
        {guides.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--rei-color-text-muted)" }}>
            Guides: {guides.map((g) => `${g.orientation === "horizontal" ? "H" : "V"}:${g.position}${g.locked ? " 🔒" : ""}`).join(", ")}
          </div>
        )}
      </DemoSection>

      <DemoSection label="Horizontal Ruler Only">
        <CanvasHorizontalRuler viewport={viewport} width={400} />
      </DemoSection>

      <DemoSection label="Vertical Ruler Only">
        <div style={{ height: 200 }}>
          <CanvasVerticalRuler viewport={viewport} height={200} />
        </div>
      </DemoSection>

      <DemoSection label="Ruler Corner">
        <DemoMutedText>
          Corner piece that connects horizontal and vertical rulers.
        </DemoMutedText>
        <div style={{ display: "inline-flex", flexDirection: "column", border: "1px solid var(--rei-color-border)" }}>
          <div style={{ display: "flex" }}>
            <CanvasRulerCorner size={20} />
            <div style={{ width: 100, height: 20, background: "var(--rei-color-surface-raised)" }} />
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ width: 20, height: 60, background: "var(--rei-color-surface-raised)" }} />
            <div style={{ width: 100, height: 60 }} />
          </div>
        </div>
      </DemoSection>
    </DemoContainer>
  );
}
