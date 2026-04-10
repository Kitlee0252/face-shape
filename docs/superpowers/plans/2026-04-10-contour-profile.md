# Contour Profile Face Shape Classification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace point-to-point width measurements with FACE_OVAL contour profiling for more accurate face shape classification.

**Architecture:** New `contourProfile.ts` samples 11 widths along the FACE_OVAL contour, extracts 4 features (peakPosition, topBottomRatio, taperRate, flatness). These replace foreheadRatio, jawRatio, widthGradient, jawlineCurvature in the scoring system. aspectRatio and chinAngle are retained.

**Tech Stack:** TypeScript, MediaPipe FaceLandmarker (478-point), Vitest

---

### Task 1: Create contourProfile.ts with contour sampling

**Files:**
- Create: `lib/detection/contourProfile.ts`
- Create: `lib/detection/__tests__/contourProfile.test.ts`

- [ ] **Step 1: Write the test for sampleContourWidths**

```typescript
// lib/detection/__tests__/contourProfile.test.ts
import { describe, it, expect } from 'vitest';
import { sampleContourWidths, extractContourFeatures } from '../contourProfile';
import type { Point } from '../types';

/** Generate 478 keypoints with a face-shaped oval contour on FACE_OVAL indices */
function makeOvalFace(cx: number, cy: number, rx: number, ry: number): Point[] {
  const kp: Point[] = Array.from({ length: 478 }, () => ({ x: cx, y: cy, z: 0 }));

  // FACE_OVAL right half: top → chin (clockwise)
  const RIGHT_HALF = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152];
  // FACE_OVAL left half: chin → top (counter-clockwise)
  const LEFT_HALF = [152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];

  // Place right half along right side of ellipse (angle 270° → 90°, top → bottom → chin isn't right)
  // Actually: top (angle=-90°) going clockwise to bottom (angle=90°)
  RIGHT_HALF.forEach((idx, i) => {
    const t = i / (RIGHT_HALF.length - 1); // 0 to 1
    const angle = -Math.PI / 2 + t * Math.PI; // -90° to +90°
    kp[idx] = { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle), z: 0 };
  });

  // Left half: chin (bottom) back to top, on the LEFT side
  LEFT_HALF.forEach((idx, i) => {
    const t = i / (LEFT_HALF.length - 1); // 0 to 1
    const angle = Math.PI / 2 + t * Math.PI; // +90° to +270° (= -90°)
    kp[idx] = { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle), z: 0 };
  });

  // Also place cheekbone/jaw/chin landmarks for aspectRatio + chinAngle
  kp[234] = { x: cx - rx, y: cy, z: 0 };      // left cheekbone
  kp[454] = { x: cx + rx, y: cy, z: 0 };       // right cheekbone
  kp[58] = { x: cx - rx * 0.7, y: cy + ry * 0.7, z: 0 };  // left jaw
  kp[288] = { x: cx + rx * 0.7, y: cy + ry * 0.7, z: 0 };  // right jaw

  return kp;
}

describe('sampleContourWidths', () => {
  it('returns 11 width values', () => {
    const kp = makeOvalFace(250, 200, 100, 140);
    const widths = sampleContourWidths(kp);
    expect(widths).toHaveLength(11);
  });

  it('widths are all positive for a normal face', () => {
    const kp = makeOvalFace(250, 200, 100, 140);
    const widths = sampleContourWidths(kp);
    for (const w of widths) {
      expect(w).toBeGreaterThan(0);
    }
  });

  it('oval face is widest in the middle', () => {
    const kp = makeOvalFace(250, 200, 100, 140);
    const widths = sampleContourWidths(kp);
    const maxIdx = widths.indexOf(Math.max(...widths));
    // Peak should be in the middle third (indices 3-7)
    expect(maxIdx).toBeGreaterThanOrEqual(3);
    expect(maxIdx).toBeLessThanOrEqual(7);
  });

  it('top and bottom are narrower than middle for an oval', () => {
    const kp = makeOvalFace(250, 200, 100, 140);
    const widths = sampleContourWidths(kp);
    const midWidth = widths[5];
    expect(widths[0]).toBeLessThan(midWidth);
    expect(widths[10]).toBeLessThan(midWidth);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run lib/detection/__tests__/contourProfile.test.ts`
