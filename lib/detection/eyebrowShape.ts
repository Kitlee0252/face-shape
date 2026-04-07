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
import type { Point, EyebrowShapeResult, BrowShape, BrowSlope, BrowThickness, BrowLength, SymmetryLevel } from './types';
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

  // Arch height: perpendicular distance from peak to head-tail line
  const headPeakDist = distance(head, peak);
  const peakTailDist = distance(peak, tail);
  const s = (browLength + headPeakDist + peakTailDist) / 2;
  const area = Math.sqrt(Math.max(0, s * (s - browLength) * (s - headPeakDist) * (s - peakTailDist)));
  const archHeight = browLength > 0 ? (2 * area) / browLength : 0;

  return { archAngle, normalizedSlope, browLength, archHeight };
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

  // Thickness: based on arch height (perpendicular distance from peak to head-tail line)
  const avgArchHeight = (right.archHeight + left.archHeight) / 2;
  let thickness: BrowThickness;
  if (avgArchHeight > 8) thickness = 'thick';
  else if (avgArchHeight > 4) thickness = 'medium';
  else if (avgArchHeight > 2) thickness = 'thin';
  else thickness = 'very thin';

  // Length: brow length relative to inter-eye distance
  const avgBrowLength = (right.browLength + left.browLength) / 2;
  const lengthRatio = eyeInnerDist > 0 ? avgBrowLength / eyeInnerDist : 1;
  let browLengthClass: BrowLength;
  if (lengthRatio > 1.2) browLengthClass = 'long';
  else if (lengthRatio < 0.9) browLengthClass = 'short';
  else browLengthClass = 'medium';

  // Symmetry: based on difference in brow lengths
  const lengthDiff = Math.abs(right.browLength - left.browLength);
  const symmetryRatio = avgBrowLength > 0 ? lengthDiff / avgBrowLength : 0;
  let symmetry: SymmetryLevel;
  if (symmetryRatio < 0.03) symmetry = 'excellent';
  else if (symmetryRatio < 0.08) symmetry = 'good';
  else if (symmetryRatio < 0.15) symmetry = 'moderate';
  else symmetry = 'asymmetric';

  return {
    shape, slope, archAngle: avgArchAngle, spacing,
    thickness, length: browLengthClass, symmetry,
    detailed: {
      height: avgArchHeight,
      leftLength: left.browLength,
      rightLength: right.browLength,
      length: avgBrowLength,
      spacing: browHeadDist,
    },
  };
}

export { BROW as BROW_LANDMARKS };
