import type { Point } from './types';

/**
 * FACE_OVAL contour landmarks (36 points, ordered clockwise from top-center).
 *
 * Split into right half (top -> chin) and left half (chin -> top) for
 * horizontal width sampling at each vertical height.
 */
const FACE_OVAL_RIGHT = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
  378, 400, 377, 152,
] as const;

const FACE_OVAL_LEFT = [
  152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103,
  67, 109, 10,
] as const;

/** Number of equally-spaced horizontal slices (h = 0.0 to h = 1.0). */
const NUM_SLICES = 11;

/**
 * Linearly interpolate the x-coordinate on a contour at a target y.
 *
 * The contour is an ordered list of (x, y) points. We walk through adjacent
 * pairs looking for the segment that brackets targetY, then linearly
 * interpolate x within that segment.
 *
 * If targetY is outside the contour range, we clamp to the nearest endpoint.
 */
function interpolateX(contour: Point[], targetY: number): number {
  // Edge cases: targetY outside the contour y-range
  if (contour.length === 0) return 0;
  if (contour.length === 1) return contour[0].x;

  // Find the segment that brackets targetY.
  // The contour may not be strictly monotonic in y, so we find the
  // best bracketing segment.
  let bestIdx = -1;
  let bestDist = Infinity;

  for (let i = 0; i < contour.length - 1; i++) {
    const y0 = contour[i].y;
    const y1 = contour[i + 1].y;
    const lo = Math.min(y0, y1);
    const hi = Math.max(y0, y1);

    if (targetY >= lo && targetY <= hi && hi > lo) {
      // targetY is within this segment
      const t = (targetY - y0) / (y1 - y0);
      return contour[i].x + t * (contour[i + 1].x - contour[i].x);
    }

    // Track closest segment endpoint in case we need fallback
    const d0 = Math.abs(y0 - targetY);
    const d1 = Math.abs(y1 - targetY);
    if (d0 < bestDist) {
      bestDist = d0;
      bestIdx = i;
    }
    if (d1 < bestDist) {
      bestDist = d1;
      bestIdx = i + 1;
    }
  }

  // Fallback: nearest endpoint
  return contour[bestIdx >= 0 ? bestIdx : 0].x;
}

/**
 * Sample face-contour widths at 11 equally-spaced vertical heights.
 *
 * h = 0.0 corresponds to forehead top (keypoints[10].y) and
 * h = 1.0 corresponds to chin (keypoints[152].y).
 *
 * At each height we interpolate x on the right half-contour and the left
 * half-contour, then compute width = rightX - leftX.
 *
 * @returns widths[11] -- horizontal face widths from top to bottom.
 */
export function sampleContourWidths(keypoints: Point[]): number[] {
  const rightContour = FACE_OVAL_RIGHT.map((i) => keypoints[i]);
  const leftContour = FACE_OVAL_LEFT.map((i) => keypoints[i]);

  const topY = keypoints[10].y;
  const botY = keypoints[152].y;
  const span = botY - topY;

  const widths: number[] = [];

  for (let s = 0; s < NUM_SLICES; s++) {
    const h = s / (NUM_SLICES - 1); // 0.0 .. 1.0
    const targetY = topY + h * span;

    const rx = interpolateX(rightContour, targetY);
    const lx = interpolateX(leftContour, targetY);
    widths.push(Math.abs(rx - lx));
  }

  return widths;
}

// ---------------------------------------------------------------------------
// Feature extraction
// ---------------------------------------------------------------------------

export interface ContourFeatures {
  /** 0-1, fractional position of the widest slice (0 = top, 1 = chin). */
  peakPosition: number;
  /** mean(widths[0..5]) / mean(widths[5..10]) -- upper-half vs lower-half. */
  topBottomRatio: number;
  /** (peakWidth - jawWidth) / peakWidth -- taper from peak to jaw (h=0.8). */
  taperRate: number;
  /** 1 - std(widths[2..8]) / mean(widths[2..8]) -- uniformity of middle widths. */
  flatness: number;
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[]): number {
  if (arr.length === 0) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

/**
 * Derive four high-level contour features from the 11 sampled widths.
 */
export function extractContourFeatures(keypoints: Point[]): ContourFeatures {
  const widths = sampleContourWidths(keypoints);

  // peakPosition: index of the widest slice, normalised to 0-1
  let peakIdx = 0;
  for (let i = 1; i < widths.length; i++) {
    if (widths[i] > widths[peakIdx]) peakIdx = i;
  }
  const peakPosition = peakIdx / (widths.length - 1);

  // topBottomRatio: mean of upper half (indices 0-5) / mean of lower half (indices 5-10)
  const upperHalf = widths.slice(0, 6); // indices 0..5
  const lowerHalf = widths.slice(5);     // indices 5..10
  const topBottomRatio =
    mean(lowerHalf) > 0 ? mean(upperHalf) / mean(lowerHalf) : 1;

  // taperRate: (peak - jaw) / peak — use h=0.8 (index 8) instead of chin (index 10)
  // because the chin point converges to zero width for all faces, giving taperRate=1.0 always
  const peakWidth = widths[peakIdx];
  const jawWidth = widths[8]; // h=0.8, jaw/lower-cheek area
  const taperRate = peakWidth > 0 ? (peakWidth - jawWidth) / peakWidth : 0;

  // flatness: 1 - cv of middle widths (indices 2..8)
  const middle = widths.slice(2, 9); // indices 2..8 inclusive
  const midMean = mean(middle);
  const midStd = std(middle);
  const flatness = midMean > 0 ? 1 - midStd / midMean : 1;

  return { peakPosition, topBottomRatio, taperRate, flatness };
}
