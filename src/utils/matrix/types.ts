/**
 * @file Matrix type definitions for 2D transformations
 */

/**
 * 2D point
 */
export type Point2D = {
  readonly x: number;
  readonly y: number;
};

/**
 * 2x3 Affine transformation matrix
 * Represents: | a  c  tx |
 *            | b  d  ty |
 */
export type Matrix2D = {
  readonly a: number;  // scale x
  readonly b: number;  // skew y
  readonly c: number;  // skew x
  readonly d: number;  // scale y
  readonly tx: number; // translate x
  readonly ty: number; // translate y
};

/**
 * Transform state combining position, size, and rotation
 */
export type Transform2D = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rotation: number; // degrees
};
