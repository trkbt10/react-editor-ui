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
  /** MediaStream from getUserMedia (ignored when mockMode is true) */
  stream?: MediaStream | null;
  /** Whether the visualizer is active */
  isActive: boolean;
  /** Use mock oscillator instead of real microphone */
  mockMode?: boolean;
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
  stream: MediaStream | null | undefined,
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
// Mock Oscillator Hook (internal)
// =============================================================================

function useMockOscillator(
  isActive: boolean,
): { getFrequencyData: () => Uint8Array<ArrayBuffer> | null } {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5; // Less smoothing for snappier response

    const nodes: AudioNode[] = [];

    // Create a rich, dynamic sound with multiple layers
    const oscillatorConfigs = [
      // Low frequencies - strong base
      { freq: 80, type: "sine" as OscillatorType, gain: 0.4 },
      { freq: 120, type: "sine" as OscillatorType, gain: 0.35 },
      // Mid frequencies - body
      { freq: 200, type: "triangle" as OscillatorType, gain: 0.3 },
      { freq: 300, type: "sine" as OscillatorType, gain: 0.25 },
      { freq: 400, type: "triangle" as OscillatorType, gain: 0.2 },
      // Higher frequencies - brightness
      { freq: 600, type: "sine" as OscillatorType, gain: 0.15 },
      { freq: 800, type: "sine" as OscillatorType, gain: 0.1 },
    ];

    oscillatorConfigs.forEach(({ freq, type, gain: baseGain }, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // LFO for amplitude modulation - creates pulsing effect
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

      // Each oscillator has different LFO rate for organic feel
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(1.5 + i * 0.3 + Math.random() * 0.5, audioContext.currentTime);

      // LFO modulates between 0.3x and 1.0x of base gain
      lfoGain.gain.setValueAtTime(baseGain * 0.35, audioContext.currentTime);
      gainNode.gain.setValueAtTime(baseGain * 0.65, audioContext.currentTime);

      // Connect LFO to gain modulation
      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);

      oscillator.connect(gainNode);
      gainNode.connect(analyser);

      oscillator.start();
      lfo.start();

      nodes.push(oscillator, lfo, gainNode, lfoGain);
    });

    // Add noise for texture (simulates breath/ambient sound)
    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(400, audioContext.currentTime);

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.08, audioContext.currentTime);

    // Modulate noise gain for breathing effect
    const noiseLfo = audioContext.createOscillator();
    const noiseLfoGain = audioContext.createGain();
    noiseLfo.type = "sine";
    noiseLfo.frequency.setValueAtTime(0.8, audioContext.currentTime);
    noiseLfoGain.gain.setValueAtTime(0.05, audioContext.currentTime);

    noiseLfo.connect(noiseLfoGain);
    noiseLfoGain.connect(noiseGain.gain);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(analyser);

    noiseSource.start();
    noiseLfo.start();

    nodes.push(noiseSource, noiseLfo, noiseFilter, noiseGain, noiseLfoGain);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    nodesRef.current = nodes;

    return () => {
      nodes.forEach((node) => {
        if ("stop" in node && typeof node.stop === "function") {
          (node as OscillatorNode | AudioBufferSourceNode).stop();
        }
      });
      audioContext.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      dataArrayRef.current = null;
      nodesRef.current = [];
    };
  }, [isActive]);

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
  mockMode = false,
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

  // Use mock oscillator in mock mode, otherwise use real stream
  const realAnalyser = useAudioAnalyser(mockMode ? null : stream, isActive && !mockMode);
  const mockAnalyser = useMockOscillator(isActive && mockMode);

  // Select frequency data source based on mode
  const getFrequencyData = mockMode ? mockAnalyser.getFrequencyData : realAnalyser.getFrequencyData;

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const frequencyData = getFrequencyData();
    if (!canvas || !frequencyData) {
      return;
    }
    drawActiveBars(canvas, frequencyData, drawOptions);
  }, [getFrequencyData, drawOptions]);

  const shouldAnimate = mockMode ? isActive : isActive && stream != null;
  useAnimationLoop(drawFrame, shouldAnimate);

  // Draw idle state when not active
  useEffect(() => {
    if (!shouldAnimate) {
      const canvas = canvasRef.current;
      if (canvas) {
        drawIdleBars(canvas, { ...drawOptions, canvasHeight: maxHeight });
      }
    }
  }, [shouldAnimate, drawOptions, maxHeight]);

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
