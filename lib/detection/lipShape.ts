/**
 * Lip shape classification.
 *
 * Partially based on zementalist (upper/lower lip height only).
 * Width and ratio measurements are our own design.
 *
 * MediaPipe landmark indices (verified):
 * - Upper lip center (inner): 13
 * - Lower lip center (inner): 14
 * - Mouth corners: 61 (left), 291 (right)
 * - Upper lip edge (outer): 0
 * - Lower lip edge (outer): 17
 * - Face width reference: 234/454
 */
import type { Point, LipShapeResult, LipThickness, LipWidth, CupidBow, LipShapeClass, SymmetryLevel } from './types';
import { distance } from './geometry';

const LIP = {
  upperInner: 13,
  lowerInner: 14,
  cornerLeft: 61,
  cornerRight: 291,
  upperOuter: 0,
  lowerOuter: 17,
} as const;

const FACE_REF = {
  cheekboneLeft: 234,
  cheekboneRight: 454,
} as const;

export function classifyLipShape(keypoints: Point[]): LipShapeResult {
  const upperOuter = keypoints[LIP.upperOuter];
  const upperInner = keypoints[LIP.upperInner];
  const lowerInner = keypoints[LIP.lowerInner];
  const lowerOuter = keypoints[LIP.lowerOuter];
  const cornerL = keypoints[LIP.cornerLeft];
  const cornerR = keypoints[LIP.cornerRight];

  const faceWidth = distance(
    keypoints[FACE_REF.cheekboneLeft],
    keypoints[FACE_REF.cheekboneRight]
  );

  // Upper lip height: outer edge to inner edge
  const upperHeight = distance(upperOuter, upperInner);
  // Lower lip height: inner edge to outer edge
  const lowerHeight = distance(lowerInner, lowerOuter);
  const totalHeight = upperHeight + lowerHeight;

  // Lip width: corner to corner
  const lipWidth = distance(cornerL, cornerR);

  const upperLowerRatio = lowerHeight > 0 ? upperHeight / lowerHeight : 1;
  const thicknessRatio = lipWidth > 0 ? totalHeight / lipWidth : 0;
  const widthRatio = faceWidth > 0 ? lipWidth / faceWidth : 0;

  // Classify thickness
  let thickness: LipThickness;
  if (thicknessRatio > 0.32) thickness = 'full';
  else if (thicknessRatio < 0.22) thickness = 'thin';
  else thickness = 'medium';

  // Classify width
  let width: LipWidth;
  if (widthRatio > 0.42) width = 'wide';
  else if (widthRatio < 0.34) width = 'narrow';
  else width = 'medium';

  // Classify cupid's bow (based on upper lip height proportion)
  const cupidBowRatio = totalHeight > 0 ? upperHeight / totalHeight : 0.5;
  let cupidBow: CupidBow;
  if (cupidBowRatio > 0.45) cupidBow = 'pronounced';
  else if (cupidBowRatio > 0.35) cupidBow = 'moderate';
  else cupidBow = 'flat';

  // Classify shape
  let shapeClass: LipShapeClass;
  if (upperLowerRatio > 1.1) shapeClass = 'top-heavy';
  else if (upperLowerRatio < 0.65) shapeClass = 'bottom-heavy';
  else shapeClass = 'balanced';

  // Classify symmetry (based on corner height difference)
  const cornerHeightDiff = Math.abs(cornerL.y - cornerR.y);
  const symmetryRatio = lipWidth > 0 ? cornerHeightDiff / lipWidth : 0;
  let symmetry: SymmetryLevel;
  if (symmetryRatio < 0.02) symmetry = 'excellent';
  else if (symmetryRatio < 0.05) symmetry = 'good';
  else if (symmetryRatio < 0.10) symmetry = 'moderate';
  else symmetry = 'asymmetric';

  return {
    thickness,
    width,
    upperLowerRatio,
    thicknessRatio,
    widthRatio,
    cupidBow,
    shapeClass,
    symmetry,
    detailed: {
      height: totalHeight,
      upperHeight,
      lowerHeight,
      width: lipWidth,
    },
  };
}

export { LIP as LIP_LANDMARKS };