Expected: FAIL — module `../contourProfile` not found

- [ ] **Step 3: Implement sampleContourWidths**

```typescript
// lib/detection/contourProfile.ts
import type { Point } from './types';

/** FACE_OVAL right half: top (10) → chin (152), clockwise */
const RIGHT_CONTOUR = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152];

/** FACE_OVAL left half: chin (152) → top (10), counter-clockwise */
const LEFT_CONTOUR = [152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];

const NUM_SLICES = 11; // h=0.0 to h=1.0

/**
 * Interpolate x-coordinate along a half-contour at a given y-coordinate.
 * The contour must be ordered from top to bottom (ascending y).
 */
function interpolateX(contour: Point[], targetY: number): number {
  // Find the two adjacent points that bracket targetY
  for (let i = 0; i < contour.length - 1; i++) {
    const a = contour[i];
    const b = contour[i + 1];
    const minY = Math.min(a.y, b.y);
    const maxY = Math.max(a.y, b.y);
    if (targetY >= minY && targetY <= maxY) {
      const dy = b.y - a.y;
      if (Math.abs(dy) < 0.001) return (a.x + b.x) / 2;
      const t = (targetY - a.y) / dy;
      return a.x + t * (b.x - a.x);
    }
  }
  // Fallback: return nearest endpoint
  const first = contour[0];
  const last = contour[contour.length - 1];
  return Math.abs(targetY - first.y) < Math.abs(targetY - last.y) ? first.x : last.x;
}

/**
 * Sample face width at 11 equally-spaced vertical heights along the FACE_OVAL.
 * Returns widths[11] from top (index 0) to chin (index 10).
 */
export function sampleContourWidths(keypoints: Point[]): number[] {
  const rightPts = RIGHT_CONTOUR.map(i => keypoints[i]);
  const leftPts = LEFT_CONTOUR.map(i => keypoints[i]);

  const topY = keypoints[10].y;   // forehead top
  const botY = keypoints[152].y;  // chin
  const range = botY - topY;

  if (range <= 0) return new Array(NUM_SLICES).fill(0);

  const widths: number[] = [];
  for (let i = 0; i < NUM_SLICES; i++) {
    const t = i / (NUM_SLICES - 1);
    const targetY = topY + t * range;
    const rightX = interpolateX(rightPts, targetY);
    const leftX = interpolateX(leftPts, targetY);
    widths.push(Math.abs(rightX - leftX));
  }

  return widths;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run lib/detection/__tests__/contourProfile.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/detection/contourProfile.ts lib/detection/__tests__/contourProfile.test.ts
git commit -m "feat: add contour width sampling from FACE_OVAL"
```

---

### Task 2: Extract 4 contour features from width profile

**Files:**
- Modify: `lib/detection/contourProfile.ts`
- Modify: `lib/detection/__tests__/contourProfile.test.ts`

- [ ] **Step 1: Write tests for extractContourFeatures**

Add to `contourProfile.test.ts`:

