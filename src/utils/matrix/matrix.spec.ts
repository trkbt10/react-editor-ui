/**
 * @file Matrix utilities unit tests
 */

import {
  IDENTITY_MATRIX,
  createRotationMatrix,
  createTranslationMatrix,
  createScaleMatrix,
  multiplyMatrix,
  invertMatrix,
  transformPoint,
  transformDelta,
  screenToLocalDelta,
  localToScreenDelta,
  getTransformCenter,
  calculateAngle,
  normalizeAngle,
  snapAngle,
  getTransformCorners,
  isInRotationZone,
} from "./matrix";
import type { Matrix2D, Point2D, Transform2D } from "./types";

describe("Matrix utilities", () => {
  describe("IDENTITY_MATRIX", () => {
    it("has correct identity values", () => {
      expect(IDENTITY_MATRIX).toEqual({
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        tx: 0,
        ty: 0,
      });
    });
  });

  describe("createRotationMatrix", () => {
    it("creates identity for 0 degrees", () => {
      const m = createRotationMatrix(0);
      expect(m.a).toBeCloseTo(1);
      expect(m.b).toBeCloseTo(0);
      expect(m.c).toBeCloseTo(0);
      expect(m.d).toBeCloseTo(1);
    });

    it("creates correct matrix for 90 degrees", () => {
      const m = createRotationMatrix(90);
      expect(m.a).toBeCloseTo(0);
      expect(m.b).toBeCloseTo(1);
      expect(m.c).toBeCloseTo(-1);
      expect(m.d).toBeCloseTo(0);
    });

    it("creates correct matrix for 180 degrees", () => {
      const m = createRotationMatrix(180);
      expect(m.a).toBeCloseTo(-1);
      expect(m.b).toBeCloseTo(0);
      expect(m.c).toBeCloseTo(0);
      expect(m.d).toBeCloseTo(-1);
    });

    it("creates correct matrix for -90 degrees", () => {
      const m = createRotationMatrix(-90);
      expect(m.a).toBeCloseTo(0);
      expect(m.b).toBeCloseTo(-1);
      expect(m.c).toBeCloseTo(1);
      expect(m.d).toBeCloseTo(0);
    });
  });

  describe("createTranslationMatrix", () => {
    it("creates correct translation matrix", () => {
      const m = createTranslationMatrix(10, 20);
      expect(m).toEqual({
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        tx: 10,
        ty: 20,
      });
    });
  });

  describe("createScaleMatrix", () => {
    it("creates correct scale matrix", () => {
      const m = createScaleMatrix(2, 3);
      expect(m).toEqual({
        a: 2,
        b: 0,
        c: 0,
        d: 3,
        tx: 0,
        ty: 0,
      });
    });
  });

  describe("multiplyMatrix", () => {
    it("multiplying by identity returns same matrix", () => {
      const m: Matrix2D = { a: 2, b: 1, c: -1, d: 2, tx: 10, ty: 20 };
      const result = multiplyMatrix(IDENTITY_MATRIX, m);
      expect(result).toEqual(m);
    });

    it("correctly multiplies translation matrices", () => {
      const m1 = createTranslationMatrix(10, 0);
      const m2 = createTranslationMatrix(0, 20);
      const result = multiplyMatrix(m1, m2);
      expect(result.tx).toBe(10);
      expect(result.ty).toBe(20);
    });

    it("correctly multiplies rotation and translation", () => {
      const rot = createRotationMatrix(90);
      const trans = createTranslationMatrix(10, 0);
      const result = multiplyMatrix(rot, trans);
      // Rotating then translating: point (10, 0) rotated 90 degrees becomes (0, 10)
      expect(result.tx).toBeCloseTo(0);
      expect(result.ty).toBeCloseTo(10);
    });
  });

  describe("invertMatrix", () => {
    it("inverts identity to identity", () => {
      const result = invertMatrix(IDENTITY_MATRIX);
      expect(result.a).toBeCloseTo(1);
      expect(result.d).toBeCloseTo(1);
      expect(result.tx).toBeCloseTo(0);
      expect(result.ty).toBeCloseTo(0);
    });

    it("inverts translation matrix", () => {
      const m = createTranslationMatrix(10, 20);
      const inv = invertMatrix(m);
      expect(inv.tx).toBeCloseTo(-10);
      expect(inv.ty).toBeCloseTo(-20);
    });

    it("inverts rotation matrix", () => {
      const m = createRotationMatrix(90);
      const inv = invertMatrix(m);
      const identity = multiplyMatrix(m, inv);
      expect(identity.a).toBeCloseTo(1);
      expect(identity.b).toBeCloseTo(0);
      expect(identity.c).toBeCloseTo(0);
      expect(identity.d).toBeCloseTo(1);
    });

    it("returns identity for singular matrix", () => {
      const singular: Matrix2D = { a: 0, b: 0, c: 0, d: 0, tx: 10, ty: 20 };
      const result = invertMatrix(singular);
      expect(result).toEqual(IDENTITY_MATRIX);
    });
  });

  describe("transformPoint", () => {
    it("identity matrix returns same point", () => {
      const point: Point2D = { x: 10, y: 20 };
      const result = transformPoint(point, IDENTITY_MATRIX);
      expect(result).toEqual(point);
    });

    it("applies translation", () => {
      const point: Point2D = { x: 0, y: 0 };
      const m = createTranslationMatrix(10, 20);
      const result = transformPoint(point, m);
      expect(result).toEqual({ x: 10, y: 20 });
    });

    it("applies rotation", () => {
      const point: Point2D = { x: 10, y: 0 };
      const m = createRotationMatrix(90);
      const result = transformPoint(point, m);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(10);
    });

    it("applies scale", () => {
      const point: Point2D = { x: 5, y: 10 };
      const m = createScaleMatrix(2, 3);
      const result = transformPoint(point, m);
      expect(result).toEqual({ x: 10, y: 30 });
    });
  });

  describe("transformDelta", () => {
    it("ignores translation", () => {
      const delta: Point2D = { x: 10, y: 20 };
      const m = createTranslationMatrix(100, 200);
      const result = transformDelta(delta, m);
      expect(result).toEqual(delta);
    });

    it("applies rotation to delta", () => {
      const delta: Point2D = { x: 10, y: 0 };
      const m = createRotationMatrix(90);
      const result = transformDelta(delta, m);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(10);
    });
  });

  describe("screenToLocalDelta", () => {
    it("returns same delta for 0 rotation", () => {
      const result = screenToLocalDelta(10, 20, 0);
      expect(result.x).toBeCloseTo(10);
      expect(result.y).toBeCloseTo(20);
    });

    it("rotates delta for 90 degree rotation", () => {
      // Screen delta (10, 0) with 90 degree rotation
      // Local should be (0, -10) to maintain screen direction
      const result = screenToLocalDelta(10, 0, 90);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(-10);
    });

    it("rotates delta for 45 degree rotation", () => {
      // Screen delta (10, 0) with 45 degree rotation
      const result = screenToLocalDelta(10, 0, 45);
      const sqrt2over2 = Math.sqrt(2) / 2;
      expect(result.x).toBeCloseTo(10 * sqrt2over2);
      expect(result.y).toBeCloseTo(-10 * sqrt2over2);
    });
  });

  describe("localToScreenDelta", () => {
    it("returns same delta for 0 rotation", () => {
      const result = localToScreenDelta(10, 20, 0);
      expect(result.x).toBeCloseTo(10);
      expect(result.y).toBeCloseTo(20);
    });

    it("is inverse of screenToLocalDelta", () => {
      const screenDelta = { x: 10, y: 5 };
      const rotation = 60;
      const local = screenToLocalDelta(screenDelta.x, screenDelta.y, rotation);
      const backToScreen = localToScreenDelta(local.x, local.y, rotation);
      expect(backToScreen.x).toBeCloseTo(screenDelta.x);
      expect(backToScreen.y).toBeCloseTo(screenDelta.y);
    });
  });

  describe("getTransformCenter", () => {
    it("calculates center of transform", () => {
      const transform: Transform2D = {
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        rotation: 0,
      };
      const center = getTransformCenter(transform);
      expect(center).toEqual({ x: 200, y: 150 });
    });
  });

  describe("calculateAngle", () => {
    it("returns 0 for point directly above", () => {
      const angle = calculateAngle(0, 0, 0, -10);
      expect(angle).toBeCloseTo(0);
    });

    it("returns 90 for point to the right", () => {
      const angle = calculateAngle(0, 0, 10, 0);
      expect(angle).toBeCloseTo(90);
    });

    it("returns 180 for point below", () => {
      const angle = calculateAngle(0, 0, 0, 10);
      expect(angle).toBeCloseTo(180);
    });

    it("returns -90 for point to the left", () => {
      const angle = calculateAngle(0, 0, -10, 0);
      expect(angle).toBeCloseTo(-90);
    });
  });

  describe("normalizeAngle", () => {
    it("keeps angles in range unchanged", () => {
      expect(normalizeAngle(45)).toBe(45);
      expect(normalizeAngle(0)).toBe(0);
      expect(normalizeAngle(359)).toBe(359);
    });

    it("normalizes negative angles", () => {
      expect(normalizeAngle(-90)).toBe(270);
      expect(normalizeAngle(-180)).toBe(180);
      expect(normalizeAngle(-360)).toBeCloseTo(0); // -0 vs 0 quirk
    });

    it("normalizes angles over 360", () => {
      expect(normalizeAngle(450)).toBe(90);
      expect(normalizeAngle(720)).toBe(0);
    });
  });

  describe("snapAngle", () => {
    it("snaps to nearest increment", () => {
      expect(snapAngle(47, 45)).toBe(45);
      expect(snapAngle(68, 45)).toBe(90);
      expect(snapAngle(23, 15)).toBe(30); // 23/15=1.53, rounds to 2 -> 30
      expect(snapAngle(8, 15)).toBe(15);  // 8/15=0.53, rounds to 1 -> 15
    });

    it("handles exact multiples", () => {
      expect(snapAngle(90, 45)).toBe(90);
      expect(snapAngle(45, 45)).toBe(45);
    });
  });

  describe("getTransformCorners", () => {
    it("returns correct corners for non-rotated transform", () => {
      const transform: Transform2D = {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        rotation: 0,
      };
      const corners = getTransformCorners(transform);
      expect(corners[0]).toEqual({ x: 0, y: 0 });    // top-left
      expect(corners[1]).toEqual({ x: 100, y: 0 });  // top-right
      expect(corners[2]).toEqual({ x: 100, y: 50 }); // bottom-right
      expect(corners[3]).toEqual({ x: 0, y: 50 });   // bottom-left
    });

    it("returns correct corners for 90 degree rotated transform", () => {
      const transform: Transform2D = {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        rotation: 90,
      };
      const corners = getTransformCorners(transform);
      const centerX = 50;
      const centerY = 25;
      // After 90 degree rotation:
      // top-left (-50, -25) -> (25, -50) + center
      expect(corners[0].x).toBeCloseTo(centerX + 25);
      expect(corners[0].y).toBeCloseTo(centerY - 50);
    });
  });

  describe("isInRotationZone", () => {
    const corner: Point2D = { x: 100, y: 100 };
    const handleSize = 10;
    const rotationZone = 15;

    it("returns false for point inside handle", () => {
      const point: Point2D = { x: 102, y: 100 }; // 2px from corner
      expect(isInRotationZone(point, corner, handleSize, rotationZone)).toBe(false);
    });

    it("returns true for point in rotation zone", () => {
      const point: Point2D = { x: 112, y: 100 }; // 12px from corner (outside 5px handle radius, inside 20px zone)
      expect(isInRotationZone(point, corner, handleSize, rotationZone)).toBe(true);
    });

    it("returns false for point outside rotation zone", () => {
      const point: Point2D = { x: 130, y: 100 }; // 30px from corner
      expect(isInRotationZone(point, corner, handleSize, rotationZone)).toBe(false);
    });
  });
});
