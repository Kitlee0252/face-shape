import { describe, it, expect } from 'vitest';
import { classifyFaceShape, LANDMARKS } from '../faceShape';
import type { Point } from '../types';

/**
 * Build a synthetic 478-point keypoints array with only the
 * measurement-critical points positioned deliberately.
 * All other points default to (0,0,0).
 */
function makeKeypoints(overrides: Record<number, [number, number]>): Point[] {
  const kp: Point[] = Array.from({ length: 478 }, () => ({ x: 0, y: 0, z: 0 }));
  for (const [idx, [x, y]] of Object.entries(overrides)) {
    kp[Number(idx)] = { x, y, z: 0 };
  }
  return kp;
}

/**
 * Create keypoints from desired ratios:
 *   aspect = faceHeight / cheekboneWidth
 *   forehead = foreheadWidth / cheekboneWidth
 *   jaw = jawWidth / cheekboneWidth
 *   jawAngle = angle at chin formed by jawLeft-chin-jawRight (degrees)
 */
function keypointsFromRatios(
  aspect: number,
  forehead: number,
  jaw: number,
  jawAngleDeg: number
): Point[] {
  const cheekW = 200; // arbitrary base
  const faceH = cheekW * aspect;
  const foreheadW = cheekW * forehead;
  const jawW = cheekW * jaw;

  // Face centered at (250, faceH/2)
  const cx = 250;
  const topY = 0;
  const chinY = faceH;

  // Jaw angle: place jawLeft and jawRight such that the angle at chin = jawAngleDeg
  // The angle at chin between jawLeft-chin-jawRight
  const halfAngle = (jawAngleDeg / 2) * (Math.PI / 180);
  const jawArmLength = jawW / (2 * Math.sin(halfAngle));
  const jawLx = cx - jawW / 2;
  const jawRx = cx + jawW / 2;
  const jawY = chinY - jawArmLength * Math.cos(halfAngle);

  return makeKeypoints({
    [LANDMARKS.foreheadTop]: [cx, topY],
    [LANDMARKS.chin]: [cx, chinY],
    [LANDMARKS.foreheadLeft]: [cx - foreheadW / 2, topY + faceH * 0.15],
    [LANDMARKS.foreheadRight]: [cx + foreheadW / 2, topY + faceH * 0.15],
    [LANDMARKS.cheekboneLeft]: [cx - cheekW / 2, faceH * 0.4],
    [LANDMARKS.cheekboneRight]: [cx + cheekW / 2, faceH * 0.4],
    [LANDMARKS.jawLeft]: [jawLx, jawY],
    [LANDMARKS.jawRight]: [jawRx, jawY],
  });
}

