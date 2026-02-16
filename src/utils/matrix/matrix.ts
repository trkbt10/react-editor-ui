/**
 * @file Matrix operations for 2D transformations
 *
 * Provides matrix math utilities for consistent transform handling.
 * Maintains edit direction through rotation by converting screen deltas
 * to local object space.
 */

import type { Matrix2D, Point2D, Transform2D } from "./types";

/**
 * Identity matrix
 */
export const IDENTITY_MATRIX: Matrix2D = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  tx: 0,
  ty: 0,
};

/**
 * Create a rotation matrix
 * @param degrees - Rotation angle in degrees
 */
export function createRotationMatrix(degrees: number): Matrix2D {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    a: cos,
    b: sin,
    c: -sin,
    d: cos,
    tx: 0,
    ty: 0,
  };
}

/**
 * Create a translation matrix
 */
export function createTranslationMatrix(tx: number, ty: number): Matrix2D {
  return {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    tx,
    ty,
  };
}

/**
 * Create a scale matrix
 */
export function createScaleMatrix(sx: number, sy: number): Matrix2D {
  return {
    a: sx,
    b: 0,
    c: 0,
    d: sy,
    tx: 0,
    ty: 0,
  };
}

/**
 * Multiply two matrices: result = m1 * m2
 */
export function multiplyMatrix(m1: Matrix2D, m2: Matrix2D): Matrix2D {
  return {
    a: m1.a * m2.a + m1.c * m2.b,
    b: m1.b * m2.a + m1.d * m2.b,
    c: m1.a * m2.c + m1.c * m2.d,
    d: m1.b * m2.c + m1.d * m2.d,
    tx: m1.a * m2.tx + m1.c * m2.ty + m1.tx,
    ty: m1.b * m2.tx + m1.d * m2.ty + m1.ty,
  };
}

/**
 * Invert a matrix
 * Returns identity if matrix is not invertible
 */
export function invertMatrix(m: Matrix2D): Matrix2D {
  const det = m.a * m.d - m.b * m.c;
  if (Math.abs(det) < 1e-10) {
    return IDENTITY_MATRIX;
  }
  const invDet = 1 / det;
  return {
    a: m.d * invDet,
    b: -m.b * invDet,
    c: -m.c * invDet,
    d: m.a * invDet,
    tx: (m.c * m.ty - m.d * m.tx) * invDet,
    ty: (m.b * m.tx - m.a * m.ty) * invDet,
  };
}

/**
 * Transform a point by a matrix
 */
export function transformPoint(point: Point2D, matrix: Matrix2D): Point2D {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.tx,
    y: matrix.b * point.x + matrix.d * point.y + matrix.ty,
  };
}

/**
 * Transform a delta (vector) by a matrix, ignoring translation
 */
export function transformDelta(delta: Point2D, matrix: Matrix2D): Point2D {
  return {
    x: matrix.a * delta.x + matrix.c * delta.y,
    y: matrix.b * delta.x + matrix.d * delta.y,
  };
}

/**
 * Convert screen delta to local (object) space delta
 * This is key for maintaining consistent resize direction when rotated
 *
 * @param deltaX - Screen delta X
 * @param deltaY - Screen delta Y
 * @param rotation - Object rotation in degrees
 * @returns Delta in local object coordinates
 */
export function screenToLocalDelta(
  deltaX: number,
  deltaY: number,
  rotation: number,
): Point2D {
  // Create inverse rotation matrix to go from screen to local
  const inverseRotation = createRotationMatrix(-rotation);
  return transformDelta({ x: deltaX, y: deltaY }, inverseRotation);
}

/**
 * Convert local (object) space delta to screen delta
 *
 * @param deltaX - Local delta X
 * @param deltaY - Local delta Y
 * @param rotation - Object rotation in degrees
 * @returns Delta in screen coordinates
 */
export function localToScreenDelta(
  deltaX: number,
  deltaY: number,
  rotation: number,
): Point2D {
  const rotationMatrix = createRotationMatrix(rotation);
  return transformDelta({ x: deltaX, y: deltaY }, rotationMatrix);
}

/**
 * Get the center point of a transform
 */
export function getTransformCenter(transform: Transform2D): Point2D {
  return {
    x: transform.x + transform.width / 2,
    y: transform.y + transform.height / 2,
  };
}

/**
 * Calculate angle from one point to another in degrees
 * 0 degrees points up, positive clockwise
 */
export function calculateAngle(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): number {
  const radians = Math.atan2(toX - fromX, -(toY - fromY));
  return (radians * 180) / Math.PI;
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

/**
 * Snap angle to nearest increment
 */
export function snapAngle(angle: number, increment: number): number {
  return Math.round(angle / increment) * increment;
}

/**
 * Get corner positions of a transform in canvas space
 * Returns corners in order: top-left, top-right, bottom-right, bottom-left
 */
export function getTransformCorners(transform: Transform2D): Point2D[] {
  const { width, height, rotation } = transform;
  const center = getTransformCenter(transform);
  const rotMatrix = createRotationMatrix(rotation);

  // Local corners relative to center
  const localCorners: Point2D[] = [
    { x: -width / 2, y: -height / 2 }, // top-left
    { x: width / 2, y: -height / 2 },  // top-right
    { x: width / 2, y: height / 2 },   // bottom-right
    { x: -width / 2, y: height / 2 },  // bottom-left
  ];

  return localCorners.map((corner) => {
    const rotated = transformPoint(corner, rotMatrix);
    return {
      x: rotated.x + center.x,
      y: rotated.y + center.y,
    };
  });
}

/**
 * Check if a point is in the rotation zone (outside corner but within threshold)
 * @param point - Point to check
 * @param cornerPoint - Corner position
 * @param handleSize - Size of resize handle
 * @param rotationZoneSize - Size of rotation zone beyond handle
 * @returns true if point is in rotation zone
 */
export function isInRotationZone(
  point: Point2D,
  cornerPoint: Point2D,
  handleSize: number,
  rotationZoneSize: number,
): boolean {
  const dx = point.x - cornerPoint.x;
  const dy = point.y - cornerPoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Must be outside resize handle but within rotation zone
  return distance > handleSize / 2 && distance <= handleSize / 2 + rotationZoneSize;
}
