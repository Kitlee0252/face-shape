import type { Point } from './types';
import { distance } from './geometry';

const L = {
  foreheadTop: 10,
  browInnerR: 70,
  browInnerL: 300,
  nostrilL: 129,
  nostrilR: 358,
  chin: 152,
  faceEdgeR: 234,
  eyeOuterR: 33,
  eyeInnerR: 133,
  eyeInnerL: 362,
  eyeOuterL: 263,
  faceEdgeL: 454,
  mouthCornerL: 61,
  mouthCornerR: 291,
} as const;

export interface ThirdsAnalysis {
  upper: number;
  middle: number;
  lower: number;
  deviation: number;
}

export interface FifthsAnalysis {
  segments: [number, number, number, number, number];
  deviation: number;
}

export interface GoldenRatios {
  faceHeightToWidth: number;
  mouthToNoseWidth: number;
  eyeSpanToMouthWidth: number;
  interEyeToNoseWidth: number;
  midToLowerThird: number;
}

export interface FacialProportions {
  thirds: ThirdsAnalysis;
  fifths: FifthsAnalysis;
  goldenRatios: GoldenRatios;
}

function midY(a: Point, b: Point): number {
  return (a.y + b.y) / 2;
}

function computeThirds(kp: Point[]): ThirdsAnalysis {
  const topY = kp[L.foreheadTop].y;
  const browY = midY(kp[L.browInnerR], kp[L.browInnerL]);
  const noseBaseY = midY(kp[L.nostrilL], kp[L.nostrilR]);
  const chinY = kp[L.chin].y;

  const upper = browY - topY;
  const middle = noseBaseY - browY;
  const lower = chinY - noseBaseY;

  const total = upper + middle + lower;
  const ideal = total / 3;
  const deviation = total > 0
    ? (Math.abs(upper - ideal) + Math.abs(middle - ideal) + Math.abs(lower - ideal)) / (3 * ideal)
    : 0;

  return { upper, middle, lower, deviation };
}

function computeFifths(kp: Point[]): FifthsAnalysis {
  const xs = [
    kp[L.faceEdgeR].x,
    kp[L.eyeOuterR].x,
    kp[L.eyeInnerR].x,
    kp[L.eyeInnerL].x,
    kp[L.eyeOuterL].x,
    kp[L.faceEdgeL].x,
  ].sort((a, b) => a - b);

  const segments: [number, number, number, number, number] = [
    xs[1] - xs[0],
    xs[2] - xs[1],
    xs[3] - xs[2],
    xs[4] - xs[3],
    xs[5] - xs[4],
  ];

  const total = segments.reduce((s, v) => s + v, 0);
  const ideal = total / 5;
  const deviation = total > 0
    ? segments.reduce((s, v) => s + Math.abs(v - ideal), 0) / (5 * ideal)
    : 0;

  return { segments, deviation };
}

function computeGoldenRatios(kp: Point[], thirds: ThirdsAnalysis): GoldenRatios {
  const faceHeight = distance(kp[L.foreheadTop], kp[L.chin]);
  const faceWidth = distance(kp[L.faceEdgeR], kp[L.faceEdgeL]);
  const mouthWidth = distance(kp[L.mouthCornerL], kp[L.mouthCornerR]);
  const noseWidth = distance(kp[L.nostrilL], kp[L.nostrilR]);
  const outerEyeSpan = distance(kp[L.eyeOuterR], kp[L.eyeOuterL]);
  const innerEyeDist = distance(kp[L.eyeInnerR], kp[L.eyeInnerL]);

  const safe = (n: number, d: number) => d > 0 ? n / d : 0;

  return {
    faceHeightToWidth: safe(faceHeight, faceWidth),
    mouthToNoseWidth: safe(mouthWidth, noseWidth),
    eyeSpanToMouthWidth: safe(outerEyeSpan, mouthWidth),
    interEyeToNoseWidth: safe(innerEyeDist, noseWidth),
    midToLowerThird: safe(thirds.middle, thirds.lower),
  };
}

export function computeFacialProportions(kp: Point[]): FacialProportions {
  const thirds = computeThirds(kp);
  const fifths = computeFifths(kp);
  const goldenRatios = computeGoldenRatios(kp, thirds);

  return { thirds, fifths, goldenRatios };
}