```typescript
describe('extractContourFeatures', () => {
  it('oval face has peakPosition near middle', () => {
    const kp = makeOvalFace(250, 200, 100, 140); // taller than wide
    const f = extractContourFeatures(kp);
    expect(f.peakPosition).toBeGreaterThanOrEqual(0.3);
    expect(f.peakPosition).toBeLessThanOrEqual(0.6);
  });

  it('oval face has balanced topBottomRatio', () => {
    const kp = makeOvalFace(250, 200, 100, 140);
    const f = extractContourFeatures(kp);
    expect(f.topBottomRatio).toBeGreaterThan(0.85);
    expect(f.topBottomRatio).toBeLessThan(1.15);
  });

  it('oval face has moderate taperRate', () => {
    const kp = makeOvalFace(250, 200, 100, 140);
    const f = extractContourFeatures(kp);
    expect(f.taperRate).toBeGreaterThan(0.3);
    expect(f.taperRate).toBeLessThan(0.9);
  });

  it('oval face has moderate flatness', () => {
    const kp = makeOvalFace(250, 200, 100, 140);
    const f = extractContourFeatures(kp);
    expect(f.flatness).toBeGreaterThan(0.7);
    expect(f.flatness).toBeLessThan(0.95);
  });

  it('heart face has high topBottomRatio', () => {
    // Heart: wide top, narrow bottom — squeeze bottom of ellipse
    const kp = makeOvalFace(250, 200, 100, 140);
    // Manually narrow the bottom half contour points
    const chin = kp[152];
    for (const idx of [397, 365, 379, 378, 400, 377, 148, 176, 149, 150, 136, 172]) {
      const p = kp[idx];
      if (p.y > chin.y * 0.5) {
        // Push bottom-half points inward
        const cx = 250;
        kp[idx] = { x: cx + (p.x - cx) * 0.4, y: p.y, z: 0 };
      }
    }
    const f = extractContourFeatures(kp);
    expect(f.topBottomRatio).toBeGreaterThan(1.05);
  });

  it('rectangle face has high flatness', () => {
    // Make a rectangular contour: constant width except very top/bottom
    const kp: Point[] = Array.from({ length: 478 }, () => ({ x: 250, y: 150, z: 0 }));
    const RIGHT_HALF = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152];
    const LEFT_HALF = [152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];
    const cx = 250, w = 100, topY = 50, botY = 350;

    RIGHT_HALF.forEach((idx, i) => {
      const t = i / (RIGHT_HALF.length - 1);
      const y = topY + t * (botY - topY);
      // Rectangle: constant width, slight taper at very top and bottom
      const taper = (t < 0.1 || t > 0.9) ? 0.7 : 1.0;
      kp[idx] = { x: cx + (w / 2) * taper, y, z: 0 };
    });
    LEFT_HALF.forEach((idx, i) => {
      const t = i / (LEFT_HALF.length - 1);
      const y = botY - t * (botY - topY);
      const taper = (t < 0.1 || t > 0.9) ? 0.7 : 1.0;
      kp[idx] = { x: cx - (w / 2) * taper, y, z: 0 };
    });
    kp[234] = { x: cx - w / 2, y: 200, z: 0 };
    kp[454] = { x: cx + w / 2, y: 200, z: 0 };
    kp[58] = { x: cx - w * 0.45, y: 300, z: 0 };
    kp[288] = { x: cx + w * 0.45, y: 300, z: 0 };

    const f = extractContourFeatures(kp);
    expect(f.flatness).toBeGreaterThan(0.88);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run lib/detection/__tests__/contourProfile.test.ts`
Expected: FAIL — `extractContourFeatures` not exported

- [ ] **Step 3: Implement extractContourFeatures**

Add to `lib/detection/contourProfile.ts`:

```typescript
export interface ContourFeatures {
  /** Position of widest slice (0=top, 1=chin) */
  peakPosition: number;
  /** Mean upper-half width / mean lower-half width */
  topBottomRatio: number;
  /** Width decrease from peak to chin, normalized (0=no taper, 1=full taper) */
  taperRate: number;
  /** Width uniformity in the middle section (1=perfectly flat) */
  flatness: number;
}

export function extractContourFeatures(keypoints: Point[]): ContourFeatures {
  const widths = sampleContourWidths(keypoints);
  const maxWidth = Math.max(...widths);
  const peakIdx = widths.indexOf(maxWidth);

  // peakPosition: normalized to 0-1
  const peakPosition = peakIdx / (NUM_SLICES - 1);

  // topBottomRatio: mean of upper 6 layers / mean of lower 6 layers (index 5 shared)
  const topSlices = widths.slice(0, 6);
  const bottomSlices = widths.slice(5);
  const topAvg = topSlices.reduce((a, b) => a + b, 0) / topSlices.length;
  const bottomAvg = bottomSlices.reduce((a, b) => a + b, 0) / bottomSlices.length;
  const topBottomRatio = bottomAvg > 0 ? topAvg / bottomAvg : 1;

  // taperRate: (peakWidth - chinWidth) / peakWidth
  const chinWidth = widths[NUM_SLICES - 1];
  const taperRate = maxWidth > 0 ? (maxWidth - chinWidth) / maxWidth : 0;

  // flatness: 1 - coefficient of variation of middle 7 layers (indices 2-8)
  const midWidths = widths.slice(2, 9);
  const midMean = midWidths.reduce((a, b) => a + b, 0) / midWidths.length;
  const midStd = Math.sqrt(midWidths.reduce((a, b) => a + (b - midMean) ** 2, 0) / midWidths.length);
  const flatness = midMean > 0 ? 1 - midStd / midMean : 0;

  return { peakPosition, topBottomRatio, taperRate, flatness };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run lib/detection/__tests__/contourProfile.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/detection/contourProfile.ts lib/detection/__tests__/contourProfile.test.ts
git commit -m "feat: extract 4 contour features from width profile"
```

