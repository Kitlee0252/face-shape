export interface Point {
  x: number;
  y: number;
  z: number;
}

export type FaceShapeType =
  | 'oval'
  | 'round'
  | 'square'
  | 'heart'
  | 'oblong'
  | 'diamond'
  | 'triangle';

export interface FaceMeasurements {
  foreheadWidth: number;
  cheekboneWidth: number;
  jawWidth: number;
  faceHeight: number;
  jawAngle: number; // degrees
}

export interface FaceRatios {
  /** Face height / cheekbone width */
  aspectRatio: number;
  /** Forehead width / cheekbone width */
  foreheadRatio: number;
  /** Jaw width / cheekbone width */
  jawRatio: number;
  /** Jaw angle in degrees */
  jawAngle: number;
}

export interface FaceShapeScore {
  type: FaceShapeType;
  confidence: number; // 0-1
}

export interface FaceShapeResult {
  primary: FaceShapeScore;
  secondary: FaceShapeScore | null; // mixed face shape
  all: FaceShapeScore[];
  measurements: FaceMeasurements;
  ratios: FaceRatios;
  keypoints: Point[];
}

export const FACE_SHAPE_LABELS: Record<FaceShapeType, string> = {
  oval: 'Oval',
  round: 'Round',
  square: 'Square',
  heart: 'Heart',
  oblong: 'Oblong',
  diamond: 'Diamond',
  triangle: 'Triangle',
};
