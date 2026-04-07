/**
 * Eye shape classification.
 *
 * Algorithm adapted from zementalist/Facial-Features-Measurement:
 * - Slope: angle from inner corner to outer corner (upturned/straight/downturned)
 * - Size: eye height / eye width ratio
 * - Spacing: inter-eye distance / eye width
 *
 * MediaPipe landmark indices (verified against FACEMESH connection definitions):
 * - Right eye: inner 133, outer 33, upper lid 159, lower lid 145
 * - Left eye: inner 362, outer 263, upper lid 386, lower lid 374
 */
import type { Point, EyeShapeResult, EyeSlope, EyeSize, EyeSpacing } from './types';
import { distance } from './geometry';

const EYE = {
  right: { inner: 133, outer: 33, upper: 159, lower: 145 },
  left: { inner: 362, outer: 263, upper: 386, lower: 374 },
} as const;

function classifySingleEye(kp: Point[], eye: { inner: number; outer: number; upper: number; lower: number }) {
  const inner = kp[eye.inner];
  const outer = kp[eye.outer];
  const upper = kp[eye.upper];
  const lower = kp[eye.lower];

  // Slope: angle of the line from inner corner to outer corner
  const slopeAngle = Math.atan2(outer.y - inner.y, outer.x - inner.x) * (180 / Math.PI);

  // Size: height / width
  const eyeHeight = distance(upper, lower);
  const eyeWidth = distance(inner, outer);
  const sizeRatio = eyeHeight / eyeWidth;

  return { slopeAngle, sizeRatio, eyeWidth };
}

export function classifyEyeShape(keypoints: Point[]): EyeShapeResult {
  const right = classifySingleEye(keypoints, EYE.right);
  const left = classifySingleEye(keypoints, EYE.left);

  // Average both eyes (left eye angle is mirrored)
  // Right eye: negative angle = upturned (outer corner higher)
  // Left eye: positive angle = upturned (outer corner higher)
  const avgSlopeAngle = (-right.slopeAngle + left.slopeAngle) / 2;
  const avgSizeRatio = (right.sizeRatio + left.sizeRatio) / 2;
  const avgEyeWidth = (right.eyeWidth + left.eyeWidth) / 2;

  // Spacing: distance between inner corners / average eye width
  const interEyeDist = distance(keypoints[EYE.right.inner], keypoints[EYE.left.inner]);
  const spacingRatio = interEyeDist / avgEyeWidth;

  // Classify slope
  let slope: EyeSlope;
  if (avgSlopeAngle > 4) slope = 'upturned';
  else if (avgSlopeAngle < -4) slope = 'downturned';
  else slope = 'straight';

  // Classify size
  let size: EyeSize;
  if (avgSizeRatio > 0.38) size = 'large';
  else if (avgSizeRatio < 0.28) size = 'small';
  else size = 'medium';

  // Classify spacing
  let spacing: EyeSpacing;
  if (spacingRatio > 1.15) spacing = 'wide-set';
  else if (spacingRatio < 0.85) spacing = 'close-set';
  else spacing = 'standard';

  return {
    slope,
    size,
    spacing,
    slopeAngle: avgSlopeAngle,
    sizeRatio: avgSizeRatio,
    spacingRatio,
  };
}

export { EYE as EYE_LANDMARKS };
