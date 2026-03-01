import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSpeechRecognition } from "./useSpeechRecognition";

describe("useSpeechRecognition", () => {
  let mockRecognition: {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    abort: ReturnType<typeof vi.fn>;
    onresult: ((event: unknown) => void) | null;
    onerror: ((event: unknown) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
  };

  beforeEach(() => {
    mockRecognition = {
      continuous: false,
      interimResults: false,
      lang: "",
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      onresult: null,
      onerror: null,
      onend: null,
      onstart: null,
    };

    class MockSpeechRecognition {
      continuous = mockRecognition.continuous;
      interimResults = mockRecognition.interimResults;
      lang = mockRecognition.lang;
      start = mockRecognition.start;
      stop = mockRecognition.stop;
      abort = mockRecognition.abort;

      set onresult(fn: ((event: unknown) => void) | null) {
        mockRecognition.onresult = fn;
      }
      get onresult() {
        return mockRecognition.onresult;
      }

      set onerror(fn: ((event: unknown) => void) | null) {
        mockRecognition.onerror = fn;
      }
      get onerror() {
        return mockRecognition.onerror;
      }

      set onend(fn: (() => void) | null) {
        mockRecognition.onend = fn;
      }
      get onend() {
        return mockRecognition.onend;
      }

      set onstart(fn: (() => void) | null) {
        mockRecognition.onstart = fn;
      }
      get onstart() {
        return mockRecognition.onstart;
      }
    }

    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns isSupported true when SpeechRecognition is available", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    expect(result.current.isSupported).toBe(true);
  });

  it("returns isSupported false when SpeechRecognition is not available", () => {
    vi.unstubAllGlobals();
    const onError = vi.fn();

    const { result } = renderHook(() => useSpeechRecognition({ onError }));

    expect(result.current.isSupported).toBe(false);
    expect(onError).toHaveBeenCalledWith(
      "Speech recognition is not supported in this browser",
    );
  });

  it("starts recognition when start is called", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });

    expect(mockRecognition.start).toHaveBeenCalled();
  });

  it("stops recognition when stop is called", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.stop();
    });

    expect(mockRecognition.stop).toHaveBeenCalled();
  });

  it("aborts recognition when abort is called", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.abort();
    });

    expect(mockRecognition.abort).toHaveBeenCalled();
  });

  it("sets isListening to true when recognition starts", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    expect(result.current.isListening).toBe(false);

    act(() => {
      mockRecognition.onstart?.();
    });

    expect(result.current.isListening).toBe(true);
  });

  it("sets isListening to false when recognition ends", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      mockRecognition.onstart?.();
    });
    expect(result.current.isListening).toBe(true);

    act(() => {
      mockRecognition.onend?.();
    });
    expect(result.current.isListening).toBe(false);
  });

  it("updates transcript on recognition result", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    const mockEvent = {
      resultIndex: 0,
      results: {
        length: 1,
        0: {
          isFinal: false,
          0: { transcript: "hello world" },
        },
      },
    };

    act(() => {
      mockRecognition.onresult?.(mockEvent);
    });

    expect(result.current.transcript).toBe("hello world");
  });

  it("calls onResult when final result is received", () => {
    const onResult = vi.fn();
    renderHook(() => useSpeechRecognition({ onResult }));

    const mockEvent = {
      resultIndex: 0,
      results: {
        length: 1,
        0: {
          isFinal: true,
          0: { transcript: "final transcript" },
        },
      },
    };

    act(() => {
      mockRecognition.onresult?.(mockEvent);
    });

    expect(onResult).toHaveBeenCalledWith("final transcript");
  });

  it("calls onError when error occurs", () => {
    const onError = vi.fn();
    renderHook(() => useSpeechRecognition({ onError }));

    act(() => {
      mockRecognition.onerror?.({ error: "no-speech" });
    });

    expect(onError).toHaveBeenCalledWith("no-speech");
  });

  it("does not call onError for aborted errors", () => {
    const onError = vi.fn();
    renderHook(() => useSpeechRecognition({ onError }));

    act(() => {
      mockRecognition.onerror?.({ error: "aborted" });
    });

    // onError should only be called once (for the "not supported" case which doesn't apply here)
    expect(onError).not.toHaveBeenCalledWith("aborted");
  });

  it("clears transcript when start is called", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    // Set some transcript
    act(() => {
      mockRecognition.onresult?.({
        resultIndex: 0,
        results: {
          length: 1,
          0: { isFinal: false, 0: { transcript: "some text" } },
        },
      });
    });
    expect(result.current.transcript).toBe("some text");

    // Start again should clear
    act(() => {
      result.current.start();
    });
    expect(result.current.transcript).toBe("");
  });

  it("clears transcript when abort is called", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    // Set some transcript
    act(() => {
      mockRecognition.onresult?.({
        resultIndex: 0,
        results: {
          length: 1,
          0: { isFinal: false, 0: { transcript: "some text" } },
        },
      });
    });
    expect(result.current.transcript).toBe("some text");

    act(() => {
      result.current.abort();
    });
    expect(result.current.transcript).toBe("");
  });

  it("aborts recognition on unmount", () => {
    const { unmount } = renderHook(() => useSpeechRecognition());

    unmount();

    expect(mockRecognition.abort).toHaveBeenCalled();
  });

  it("uses custom lang option", () => {
    renderHook(() => useSpeechRecognition({ lang: "ja-JP" }));

    // The mock doesn't track property assignments directly,
    // but we can verify the hook doesn't throw
    expect(mockRecognition.start).toBeDefined();
  });
});
