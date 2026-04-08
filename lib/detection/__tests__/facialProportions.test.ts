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

describe('Rule of Fifths', () => {
  it('returns equal fifths for ideal proportions', () => {
    const kp = makeKeypoints({
      10: p(250, 0),
      70: p(200, 100), 300: p(300, 100),
      129: p(225, 200), 358: p(275, 200),
      152: p(250, 300),
      234: p(0, 150),
      33: p(100, 150),
      133: p(200, 150),
      362: p(300, 150),
      263: p(400, 150),
      454: p(500, 150),
    });
    const result = computeFacialProportions(kp);
    expect(result.fifths.segments).toHaveLength(5);
    for (const seg of result.fifths.segments) {
      expect(seg).toBeCloseTo(100, 0);
    }
    expect(result.fifths.deviation).toBeCloseTo(0, 1);
  });

  it('detects unequal fifths', () => {
    const kp = makeKeypoints({
      10: p(250, 0),
      70: p(200, 100), 300: p(300, 100),
      129: p(225, 200), 358: p(275, 200),
      152: p(250, 300),
      234: p(0, 150),
      33: p(80, 150),
      133: p(180, 150),
      362: p(300, 150),
      263: p(420, 150),
      454: p(500, 150),
    });
    const result = computeFacialProportions(kp);
    expect(result.fifths.deviation).toBeGreaterThan(0);
    expect(result.fifths.segments[0]).toBeCloseTo(80, 0);
    expect(result.fifths.segments[2]).toBeCloseTo(120, 0);
  });
});
