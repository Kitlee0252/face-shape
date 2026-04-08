import type { FiveAnalysisResult } from './types';
import { computeFacialProportions } from './facialProportions';

export interface EyeRatings { overall: number; shape: number; size: number; spacing: number; symmetry: number; }
export interface BrowRatings { overall: number; arch: number; spacing: number; thickness: number; }
export interface LipRatings { overall: number; cupidBow: number; proportion: number; shape: number; thickness: number; width: number; }
export interface NoseRatings { overall: number; bridge: number; length: number; proportion: number; width: number; }

export interface ProportionRatings {
  overall: number;
  thirds: number;
  fifths: number;
  goldenRatio: number;
}

export interface FeatureRatings {
  eyes: EyeRatings;
  eyebrows: BrowRatings;
  lips: LipRatings;
  nose: NoseRatings;
  proportions: ProportionRatings;
  overall: number;
}

function idealScore(value: number, idealMin: number, idealMax: number, sigma: number): number {
  const center = (idealMin + idealMax) / 2;
  const halfRange = (idealMax - idealMin) / 2;
  if (value >= idealMin && value <= idealMax) {
    const d = Math.abs(value - center) / (halfRange || 1);
    return 1.0 - 0.15 * d;
  }
  const dist = value < idealMin ? idealMin - value : value - idealMax;
  return 0.85 * Math.exp(-((dist / sigma) ** 2));
}

function round1(n: number): number { return Math.round(n * 10) / 10; }
function toDisplay(raw: number): number { return round1(5.0 + raw * 5.0); }

function rateEyes(r: FiveAnalysisResult): EyeRatings {
  const shape = toDisplay(idealScore(r.eyeShape.sizeRatio, 0.30, 0.38, 0.08));
  const size = toDisplay(idealScore(r.eyeShape.sizeRatio, 0.28, 0.40, 0.10));
  const spacing = toDisplay(idealScore(r.eyeShape.spacingRatio, 0.92, 1.08, 0.12));
  const symMap: Record<string, number> = { excellent: 1, good: 0.85, moderate: 0.6, asymmetric: 0.35 };
  const symmetry = toDisplay(symMap[r.eyeShape.symmetry] ?? 0.5);
  const overall = round1((shape + size + spacing + symmetry) / 4);
  return { overall, shape, size, spacing, symmetry };
}

function rateBrows(r: FiveAnalysisResult): BrowRatings {
  const arch = toDisplay(idealScore(r.eyebrowShape.archAngle, 142, 162, 12));
  const spacing = toDisplay(idealScore(r.eyebrowShape.spacing, 0.88, 1.12, 0.15));
  const thickMap: Record<string, number> = { thick: 0.8, medium: 1.0, thin: 0.7, 'very thin': 0.5 };
  const thickness = toDisplay(thickMap[r.eyebrowShape.thickness] ?? 0.5);
  const overall = round1((arch + spacing + thickness) / 3);
  return { overall, arch, spacing, thickness };
}

function rateLips(r: FiveAnalysisResult): LipRatings {
  const cupidMap: Record<string, number> = { pronounced: 0.9, moderate: 1.0, flat: 0.65 };
  const cupidBow = toDisplay(cupidMap[r.lipShape.cupidBow] ?? 0.5);
  const proportion = toDisplay(idealScore(r.lipShape.upperLowerRatio, 0.55, 0.80, 0.15));
  const shapeMap: Record<string, number> = { 'top-heavy': 0.7, balanced: 1.0, 'bottom-heavy': 0.75 };
  const shape = toDisplay(shapeMap[r.lipShape.shapeClass] ?? 0.5);
  const thickness = toDisplay(idealScore(r.lipShape.thicknessRatio, 0.24, 0.33, 0.06));
  const width = toDisplay(idealScore(r.lipShape.widthRatio, 0.36, 0.43, 0.05));
  const overall = round1((cupidBow + proportion + shape + thickness + width) / 5);
  return { overall, cupidBow, proportion, shape, thickness, width };
}

function rateNose(r: FiveAnalysisResult): NoseRatings {
  const bridgeMap: Record<string, number> = { 'very high': 0.65, high: 0.85, medium: 1.0, low: 0.7 };
  const bridge = toDisplay(bridgeMap[r.noseShape.bridge] ?? 0.5);
  const length = toDisplay(idealScore(r.noseShape.lengthRatio, 0.26, 0.33, 0.05));
  const propMap: Record<string, number> = { proportioned: 1.0, 'slightly disproportioned': 0.7, disproportioned: 0.45 };
  const proportion = toDisplay(propMap[r.noseShape.proportion] ?? 0.5);
  const width = toDisplay(idealScore(r.noseShape.widthRatio, 0.22, 0.27, 0.04));
  const overall = round1((bridge + length + proportion + width) / 4);
  return { overall, bridge, length, proportion, width };
}

function rateProportions(result: FiveAnalysisResult): ProportionRatings {
  if (!result.keypoints || result.keypoints.length < 478) {
    return { overall: 7.5, thirds: 7.5, fifths: 7.5, goldenRatio: 7.5 };
  }

  const props = computeFacialProportions(result.keypoints);

  const thirdsScore = toDisplay(Math.max(0, 1.0 - props.thirds.deviation * 2.5));
  const fifthsScore = toDisplay(Math.max(0, 1.0 - props.fifths.deviation * 2.5));

  const gr = props.goldenRatios;
  const grScores = [
    idealScore(gr.faceHeightToWidth, 1.5, 1.7, 0.2),
    idealScore(gr.mouthToNoseWidth, 1.45, 1.75, 0.2),
    idealScore(gr.eyeSpanToMouthWidth, 1.45, 1.75, 0.2),
    idealScore(gr.interEyeToNoseWidth, 0.9, 1.1, 0.15),
    idealScore(gr.midToLowerThird, 0.9, 1.1, 0.15),
  ];
  const goldenRatio = toDisplay(grScores.reduce((s, v) => s + v, 0) / grScores.length);

  const overall = round1((thirdsScore + fifthsScore + goldenRatio) / 3);
  return { overall, thirds: thirdsScore, fifths: fifthsScore, goldenRatio };
}

export function computeFeatureRatings(result: FiveAnalysisResult): FeatureRatings {
  const eyes = rateEyes(result);
  const eyebrows = rateBrows(result);
  const lips = rateLips(result);
  const nose = rateNose(result);
  const proportions = rateProportions(result);
  const overall = round1(
    eyes.overall * 0.25 +
    eyebrows.overall * 0.15 +
    lips.overall * 0.20 +
    nose.overall * 0.20 +
    proportions.overall * 0.20
  );
  return { eyes, eyebrows, lips, nose, proportions, overall };
}
