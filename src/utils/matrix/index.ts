/**
 * @file Matrix module exports
 */

export type { Matrix2D, Point2D, Transform2D } from "./types";

export {
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
