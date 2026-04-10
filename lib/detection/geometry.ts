import type { Point } from './types';

/** Euclidean distance between two points (2D) */
export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

/** Angle at vertex B formed by points A-B-C, in degrees */
export function angleDeg(a: Point, b: Point, c: Point): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2);
  const cos = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return Math.acos(cos) * (180 / Math.PI);
}

/** Perpendicular distance from point P to line AB (2D, ignores z) */
export function pointToLineDist(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return distance(p, a);
  return Math.abs(dx * (a.y - p.y) - dy * (a.x - p.x)) / len;
}

/**
 * Gaussian-like scoring: returns 1.0 at center of [min, max],
 * decays smoothly outside the range.
 * sigma controls how quickly it drops off outside.
 */
export function rangeScore(
  value: number,
  min: number,
  max: number,
  sigma: number = 0.15
): number {
  const center = (min + max) / 2;
  const halfRange = (max - min) / 2;

  if (value >= min && value <= max) {
    // Inside range: score based on distance from center, but minimum 0.7
    const distFromCenter = Math.abs(value - center) / halfRange;
    return 1.0 - 0.3 * distFromCenter;
  }

  // Outside range: Gaussian decay
  const distOutside = value < min ? min - value : value - max;
  return 0.7 * Math.exp(-((distOutside / sigma) ** 2));
}
