import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useMediaStream } from "./useMediaStream";

describe("useMediaStream", () => {
  let mockStream: MediaStream;
  let mockTrack: { stop: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockTrack = { stop: vi.fn() };
    mockStream = {
      getTracks: vi.fn().mockReturnValue([mockTrack]),
    } as unknown as MediaStream;

    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("auto-starts stream on mount by default", async () => {
    const { result } = renderHook(() => useMediaStream());

    await waitFor(() => {
      expect(result.current.stream).toBe(mockStream);
    });
  });

  it("does not auto-start when autoStart is false", async () => {
    const { result } = renderHook(() => useMediaStream({ autoStart: false }));

    // Wait a bit to ensure no stream is fetched
    await new Promise((r) => setTimeout(r, 50));

    expect(result.current.stream).toBeNull();
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it("starts stream manually", async () => {
    const { result } = renderHook(() => useMediaStream({ autoStart: false }));

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.stream).toBe(mockStream);
  });

  it("stops stream tracks when stop is called", async () => {
    const { result } = renderHook(() => useMediaStream());

    await waitFor(() => {
      expect(result.current.stream).toBe(mockStream);
    });

    act(() => {
      result.current.stop();
    });

    expect(mockTrack.stop).toHaveBeenCalled();
    expect(result.current.stream).toBeNull();
  });

  it("calls onError when getUserMedia fails", async () => {
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(new Error("Permission denied")),
      },
    });

    const onError = vi.fn();
    renderHook(() => useMediaStream({ onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Microphone access denied");
    });
  });

  it("sets isLoading to false after fetch completes", async () => {
    const { result } = renderHook(() => useMediaStream({ autoStart: false }));

    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.stream).toBe(mockStream);
  });

  it("does not start if already has stream", async () => {
    const { result } = renderHook(() => useMediaStream({ autoStart: false }));

    // Start once
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.stream).toBe(mockStream);

    // Reset mock to track new calls
    vi.mocked(navigator.mediaDevices.getUserMedia).mockClear();

    // Start again
    await act(async () => {
      await result.current.start();
    });

    // Should not call getUserMedia again
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it("stops stream on unmount when stream exists", async () => {
    const { result, unmount } = renderHook(() => useMediaStream({ autoStart: false }));

    // Start stream first
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.stream).toBe(mockStream);

    unmount();

    expect(mockTrack.stop).toHaveBeenCalled();
  });
});
