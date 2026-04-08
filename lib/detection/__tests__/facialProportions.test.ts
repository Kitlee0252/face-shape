import { describe, it, expect } from 'vitest';
import { computeFacialProportions } from '../facialProportions';
import type { Point } from '../types';

const p = (x: number, y: number): Point => ({ x, y, z: 0 });

function makeKeypoints(overrides: Record<number, Point>): Point[] {
  const pts: Point[] = Array.from({ length: 478 }, () => p(0, 0));
  for (const [idx, pt] of Object.entries(overrides)) {
    pts[Number(idx)] = pt;
  }
  return pts;
}

describe('Rule of Thirds', () => {
  it('returns equal thirds for ideal proportions', () => {
    const kp = makeKeypoints({
      10: p(200, 0),
      70: p(170, 100),
      300: p(230, 100),
      129: p(180, 200),
      358: p(220, 200),
      152: p(200, 300),
    });
    const result = computeFacialProportions(kp);
    expect(result.thirds.upper).toBeCloseTo(100, 0);
    expect(result.thirds.middle).toBeCloseTo(100, 0);
    expect(result.thirds.lower).toBeCloseTo(100, 0);
    expect(result.thirds.deviation).toBeCloseTo(0, 1);
  });

  it('detects unequal thirds', () => {
    const kp = makeKeypoints({
      10: p(200, 0),
      70: p(170, 80),
      300: p(230, 80),
      129: p(180, 200),
      358: p(220, 200),
      152: p(200, 300),
    });
    const result = computeFacialProportions(kp);
    expect(result.thirds.upper).toBeCloseTo(80, 0);
    expect(result.thirds.middle).toBeCloseTo(120, 0);
    expect(result.thirds.lower).toBeCloseTo(100, 0);
    expect(result.thirds.deviation).toBeGreaterThan(0);
  });
});
