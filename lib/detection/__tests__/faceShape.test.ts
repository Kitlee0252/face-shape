import { describe, it, expect } from 'vitest';
import { classifyFaceShape, LANDMARKS } from '../faceShape';
import type { Point } from '../types';

/**
 * FACE_OVAL contour landmark indices (must match contourProfile.ts).
 * Right half (top -> chin), Left half (chin -> top).
 */
const FACE_OVAL_RIGHT = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
  378, 400, 377, 152,
] as const;

const FACE_OVAL_LEFT = [
  152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103,
  67, 109, 10,
] as const;

/**
 * Build a synthetic 478-point face with controllable contour shape.
 *
 * @param aspect      - face height / cheekbone width (controls aspect ratio)
 * @param chinAngleDeg - angle at chin formed by jawLeft-chin-jawRight (degrees)
 * @param topScale    - width multiplier for upper face (>1 = wider top = heart-like)
 * @param bottomScale - width multiplier for lower face (>1 = wider bottom = triangle-like)
 * @param peakHeight  - where widest point is (0=top, 1=bottom). 0.5 = middle.
 *
 * The cheekbone landmark width is always fixed at `cheekW` so that aspect ratio
 * is purely controlled by the `aspect` parameter. The contour shape is a
 * modified ellipse where the width at each height gets an additional scale
 * factor that smoothly transitions between topScale and bottomScale with the
 * widest point at peakHeight.
 */
function makeContourFace(
  aspect: number,
  chinAngleDeg: number,
  topScale: number = 1.0,
  bottomScale: number = 1.0,
  peakHeight: number = 0.5
): Point[] {
  const cx = 250;
  const cheekW = 200; // base cheekbone width (landmark-measured)
  const faceH = cheekW * aspect;
  const rx = cheekW / 2; // base horizontal radius
  const ry = faceH / 2;

  const topY = 0;
  const botY = faceH;
  const cy = faceH / 2;

  const kp: Point[] = Array.from({ length: 478 }, () => ({
    x: cx,
    y: cy,
    z: 0,
  }));

  /**
   * Compute width scale factor at a given normalized height h (0=top, 1=bottom).
   */
  function widthScale(h: number): number {
    if (h <= peakHeight) {
      const t = peakHeight > 0 ? h / peakHeight : 1;
      const peakVal = Math.max(topScale, bottomScale) * 1.1;
      return topScale + t * (peakVal - topScale);
    } else {
      const t = peakHeight < 1 ? (h - peakHeight) / (1 - peakHeight) : 0;
      const peakVal = Math.max(topScale, bottomScale) * 1.1;
      return peakVal + t * (bottomScale - peakVal);
    }
  }

  /**
   * Compute the half-width of the face at a given normalized height h (0=top, 1=bottom).
   * Uses a super-ellipse shape instead of a regular ellipse to avoid zero width at tips.
   * The exponent controls how quickly the face tapers: 2.0 = ellipse, higher = flatter.
   */
  function contourHalfWidth(h: number): number {
    // Map h to parametric position: 0 = top, 0.5 = widest, 1 = bottom
    const relY = 2 * h - 1; // -1..+1
    // Super-ellipse: x = (1 - |y|^n)^(1/n) with n=2.5 for slightly flatter shape
    const n = 2.5;
    const baseWidth = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(relY), n)), 1 / n);
    return rx * baseWidth * widthScale(h);
  }

  // Place right-half contour points
  for (let i = 0; i < FACE_OVAL_RIGHT.length; i++) {
    const t = i / (FACE_OVAL_RIGHT.length - 1);
    const y = topY + t * (botY - topY);
    const xOff = contourHalfWidth(t);
    kp[FACE_OVAL_RIGHT[i]] = { x: cx + xOff, y, z: 0 };
  }

  // Place left-half contour points (bottom -> top)
  for (let i = 0; i < FACE_OVAL_LEFT.length; i++) {
    const t = i / (FACE_OVAL_LEFT.length - 1);
    const y = botY - t * (botY - topY);
    const h = 1 - t;
    const xOff = contourHalfWidth(h);
    kp[FACE_OVAL_LEFT[i]] = { x: cx - xOff, y, z: 0 };
  }

  // Place cheekbone landmarks (234/454) at fixed width = cheekW.
  // This ensures aspect ratio = faceH / cheekW = the `aspect` parameter.
  // The contour already places these via the FACE_OVAL loop, but we override
  // to decouple cheekbone measurement from the contour scale factors.
  const cheekY = topY + faceH * 0.4;
  kp[LANDMARKS.cheekboneLeft] = { x: cx - cheekW / 2, y: cheekY, z: 0 };
  kp[LANDMARKS.cheekboneRight] = { x: cx + cheekW / 2, y: cheekY, z: 0 };

  // Place foreheadTop (10) and chin (152)
  kp[LANDMARKS.foreheadTop] = { x: cx, y: topY, z: 0 };
  kp[LANDMARKS.chin] = { x: cx, y: botY, z: 0 };

  // Place jaw landmarks (58/288) for chin angle calculation
  const halfAngle = (chinAngleDeg / 2) * (Math.PI / 180);
  const jawArmLength = cheekW * 0.5;
  const jawDx = jawArmLength * Math.sin(halfAngle);
  const jawDy = jawArmLength * Math.cos(halfAngle);
  kp[LANDMARKS.jawLeft] = { x: cx - jawDx, y: botY - jawDy, z: 0 };
  kp[LANDMARKS.jawRight] = { x: cx + jawDx, y: botY - jawDy, z: 0 };

  return kp;
}

