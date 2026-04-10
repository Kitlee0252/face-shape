import type {
  Point,
  FaceShapeType,
  FaceMeasurements,
  FaceRatios,
  FaceShapeScore,
  FaceShapeResult,
} from './types';
import { distance, angleDeg, rangeScore, pointToLineDist } from './geometry';

/**
 * MediaPipe FaceMesh 478-point landmark indices for face shape measurements.
 *
 * Verified against official FACEMESH connection definitions:
 * - 234/454: on FACE_OVAL contour, widest cheekbone points ✓
 * - 58/288: on FACE_OVAL contour, jaw angle (gonion) ✓
 * - 10/152: top/bottom of FACE_OVAL contour ✓
 * - 71/301: near outer eyebrow level, calibrated with existing ranges ✓
 *
 * Sources: tfjs-models/face-landmarks-detection, akashchoudhary436/Face-Shape-Detection
 */
const LANDMARKS = {
  foreheadLeft: 71,    // near outer eyebrow (original, calibrated with ranges)
  foreheadRight: 301,  // near outer eyebrow
  cheekboneLeft: 234,
  cheekboneRight: 454,
  jawLeft: 58,
  jawRight: 288,
  foreheadTop: 10,
  chin: 152,
  // FACE_OVAL jawline sample points (for curvature measurement)
  jawlineLeft: [176, 150, 136] as const,   // chin → jawLeft
  jawlineRight: [400, 379, 365] as const,  // chin → jawRight
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
    chinAngle: [number, number];
    widthGradient: [number, number];
    jawlineCurvature: [number, number];
    weight: [number, number, number, number, number, number]; // [aspect, forehead, jaw, chinAngle, widthGradient, jawlineCurvature]
  }
> = {
  // Calibrated from real data (8 photos):
  //   chinAngle: 96-106°, jawlineCurvature: 0.12-0.18, widthGradient: -0.00~0.06
  // All ranges adjusted to center on real-world values.
  oval: {
    aspect: [1.25, 1.5],
    forehead: [0.74, 0.92],
    jaw: [0.70, 0.88],
    chinAngle: [95, 135],
    widthGradient: [-0.02, 0.10],
    jawlineCurvature: [0.10, 0.18],  // recalibrated from real data
    weight: [1.5, 1, 1, 0.4, 0.2, 0.2],
  },
  round: {
    aspect: [1.0, 1.25],
    forehead: [0.80, 0.98],
    jaw: [0.80, 0.98],
    chinAngle: [100, 155],
    widthGradient: [-0.06, 0.06],
    jawlineCurvature: [0.14, 0.22],  // highest curvature (smooth jawline)
    weight: [1.5, 0.8, 0.8, 0.5, 0.2, 0.3],
  },
  square: {
    aspect: [1.0, 1.25],
    forehead: [0.85, 1.02],
    jaw: [0.90, 1.05],
    chinAngle: [85, 105],
    widthGradient: [-0.06, 0.06],
    jawlineCurvature: [0.06, 0.14],  // lowest curvature (angular jawline)
    weight: [1.2, 0.8, 1.5, 0.5, 0.2, 0.3],
  },
  heart: {
    aspect: [1.15, 1.5],
    forehead: [0.85, 1.08],
    jaw: [0.58, 0.78],
    chinAngle: [90, 125],
    widthGradient: [0.08, 0.25],
    jawlineCurvature: [0.10, 0.18],
    weight: [0.8, 1.2, 1.8, 0.4, 0.3, 0.2],
  },
  oblong: {
    aspect: [1.5, 1.85],
    forehead: [0.72, 0.94],
    jaw: [0.68, 0.92],
    chinAngle: [95, 135],
    widthGradient: [-0.04, 0.08],
    jawlineCurvature: [0.10, 0.18],
    weight: [2.2, 0.6, 0.6, 0.4, 0.2, 0.2],
  },
  diamond: {
    aspect: [1.15, 1.5],
    forehead: [0.62, 0.82],
    jaw: [0.58, 0.80],
    chinAngle: [90, 130],
    widthGradient: [-0.06, 0.08],
    jawlineCurvature: [0.10, 0.18],
    weight: [0.8, 1.4, 1.4, 0.4, 0.2, 0.2],
  },
  triangle: {
    aspect: [1.05, 1.4],
    forehead: [0.62, 0.82],
    jaw: [0.88, 1.12],
    chinAngle: [90, 130],
    widthGradient: [-0.25, -0.04],
    jawlineCurvature: [0.10, 0.18],
    weight: [0.6, 1.4, 1.6, 0.4, 0.3, 0.2],
  },
};

