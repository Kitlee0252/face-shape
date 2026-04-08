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

describe('Golden Ratios', () => {
  it('computes all 5 golden ratio values', () => {
    const kp = makeKeypoints({
      10: p(250, 0),
      70: p(200, 100), 300: p(300, 100),
      129: p(225, 200), 358: p(275, 200),
      152: p(250, 300),
      234: p(50, 150), 454: p(450, 150),
      33: p(100, 150), 263: p(400, 150),
      133: p(175, 150), 362: p(325, 150),
      61: p(150, 250), 291: p(350, 250),
    });
    const result = computeFacialProportions(kp);
    const gr = result.goldenRatios;

    // Face height 300 / face width 400 = 0.75
    expect(gr.faceHeightToWidth).toBeCloseTo(0.75, 2);
    // Mouth 200 / nose 50 = 4.0
    expect(gr.mouthToNoseWidth).toBeCloseTo(4.0, 2);
    // Eye span 300 / mouth 200 = 1.5
    expect(gr.eyeSpanToMouthWidth).toBeCloseTo(1.5, 2);
    // Inter-eye 150 / nose 50 = 3.0
    expect(gr.interEyeToNoseWidth).toBeCloseTo(3.0, 2);
    // Middle 100 / lower 100 = 1.0
    expect(gr.midToLowerThird).toBeCloseTo(1.0, 2);
  });

  it('handles phi-ideal face proportions', () => {
    const faceW = 250;
    const faceH = 250 * 1.618;
    const noseW = 50;
    const mouthW = noseW * 1.618;
    const eyeSpan = mouthW * 1.618;

    const kp = makeKeypoints({
      10: p(200, 0),
      70: p(175, faceH / 3), 300: p(225, faceH / 3),
      129: p(200 - noseW / 2, faceH * 2 / 3), 358: p(200 + noseW / 2, faceH * 2 / 3),
      152: p(200, faceH),
      234: p(200 - faceW / 2, faceH / 2), 454: p(200 + faceW / 2, faceH / 2),
      33: p(200 - eyeSpan / 2, faceH / 3), 263: p(200 + eyeSpan / 2, faceH / 3),
      133: p(200 - noseW, faceH / 3), 362: p(200 + noseW, faceH / 3),
      61: p(200 - mouthW / 2, faceH * 0.75), 291: p(200 + mouthW / 2, faceH * 0.75),
    });
    const gr = computeFacialProportions(kp).goldenRatios;
    expect(gr.faceHeightToWidth).toBeCloseTo(1.618, 1);
    expect(gr.mouthToNoseWidth).toBeCloseTo(1.618, 1);
    expect(gr.eyeSpanToMouthWidth).toBeCloseTo(1.618, 1);
  });
});
