import { describe, it, expect } from 'vitest';
import { classifyEyebrowShape, BROW_LANDMARKS } from '../eyebrowShape';
import type { Point } from '../types';

function makeKeypoints(overrides: Record<number, [number, number]>): Point[] {
  const kp: Point[] = Array.from({ length: 478 }, () => ({ x: 0, y: 0, z: 0 }));
  for (const [idx, [x, y]] of Object.entries(overrides)) {
    kp[Number(idx)] = { x, y, z: 0 };
  }
  return kp;
}

/**
 * Build brow keypoints. archAngle = angle at peak formed by head-peak-tail.
 * Larger angle = straighter brow. slopeDy = vertical offset from head to tail.
 */
function makeBrowKeypoints(params: {
  archAngleDeg: number;  // angle at peak
  slopeDy: number;       // positive = tail lower than head (downward)
  spacingRatio: number;  // inter-brow / inter-eye spacing
}): Point[] {
  const cx = 250;
  const browY = 150;
  const browLen = 50;
  const eyeInnerDist = 40;

  // Build right brow
  const rHeadX = cx - 15;
  const rHeadY = browY;
  const rTailX = rHeadX - browLen;
  const rTailY = browY + params.slopeDy;

  // Peak: position such that angle at peak ≈ archAngleDeg
  // For a roughly symmetric brow, peak is at midpoint pushed up
  const halfAngle = (params.archAngleDeg / 2) * (Math.PI / 180);
  const peakOffset = (browLen / 2) / Math.tan(halfAngle);
  const rPeakX = (rHeadX + rTailX) / 2;
  const rPeakY = (rHeadY + rTailY) / 2 - Math.max(0, peakOffset);

  // Left brow (mirrored)
  const browHeadDist = eyeInnerDist * params.spacingRatio;
  const lHeadX = cx + 15;
  const lHeadY = browY;
  const lTailX = lHeadX + browLen;
  const lTailY = browY + params.slopeDy;
  const lPeakX = (lHeadX + lTailX) / 2;
  const lPeakY = (lHeadY + lTailY) / 2 - Math.max(0, peakOffset);

  return makeKeypoints({
    [BROW_LANDMARKS.right.head]: [rHeadX, rHeadY],
    [BROW_LANDMARKS.right.peak]: [rPeakX, rPeakY],
    [BROW_LANDMARKS.right.tail]: [rTailX, rTailY],
    [BROW_LANDMARKS.left.head]: [lHeadX, lHeadY],
    [BROW_LANDMARKS.left.peak]: [lPeakX, lPeakY],
    [BROW_LANDMARKS.left.tail]: [lTailX, lTailY],
    // Eye inner corners for spacing
    133: [cx - eyeInnerDist / 2, 170],
    362: [cx + eyeInnerDist / 2, 170],
  });
}

describe('classifyEyebrowShape', () => {
  describe('shape classification', () => {
    it('detects straight eyebrows (high arch angle > 160°)', () => {
      const kp = makeBrowKeypoints({ archAngleDeg: 170, slopeDy: 0, spacingRatio: 1.0 });
      const result = classifyEyebrowShape(kp);
      expect(result.shape).toBe('straight');
    });

    it('detects arched eyebrows (arch angle 140-160°)', () => {
      const kp = makeBrowKeypoints({ archAngleDeg: 150, slopeDy: 0, spacingRatio: 1.0 });
      const result = classifyEyebrowShape(kp);
      expect(result.shape).toBe('arched');
    });

    it('detects high-arched eyebrows (arch angle < 140°)', () => {
      const kp = makeBrowKeypoints({ archAngleDeg: 125, slopeDy: 0, spacingRatio: 1.0 });
      const result = classifyEyebrowShape(kp);
      expect(result.shape).toBe('high-arched');
    });
  });

  describe('slope classification', () => {
    it('detects downward slope', () => {
      const kp = makeBrowKeypoints({ archAngleDeg: 160, slopeDy: 10, spacingRatio: 1.0 });
      const result = classifyEyebrowShape(kp);
      expect(result.slope).toBe('downward');
    });

    it('detects flat slope', () => {
      const kp = makeBrowKeypoints({ archAngleDeg: 160, slopeDy: 0, spacingRatio: 1.0 });
      const result = classifyEyebrowShape(kp);
      expect(result.slope).toBe('flat');
    });

    it('detects upward slope', () => {
      const kp = makeBrowKeypoints({ archAngleDeg: 160, slopeDy: -10, spacingRatio: 1.0 });
      const result = classifyEyebrowShape(kp);
      expect(result.slope).toBe('upward');
    });
  });

  describe('result structure', () => {
    it('includes arch angle in degrees', () => {
      const kp = makeBrowKeypoints({ archAngleDeg: 150, slopeDy: 0, spacingRatio: 1.0 });
      const result = classifyEyebrowShape(kp);
      expect(result.archAngle).toBeGreaterThan(0);
      expect(result.archAngle).toBeLessThan(180);
    });

    it('includes spacing measurement', () => {
      const kp = makeBrowKeypoints({ archAngleDeg: 150, slopeDy: 0, spacingRatio: 1.0 });
      const result = classifyEyebrowShape(kp);
      expect(result.spacing).toBeGreaterThan(0);
    });
  });

  describe('thickness classification', () => {
    it('classifies brow thickness', () => {
      const kp = makeBrowKeypoints({ archAngleDeg: 150, slopeDy: 0, spacingRatio: 1.0 });
      const result = classifyEyebrowShape(kp);
      expect(['thick', 'medium', 'thin', 'very thin']).toContain(result.thickness);
    });
  });

  describe('length classification', () => {
    it('classifies brow length', () => {
      const kp = makeBrowKeypoints({ archAngleDeg: 150, slopeDy: 0, spacingRatio: 1.0 });
      const result = classifyEyebrowShape(kp);
      expect(['long', 'medium', 'short']).toContain(result.length);
    });
  });

  describe('symmetry classification', () => {
    it('detects good symmetry for mirrored brows', () => {
      const kp = makeBrowKeypoints({ archAngleDeg: 150, slopeDy: 0, spacingRatio: 1.0 });
      const result = classifyEyebrowShape(kp);
      expect(['excellent', 'good']).toContain(result.symmetry);
    });
  });

  describe('detailed measurements', () => {
    it('includes raw measurements', () => {
      const kp = makeBrowKeypoints({ archAngleDeg: 150, slopeDy: 0, spacingRatio: 1.0 });
      const result = classifyEyebrowShape(kp);
      expect(result.detailed.length).toBeGreaterThan(0);
      expect(result.detailed.leftLength).toBeGreaterThan(0);
      expect(result.detailed.rightLength).toBeGreaterThan(0);
      expect(result.detailed.height).toBeGreaterThanOrEqual(0);
      expect(result.detailed.spacing).toBeGreaterThan(0);
    });
  });
});
