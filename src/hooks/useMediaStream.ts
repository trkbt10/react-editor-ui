/**
 * @file useMediaStream hook - Microphone stream management
 */

import { useState, useEffect, useCallback, useRef, useEffectEvent } from "react";

export type UseMediaStreamOptions = {
  /** Called when an error occurs */
  onError?: (error: string) => void;
  /** Whether to auto-start stream on mount */
  autoStart?: boolean;
};

export type UseMediaStreamResult = {
  /** The current MediaStream, or null if not available */
  stream: MediaStream | null;
  /** Whether the stream is loading */
  isLoading: boolean;
  /** Start the stream */
  start: () => Promise<void>;
  /** Stop the stream */
  stop: () => void;
};

/**
 * Manages microphone MediaStream lifecycle.
 *
 * @param options - Configuration options
 * @returns Stream state and controls
 */
export function useMediaStream(
  options: UseMediaStreamOptions = {},
): UseMediaStreamResult {
  const { onError, autoStart = true } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Keep ref in sync with state
  streamRef.current = stream;

  const handleError = useEffectEvent((error: string) => {
    onError?.(error);
  });

  const start = useCallback(async () => {
    if (streamRef.current) {
      return;
    }

    setIsLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = mediaStream;
      setStream(mediaStream);
    } catch {
      handleError("Microphone access denied");
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const stop = useCallback(() => {
    const currentStream = streamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  // Auto-start on mount if enabled
  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      // Cleanup on unmount using ref to get current value
      const currentStream = streamRef.current;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [autoStart, start]);

  return {
    stream,
    isLoading,
    start,
    stop,
  };
}
