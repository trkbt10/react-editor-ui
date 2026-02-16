/**
 * @file useLocalFonts hook tests
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useLocalFonts, type LocalFontData } from "./useLocalFonts";

function createFakeBlobFn(): () => Promise<Blob> {
  return () => Promise.resolve(new Blob());
}

const mockFonts: LocalFontData[] = [
  {
    family: "Arial",
    fullName: "Arial Regular",
    postscriptName: "ArialMT",
    style: "Regular",
    blob: createFakeBlobFn(),
  },
  {
    family: "Arial",
    fullName: "Arial Bold",
    postscriptName: "Arial-BoldMT",
    style: "Bold",
    blob: createFakeBlobFn(),
  },
  {
    family: "Helvetica",
    fullName: "Helvetica",
    postscriptName: "Helvetica",
    style: "Regular",
    blob: createFakeBlobFn(),
  },
];

describe("useLocalFonts", () => {
  describe("when API is not supported", () => {
    it("should return isSupported as false when no queryLocalFonts is provided", () => {
      const { result } = renderHook(() => useLocalFonts({ queryLocalFonts: undefined }));

      expect(result.current.isSupported).toBe(false);
      expect(result.current.status).toBe("idle");
    });

    it("should set status to not-supported when requestFonts is called without API", async () => {
      const { result } = renderHook(() => useLocalFonts({ queryLocalFonts: undefined }));

      await act(async () => {
        await result.current.requestFonts();
      });

      expect(result.current.status).toBe("not-supported");
      expect(result.current.error).toBe("Local Font Access API is not supported in this browser");
    });
  });

  describe("when API is supported via DI", () => {
    function createFakeQueryLocalFonts(fonts: LocalFontData[]) {
      return () => Promise.resolve(fonts);
    }

    it("should return isSupported as true when queryLocalFonts is provided", () => {
      const fakeQuery = createFakeQueryLocalFonts(mockFonts);
      const { result } = renderHook(() => useLocalFonts({ queryLocalFonts: fakeQuery }));

      expect(result.current.isSupported).toBe(true);
      expect(result.current.status).toBe("idle");
    });

    it("should load fonts when requestFonts is called", async () => {
      const fakeQuery = createFakeQueryLocalFonts(mockFonts);
      const { result } = renderHook(() => useLocalFonts({ queryLocalFonts: fakeQuery }));

      await act(async () => {
        await result.current.requestFonts();
      });

      expect(result.current.status).toBe("granted");
      expect(result.current.fonts).toHaveLength(3);
      expect(result.current.error).toBeNull();
    });

    it("should group fonts by family", async () => {
      const fakeQuery = createFakeQueryLocalFonts(mockFonts);
      const { result } = renderHook(() => useLocalFonts({ queryLocalFonts: fakeQuery }));

      await act(async () => {
        await result.current.requestFonts();
      });

      expect(result.current.families).toHaveLength(2);

      const arialFamily = result.current.families.find((f) => f.family === "Arial");
      expect(arialFamily).toBeDefined();
      expect(arialFamily?.fonts).toHaveLength(2);
      expect(arialFamily?.styles).toEqual(["Regular", "Bold"]);

      const helveticaFamily = result.current.families.find((f) => f.family === "Helvetica");
      expect(helveticaFamily).toBeDefined();
      expect(helveticaFamily?.fonts).toHaveLength(1);
    });

    it("should sort families alphabetically", async () => {
      const fakeQuery = createFakeQueryLocalFonts(mockFonts);
      const { result } = renderHook(() => useLocalFonts({ queryLocalFonts: fakeQuery }));

      await act(async () => {
        await result.current.requestFonts();
      });

      const familyNames = result.current.families.map((f) => f.family);
      expect(familyNames).toEqual(["Arial", "Helvetica"]);
    });

    it("should set status to requesting while loading", async () => {
      const deferred = { resolve: null as ((value: LocalFontData[]) => void) | null };
      const pendingPromise = new Promise<LocalFontData[]>((resolve) => {
        deferred.resolve = resolve;
      });
      const fakeQuery = () => pendingPromise;

      const { result } = renderHook(() => useLocalFonts({ queryLocalFonts: fakeQuery }));

      act(() => {
        result.current.requestFonts();
      });

      expect(result.current.status).toBe("requesting");

      await act(async () => {
        deferred.resolve!(mockFonts);
        await waitFor(() => result.current.status === "granted");
      });

      expect(result.current.status).toBe("granted");
    });
  });

  describe("error handling", () => {
    it("should handle NotAllowedError", async () => {
      const notAllowedError = new DOMException("Permission denied", "NotAllowedError");
      const fakeQuery = () => Promise.reject(notAllowedError);

      const { result } = renderHook(() => useLocalFonts({ queryLocalFonts: fakeQuery }));

      await act(async () => {
        await result.current.requestFonts();
      });

      expect(result.current.status).toBe("denied");
      expect(result.current.error).toBe("Permission to access local fonts was denied");
    });

    it("should handle other errors", async () => {
      const genericError = new Error("Something went wrong");
      const fakeQuery = () => Promise.reject(genericError);

      const { result } = renderHook(() => useLocalFonts({ queryLocalFonts: fakeQuery }));

      await act(async () => {
        await result.current.requestFonts();
      });

      expect(result.current.status).toBe("idle");
      expect(result.current.error).toBe("Something went wrong");
    });
  });
});