function computeJawlineCurvature(keypoints: Point[]): number {
  const chin = keypoints[LANDMARKS.chin];
  const jawL = keypoints[LANDMARKS.jawLeft];
  const jawR = keypoints[LANDMARKS.jawRight];

  let totalDist = 0;
  let count = 0;

  // Left jawline: deviation from chin→jawLeft line
  for (const idx of LANDMARKS.jawlineLeft) {
    totalDist += pointToLineDist(keypoints[idx], chin, jawL);
    count++;
  }
  // Right jawline: deviation from chin→jawRight line
  for (const idx of LANDMARKS.jawlineRight) {
    totalDist += pointToLineDist(keypoints[idx], chin, jawR);
    count++;
  }

  return count > 0 ? totalDist / count : 0;
}

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
    chinAngle: angleDeg(
      keypoints[LANDMARKS.jawLeft],
      keypoints[LANDMARKS.chin],
      keypoints[LANDMARKS.jawRight]
    ),
    jawlineCurvature: computeJawlineCurvature(keypoints),
  };
}

function computeRatios(m: FaceMeasurements): FaceRatios {
  // Normalize jawline curvature by half-face height (chin to jaw distance proxy)
  const jawChinDist = m.faceHeight * 0.4; // jaw-to-chin is roughly 40% of face height
  return {
    aspectRatio: m.faceHeight / m.cheekboneWidth,
    foreheadRatio: m.foreheadWidth / m.cheekboneWidth,
    jawRatio: m.jawWidth / m.cheekboneWidth,
    chinAngle: m.chinAngle,
    widthGradient: (m.foreheadWidth - m.jawWidth) / m.faceHeight,
    jawlineCurvature: jawChinDist > 0 ? m.jawlineCurvature / jawChinDist : 0,
  };
}

function scoreShape(ratios: FaceRatios, type: FaceShapeType): number {
  const rule = SHAPE_RULES[type];
  const [wA, wF, wJ, wCA, wWG, wJC] = rule.weight;

  const sA = rangeScore(ratios.aspectRatio, rule.aspect[0], rule.aspect[1]);
  const sF = rangeScore(ratios.foreheadRatio, rule.forehead[0], rule.forehead[1]);
  const sJ = rangeScore(ratios.jawRatio, rule.jaw[0], rule.jaw[1]);
  const sCA = rangeScore(ratios.chinAngle, rule.chinAngle[0], rule.chinAngle[1], 15);
  const sWG = rangeScore(ratios.widthGradient, rule.widthGradient[0], rule.widthGradient[1]);
  const sJC = rangeScore(ratios.jawlineCurvature, rule.jawlineCurvature[0], rule.jawlineCurvature[1]);

  const totalWeight = wA + wF + wJ + wCA + wWG + wJC;
  return (sA * wA + sF * wF + sJ * wJ + sCA * wCA + sWG * wWG + sJC * wJC) / totalWeight;
}

export function classifyFaceShape(keypoints: Point[]): FaceShapeResult {
  const measurements = extractMeasurements(keypoints);
  const ratios = computeRatios(measurements);

  // Debug: log actual measurements to help calibrate ranges
  if (typeof window !== 'undefined') {
    console.log('[FaceShape] ratios:', {
      aspect: ratios.aspectRatio.toFixed(3),
      forehead: ratios.foreheadRatio.toFixed(3),
      jaw: ratios.jawRatio.toFixed(3),
      chinAngle: ratios.chinAngle.toFixed(1),
      widthGradient: ratios.widthGradient.toFixed(3),
      jawlineCurvature: ratios.jawlineCurvature.toFixed(3),
    });
  }

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