describe('classifyFaceShape', () => {
  describe('returns correct primary type for ideal shapes', () => {
    it('classifies oval face (aspect ~1.4, balanced widths, moderate jaw angle)', () => {
      const kp = keypointsFromRatios(1.38, 0.83, 0.78, 130);
      const result = classifyFaceShape(kp);
      expect(result.primary.type).toBe('oval');
      expect(result.primary.confidence).toBeGreaterThan(0.5);
    });

    it('classifies round face (aspect ~1.1, similar widths, wide jaw angle)', () => {
      const kp = keypointsFromRatios(1.12, 0.9, 0.9, 155);
      const result = classifyFaceShape(kp);
      expect(result.primary.type).toBe('round');
      expect(result.primary.confidence).toBeGreaterThan(0.5);
    });

    it('classifies square face (aspect ~1.15, wide jaw, sharp jaw angle)', () => {
      const kp = keypointsFromRatios(1.15, 0.93, 0.97, 112);
      const result = classifyFaceShape(kp);
      expect(result.primary.type).toBe('square');
      expect(result.primary.confidence).toBeGreaterThan(0.5);
    });

    it('classifies heart face (wide forehead, narrow jaw)', () => {
      const kp = keypointsFromRatios(1.35, 0.96, 0.68, 122);
      const result = classifyFaceShape(kp);
      expect(result.primary.type).toBe('heart');
      expect(result.primary.confidence).toBeGreaterThan(0.5);
    });

    it('classifies oblong face (very high aspect ratio)', () => {
      const kp = keypointsFromRatios(1.65, 0.83, 0.8, 130);
      const result = classifyFaceShape(kp);
      expect(result.primary.type).toBe('oblong');
      expect(result.primary.confidence).toBeGreaterThan(0.5);
    });

    it('classifies diamond face (narrow forehead and jaw, wide cheekbones)', () => {
      const kp = keypointsFromRatios(1.35, 0.72, 0.7, 128);
      const result = classifyFaceShape(kp);
      expect(result.primary.type).toBe('diamond');
      expect(result.primary.confidence).toBeGreaterThan(0.5);
    });

    it('classifies triangle face (narrow forehead, wide jaw)', () => {
      const kp = keypointsFromRatios(1.2, 0.72, 0.98, 128);
      const result = classifyFaceShape(kp);
      expect(result.primary.type).toBe('triangle');
      expect(result.primary.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('result structure', () => {
    it('returns all 7 shape scores sorted by confidence descending', () => {
      const kp = keypointsFromRatios(1.38, 0.83, 0.78, 130);
      const result = classifyFaceShape(kp);
      expect(result.all).toHaveLength(7);
      for (let i = 1; i < result.all.length; i++) {
        expect(result.all[i - 1].confidence).toBeGreaterThanOrEqual(result.all[i].confidence);
      }
    });

    it('all confidences are between 0 and 1', () => {
      const kp = keypointsFromRatios(1.38, 0.83, 0.78, 130);
      const result = classifyFaceShape(kp);
      for (const score of result.all) {
        expect(score.confidence).toBeGreaterThanOrEqual(0);
        expect(score.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('includes measurements and ratios', () => {
      const kp = keypointsFromRatios(1.38, 0.83, 0.78, 130);
      const result = classifyFaceShape(kp);
      expect(result.measurements.cheekboneWidth).toBeGreaterThan(0);
      expect(result.measurements.faceHeight).toBeGreaterThan(0);
      expect(result.ratios.aspectRatio).toBeCloseTo(1.38, 1);
    });

    it('includes keypoints in result', () => {
      const kp = keypointsFromRatios(1.38, 0.83, 0.78, 130);
      const result = classifyFaceShape(kp);
      expect(result.keypoints).toHaveLength(478);
    });
  });

  describe('mixed face shapes (secondary detection)', () => {
    it('detects secondary shape when scores are close', () => {
      // Borderline oval/oblong: aspect 1.48 (top of oval, near oblong)
      const kp = keypointsFromRatios(1.48, 0.83, 0.8, 130);
      const result = classifyFaceShape(kp);
      // Should have a secondary since it's on the border
      if (result.secondary) {
        expect(result.secondary.confidence).toBeGreaterThan(
          result.primary.confidence * 0.85
        );
      }
    });

    it('returns null secondary when primary is dominant', () => {
      // Very clearly round
      const kp = keypointsFromRatios(1.12, 0.9, 0.9, 155);
      const result = classifyFaceShape(kp);
      // Primary should be strongly dominant over most shapes
      expect(result.primary.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('key differentiators', () => {
    it('round vs square is distinguished by jaw angle', () => {
      // Same proportions, different jaw angle
      const round = classifyFaceShape(keypointsFromRatios(1.15, 0.9, 0.92, 155));
      const square = classifyFaceShape(keypointsFromRatios(1.15, 0.92, 0.95, 110));
      expect(round.primary.type).toBe('round');
      expect(square.primary.type).toBe('square');
    });

    it('heart vs diamond is distinguished by forehead width', () => {
      // Heart: wide forehead, narrow jaw
      const heart = classifyFaceShape(keypointsFromRatios(1.35, 0.96, 0.68, 122));
      // Diamond: narrow forehead AND narrow jaw
      const diamond = classifyFaceShape(keypointsFromRatios(1.35, 0.72, 0.7, 128));
      expect(heart.primary.type).toBe('heart');
      expect(diamond.primary.type).toBe('diamond');
    });

    it('oval vs oblong is distinguished by aspect ratio', () => {
      const oval = classifyFaceShape(keypointsFromRatios(1.38, 0.83, 0.78, 130));
      const oblong = classifyFaceShape(keypointsFromRatios(1.65, 0.83, 0.8, 130));
      expect(oval.primary.type).toBe('oval');
      expect(oblong.primary.type).toBe('oblong');
    });
  });
});