describe('classifyFaceShape', () => {
  describe('returns correct primary type for ideal shapes', () => {
    it('classifies oval face', () => {
      // Moderate aspect, balanced widths, moderate taper
      const kp = makeContourFace(1.38, 115, 1.0, 1.0, 0.4);
      const result = classifyFaceShape(kp);
      expect(result.primary.type).toBe('oval');
      expect(result.primary.confidence).toBeGreaterThan(0.5);
    });

    it('classifies round face', () => {
      // Low aspect, wide chin angle, uniform widths, high flatness
      const kp = makeContourFace(1.12, 130, 1.0, 1.0, 0.45);
      const result = classifyFaceShape(kp);
      expect(result.primary.type).toBe('round');
      expect(result.primary.confidence).toBeGreaterThan(0.5);
    });

    it('classifies square face', () => {
      // Low aspect, sharp chin angle, low taper, high flatness
      const kp = makeContourFace(1.12, 95, 1.0, 1.0, 0.45);
      const result = classifyFaceShape(kp);
      expect(result.primary.type).toBe('square');
      expect(result.primary.confidence).toBeGreaterThan(0.5);
    });

    it('classifies heart face', () => {
      // Wider top, narrower bottom, high taper
      const kp = makeContourFace(1.35, 108, 1.2, 0.6, 0.3);
      const result = classifyFaceShape(kp);
      expect(result.primary.type).toBe('heart');
      expect(result.primary.confidence).toBeGreaterThan(0.5);
    });

    it('classifies oblong face', () => {
      // Very high aspect ratio, balanced widths
      const kp = makeContourFace(1.65, 115, 1.0, 1.0, 0.4);
      const result = classifyFaceShape(kp);
      expect(result.primary.type).toBe('oblong');
      expect(result.primary.confidence).toBeGreaterThan(0.5);
    });

    it('classifies diamond face', () => {
      // Narrow top and bottom, wide middle, balanced topBottom, low flatness
      const kp = makeContourFace(1.35, 110, 0.6, 0.6, 0.45);
      const result = classifyFaceShape(kp);
      expect(result.primary.type).toBe('diamond');
      expect(result.primary.confidence).toBeGreaterThan(0.5);
    });

    it('classifies triangle face', () => {
      // Narrow top, wider bottom, peak lower
      const kp = makeContourFace(1.2, 110, 0.7, 1.3, 0.55);
      const result = classifyFaceShape(kp);
      expect(result.primary.type).toBe('triangle');
      expect(result.primary.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('result structure', () => {
    it('returns all 7 shape scores sorted by confidence descending', () => {
      const kp = makeContourFace(1.38, 115, 1.0, 1.0, 0.4);
      const result = classifyFaceShape(kp);
      expect(result.all).toHaveLength(7);
      for (let i = 1; i < result.all.length; i++) {
        expect(result.all[i - 1].confidence).toBeGreaterThanOrEqual(
          result.all[i].confidence
        );
      }
    });

    it('all confidences are between 0 and 1', () => {
      const kp = makeContourFace(1.38, 115, 1.0, 1.0, 0.4);
      const result = classifyFaceShape(kp);
      for (const score of result.all) {
        expect(score.confidence).toBeGreaterThanOrEqual(0);
        expect(score.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('includes measurements and ratios', () => {
      const kp = makeContourFace(1.38, 115, 1.0, 1.0, 0.4);
      const result = classifyFaceShape(kp);
      expect(result.measurements.cheekboneWidth).toBeGreaterThan(0);
      expect(result.measurements.faceHeight).toBeGreaterThan(0);
      expect(result.ratios.aspectRatio).toBeGreaterThan(1);
    });

    it('includes keypoints in result', () => {
      const kp = makeContourFace(1.38, 115, 1.0, 1.0, 0.4);
      const result = classifyFaceShape(kp);
      expect(result.keypoints).toHaveLength(478);
    });
  });

  describe('key differentiators', () => {
    it('heart vs triangle by topBottomRatio', () => {
      const heart = classifyFaceShape(
        makeContourFace(1.35, 108, 1.2, 0.6, 0.3)
      );
      const triangle = classifyFaceShape(
        makeContourFace(1.2, 110, 0.7, 1.3, 0.55)
      );
      expect(heart.primary.type).toBe('heart');
      expect(triangle.primary.type).toBe('triangle');
      // Heart has topBottomRatio > 1, triangle < 1
      expect(heart.ratios.topBottomRatio).toBeGreaterThan(1);
      expect(triangle.ratios.topBottomRatio).toBeLessThan(1);
    });

    it('round vs square by taperRate and chinAngle', () => {
      const round = classifyFaceShape(
        makeContourFace(1.12, 130, 1.0, 1.0, 0.45)
      );
      const square = classifyFaceShape(
        makeContourFace(1.12, 95, 1.0, 1.0, 0.45)
      );
      expect(round.primary.type).toBe('round');
      expect(square.primary.type).toBe('square');
    });

    it('oval vs oblong by aspectRatio', () => {
      const oval = classifyFaceShape(
        makeContourFace(1.38, 115, 1.0, 1.0, 0.4)
      );
      const oblong = classifyFaceShape(
        makeContourFace(1.65, 115, 1.0, 1.0, 0.4)
      );
      expect(oval.primary.type).toBe('oval');
      expect(oblong.primary.type).toBe('oblong');
    });
  });
});
