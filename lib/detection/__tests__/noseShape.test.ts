import { describe, it, expect } from 'vitest';
import { classifyNoseShape, NOSE_LANDMARKS } from '../noseShape';
import type { Point } from '../types';

function makeKeypoints(overrides: Record<number, [number, number]>): Point[] {
  const kp: Point[] = Array.from({ length: 478 }, () => ({ x: 0, y: 0, z: 0 }));
  for (const [idx, [x, y]] of Object.entries(overrides)) {
    kp[Number(idx)] = { x, y, z: 0 };
  }
  return kp;
}

/**
 * Build nose keypoints with face reference points.
 * faceWidth and faceHeight define the overall face, nose is placed relative.
 */
function makeNoseKeypoints(params: {
  noseWidthRatio: number;   // nose width / face width
  noseLengthRatio: number;  // nose length / face height
}): Point[] {
  const faceWidth = 200;
  const faceHeight = 280;
  const cx = 250;

  const noseWidth = faceWidth * params.noseWidthRatio;
  const noseLength = faceHeight * params.noseLengthRatio;

  const bridgeTopY = 100;
  const tipY = bridgeTopY + noseLength;

  return makeKeypoints({
    // Face reference
    234: [cx - faceWidth / 2, 110],  // cheekboneLeft
    454: [cx + faceWidth / 2, 110],  // cheekboneRight
    10: [cx, 0],                      // foreheadTop
    152: [cx, faceHeight],            // chin
    // Nose
    [NOSE_LANDMARKS.bridgeTop]: [cx, bridgeTopY],
    [NOSE_LANDMARKS.tip]: [cx, tipY],
    [NOSE_LANDMARKS.nostrilLeft]: [cx - noseWidth / 2, tipY - 5],
    [NOSE_LANDMARKS.nostrilRight]: [cx + noseWidth / 2, tipY - 5],
  });
}

describe('classifyNoseShape', () => {
  describe('width classification', () => {
    it('detects wide nose', () => {
      const kp = makeNoseKeypoints({ noseWidthRatio: 0.32, noseLengthRatio: 0.28 });
      const result = classifyNoseShape(kp);
      expect(result.width).toBe('wide');
      expect(result.widthRatio).toBeGreaterThan(0.28);
    });

    it('detects medium nose', () => {
      const kp = makeNoseKeypoints({ noseWidthRatio: 0.25, noseLengthRatio: 0.28 });
      const result = classifyNoseShape(kp);
      expect(result.width).toBe('medium');
    });

    it('detects narrow nose', () => {
      const kp = makeNoseKeypoints({ noseWidthRatio: 0.18, noseLengthRatio: 0.28 });
      const result = classifyNoseShape(kp);
      expect(result.width).toBe('narrow');
      expect(result.widthRatio).toBeLessThan(0.22);
    });
  });

  describe('length classification', () => {
    it('detects long nose', () => {
      const kp = makeNoseKeypoints({ noseWidthRatio: 0.25, noseLengthRatio: 0.36 });
      const result = classifyNoseShape(kp);
      expect(result.length).toBe('long');
    });

    it('detects medium nose length', () => {
      const kp = makeNoseKeypoints({ noseWidthRatio: 0.25, noseLengthRatio: 0.28 });
      const result = classifyNoseShape(kp);
      expect(result.length).toBe('medium');
    });

    it('detects short nose', () => {
      const kp = makeNoseKeypoints({ noseWidthRatio: 0.25, noseLengthRatio: 0.2 });
      const result = classifyNoseShape(kp);
      expect(result.length).toBe('short');
    });
  });

  describe('result structure', () => {
    it('includes bridge angle measurement', () => {
      const kp = makeNoseKeypoints({ noseWidthRatio: 0.25, noseLengthRatio: 0.28 });
      const result = classifyNoseShape(kp);
      expect(result.bridgeAngle).toBeGreaterThan(0);
      expect(result.bridgeAngle).toBeLessThan(180);
    });

    it('ratios are positive numbers', () => {
      const kp = makeNoseKeypoints({ noseWidthRatio: 0.25, noseLengthRatio: 0.28 });
      const result = classifyNoseShape(kp);
      expect(result.widthRatio).toBeGreaterThan(0);
      expect(result.lengthRatio).toBeGreaterThan(0);
    });
  });

  describe('bridge classification', () => {
    it('classifies nose bridge height', () => {
      const kp = makeNoseKeypoints({ noseWidthRatio: 0.25, noseLengthRatio: 0.28 });
      const result = classifyNoseShape(kp);
      expect(['very high', 'high', 'medium', 'low']).toContain(result.bridge);
    });
  });

  describe('shape classification', () => {
    it('classifies nose shape', () => {
      const kp = makeNoseKeypoints({ noseWidthRatio: 0.25, noseLengthRatio: 0.28 });
      const result = classifyNoseShape(kp);
      expect(['straight', 'curved', 'concave']).toContain(result.shapeClass);
    });
  });

  describe('proportion classification', () => {
    it('classifies proportion', () => {
      const kp = makeNoseKeypoints({ noseWidthRatio: 0.25, noseLengthRatio: 0.28 });
      const result = classifyNoseShape(kp);
      expect(['proportioned', 'slightly disproportioned', 'disproportioned']).toContain(result.proportion);
    });
  });

  describe('detailed measurements', () => {
    it('includes raw measurements', () => {
      const kp = makeNoseKeypoints({ noseWidthRatio: 0.25, noseLengthRatio: 0.28 });
      const result = classifyNoseShape(kp);
      expect(result.detailed.length).toBeGreaterThan(0);
      expect(result.detailed.width).toBeGreaterThan(0);
      expect(result.detailed.bridgeHeight).toBeGreaterThan(0);
      expect(result.detailed.bridgeWidth).toBeGreaterThanOrEqual(0);
    });
  });
});