---

### Task 3: Update types for new scoring system

**Files:**
- Modify: `lib/detection/types.ts`

- [ ] **Step 1: Replace FaceMeasurements and FaceRatios**

In `lib/detection/types.ts`, replace the existing interfaces:

```typescript
export interface FaceMeasurements {
  cheekboneWidth: number;
  faceHeight: number;
  chinAngle: number; // degrees — angle at chin (152) between jaw points (58/288)
}

export interface FaceRatios {
  /** Face height / cheekbone width */
  aspectRatio: number;
  /** Chin angle in degrees — measures chin pointedness */
  chinAngle: number;
  /** Position of widest contour slice (0=top, 1=chin) */
  peakPosition: number;
  /** Upper-half avg width / lower-half avg width */
  topBottomRatio: number;
  /** Width decrease from peak to chin (0=none, 1=full) */
  taperRate: number;
  /** Width uniformity in middle section (1=perfectly flat) */
  flatness: number;
}
```

- [ ] **Step 2: Run tests to see what breaks**

Run: `pnpm vitest run`
Expected: Compilation errors in faceShape.ts, tests, AnalysisTabs — this is expected, we fix them in the next tasks.

- [ ] **Step 3: Commit**

```bash
git add lib/detection/types.ts
git commit -m "refactor: update FaceMeasurements and FaceRatios for contour features"
```

---

### Task 4: Rewrite faceShape.ts to use contour features

**Files:**
- Modify: `lib/detection/faceShape.ts`

- [ ] **Step 1: Rewrite faceShape.ts**

Replace the entire file:

