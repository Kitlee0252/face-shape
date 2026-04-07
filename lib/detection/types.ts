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

// --- Shared ---

export type SymmetryLevel = 'excellent' | 'good' | 'moderate' | 'asymmetric';

// --- Eye Shape ---

export type EyeSlope = 'upturned' | 'straight' | 'downturned';
export type EyeSize = 'large' | 'medium' | 'small';
export type EyeSpacing = 'close-set' | 'standard' | 'wide-set';
export type EyeShapeClass = 'round' | 'almond' | 'narrow';

export interface EyeShapeResult {
  slope: EyeSlope;
  size: EyeSize;
  spacing: EyeSpacing;
  slopeAngle: number;    // degrees, positive = upturned
  sizeRatio: number;     // eye height / eye width
  spacingRatio: number;  // inter-eye distance / eye width
  shape: EyeShapeClass;
  symmetry: SymmetryLevel;
  detailed: {
    aspectRatio: number;   // width / height
    avgHeight: number;     // pixels
    avgWidth: number;      // pixels
    distance: number;      // inter-eye px
    leftWidth: number;     // pixels
    rightWidth: number;    // pixels
  };
}

// --- Nose Shape ---

export type NoseWidth = 'narrow' | 'medium' | 'wide';
export type NoseLength = 'short' | 'medium' | 'long';
export type NoseBridge = 'very high' | 'high' | 'medium' | 'low';
export type NoseShapeClass = 'straight' | 'curved' | 'concave';
export type NoseProportion = 'proportioned' | 'slightly disproportioned' | 'disproportioned';

export interface NoseShapeResult {
  width: NoseWidth;
  length: NoseLength;
  bridgeAngle: number;   // degrees
  widthRatio: number;    // nose width / face width
  lengthRatio: number;   // nose length / face height
  bridge: NoseBridge;
  shapeClass: NoseShapeClass;
  proportion: NoseProportion;
  detailed: {
    bridgeHeight: number;  // px
    bridgeWidth: number;   // px
    length: number;        // nose length px
    width: number;         // nostril span px
  };
}

// --- Lip Shape ---

export type LipThickness = 'thin' | 'medium' | 'full';
export type LipWidth = 'narrow' | 'medium' | 'wide';
export type CupidBow = 'pronounced' | 'moderate' | 'flat';
export type LipShapeClass = 'top-heavy' | 'balanced' | 'bottom-heavy';

export interface LipShapeResult {
  thickness: LipThickness;
  width: LipWidth;
  upperLowerRatio: number;  // upper lip height / lower lip height
  thicknessRatio: number;   // total lip height / lip width
  widthRatio: number;       // lip width / face width
  cupidBow: CupidBow;
  shapeClass: LipShapeClass;
  symmetry: SymmetryLevel;
  detailed: {
    height: number;        // total lip height px
    upperHeight: number;   // px
    lowerHeight: number;   // px
    width: number;         // lip width px
  };
}

// --- Eyebrow Shape ---

export type BrowShape = 'straight' | 'arched' | 'high-arched';
export type BrowSlope = 'upward' | 'flat' | 'downward';
export type BrowThickness = 'thick' | 'medium' | 'thin' | 'very thin';
export type BrowLength = 'long' | 'medium' | 'short';

export interface EyebrowShapeResult {
  shape: BrowShape;
  slope: BrowSlope;
  archAngle: number;     // degrees at peak
  spacing: number;       // inter-brow distance / eye width
  thickness: BrowThickness;
  length: BrowLength;
  symmetry: SymmetryLevel;
  detailed: {
    height: number;        // arch height px
    leftLength: number;    // px
    rightLength: number;   // px
    length: number;        // avg px
    spacing: number;       // raw inter-brow distance px
  };
}

// --- Combined Five-Dimension Result ---

export interface FiveAnalysisResult {
  faceShape: FaceShapeResult;
  eyeShape: EyeShapeResult;
  noseShape: NoseShapeResult;
  lipShape: LipShapeResult;
  eyebrowShape: EyebrowShapeResult;
  keypoints: Point[];
}
