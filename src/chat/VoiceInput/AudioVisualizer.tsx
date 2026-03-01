/**
 * @file AudioVisualizer component - Real-time audio waveform display
 *
 * @description
 * Displays audio levels as animated vertical bars using the Web Audio API.
 * Used by VoiceInput to provide visual feedback during speech recognition.
 */

import { memo, useEffect, useRef, useMemo, useCallback } from "react";
import type { CSSProperties } from "react";
import { COLOR_TEXT } from "../../themes/styles";

// =============================================================================
// Types
// =============================================================================

export type AudioVisualizerProps = {
  /** MediaStream from getUserMedia */
  stream: MediaStream | null;
  /** Whether the visualizer is active */
  isActive: boolean;
  /** Number of bars to display */
  barCount?: number;
  /** Width of each bar in pixels */
  barWidth?: number;
  /** Gap between bars in pixels */
  barGap?: number;
  /** Maximum height of bars in pixels */
  maxHeight?: number;
  /** Minimum height of bars in pixels */
  minHeight?: number;
  /** Bar color */
  color?: string;
  /** Custom class name */
  className?: string;
};

// =============================================================================
// Main Component
// =============================================================================

export const AudioVisualizer = memo(function AudioVisualizer({
  stream,
  isActive,
  barCount = 5,
  barWidth = 3,
  barGap = 2,
  maxHeight = 20,
  minHeight = 4,
  color = COLOR_TEXT,
  className,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const canvasWidth = barCount * barWidth + (barCount - 1) * barGap;
  const canvasHeight = maxHeight;

  // Draw the visualizer bars
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate bar heights from frequency data
    const step = Math.floor(dataArray.length / barCount);

    ctx.fillStyle = color;

    for (let i = 0; i < barCount; i++) {
      // Get average of frequency range for this bar
      const startIndex = i * step;
      const endIndex = startIndex + step;
      const slice = dataArray.slice(startIndex, endIndex);
      const average = slice.reduce((a, b) => a + b, 0) / slice.length;

      // Normalize to bar height
      const normalizedHeight = average / 255;
      const barHeight = Math.max(
        minHeight,
        Math.round(normalizedHeight * maxHeight),
      );

      // Calculate position (centered vertically)
      const x = i * (barWidth + barGap);
      const y = (canvasHeight - barHeight) / 2;

      // Draw rounded bar
      const radius = barWidth / 2;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, radius);
      ctx.fill();
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [barCount, barGap, barWidth, color, maxHeight, minHeight, canvasHeight]);

  // Draw idle state (minimal bars)
  const drawIdle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;

    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + barGap);
      const y = (canvasHeight - minHeight) / 2;

      const radius = barWidth / 2;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, minHeight, radius);
      ctx.fill();
    }
  }, [barCount, barGap, barWidth, color, minHeight, canvasHeight]);

  // Setup audio analyser when stream is available
  useEffect(() => {
    if (!stream || !isActive) {
      drawIdle();
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    // Start animation
    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
    };
  }, [stream, isActive, draw, drawIdle]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),
    [],
  );

  return (
    <div className={className} style={containerStyle}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ display: "block" }}
      />
    </div>
  );
});
