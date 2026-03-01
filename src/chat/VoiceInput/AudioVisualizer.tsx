/**
 * @file AudioVisualizer component - Real-time audio waveform display
 *
 * @description
 * Displays audio levels as animated vertical bars using the Web Audio API.
 * Used by VoiceInput to provide visual feedback during speech recognition.
 */

import { memo, useRef, useMemo, useCallback, useEffect } from "react";
import type { CSSProperties } from "react";
import { COLOR_TEXT } from "../../themes/styles";
import { useAnimationLoop } from "../../hooks/useAnimationLoop";

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

type BarDrawOptions = {
  barCount: number;
  barWidth: number;
  barGap: number;
  maxHeight: number;
  minHeight: number;
  color: string;
};

// =============================================================================
// Styles
// =============================================================================

const CONTAINER_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const CANVAS_STYLE: CSSProperties = {
  display: "block",
};

// =============================================================================
// Bar Drawing (internal)
// =============================================================================

function drawRoundedBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const radius = width / 2;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

function drawActiveBars(
  canvas: HTMLCanvasElement,
  frequencyData: Uint8Array<ArrayBuffer>,
  options: BarDrawOptions,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const { barCount, barWidth, barGap, maxHeight, minHeight, color } = options;
  const step = Math.floor(frequencyData.length / barCount);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;

  for (let i = 0; i < barCount; i++) {
    const startIndex = i * step;
    const slice = frequencyData.slice(startIndex, startIndex + step);
    const average = slice.reduce((a, b) => a + b, 0) / slice.length;
    const normalizedHeight = average / 255;
    const barHeight = Math.max(minHeight, Math.round(normalizedHeight * maxHeight));
    const x = i * (barWidth + barGap);
    const y = (maxHeight - barHeight) / 2;
    drawRoundedBar(ctx, x, y, barWidth, barHeight);
  }
}

function drawIdleBars(
  canvas: HTMLCanvasElement,
  options: BarDrawOptions & { canvasHeight: number },
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const { barCount, barWidth, barGap, minHeight, color, canvasHeight } = options;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;

  for (let i = 0; i < barCount; i++) {
    const x = i * (barWidth + barGap);
    const y = (canvasHeight - minHeight) / 2;
    drawRoundedBar(ctx, x, y, barWidth, minHeight);
  }
}

// =============================================================================
// Audio Analyser Hook (internal)
// =============================================================================

function useAudioAnalyser(
  stream: MediaStream | null,
  isActive: boolean,
): { getFrequencyData: () => Uint8Array<ArrayBuffer> | null } {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    if (!stream || !isActive) {
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
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    return () => {
      audioContext.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      dataArrayRef.current = null;
    };
  }, [stream, isActive]);

  const getFrequencyData = useCallback((): Uint8Array<ArrayBuffer> | null => {
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    if (!analyser || !dataArray) {
      return null;
    }
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }, []);

  return { getFrequencyData };
}

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

  const canvasWidth = barCount * barWidth + (barCount - 1) * barGap;

  const drawOptions = useMemo<BarDrawOptions>(
    () => ({ barCount, barWidth, barGap, maxHeight, minHeight, color }),
    [barCount, barWidth, barGap, maxHeight, minHeight, color],
  );

  const { getFrequencyData } = useAudioAnalyser(stream, isActive);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const frequencyData = getFrequencyData();
    if (!canvas || !frequencyData) {
      return;
    }
    drawActiveBars(canvas, frequencyData, drawOptions);
  }, [getFrequencyData, drawOptions]);

  useAnimationLoop(drawFrame, isActive && stream !== null);

  // Draw idle state when not active
  useEffect(() => {
    if (!isActive || !stream) {
      const canvas = canvasRef.current;
      if (canvas) {
        drawIdleBars(canvas, { ...drawOptions, canvasHeight: maxHeight });
      }
    }
  }, [isActive, stream, drawOptions, maxHeight]);

  return (
    <div className={className} style={CONTAINER_STYLE}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={maxHeight}
        style={CANVAS_STYLE}
      />
    </div>
  );
});
