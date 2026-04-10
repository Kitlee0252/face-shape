import { describe, it, expect } from 'vitest';
import { sampleContourWidths, extractContourFeatures } from '../contourProfile';
import type { Point } from '../types';

/**
 * FACE_OVAL landmark indices used by contourProfile.ts.
 * Right half (top -> chin): 10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152
 * Left half (chin -> top):  152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109,10
 */
const FACE_OVAL_RIGHT = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
  378, 400, 377, 152,
];
const FACE_OVAL_LEFT = [
  152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103,
  67, 109, 10,
];

const ALL_OVAL_INDICES = [
  ...new Set([...FACE_OVAL_RIGHT, ...FACE_OVAL_LEFT]),
];

/**
 * Generate 478 keypoints with FACE_OVAL indices placed on an ellipse.
 *
 * The ellipse is centered at (cx, cy) with horizontal radius rx and vertical
 * radius ry. The FACE_OVAL right-half is placed on the right side of the
 * ellipse (positive x offset), the left-half on the left side, both
 * progressing from top (landmark 10) to chin (landmark 152).
 */
function makeOvalFace(
  cx: number,
  cy: number,
  rx: number,
  ry: number
): Point[] {
  const kp: Point[] = Array.from({ length: 478 }, () => ({
    x: cx,
    y: cy,
    z: 0,
  }));

  const topY = cy - ry; // landmark 10
  const botY = cy + ry; // landmark 152

  // Right half goes from top to bottom along the right side of the ellipse
  for (let i = 0; i < FACE_OVAL_RIGHT.length; i++) {
    const t = i / (FACE_OVAL_RIGHT.length - 1); // 0..1
    const y = topY + t * (botY - topY);
    // x on ellipse: x = cx + rx * sqrt(1 - ((y-cy)/ry)^2)
    const relY = (y - cy) / ry;
    const xOff = rx * Math.sqrt(Math.max(0, 1 - relY * relY));
    kp[FACE_OVAL_RIGHT[i]] = { x: cx + xOff, y, z: 0 };
  }

  // Left half goes from bottom to top along the left side of the ellipse
  for (let i = 0; i < FACE_OVAL_LEFT.length; i++) {
    const t = i / (FACE_OVAL_LEFT.length - 1); // 0..1
    const y = botY - t * (botY - topY); // bottom -> top
    const relY = (y - cy) / ry;
    const xOff = rx * Math.sqrt(Math.max(0, 1 - relY * relY));
    kp[FACE_OVAL_LEFT[i]] = { x: cx - xOff, y, z: 0 };
  }

  // Also place cheekbone (234/454) and jaw (58/288) landmarks for completeness.
  // They're already included via FACE_OVAL paths, but verify they're sensible.
  // 234 and 454 sit near cheekbone height (~40% down), 58 and 288 near jaw.

  return kp;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('sampleContourWidths', () => {
  it('returns exactly 11 positive values for an oval face', () => {
    const kp = makeOvalFace(250, 300, 100, 150);
    const widths = sampleContourWidths(kp);

    expect(widths).toHaveLength(11);
    for (const w of widths) {
      expect(w).toBeGreaterThanOrEqual(0);
    }
    // All interior widths should be positive (endpoints may be ~0)
    for (let i = 1; i < widths.length - 1; i++) {
      expect(widths[i]).toBeGreaterThan(0);
    }
  });

  it('oval face is widest in the middle (peak index 3-7)', () => {
    const kp = makeOvalFace(250, 300, 100, 150);
    const widths = sampleContourWidths(kp);

    let peakIdx = 0;
    for (let i = 1; i < widths.length; i++) {
      if (widths[i] > widths[peakIdx]) peakIdx = i;
    }
    expect(peakIdx).toBeGreaterThanOrEqual(3);
    expect(peakIdx).toBeLessThanOrEqual(7);
  });

  it('top and bottom are narrower than the middle', () => {
    const kp = makeOvalFace(250, 300, 100, 150);
    const widths = sampleContourWidths(kp);

    const midWidth = widths[5]; // middle slice
    expect(widths[0]).toBeLessThan(midWidth);
    expect(widths[widths.length - 1]).toBeLessThan(midWidth);
  });
});

describe('extractContourFeatures', () => {
  it('oval face has expected feature ranges', () => {
    const kp = makeOvalFace(250, 300, 100, 150);
    const f = extractContourFeatures(kp);

    expect(f.peakPosition).toBeGreaterThanOrEqual(0.3);
    expect(f.peakPosition).toBeLessThanOrEqual(0.6);

    expect(f.topBottomRatio).toBeGreaterThanOrEqual(0.85);
    expect(f.topBottomRatio).toBeLessThanOrEqual(1.15);

    // A perfect ellipse converges to a point at chin, giving taperRate ~1.0.
    // Real faces have a wider chin, so this range covers both synthetic and real.
    expect(f.taperRate).toBeGreaterThanOrEqual(0.3);
    expect(f.taperRate).toBeLessThanOrEqual(1.0);

    expect(f.flatness).toBeGreaterThanOrEqual(0.7);
    expect(f.flatness).toBeLessThanOrEqual(0.95);
  });

  it('heart-like face (narrow bottom) has topBottomRatio > 1.05', () => {
    // Start with a standard oval, then manually narrow the bottom half
    const kp = makeOvalFace(250, 300, 100, 150);

    const topY = kp[10].y;
    const botY = kp[152].y;
    const midY = (topY + botY) / 2;

    // Narrow all FACE_OVAL points below mid-height
    for (const idx of ALL_OVAL_INDICES) {
      if (kp[idx].y > midY) {
        // Move x toward center
        const dx = kp[idx].x - 250;
        kp[idx] = { ...kp[idx], x: 250 + dx * 0.5 };
      }
    }

    const f = extractContourFeatures(kp);
    expect(f.topBottomRatio).toBeGreaterThan(1.05);
  });

  it('rectangle-like face (constant width except tips) has flatness > 0.88', () => {
    const kp: Point[] = Array.from({ length: 478 }, () => ({
      x: 250,
      y: 300,
      z: 0,
    }));

    const topY = 150;
    const botY = 450;
    const halfW = 100;

    // Right half: constant x = cx + halfW except at very top and bottom tips
    for (let i = 0; i < FACE_OVAL_RIGHT.length; i++) {
      const t = i / (FACE_OVAL_RIGHT.length - 1);
      const y = topY + t * (botY - topY);
      // Small taper at top and bottom (first/last ~10%)
      let xOff = halfW;
      if (t < 0.1) xOff = halfW * (t / 0.1);
      else if (t > 0.9) xOff = halfW * ((1 - t) / 0.1);
      kp[FACE_OVAL_RIGHT[i]] = { x: 250 + xOff, y, z: 0 };
    }

    // Left half: mirror
    for (let i = 0; i < FACE_OVAL_LEFT.length; i++) {
      const t = i / (FACE_OVAL_LEFT.length - 1);
      const y = botY - t * (botY - topY);
      let xOff = halfW;
      if (t > 0.9) xOff = halfW * ((1 - t) / 0.1);
      else if (t < 0.1) xOff = halfW * (t / 0.1);
      kp[FACE_OVAL_LEFT[i]] = { x: 250 - xOff, y, z: 0 };
    }

    const f = extractContourFeatures(kp);
    expect(f.flatness).toBeGreaterThan(0.88);
  });
});
