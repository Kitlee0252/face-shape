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
 *
 * Verified against official FACEMESH connection definitions:
 * - 234/454: on FACE_OVAL contour, widest cheekbone points ✓
 * - 58/288: on FACE_OVAL contour, jaw angle (gonion) ✓
 * - 10/152: top/bottom of FACE_OVAL contour ✓
 * - 71/301: forehead near eyebrow level (not temple-widest, but standard choice)
 *
 * Sources: tfjs-models/face-landmarks-detection, akashchoudhary436/Face-Shape-Detection
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
 * Target ranges for each face shape's key ratios and jaw angle.
 *
 * Cross-validated against:
 * - Mgeijer/framefinder: aspect ratios + forehead/jaw ratios (6 shapes)
 * - sinfulExiled/automated-glasses-recommendation: jaw angle < 160° = angular,
 *   std(widths) low = similar widths → Square/Round
 * - akashchoudhary436/Face-Shape-Detection: confirms face height/width as primary feature
 *
 * Key differentiators per shape:
 * - Round vs Square: jaw angle (round > 140°, square < 130°)
 * - Heart vs Diamond: forehead ratio (heart > 0.85, diamond < 0.82)
 * - Oval vs Oblong: aspect ratio (oval < 1.5, oblong > 1.5)
 * - Triangle: jaw > forehead (jawRatio > foreheadRatio clearly)
 */
const SHAPE_RULES: Record<
  FaceShapeType,
  {
    aspect: [number, number];
    forehead: [number, number];
    jaw: [number, number];
    jawAngle: [number, number];
    weight: [number, number, number, number]; // [aspect, forehead, jaw, jawAngle]
  }
> = {
  oval: {
    aspect: [1.25, 1.5],    // moderately elongated
    forehead: [0.74, 0.92],  // balanced, slightly narrower than cheekbone
    jaw: [0.70, 0.88],       // tapers gently
    jawAngle: [120, 145],    // moderate angle
    weight: [1.5, 1, 1, 0.8],
  },
  round: {
    aspect: [1.0, 1.25],     // nearly as wide as tall
    forehead: [0.80, 0.98],  // similar widths across
    jaw: [0.80, 0.98],       // wide, similar to forehead
    jawAngle: [140, 170],    // soft, rounded jaw (> 140°)
    weight: [1.5, 0.8, 0.8, 1.3],
  },
  square: {
    aspect: [1.0, 1.25],     // width ≈ height (tighter than before)
    forehead: [0.85, 1.02],  // wide forehead
    jaw: [0.90, 1.05],       // jaw clearly wide (key differentiator)
    jawAngle: [95, 122],     // truly angular jaw only (was [95,130])
    weight: [1.2, 0.8, 1.5, 1.2],  // balanced: jaw width matters most, jawAngle no longer dominant
  },
  heart: {
    aspect: [1.15, 1.5],     // moderate to elongated
    forehead: [0.85, 1.08],  // wide forehead (key: wider than jaw)
    jaw: [0.58, 0.78],       // narrow, pointed chin
    jawAngle: [105, 140],    // can vary
    weight: [0.8, 1.2, 1.8, 0.8],
  },
  oblong: {
    aspect: [1.5, 1.85],     // clearly elongated (key differentiator)
    forehead: [0.72, 0.94],  // balanced widths
    jaw: [0.68, 0.92],       // balanced widths
    jawAngle: [115, 150],    // moderate
    weight: [2.2, 0.6, 0.6, 0.6],
  },
  diamond: {
    aspect: [1.15, 1.5],     // moderate
    forehead: [0.62, 0.82],  // narrow forehead (key: cheekbone widest)
    jaw: [0.58, 0.80],       // narrow jaw (key: cheekbone widest)
    jawAngle: [110, 145],    // moderate
    weight: [0.8, 1.4, 1.4, 0.8],
  },
  triangle: {
    aspect: [1.05, 1.4],     // moderate
    forehead: [0.62, 0.82],  // narrow forehead
    jaw: [0.88, 1.12],       // wide jaw (key: jaw > forehead)
    jawAngle: [110, 145],    // moderate
    weight: [0.6, 1.4, 1.6, 0.8],
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
