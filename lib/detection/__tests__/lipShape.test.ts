import { describe, it, expect } from 'vitest';
import { classifyLipShape, LIP_LANDMARKS } from '../lipShape';
import type { Point } from '../types';

function makeKeypoints(overrides: Record<number, [number, number]>): Point[] {
  const kp: Point[] = Array.from({ length: 478 }, () => ({ x: 0, y: 0, z: 0 }));
  for (const [idx, [x, y]] of Object.entries(overrides)) {
    kp[Number(idx)] = { x, y, z: 0 };
  }
  return kp;
}

function makeLipKeypoints(params: {
  thicknessRatio: number;  // total lip height / lip width
  widthRatio: number;       // lip width / face width
  upperLowerRatio: number;  // upper height / lower height
}): Point[] {
  const faceWidth = 200;
  const cx = 250;
  const lipY = 250;

  const lipWidth = faceWidth * params.widthRatio;
  const totalHeight = lipWidth * params.thicknessRatio;
  const upperH = totalHeight * params.upperLowerRatio / (1 + params.upperLowerRatio);
  const lowerH = totalHeight - upperH;

  return makeKeypoints({
    // Face reference
    234: [cx - faceWidth / 2, 110],
    454: [cx + faceWidth / 2, 110],
    // Lip landmarks
    [LIP_LANDMARKS.upperOuter]: [cx, lipY - upperH],
    [LIP_LANDMARKS.upperInner]: [cx, lipY],
    [LIP_LANDMARKS.lowerInner]: [cx, lipY],
    [LIP_LANDMARKS.lowerOuter]: [cx, lipY + lowerH],
    [LIP_LANDMARKS.cornerLeft]: [cx - lipWidth / 2, lipY],
    [LIP_LANDMARKS.cornerRight]: [cx + lipWidth / 2, lipY],
  });
}

describe('classifyLipShape', () => {
  describe('thickness classification', () => {
    it('detects full lips', () => {
      const kp = makeLipKeypoints({ thicknessRatio: 0.38, widthRatio: 0.38, upperLowerRatio: 0.7 });
      const result = classifyLipShape(kp);
      expect(result.thickness).toBe('full');
    });

    it('detects medium lips', () => {
      const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.38, upperLowerRatio: 0.7 });
      const result = classifyLipShape(kp);
      expect(result.thickness).toBe('medium');
    });

    it('detects thin lips', () => {
      const kp = makeLipKeypoints({ thicknessRatio: 0.18, widthRatio: 0.38, upperLowerRatio: 0.7 });
      const result = classifyLipShape(kp);
      expect(result.thickness).toBe('thin');
    });
  });

  describe('width classification', () => {
    it('detects wide lips', () => {
      const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.46, upperLowerRatio: 0.7 });
      const result = classifyLipShape(kp);
      expect(result.width).toBe('wide');
    });

    it('detects medium width', () => {
      const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.38, upperLowerRatio: 0.7 });
      const result = classifyLipShape(kp);
      expect(result.width).toBe('medium');
    });

    it('detects narrow lips', () => {
      const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.30, upperLowerRatio: 0.7 });
      const result = classifyLipShape(kp);
      expect(result.width).toBe('narrow');
    });
  });

  describe('upper/lower ratio', () => {
    it('measures upper/lower lip ratio correctly', () => {
      const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.38, upperLowerRatio: 0.8 });
      const result = classifyLipShape(kp);
      expect(result.upperLowerRatio).toBeCloseTo(0.8, 1);
    });
  });

  describe('edge cases', () => {
    it('handles equal upper and lower lips', () => {
      const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.38, upperLowerRatio: 1.0 });
      const result = classifyLipShape(kp);
      expect(result.upperLowerRatio).toBeCloseTo(1.0, 1);
    });
  });

  describe('shape classification', () => {
    it('detects top-heavy lips', () => {
      const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.38, upperLowerRatio: 1.3 });
      const result = classifyLipShape(kp);
      expect(result.shapeClass).toBe('top-heavy');
    });

    it('detects balanced lips', () => {
      const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.38, upperLowerRatio: 0.9 });
      const result = classifyLipShape(kp);
      expect(result.shapeClass).toBe('balanced');
    });

    it('detects bottom-heavy lips', () => {
      const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.38, upperLowerRatio: 0.5 });
      const result = classifyLipShape(kp);
      expect(result.shapeClass).toBe('bottom-heavy');
    });
  });

  describe('cupid bow classification', () => {
    it('classifies cupid bow', () => {
      const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.38, upperLowerRatio: 0.7 });
      const result = classifyLipShape(kp);
      expect(['pronounced', 'moderate', 'flat']).toContain(result.cupidBow);
    });
  });

  describe('symmetry', () => {
    it('detects good symmetry for level corners', () => {
      const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.38, upperLowerRatio: 0.7 });
      const result = classifyLipShape(kp);
      expect(['excellent', 'good']).toContain(result.symmetry);
    });
  });

  describe('detailed measurements', () => {
    it('includes raw measurements', () => {
      const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.38, upperLowerRatio: 0.7 });
      const result = classifyLipShape(kp);
      expect(result.detailed.height).toBeGreaterThan(0);
      expect(result.detailed.upperHeight).toBeGreaterThan(0);
      expect(result.detailed.lowerHeight).toBeGreaterThan(0);
      expect(result.detailed.width).toBeGreaterThan(0);
    });
  });
});