```typescript
import type {
  Point,
  FaceShapeType,
  FaceMeasurements,
  FaceRatios,
  FaceShapeScore,
  FaceShapeResult,
} from './types';
import { distance, angleDeg, rangeScore } from './geometry';
import { extractContourFeatures } from './contourProfile';

/**
 * Landmark indices still needed:
 * - 234/454: cheekbone width (for aspectRatio)
 * - 10/152: face height (for aspectRatio)
 * - 58/288: jaw angle (for chinAngle)
 */
const LANDMARKS = {
  cheekboneLeft: 234,
  cheekboneRight: 454,
  jawLeft: 58,
  jawRight: 288,
  foreheadTop: 10,
  chin: 152,
} as const;

const SHAPE_RULES: Record<
  FaceShapeType,
  {
    aspect: [number, number];
    chinAngle: [number, number];
    peakPosition: [number, number];
    topBottomRatio: [number, number];
    taperRate: [number, number];
    flatness: [number, number];
    weight: [number, number, number, number, number, number];
    // [aspect, chinAngle, peakPosition, topBottomRatio, taperRate, flatness]
  }
> = {
  oval: {
    aspect: [1.25, 1.5],
    chinAngle: [95, 135],
    peakPosition: [0.3, 0.5],
    topBottomRatio: [0.95, 1.10],
    taperRate: [0.55, 0.70],
    flatness: [0.82, 0.90],
    weight: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  },
  round: {
    aspect: [1.0, 1.25],
    chinAngle: [100, 155],
    peakPosition: [0.3, 0.5],
    topBottomRatio: [0.95, 1.10],
    taperRate: [0.40, 0.60],
    flatness: [0.88, 0.96],
    weight: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  },
  square: {
    aspect: [1.0, 1.25],
    chinAngle: [85, 105],
    peakPosition: [0.3, 0.5],
    topBottomRatio: [0.95, 1.10],
    taperRate: [0.30, 0.50],
    flatness: [0.88, 0.96],
    weight: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  },
  heart: {
    aspect: [1.15, 1.5],
    chinAngle: [90, 125],
    peakPosition: [0.2, 0.4],
    topBottomRatio: [1.10, 1.35],
    taperRate: [0.70, 0.90],
    flatness: [0.78, 0.88],
    weight: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  },
  oblong: {
    aspect: [1.5, 1.85],
    chinAngle: [95, 135],
    peakPosition: [0.3, 0.5],
    topBottomRatio: [0.95, 1.10],
    taperRate: [0.55, 0.75],
    flatness: [0.82, 0.92],
    weight: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  },
  diamond: {
    aspect: [1.15, 1.5],
    chinAngle: [90, 130],
    peakPosition: [0.25, 0.45],
    topBottomRatio: [0.90, 1.10],
    taperRate: [0.60, 0.80],
    flatness: [0.72, 0.84],
    weight: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  },
  triangle: {
    aspect: [1.05, 1.4],
    chinAngle: [90, 130],
    peakPosition: [0.45, 0.65],
    topBottomRatio: [0.75, 0.92],
    taperRate: [0.25, 0.50],
    flatness: [0.80, 0.90],
    weight: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  },
};

function extractMeasurements(keypoints: Point[]): FaceMeasurements {
  return {
    cheekboneWidth: distance(
      keypoints[LANDMARKS.cheekboneLeft],
      keypoints[LANDMARKS.cheekboneRight]
    ),
    faceHeight: distance(
      keypoints[LANDMARKS.foreheadTop],
      keypoints[LANDMARKS.chin]
    ),
    chinAngle: angleDeg(
      keypoints[LANDMARKS.jawLeft],
      keypoints[LANDMARKS.chin],
      keypoints[LANDMARKS.jawRight]
    ),
  };
}

function computeRatios(m: FaceMeasurements, keypoints: Point[]): FaceRatios {
  const contour = extractContourFeatures(keypoints);
  return {
    aspectRatio: m.cheekboneWidth > 0 ? m.faceHeight / m.cheekboneWidth : 0,
    chinAngle: m.chinAngle,
    peakPosition: contour.peakPosition,
    topBottomRatio: contour.topBottomRatio,
    taperRate: contour.taperRate,
    flatness: contour.flatness,
  };
}

function scoreShape(ratios: FaceRatios, type: FaceShapeType): number {
  const rule = SHAPE_RULES[type];
  const [wA, wCA, wPP, wTB, wTR, wFL] = rule.weight;

  const sA = rangeScore(ratios.aspectRatio, rule.aspect[0], rule.aspect[1]);
  const sCA = rangeScore(ratios.chinAngle, rule.chinAngle[0], rule.chinAngle[1], 15);
  const sPP = rangeScore(ratios.peakPosition, rule.peakPosition[0], rule.peakPosition[1]);
  const sTB = rangeScore(ratios.topBottomRatio, rule.topBottomRatio[0], rule.topBottomRatio[1]);
  const sTR = rangeScore(ratios.taperRate, rule.taperRate[0], rule.taperRate[1]);
  const sFL = rangeScore(ratios.flatness, rule.flatness[0], rule.flatness[1]);

  const totalWeight = wA + wCA + wPP + wTB + wTR + wFL;
  return (sA * wA + sCA * wCA + sPP * wPP + sTB * wTB + sTR * wTR + sFL * wFL) / totalWeight;
}

export function classifyFaceShape(keypoints: Point[]): FaceShapeResult {
  const measurements = extractMeasurements(keypoints);
  const ratios = computeRatios(measurements, keypoints);

  // Debug: log actual measurements to help calibrate ranges
  if (typeof window !== 'undefined') {
    console.log('[FaceShape] ratios:', {
      aspect: ratios.aspectRatio.toFixed(3),
      chinAngle: ratios.chinAngle.toFixed(1),
      peakPos: ratios.peakPosition.toFixed(3),
      topBottom: ratios.topBottomRatio.toFixed(3),
      taper: ratios.taperRate.toFixed(3),
      flatness: ratios.flatness.toFixed(3),
    });
  }

  const scores: FaceShapeScore[] = (
    Object.keys(SHAPE_RULES) as FaceShapeType[]
  )
    .map((type) => ({
      type,
      confidence: scoreShape(ratios, type),
    }))
    .sort((a, b) => b.confidence - a.confidence);

  const primary = scores[0];
  const secondary =
    scores[1].confidence >= primary.confidence * 0.85 ? scores[1] : null;

  return {
    primary,
    secondary,
    all: scores,
    measurements,
    ratios,
    keypoints,
  };
}

export { LANDMARKS };
```

