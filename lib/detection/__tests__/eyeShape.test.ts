import { describe, it, expect } from 'vitest';
import { classifyEyeShape, EYE_LANDMARKS } from '../eyeShape';
import type { Point } from '../types';

function makeKeypoints(overrides: Record<number, [number, number]>): Point[] {
  const kp: Point[] = Array.from({ length: 478 }, () => ({ x: 0, y: 0, z: 0 }));
  for (const [idx, [x, y]] of Object.entries(overrides)) {
    kp[Number(idx)] = { x, y, z: 0 };
  }
  return kp;
}

/**
 * Build eye keypoints with controllable parameters.
 * Eyes are placed symmetrically around center x=250.
 */
function makeEyeKeypoints(params: {
  slopeDeg: number;     // positive = upturned
  sizeRatio: number;    // eye height / eye width
  spacingRatio: number; // inter-eye dist / eye width
}): Point[] {
  const { slopeDeg, sizeRatio, spacingRatio } = params;
  const eyeWidth = 40;
  const eyeHeight = eyeWidth * sizeRatio;
  const interEye = eyeWidth * spacingRatio;
  const slopeRad = (slopeDeg * Math.PI) / 180;

  const cy = 200;
  const cx = 250;

  // Right eye (inner corner closer to center)
  const rInnerX = cx - interEye / 2;
  const rOuterX = rInnerX - eyeWidth;
  // Slope: outer corner is higher for upturned (negative dy for right eye)
  const rSlopeDy = -Math.tan(slopeRad) * eyeWidth;

  // Left eye (mirror)
  const lInnerX = cx + interEye / 2;
  const lOuterX = lInnerX + eyeWidth;
  const lSlopeDy = -Math.tan(slopeRad) * eyeWidth; // same slope direction

  return makeKeypoints({
    // Right eye
    [EYE_LANDMARKS.right.inner]: [rInnerX, cy],
    [EYE_LANDMARKS.right.outer]: [rOuterX, cy + rSlopeDy],
    [EYE_LANDMARKS.right.upper]: [(rInnerX + rOuterX) / 2, cy + rSlopeDy / 2 - eyeHeight / 2],
    [EYE_LANDMARKS.right.lower]: [(rInnerX + rOuterX) / 2, cy + rSlopeDy / 2 + eyeHeight / 2],
    // Left eye
    [EYE_LANDMARKS.left.inner]: [lInnerX, cy],
    [EYE_LANDMARKS.left.outer]: [lOuterX, cy + lSlopeDy],
    [EYE_LANDMARKS.left.upper]: [(lInnerX + lOuterX) / 2, cy + lSlopeDy / 2 - eyeHeight / 2],
    [EYE_LANDMARKS.left.lower]: [(lInnerX + lOuterX) / 2, cy + lSlopeDy / 2 + eyeHeight / 2],
  });
}

describe('classifyEyeShape', () => {
  describe('slope classification', () => {
    it('detects upturned eyes (positive slope)', () => {
      const kp = makeEyeKeypoints({ slopeDeg: 8, sizeRatio: 0.33, spacingRatio: 1.0 });
      const result = classifyEyeShape(kp);
      expect(result.slope).toBe('upturned');
      expect(result.slopeAngle).toBeGreaterThan(4);
    });

    it('detects straight eyes (near-zero slope)', () => {
      const kp = makeEyeKeypoints({ slopeDeg: 1, sizeRatio: 0.33, spacingRatio: 1.0 });
      const result = classifyEyeShape(kp);
      expect(result.slope).toBe('straight');
    });

    it('detects downturned eyes (negative slope)', () => {
      const kp = makeEyeKeypoints({ slopeDeg: -8, sizeRatio: 0.33, spacingRatio: 1.0 });
      const result = classifyEyeShape(kp);
      expect(result.slope).toBe('downturned');
      expect(result.slopeAngle).toBeLessThan(-4);
    });
  });

  describe('size classification', () => {
    it('detects large eyes (high height/width ratio)', () => {
      const kp = makeEyeKeypoints({ slopeDeg: 0, sizeRatio: 0.45, spacingRatio: 1.0 });
      const result = classifyEyeShape(kp);
      expect(result.size).toBe('large');
    });

    it('detects medium eyes', () => {
      const kp = makeEyeKeypoints({ slopeDeg: 0, sizeRatio: 0.33, spacingRatio: 1.0 });
      const result = classifyEyeShape(kp);
      expect(result.size).toBe('medium');
    });

    it('detects small eyes (low height/width ratio)', () => {
      const kp = makeEyeKeypoints({ slopeDeg: 0, sizeRatio: 0.22, spacingRatio: 1.0 });
      const result = classifyEyeShape(kp);
      expect(result.size).toBe('small');
    });
  });

  describe('spacing classification', () => {
    it('detects wide-set eyes', () => {
      const kp = makeEyeKeypoints({ slopeDeg: 0, sizeRatio: 0.33, spacingRatio: 1.3 });
      const result = classifyEyeShape(kp);
      expect(result.spacing).toBe('wide-set');
    });

    it('detects standard spacing', () => {
      const kp = makeEyeKeypoints({ slopeDeg: 0, sizeRatio: 0.33, spacingRatio: 1.0 });
      const result = classifyEyeShape(kp);
      expect(result.spacing).toBe('standard');
    });

    it('detects close-set eyes', () => {
      const kp = makeEyeKeypoints({ slopeDeg: 0, sizeRatio: 0.33, spacingRatio: 0.7 });
      const result = classifyEyeShape(kp);
      expect(result.spacing).toBe('close-set');
    });
  });

  describe('result structure', () => {
    it('includes all numeric measurements', () => {
      const kp = makeEyeKeypoints({ slopeDeg: 5, sizeRatio: 0.35, spacingRatio: 1.0 });
      const result = classifyEyeShape(kp);
      expect(typeof result.slopeAngle).toBe('number');
      expect(typeof result.sizeRatio).toBe('number');
      expect(typeof result.spacingRatio).toBe('number');
      expect(result.sizeRatio).toBeCloseTo(0.35, 1);
    });
  });
});
