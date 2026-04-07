import { describe, it, expect } from 'vitest';
import { computeFeatureRatings } from '../featureRating';
import type { FiveAnalysisResult } from '../types';

function makeMockResult(): FiveAnalysisResult {
  return {
    faceShape: {} as any,
    eyeShape: {
      slope: 'straight', size: 'medium', spacing: 'standard',
      shape: 'almond', symmetry: 'good',
      slopeAngle: 1, sizeRatio: 0.33, spacingRatio: 1.0,
      detailed: { aspectRatio: 3.0, avgHeight: 13, avgWidth: 40, distance: 42, leftWidth: 40, rightWidth: 40 },
    },
    noseShape: {
      width: 'medium', length: 'medium', bridgeAngle: 35,
      widthRatio: 0.25, lengthRatio: 0.29,
      bridge: 'medium', shapeClass: 'straight', proportion: 'proportioned',
      detailed: { bridgeHeight: 50, bridgeWidth: 20, length: 70, width: 50 },
    },
    lipShape: {
      thickness: 'medium', width: 'medium',
      upperLowerRatio: 0.7, thicknessRatio: 0.28, widthRatio: 0.39,
      cupidBow: 'moderate', shapeClass: 'balanced', symmetry: 'good',
      detailed: { height: 20, upperHeight: 8, lowerHeight: 12, width: 60 },
    },
    eyebrowShape: {
      shape: 'arched', slope: 'flat', archAngle: 150, spacing: 1.0,
      thickness: 'medium', length: 'medium', symmetry: 'good',
      detailed: { height: 5, leftLength: 50, rightLength: 50, length: 50, spacing: 35 },
    },
    keypoints: [],
  };
}

describe('computeFeatureRatings', () => {
  it('returns sub-ratings for each feature', () => {
    const result = makeMockResult();
    const ratings = computeFeatureRatings(result);
    // Eyes sub-ratings
    expect(ratings.eyes.overall).toBeGreaterThanOrEqual(5);
    expect(ratings.eyes.overall).toBeLessThanOrEqual(10);
    expect(typeof ratings.eyes.shape).toBe('number');
    expect(typeof ratings.eyes.size).toBe('number');
    expect(typeof ratings.eyes.spacing).toBe('number');
    expect(typeof ratings.eyes.symmetry).toBe('number');
    // Brows sub-ratings
    expect(typeof ratings.eyebrows.overall).toBe('number');
    expect(typeof ratings.eyebrows.arch).toBe('number');
    expect(typeof ratings.eyebrows.spacing).toBe('number');
    expect(typeof ratings.eyebrows.thickness).toBe('number');
    // Lips sub-ratings
    expect(typeof ratings.lips.overall).toBe('number');
    expect(typeof ratings.lips.cupidBow).toBe('number');
    expect(typeof ratings.lips.proportion).toBe('number');
    expect(typeof ratings.lips.shape).toBe('number');
    expect(typeof ratings.lips.thickness).toBe('number');
    expect(typeof ratings.lips.width).toBe('number');
    // Nose sub-ratings
    expect(typeof ratings.nose.overall).toBe('number');
    expect(typeof ratings.nose.bridge).toBe('number');
    expect(typeof ratings.nose.length).toBe('number');
    expect(typeof ratings.nose.proportion).toBe('number');
    expect(typeof ratings.nose.width).toBe('number');
    // Overall
    expect(ratings.overall).toBeGreaterThanOrEqual(5);
    expect(ratings.overall).toBeLessThanOrEqual(10);
  });

  it('scores ideal proportions higher', () => {
    const ideal = makeMockResult();
    const ratings = computeFeatureRatings(ideal);
    expect(ratings.eyes.overall).toBeGreaterThan(7);
    expect(ratings.nose.overall).toBeGreaterThan(7);
  });

  it('all scores are between 5 and 10', () => {
    const result = makeMockResult();
    const ratings = computeFeatureRatings(result);
    const allScores = [
      ratings.eyes.overall, ratings.eyes.shape, ratings.eyes.size, ratings.eyes.spacing, ratings.eyes.symmetry,
      ratings.eyebrows.overall, ratings.eyebrows.arch, ratings.eyebrows.spacing, ratings.eyebrows.thickness,
      ratings.lips.overall, ratings.lips.cupidBow, ratings.lips.proportion, ratings.lips.shape, ratings.lips.thickness, ratings.lips.width,
      ratings.nose.overall, ratings.nose.bridge, ratings.nose.length, ratings.nose.proportion, ratings.nose.width,
      ratings.overall,
    ];
    for (const score of allScores) {
      expect(score).toBeGreaterThanOrEqual(5);
      expect(score).toBeLessThanOrEqual(10);
    }
  });
});