- [ ] **Step 2: Run tests (expect failures in faceShape tests — old helper uses old API)**

Run: `pnpm vitest run lib/detection/__tests__/contourProfile.test.ts`
Expected: contourProfile tests still PASS

- [ ] **Step 3: Commit**

```bash
git add lib/detection/faceShape.ts
git commit -m "refactor: rewrite faceShape.ts to use contour profile features"
```

---

### Task 5: Rewrite faceShape tests with contour-based helpers

**Files:**
- Modify: `lib/detection/__tests__/faceShape.test.ts`

- [ ] **Step 1: Rewrite test file**

Replace the entire file with contour-based test helpers:

```typescript
import { describe, it, expect } from 'vitest';
import { classifyFaceShape } from '../faceShape';
import type { Point } from '../types';

// FACE_OVAL contour indices
const RIGHT_HALF = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152];
const LEFT_HALF = [152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];

/**
 * Generate a face contour with controllable shape parameters.
 *
 * @param aspect - face height / width ratio (>1 = taller)
 * @param chinAngleDeg - angle at chin between jaw points
 * @param topScale - width scale of upper portion (>1 = wider top = heart-like)
 * @param bottomScale - width scale of lower portion (>1 = wider bottom = triangle-like)
 * @param peakHeight - where the widest point is (0=top, 1=bottom), default 0.4
 */
function makeContourFace(
  aspect: number,
  chinAngleDeg: number,
  topScale: number = 1.0,
  bottomScale: number = 1.0,
  peakHeight: number = 0.4
): Point[] {
  const kp: Point[] = Array.from({ length: 478 }, () => ({ x: 0, y: 0, z: 0 }));
  const cx = 250;
  const halfW = 100;
  const halfH = halfW * aspect;
  const topY = cx - halfH;
  const botY = cx + halfH;

  // Generate width at each height using a shape function
  function widthAt(t: number): number {
    // Base ellipse width
    const ellipseW = Math.sin(t * Math.PI) * halfW;
    // Apply top/bottom scale: interpolate scale based on position relative to peak
    let scale: number;
    if (t < peakHeight) {
      scale = topScale + (1 - topScale) * (t / peakHeight);
    } else {
      scale = 1 + (bottomScale - 1) * ((t - peakHeight) / (1 - peakHeight));
    }
    return ellipseW * scale;
  }

  // Place right half contour
  RIGHT_HALF.forEach((idx, i) => {
    const t = i / (RIGHT_HALF.length - 1);
    const y = topY + t * (botY - topY);
    kp[idx] = { x: cx + widthAt(t), y, z: 0 };
  });

  // Place left half contour (chin → top)
  LEFT_HALF.forEach((idx, i) => {
    const t = i / (LEFT_HALF.length - 1);
    const y = botY - t * (botY - topY);
    const tFromTop = 1 - t;
    kp[idx] = { x: cx - widthAt(tFromTop), y, z: 0 };
  });

  // Place retained measurement landmarks
  kp[234] = { x: cx - halfW, y: cx, z: 0 };  // left cheekbone
  kp[454] = { x: cx + halfW, y: cx, z: 0 };   // right cheekbone

  // Jaw points for chinAngle
  const jawW = widthAt(0.75) * 2;
  const halfAngle = (chinAngleDeg / 2) * (Math.PI / 180);
  kp[58] = { x: cx - jawW / 2, y: botY - jawW / (2 * Math.tan(halfAngle)), z: 0 };
  kp[288] = { x: cx + jawW / 2, y: botY - jawW / (2 * Math.tan(halfAngle)), z: 0 };

  return kp;
}

describe('classifyFaceShape', () => {
  describe('returns correct primary type for contour-based shapes', () => {
    it('classifies oval (elongated, balanced, gentle taper)', () => {
      const kp = makeContourFace(1.4, 115, 1.0, 1.0, 0.4);
      const r = classifyFaceShape(kp);
      expect(r.primary.type).toBe('oval');
    });

    it('classifies round (short, balanced, flat profile)', () => {
      const kp = makeContourFace(1.1, 130, 1.0, 1.0, 0.45);
      const r = classifyFaceShape(kp);
      expect(r.primary.type).toBe('round');
    });

    it('classifies square (short, angular chin, flat profile, low taper)', () => {
      // Square: wide bottom, angular chin, very flat
      const kp = makeContourFace(1.1, 95, 1.0, 1.15, 0.45);
      const r = classifyFaceShape(kp);
      expect(r.primary.type).toBe('square');
    });

    it('classifies heart (wide top, narrow bottom, high taper)', () => {
      const kp = makeContourFace(1.3, 105, 1.2, 0.6, 0.3);
      const r = classifyFaceShape(kp);
      expect(r.primary.type).toBe('heart');
    });

    it('classifies oblong (very elongated)', () => {
      const kp = makeContourFace(1.7, 115, 1.0, 1.0, 0.4);
      const r = classifyFaceShape(kp);
      expect(r.primary.type).toBe('oblong');
    });

    it('classifies diamond (peaked middle, narrow top and bottom)', () => {
      const kp = makeContourFace(1.3, 110, 0.7, 0.7, 0.35);
      const r = classifyFaceShape(kp);
      expect(r.primary.type).toBe('diamond');
    });

    it('classifies triangle (narrow top, wide bottom)', () => {
      const kp = makeContourFace(1.2, 110, 0.7, 1.2, 0.55);
      const r = classifyFaceShape(kp);
      expect(r.primary.type).toBe('triangle');
    });
  });

  describe('result structure', () => {
    it('returns all 7 shape scores sorted descending', () => {
      const kp = makeContourFace(1.4, 115);
      const r = classifyFaceShape(kp);
      expect(r.all).toHaveLength(7);
      for (let i = 1; i < r.all.length; i++) {
        expect(r.all[i - 1].confidence).toBeGreaterThanOrEqual(r.all[i].confidence);
      }
    });

    it('all confidences between 0 and 1', () => {
      const kp = makeContourFace(1.4, 115);
      const r = classifyFaceShape(kp);
      for (const s of r.all) {
        expect(s.confidence).toBeGreaterThanOrEqual(0);
        expect(s.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('includes measurements and ratios', () => {
      const kp = makeContourFace(1.4, 115);
      const r = classifyFaceShape(kp);
      expect(r.measurements.cheekboneWidth).toBeGreaterThan(0);
      expect(r.measurements.faceHeight).toBeGreaterThan(0);
      expect(r.ratios.peakPosition).toBeGreaterThanOrEqual(0);
      expect(r.ratios.flatness).toBeGreaterThan(0);
    });

    it('includes keypoints in result', () => {
      const kp = makeContourFace(1.4, 115);
      const r = classifyFaceShape(kp);
      expect(r.keypoints).toHaveLength(478);
    });
  });

  describe('key differentiators', () => {
    it('heart vs triangle distinguished by topBottomRatio', () => {
      const heart = classifyFaceShape(makeContourFace(1.3, 105, 1.2, 0.6, 0.3));
      const triangle = classifyFaceShape(makeContourFace(1.2, 110, 0.7, 1.2, 0.55));
      expect(heart.primary.type).toBe('heart');
      expect(triangle.primary.type).toBe('triangle');
    });

    it('round vs square distinguished by taperRate + chinAngle', () => {
      const round = classifyFaceShape(makeContourFace(1.1, 130, 1.0, 1.0, 0.45));
      const square = classifyFaceShape(makeContourFace(1.1, 95, 1.0, 1.15, 0.45));
      expect(round.primary.type).toBe('round');
      expect(square.primary.type).toBe('square');
    });

    it('oval vs oblong distinguished by aspectRatio', () => {
      const oval = classifyFaceShape(makeContourFace(1.4, 115));
      const oblong = classifyFaceShape(makeContourFace(1.7, 115));
      expect(oval.primary.type).toBe('oval');
      expect(oblong.primary.type).toBe('oblong');
    });
  });
});
```

