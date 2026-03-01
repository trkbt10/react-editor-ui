/**
 * @file useSpeechRecognition hook - Web Speech API speech recognition
 */

import { useRef, useEffect, useCallback, useState, useEffectEvent } from "react";

// =============================================================================
// Types
// =============================================================================

type SpeechRecognitionEvent = {
  results: SpeechRecognitionResultList;
  resultIndex: number;
};

type SpeechRecognitionErrorEvent = {
  error: string;
  message?: string;
};

type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type WindowWithSpeechRecognition = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export type UseSpeechRecognitionOptions = {
  /** Called when recognition produces a result */
  onResult?: (transcript: string) => void;
  /** Called when an error occurs */
  onError?: (error: string) => void;
  /** Language for recognition (default: navigator.language) */
  lang?: string;
};

export type UseSpeechRecognitionResult = {
  /** Whether speech recognition is currently listening */
  isListening: boolean;
  /** Current transcript (interim or final) */
  transcript: string;
  /** Whether speech recognition is supported */
  isSupported: boolean;
  /** Start speech recognition */
  start: () => void;
  /** Stop speech recognition (triggers onResult if there's a transcript) */
  stop: () => void;
  /** Abort speech recognition (does not trigger onResult) */
  abort: () => void;
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Checks if Web Speech API is supported in the current environment.
 */
function checkSpeechRecognitionSupport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const win = window as WindowWithSpeechRecognition;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Manages Web Speech API speech recognition.
 *
 * @param options - Configuration options
 * @returns Speech recognition state and controls
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionResult {
  const { onResult, onError, lang } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupportedRef = useRef(checkSpeechRecognitionSupport());

  // Event handlers wrapped with useEffectEvent
  const handleRecognitionResult = useEffectEvent((event: SpeechRecognitionEvent) => {
    const results = Array.from(
      { length: event.results.length - event.resultIndex },
      (_, i) => {
        const result = event.results[event.resultIndex + i];
        return { isFinal: result.isFinal, transcript: result[0].transcript };
      },
    );

    const finalTranscript = results
      .filter((r) => r.isFinal)
      .map((r) => r.transcript)
      .join("");
    const interimTranscript = results
      .filter((r) => !r.isFinal)
      .map((r) => r.transcript)
      .join("");

    const newTranscript = finalTranscript || interimTranscript;
    setTranscript(newTranscript);

    if (finalTranscript) {
      onResult?.(finalTranscript);
    }
  });

  const handleRecognitionError = useEffectEvent((event: SpeechRecognitionErrorEvent) => {
    if (event.error !== "aborted") {
      onError?.(event.error);
    }
    setIsListening(false);
  });

  const handleRecognitionEnd = useEffectEvent(() => {
    setIsListening(false);
  });

  const handleRecognitionStart = useEffectEvent(() => {
    setIsListening(true);
  });

  // Report unsupported on mount
  useEffect(() => {
    if (!isSupportedRef.current) {
      onError?.("Speech recognition is not supported in this browser");
    }
  }, [onError]);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupportedRef.current) {
      return;
    }

    const win = window as WindowWithSpeechRecognition;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang || navigator.language || "en-US";

    recognition.onresult = handleRecognitionResult;
    recognition.onerror = handleRecognitionError;
    recognition.onend = handleRecognitionEnd;
    recognition.onstart = handleRecognitionStart;

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [
    lang,
    handleRecognitionResult,
    handleRecognitionError,
    handleRecognitionEnd,
    handleRecognitionStart,
  ]);

  const start = useCallback(() => {
    setTranscript("");
    recognitionRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const abort = useCallback(() => {
    recognitionRef.current?.abort();
    setTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    isSupported: isSupportedRef.current,
    start,
    stop,
    abort,
  };
}
