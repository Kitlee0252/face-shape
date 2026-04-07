/**
 * Eyebrow shape classification.
 *
 * Algorithm adapted from zementalist/Facial-Features-Measurement:
 * - Shape: angle at peak (angleX) — straight (>160°), arched (140-160°), high-arched (<140°)
 * - Slope: brow head to tail vertical direction
 * - Spacing: inter-brow distance / eye width
 *
 * MediaPipe landmark indices (verified against EYEBROW contour definitions):
 * - Right: head 70, peak 105, tail 107
 * - Left: head 300, peak 334, tail 336
 */
import type { Point, EyebrowShapeResult, BrowShape, BrowSlope } from './types';
import { distance, angleDeg } from './geometry';

const BROW = {
  right: { head: 70, peak: 105, tail: 107 },
  left: { head: 300, peak: 334, tail: 336 },
} as const;

// Eye inner corners for spacing reference
const EYE_INNER = { right: 133, left: 362 } as const;

function classifySingleBrow(kp: Point[], brow: { head: number; peak: number; tail: number }) {
  const head = kp[brow.head];
  const peak = kp[brow.peak];
  const tail = kp[brow.tail];

  // Arch angle: angle at peak formed by head and tail
  // Larger angle = straighter, smaller = more arched
  const archAngle = angleDeg(head, peak, tail);

  // Slope: vertical difference from head to tail
  // Positive = tail is lower (downward slope)
  const slopeDy = tail.y - head.y;
  const browLength = distance(head, tail);
  const normalizedSlope = browLength > 0 ? slopeDy / browLength : 0;

  return { archAngle, normalizedSlope };
}

export function classifyEyebrowShape(keypoints: Point[]): EyebrowShapeResult {
  const right = classifySingleBrow(keypoints, BROW.right);
  const left = classifySingleBrow(keypoints, BROW.left);

  const avgArchAngle = (right.archAngle + left.archAngle) / 2;
  const avgSlope = (right.normalizedSlope + left.normalizedSlope) / 2;

  // Spacing: distance between brow heads / distance between eye inner corners
  const browHeadDist = distance(keypoints[BROW.right.head], keypoints[BROW.left.head]);
  const eyeInnerDist = distance(keypoints[EYE_INNER.right], keypoints[EYE_INNER.left]);
  const spacing = eyeInnerDist > 0 ? browHeadDist / eyeInnerDist : 1;

  // Classify shape (from zementalist's angleX approach)
  let shape: BrowShape;
  if (avgArchAngle > 160) shape = 'straight';
  else if (avgArchAngle > 140) shape = 'arched';
  else shape = 'high-arched';

  // Classify slope
  let slope: BrowSlope;
  if (avgSlope > 0.1) slope = 'downward';
  else if (avgSlope < -0.1) slope = 'upward';
  else slope = 'flat';

  return {
    shape,
    slope,
    archAngle: avgArchAngle,
    spacing,
  };
}

export { BROW as BROW_LANDMARKS };