- [ ] **Step 2: Run tests**

Run: `pnpm vitest run lib/detection/__tests__/faceShape.test.ts`
Expected: Tests may need tuning — the synthetic contour parameters might not produce exact expected feature values. Adjust makeContourFace parameters if needed.

- [ ] **Step 3: Commit**

```bash
git add lib/detection/__tests__/faceShape.test.ts
git commit -m "test: rewrite faceShape tests with contour-based helpers"
```

---

### Task 6: Update UI components

**Files:**
- Modify: `components/result/AnalysisTabs.tsx`
- Modify: `components/detector/CanvasOverlay.tsx`

- [ ] **Step 1: Update AnalysisTabs normalizeResult + stats display**

In `components/result/AnalysisTabs.tsx`, update the normalizeResult faceShape section:

```typescript
    faceShape: {
      ...face,
      ratios: {
        ...face.ratios,
        peakPosition: face.ratios.peakPosition ?? 0,
        topBottomRatio: face.ratios.topBottomRatio ?? 0,
        taperRate: face.ratios.taperRate ?? 0,
        flatness: face.ratios.flatness ?? 0,
      },
    },
```

Replace the stats grid:

```tsx
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
        <StatBox label="Aspect" value={ratios.aspectRatio.toFixed(2)} />
        <StatBox label="Chin Angle" value={`${Math.round(ratios.chinAngle)}\u00B0`} />
        <StatBox label="Peak Pos" value={ratios.peakPosition.toFixed(2)} />
        <StatBox label="Top/Bottom" value={ratios.topBottomRatio.toFixed(2)} />
        <StatBox label="Taper" value={ratios.taperRate.toFixed(2)} />
        <StatBox label="Flatness" value={ratios.flatness.toFixed(2)} />
      </div>
```

- [ ] **Step 2: Update CanvasOverlay**

In `components/detector/CanvasOverlay.tsx`, update the `ratios.chinAngle` reference (already correct path since FaceRatios still has chinAngle). No changes needed if it compiles.

- [ ] **Step 3: Run full test suite + build**

Run: `pnpm vitest run && pnpm next build`
Expected: All tests pass, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/result/AnalysisTabs.tsx components/detector/CanvasOverlay.tsx
git commit -m "feat: update UI to display contour profile stats"
```

---

### Task 7: Integration test + final verification

**Files:** None new — just run everything.

- [ ] **Step 1: Run full test suite**

Run: `pnpm vitest run`
Expected: All tests pass.

- [ ] **Step 2: Run production build**

Run: `pnpm next build`
Expected: Build succeeds, all 28 pages generated.

- [ ] **Step 3: Start dev server and test with real photos**

Run: `pnpm dev --port 3000` + cloudflare tunnel

Upload real photos and check console.log for contour feature values. Record values for range calibration.

- [ ] **Step 4: Calibrate ranges if needed**

Based on real data, adjust SHAPE_RULES ranges in faceShape.ts. Re-run tests after each adjustment.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: contour profile face shape classification"
```
