import type {
  Point,
  FaceShapeType,
  FaceMeasurements,
  FaceRatios,
  FaceShapeScore,
  FaceShapeResult,
} from './types';
import { distance, angleDeg, rangeScore } from './geometry';
import { extractContourFeatures } from './contourProfile';

/**
 * MediaPipe FaceMesh 478-point landmark indices for face shape measurements.
 *
 * Only the landmarks needed for direct geometric measurements are kept here.
 * Contour-based features (peakPosition, topBottomRatio, taperRate, flatness)
 * are derived from the full FACE_OVAL contour in contourProfile.ts.
 */
const LANDMARKS = {
  cheekboneLeft: 234,
  cheekboneRight: 454,
  jawLeft: 58,
  jawRight: 288,
  foreheadTop: 10,
  chin: 152,
} as const;

/**
 * Target ranges for each face shape across 6 contour-based dimensions.
 *
 * All weights start at 1.0 for initial calibration.
 */
const SHAPE_RULES: Record<
  FaceShapeType,
  {
    aspect: [number, number];
    chinAngle: [number, number];
    peakPosition: [number, number];
    topBottomRatio: [number, number];
    taperRate: [number, number];
    flatness: [number, number];
    weight: [number, number, number, number, number, number];
  }
> = {
  oval: {
    aspect: [1.25, 1.5],
    chinAngle: [95, 135],
    peakPosition: [0.3, 0.5],
    topBottomRatio: [0.95, 1.10],
    taperRate: [0.55, 0.70],
    flatness: [0.82, 0.90],
    weight: [1, 1, 1, 1, 1, 1],
  },
  round: {
    aspect: [1.0, 1.25],
    chinAngle: [100, 155],
    peakPosition: [0.3, 0.5],
    topBottomRatio: [0.95, 1.10],
    taperRate: [0.40, 0.60],
    flatness: [0.88, 0.96],
    weight: [1, 1, 1, 1, 1, 1],
  },
  square: {
    aspect: [1.0, 1.25],
    chinAngle: [85, 105],
    peakPosition: [0.3, 0.5],
    topBottomRatio: [0.95, 1.10],
    taperRate: [0.30, 0.50],
    flatness: [0.88, 0.96],
    weight: [1, 1, 1, 1, 1, 1],
  },
  heart: {
    aspect: [1.15, 1.5],
    chinAngle: [90, 125],
    peakPosition: [0.2, 0.4],
    topBottomRatio: [1.10, 1.35],
    taperRate: [0.70, 0.90],
    flatness: [0.78, 0.88],
    weight: [1, 1, 1, 1, 1, 1],
  },
  oblong: {
    aspect: [1.5, 1.85],
    chinAngle: [95, 135],
    peakPosition: [0.3, 0.5],
    topBottomRatio: [0.95, 1.10],
    taperRate: [0.55, 0.75],
    flatness: [0.82, 0.92],
    weight: [1, 1, 1, 1, 1, 1],
  },
  diamond: {
    aspect: [1.15, 1.5],
    chinAngle: [90, 130],
    peakPosition: [0.25, 0.45],
    topBottomRatio: [0.90, 1.10],
    taperRate: [0.60, 0.80],
    flatness: [0.72, 0.84],
    weight: [1, 1, 1, 1, 1, 1],
  },
  triangle: {
    aspect: [1.05, 1.4],
    chinAngle: [90, 130],
    peakPosition: [0.45, 0.65],
    topBottomRatio: [0.75, 0.92],
    taperRate: [0.25, 0.50],
    flatness: [0.80, 0.90],
    weight: [1, 1, 1, 1, 1, 1],
  },
};

function extractMeasurements(keypoints: Point[]): FaceMeasurements {
  return {
    cheekboneWidth: distance(
      keypoints[LANDMARKS.cheekboneLeft],
      keypoints[LANDMARKS.cheekboneRight]
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
  };
}

function computeRatios(m: FaceMeasurements, keypoints: Point[]): FaceRatios {
  const contour = extractContourFeatures(keypoints);
  return {
    aspectRatio: m.faceHeight / m.cheekboneWidth,
    chinAngle: m.chinAngle,
    peakPosition: contour.peakPosition,
    topBottomRatio: contour.topBottomRatio,
    taperRate: contour.taperRate,
    flatness: contour.flatness,
  };
}

function scoreShape(ratios: FaceRatios, type: FaceShapeType): number {
  const rule = SHAPE_RULES[type];
  const [wAsp, wChin, wPeak, wTB, wTaper, wFlat] = rule.weight;

  const sAsp = rangeScore(ratios.aspectRatio, rule.aspect[0], rule.aspect[1]);
  const sChin = rangeScore(ratios.chinAngle, rule.chinAngle[0], rule.chinAngle[1], 15);
  const sPeak = rangeScore(ratios.peakPosition, rule.peakPosition[0], rule.peakPosition[1]);
  const sTB = rangeScore(ratios.topBottomRatio, rule.topBottomRatio[0], rule.topBottomRatio[1]);
  const sTaper = rangeScore(ratios.taperRate, rule.taperRate[0], rule.taperRate[1]);
  const sFlat = rangeScore(ratios.flatness, rule.flatness[0], rule.flatness[1]);

  const totalWeight = wAsp + wChin + wPeak + wTB + wTaper + wFlat;
  return (
    (sAsp * wAsp +
      sChin * wChin +
      sPeak * wPeak +
      sTB * wTB +
      sTaper * wTaper +
      sFlat * wFlat) /
    totalWeight
  );
}

export function classifyFaceShape(keypoints: Point[]): FaceShapeResult {
  const measurements = extractMeasurements(keypoints);
  const ratios = computeRatios(measurements, keypoints);

  // Debug: log actual measurements to help calibrate ranges
  if (typeof window !== 'undefined') {
    console.log('[FaceShape] ratios:', {
      aspect: ratios.aspectRatio.toFixed(3),
      chinAngle: ratios.chinAngle.toFixed(1),
      peakPosition: ratios.peakPosition.toFixed(3),
      topBottomRatio: ratios.topBottomRatio.toFixed(3),
      taperRate: ratios.taperRate.toFixed(3),
      flatness: ratios.flatness.toFixed(3),
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
