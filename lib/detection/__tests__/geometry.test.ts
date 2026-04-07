import { describe, it, expect } from 'vitest';
import { distance, angleDeg, rangeScore } from '../geometry';
import type { Point } from '../types';

const p = (x: number, y: number, z = 0): Point => ({ x, y, z });

describe('distance', () => {
  it('returns 0 for same point', () => {
    expect(distance(p(5, 5), p(5, 5))).toBe(0);
  });

  it('calculates horizontal distance', () => {
    expect(distance(p(0, 0), p(3, 0))).toBe(3);
  });

  it('calculates vertical distance', () => {
    expect(distance(p(0, 0), p(0, 4))).toBe(4);
  });

  it('calculates diagonal distance (3-4-5 triangle)', () => {
    expect(distance(p(0, 0), p(3, 4))).toBe(5);
  });

  it('is symmetric', () => {
    const a = p(1, 2);
    const b = p(4, 6);
    expect(distance(a, b)).toBe(distance(b, a));
  });

  it('ignores z coordinate (2D only)', () => {
    expect(distance(p(0, 0, 100), p(3, 4, 200))).toBe(5);
  });
});

describe('angleDeg', () => {
  it('returns 90° for a right angle', () => {
    const angle = angleDeg(p(1, 0), p(0, 0), p(0, 1));
    expect(angle).toBeCloseTo(90, 1);
  });

  it('returns 180° for a straight line', () => {
    const angle = angleDeg(p(-1, 0), p(0, 0), p(1, 0));
    expect(angle).toBeCloseTo(180, 1);
  });

  it('returns 60° for equilateral triangle vertex', () => {
    const angle = angleDeg(p(0, 0), p(0.5, Math.sqrt(3) / 2), p(1, 0));
    expect(angle).toBeCloseTo(60, 1);
  });

  it('returns 45° correctly', () => {
    const angle = angleDeg(p(1, 0), p(0, 0), p(1, 1));
    expect(angle).toBeCloseTo(45, 1);
  });

  it('handles collinear points (0°)', () => {
    const angle = angleDeg(p(1, 0), p(2, 0), p(3, 0));
    expect(angle).toBeCloseTo(180, 1);
  });

  it('is independent of distance from vertex', () => {
    const near = angleDeg(p(1, 0), p(0, 0), p(0, 1));
    const far = angleDeg(p(10, 0), p(0, 0), p(0, 10));
    expect(near).toBeCloseTo(far, 5);
  });
});

describe('rangeScore', () => {
  it('returns 1.0 at center of range', () => {
    expect(rangeScore(1.5, 1.0, 2.0)).toBe(1.0);
  });

  it('returns >= 0.7 at range edges', () => {
    expect(rangeScore(1.0, 1.0, 2.0)).toBeGreaterThanOrEqual(0.7);
    expect(rangeScore(2.0, 1.0, 2.0)).toBeGreaterThanOrEqual(0.7);
  });

  it('decays smoothly outside range', () => {
    const atEdge = rangeScore(2.0, 1.0, 2.0);
    const slightlyOut = rangeScore(2.1, 1.0, 2.0);
    const farOut = rangeScore(3.0, 1.0, 2.0);
    expect(slightlyOut).toBeLessThan(atEdge);
    expect(farOut).toBeLessThan(slightlyOut);
  });

  it('returns positive even far outside range', () => {
    expect(rangeScore(5.0, 1.0, 2.0)).toBeGreaterThan(0);
  });

  it('is symmetric around center', () => {
    const below = rangeScore(0.8, 1.0, 2.0);
    const above = rangeScore(2.2, 1.0, 2.0);
    expect(below).toBeCloseTo(above, 2);
  });

  it('respects custom sigma for wider tolerance', () => {
    const narrow = rangeScore(2.5, 1.0, 2.0, 0.1);
    const wide = rangeScore(2.5, 1.0, 2.0, 0.5);
    expect(wide).toBeGreaterThan(narrow);
  });
});
