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
import type { Point, NoseShapeResult, NoseWidth, NoseLength } from './types';
import { distance, angleDeg } from './geometry';

const NOSE = {
  bridgeTop: 6,
  tip: 1,
  nostrilLeft: 129,
  nostrilRight: 358,
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

  const widthRatio = noseWidth / faceWidth;
  const lengthRatio = noseLength / faceHeight;

  // Nose arc angle: angle at tip formed by left and right nostrils
  // Wider nose → larger angle, narrower → smaller
  // Per zementalist: angle_of_3points(nose_arc[2], nose_arc[0], nose_arc[4])
  const bridgeAngle = angleDeg(nostrilL, tip, nostrilR);

  // Classify width
  let width: NoseWidth;
  if (widthRatio > 0.28) width = 'wide';
  else if (widthRatio < 0.22) width = 'narrow';
  else width = 'medium';

  // Classify length
  let length: NoseLength;
  if (lengthRatio > 0.32) length = 'long';
  else if (lengthRatio < 0.25) length = 'short';
  else length = 'medium';

  return {
    width,
    length,
    bridgeAngle,
    widthRatio,
    lengthRatio,
  };
}

export { NOSE as NOSE_LANDMARKS };
