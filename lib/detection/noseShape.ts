/**
 * Nose shape classification.
 *
 * Algorithm adapted from zementalist/Facial-Features-Measurement:
 * - Width: nostril span / face width
 * - Length: bridge to tip / face height
 * - Bridge angle: nose arc angle at tip between nostrils (per zementalist)
 *
 * MediaPipe landmark indices:
 * - Bridge top: 6 (2nd point on FACEMESH_NOSE path)
 * - Tip: 1 (end of nose bridge path)
 * - Nostrils: 129/358 (outer alar crease, usable per tfjs-models verification)
 * - Face width reference: 234/454 (cheekbones)
 * - Face height reference: 10/152 (forehead top / chin)
 */
import type { Point, NoseShapeResult, NoseWidth, NoseLength, NoseBridge, NoseShapeClass, NoseProportion } from './types';
import { distance, angleDeg } from './geometry';

const NOSE = {
  bridgeTop: 6,
  tip: 1,
  nostrilLeft: 129,
  nostrilRight: 358,
  bridgeLeft: 48,   // left side of bridge
  bridgeRight: 278, // right side of bridge
} as const;

const FACE_REF = {
  cheekboneLeft: 234,
  cheekboneRight: 454,
  foreheadTop: 10,
  chin: 152,
} as const;

export function classifyNoseShape(keypoints: Point[]): NoseShapeResult {
  const bridgeTop = keypoints[NOSE.bridgeTop];
  const tip = keypoints[NOSE.tip];
  const nostrilL = keypoints[NOSE.nostrilLeft];
  const nostrilR = keypoints[NOSE.nostrilRight];

  const faceWidth = distance(
    keypoints[FACE_REF.cheekboneLeft],
    keypoints[FACE_REF.cheekboneRight]
  );
  const faceHeight = distance(
    keypoints[FACE_REF.foreheadTop],
    keypoints[FACE_REF.chin]
  );

  const noseWidth = distance(nostrilL, nostrilR);
  const noseLength = distance(bridgeTop, tip);

  const bridgeLeft = keypoints[NOSE.bridgeLeft];
  const bridgeRight = keypoints[NOSE.bridgeRight];
  const bridgeWidthVal = distance(bridgeLeft, bridgeRight);

  const widthRatio = noseWidth / faceWidth;
  const lengthRatio = noseLength / faceHeight;

  // Nose arc angle: angle at tip formed by left and right nostrils
  // Wider nose → larger angle, narrower → smaller
  // Per zementalist: angle_of_3points(nose_arc[2], nose_arc[0], nose_arc[4])
  const bridgeAngle = angleDeg(nostrilL, tip, nostrilR);

  // Classify width
  let widthClass: NoseWidth;
  if (widthRatio > 0.28) widthClass = 'wide';
  else if (widthRatio < 0.22) widthClass = 'narrow';
  else widthClass = 'medium';

  // Classify length
  let lengthClass: NoseLength;
  if (lengthRatio > 0.32) lengthClass = 'long';
  else if (lengthRatio < 0.25) lengthClass = 'short';
  else lengthClass = 'medium';

  // Classify bridge height
  let bridge: NoseBridge;
  if (lengthRatio > 0.35) bridge = 'very high';
  else if (lengthRatio > 0.30) bridge = 'high';
  else if (lengthRatio > 0.24) bridge = 'medium';
  else bridge = 'low';

  // Classify shape based on bridge angle
  let shapeClass: NoseShapeClass;
  if (bridgeAngle > 45) shapeClass = 'concave';
  else if (bridgeAngle > 30) shapeClass = 'curved';
  else shapeClass = 'straight';

  // Assess proportion
  const widthDeviation = Math.abs(widthRatio - 0.25) / 0.25;
  const lengthDeviation = Math.abs(lengthRatio - 0.29) / 0.29;
  const avgDeviation = (widthDeviation + lengthDeviation) / 2;
  let proportion: NoseProportion;
  if (avgDeviation < 0.12) proportion = 'proportioned';
  else if (avgDeviation < 0.25) proportion = 'slightly disproportioned';
  else proportion = 'disproportioned';

  return {
    width: widthClass,
    length: lengthClass,
    bridgeAngle,
    widthRatio,
    lengthRatio,
    bridge,
    shapeClass,
    proportion,
    detailed: {
      bridgeHeight: noseLength,
      bridgeWidth: bridgeWidthVal,
      length: noseLength,
      width: noseWidth,
    },
  };
}

export { NOSE as NOSE_LANDMARKS };
