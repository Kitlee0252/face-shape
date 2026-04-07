import type {
  Point,
  FaceShapeType,
  FaceMeasurements,
  FaceRatios,
  FaceShapeScore,
  FaceShapeResult,
} from './types';
import { distance, angleDeg, rangeScore } from './geometry';

/**
 * MediaPipe FaceMesh 478-point landmark indices for face shape measurements.
 * Reference: https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/mesh_map.jpg
 */
const LANDMARKS = {
  foreheadLeft: 71,
  foreheadRight: 301,
  cheekboneLeft: 234,
  cheekboneRight: 454,
  jawLeft: 58,
  jawRight: 288,
  foreheadTop: 10,
  chin: 152,
} as const;

/**
 * Target ranges for each face shape's ratios.
 * [aspectRatio, foreheadRatio, jawRatio, jawAngle]
 * Each is [min, max].
 */
const SHAPE_RULES: Record<
  FaceShapeType,
  {
    aspect: [number, number];
    forehead: [number, number];
    jaw: [number, number];
    jawAngle: [number, number];
    weight: [number, number, number, number]; // weights for each dimension
  }
> = {
  oval: {
    aspect: [1.3, 1.5],
    forehead: [0.74, 0.9],
    jaw: [0.7, 0.88],
    jawAngle: [120, 140],
    weight: [1.5, 1, 1, 0.8],
  },
  round: {
    aspect: [1.0, 1.25],
    forehead: [0.8, 0.95],
    jaw: [0.8, 0.95],
    jawAngle: [135, 160],
    weight: [1.5, 0.8, 0.8, 1.2],
  },
  square: {
    aspect: [1.0, 1.3],
    forehead: [0.85, 1.0],
    jaw: [0.88, 1.05],
    jawAngle: [100, 125],
    weight: [1, 0.8, 1.3, 1.5],
  },
  heart: {
    aspect: [1.2, 1.5],
    forehead: [0.85, 1.05],
    jaw: [0.6, 0.78],
    jawAngle: [110, 135],
    weight: [1, 1.2, 1.5, 1],
  },
  oblong: {
    aspect: [1.5, 1.8],
    forehead: [0.75, 0.92],
    jaw: [0.7, 0.9],
    jawAngle: [115, 140],
    weight: [2, 0.8, 0.8, 0.8],
  },
  diamond: {
    aspect: [1.2, 1.5],
    forehead: [0.65, 0.82],
    jaw: [0.6, 0.8],
    jawAngle: [115, 140],
    weight: [1, 1.3, 1.3, 0.8],
  },
  triangle: {
    aspect: [1.1, 1.4],
    forehead: [0.65, 0.82],
    jaw: [0.88, 1.1],
    jawAngle: [115, 140],
    weight: [0.8, 1.3, 1.5, 0.8],
  },
};

function extractMeasurements(keypoints: Point[]): FaceMeasurements {
  return {
    foreheadWidth: distance(
      keypoints[LANDMARKS.foreheadLeft],
      keypoints[LANDMARKS.foreheadRight]
    ),
    cheekboneWidth: distance(
      keypoints[LANDMARKS.cheekboneLeft],
      keypoints[LANDMARKS.cheekboneRight]
    ),
    jawWidth: distance(
      keypoints[LANDMARKS.jawLeft],
      keypoints[LANDMARKS.jawRight]
    ),
    faceHeight: distance(
      keypoints[LANDMARKS.foreheadTop],
      keypoints[LANDMARKS.chin]
    ),
    jawAngle: angleDeg(
      keypoints[LANDMARKS.jawLeft],
      keypoints[LANDMARKS.chin],
      keypoints[LANDMARKS.jawRight]
    ),
  };
}

function computeRatios(m: FaceMeasurements): FaceRatios {
  return {
    aspectRatio: m.faceHeight / m.cheekboneWidth,
    foreheadRatio: m.foreheadWidth / m.cheekboneWidth,
    jawRatio: m.jawWidth / m.cheekboneWidth,
    jawAngle: m.jawAngle,
  };
}

function scoreShape(ratios: FaceRatios, type: FaceShapeType): number {
  const rule = SHAPE_RULES[type];
  const [wA, wF, wJ, wJA] = rule.weight;

  const sA = rangeScore(ratios.aspectRatio, rule.aspect[0], rule.aspect[1]);
  const sF = rangeScore(ratios.foreheadRatio, rule.forehead[0], rule.forehead[1]);
  const sJ = rangeScore(ratios.jawRatio, rule.jaw[0], rule.jaw[1]);
  const sJA = rangeScore(ratios.jawAngle, rule.jawAngle[0], rule.jawAngle[1], 15);

  const totalWeight = wA + wF + wJ + wJA;
  return (sA * wA + sF * wF + sJ * wJ + sJA * wJA) / totalWeight;
}

export function classifyFaceShape(keypoints: Point[]): FaceShapeResult {
  const measurements = extractMeasurements(keypoints);
  const ratios = computeRatios(measurements);

  const scores: FaceShapeScore[] = (
    Object.keys(SHAPE_RULES) as FaceShapeType[]
  )
    .map((type) => ({
      type,
      confidence: scoreShape(ratios, type),
    }))
    .sort((a, b) => b.confidence - a.confidence);

  const primary = scores[0];
  // Secondary shape if it's close enough (within 15% of primary)
  const secondary =
    scores[1].confidence >= primary.confidence * 0.85 ? scores[1] : null;

  return {
    primary,
    secondary,
    all: scores,
    measurements,
    ratios,
    keypoints,
  };
}

export { LANDMARKS };
