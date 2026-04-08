# Facial Proportions & Golden Ratio Enhancement

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Rule of Thirds (三庭), Rule of Fifths (五眼), and enhanced golden ratio scoring to the face analysis system.

**Architecture:** Create a new `facialProportions.ts` module that computes proportions from existing keypoints. Integrate its output into `featureRating.ts` as a new `proportions` rating category. Display in the Score tab UI. No changes to the detection pipeline or `FiveAnalysisResult` type — proportions are computed lazily from `result.keypoints` inside the rating function.

**Tech Stack:** TypeScript, MediaPipe 478-point landmarks, Vitest

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `lib/detection/facialProportions.ts` | Compute Rule of Thirds, Rule of Fifths, 5 golden ratio metrics from keypoints |
| Create | `lib/detection/__tests__/facialProportions.test.ts` | Unit tests for all proportion calculations |
| Modify | `lib/detection/featureRating.ts` | Add `ProportionRatings` interface, `rateProportions()`, include in overall score |
| Modify | `lib/detection/__tests__/featureRating.test.ts` | Add tests for proportions in FeatureRatings |
| Modify | `components/result/FeatureRatings.tsx` | Display proportions section below feature bars |

---

## MediaPipe Landmark Reference

These are the landmark indices used for proportions calculations:

```
Rule of Thirds (vertical zones):
  Forehead top:    10
  Brow level:      midpoint Y of 70 (R brow inner) and 300 (L brow inner)
  Nose base:       midpoint Y of 129 (L nostril) and 358 (R nostril)
  Chin:            152

Rule of Fifths (horizontal segments at eye level):
  Face edge R:     234 (right cheekbone, face oval contour)
  R eye outer:     33
  R eye inner:     133
  L eye inner:     362
  L eye outer:     263
  Face edge L:     454 (left cheekbone, face oval contour)

Golden Ratio (inter-feature):
  Mouth corners:   61 (left), 291 (right)
  Nostrils:        129 (left), 358 (right)
  Outer eyes:      33 (right), 263 (left)
  Inner eyes:      133 (right), 362 (left)
  Cheekbones:      234 (right), 454 (left)
  Face height:     10 (top) to 152 (chin)
```

---

### Task 1: Create facialProportions types and Rule of Thirds computation

**Files:**
- Create: `lib/detection/facialProportions.ts`
- Create: `lib/detection/__tests__/facialProportions.test.ts`

- [ ] **Step 1: Write failing test for Rule of Thirds**

```typescript
// lib/detection/__tests__/facialProportions.test.ts
import { describe, it, expect } from 'vitest';
import { computeFacialProportions } from '../facialProportions';
import type { Point } from '../types';

const p = (x: number, y: number): Point => ({ x, y, z: 0 });

/** Build a 478-point array with specific landmarks set */
function makeKeypoints(overrides: Record<number, Point>): Point[] {
  const pts: Point[] = Array.from({ length: 478 }, () => p(0, 0));
  for (const [idx, pt] of Object.entries(overrides)) {
    pts[Number(idx)] = pt;
  }
  return pts;
}

describe('Rule of Thirds', () => {
  it('returns equal thirds for ideal proportions', () => {
    // Face height 300px, divided into 3 equal 100px zones
    // Top=10 y=0, browLevel midpoint(70,300) y=100, noseBase midpoint(129,358) y=200, chin=152 y=300
    const kp = makeKeypoints({
      10: p(200, 0),      // forehead top
      70: p(170, 100),    // R brow inner
      300: p(230, 100),   // L brow inner
      129: p(180, 200),   // L nostril
      358: p(220, 200),   // R nostril
      152: p(200, 300),   // chin
    });
    const result = computeFacialProportions(kp);
    expect(result.thirds.upper).toBeCloseTo(100, 0);
    expect(result.thirds.middle).toBeCloseTo(100, 0);
    expect(result.thirds.lower).toBeCloseTo(100, 0);
    expect(result.thirds.deviation).toBeCloseTo(0, 1);
  });

  it('detects unequal thirds', () => {
    // Upper=80, middle=120, lower=100 → total 300, ideal each 100
    const kp = makeKeypoints({
      10: p(200, 0),
      70: p(170, 80),
      300: p(230, 80),
      129: p(180, 200),
      358: p(220, 200),
      152: p(200, 300),
    });
    const result = computeFacialProportions(kp);
    expect(result.thirds.upper).toBeCloseTo(80, 0);
    expect(result.thirds.middle).toBeCloseTo(120, 0);
    expect(result.thirds.lower).toBeCloseTo(100, 0);
    expect(result.thirds.deviation).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/detection/__tests__/facialProportions.test.ts`
Expected: FAIL — module `../facialProportions` does not exist

- [ ] **Step 3: Write minimal implementation for Rule of Thirds**

```typescript
// lib/detection/facialProportions.ts
import type { Point } from './types';
import { distance } from './geometry';

/* ---- Landmark indices ---- */

const L = {
  // Vertical (Rule of Thirds)
  foreheadTop: 10,
  browInnerR: 70,
  browInnerL: 300,
  nostrilL: 129,
  nostrilR: 358,
  chin: 152,
  // Horizontal (Rule of Fifths)
  faceEdgeR: 234,
  eyeOuterR: 33,
  eyeInnerR: 133,
  eyeInnerL: 362,
  eyeOuterL: 263,
  faceEdgeL: 454,
  // Golden Ratio
  mouthCornerL: 61,
  mouthCornerR: 291,
} as const;

/* ---- Types ---- */

export interface ThirdsAnalysis {
  upper: number;    // forehead-to-brow height (px)
  middle: number;   // brow-to-nose height (px)
  lower: number;    // nose-to-chin height (px)
  /** Mean absolute deviation of three zones from ideal (1/3 each), 0 = perfect */
  deviation: number;
}

export interface FifthsAnalysis {
  segments: [number, number, number, number, number]; // 5 widths L-to-R (px)
  /** Mean absolute deviation of five segments from ideal (1/5 each), 0 = perfect */
  deviation: number;
}

export interface GoldenRatios {
  /** Face height / face width — ideal ≈ 1.618 */
  faceHeightToWidth: number;
  /** Mouth width / nose width — ideal ≈ 1.618 */
  mouthToNoseWidth: number;
  /** Outer-eye span / mouth width — ideal ≈ 1.618 */
  eyeSpanToMouthWidth: number;
  /** Inter-eye distance / nose width — ideal ≈ 1.0 */
  interEyeToNoseWidth: number;
  /** Middle third / lower third — ideal ≈ 1.0 */
  midToLowerThird: number;
}

export interface FacialProportions {
  thirds: ThirdsAnalysis;
  fifths: FifthsAnalysis;
  goldenRatios: GoldenRatios;
}

/* ---- Helpers ---- */

function midY(a: Point, b: Point): number {
  return (a.y + b.y) / 2;
}

/** Mean absolute deviation of values from their own mean */
function mad(values: number[]): number {
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return values.reduce((s, v) => s + Math.abs(v - mean), 0) / values.length;
}

/* ---- Computation ---- */

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

export function computeFacialProportions(kp: Point[]): FacialProportions {
  const thirds = computeThirds(kp);

  // Fifths and golden ratios — placeholder, implemented in next tasks
  const fifths: FifthsAnalysis = {
    segments: [0, 0, 0, 0, 0],
    deviation: 0,
  };

  const goldenRatios: GoldenRatios = {
    faceHeightToWidth: 0,
    mouthToNoseWidth: 0,
    eyeSpanToMouthWidth: 0,
    interEyeToNoseWidth: 0,
    midToLowerThird: 0,
  };

  return { thirds, fifths, goldenRatios };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/detection/__tests__/facialProportions.test.ts`
Expected: 2 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/detection/facialProportions.ts lib/detection/__tests__/facialProportions.test.ts
git commit -m "feat: add Rule of Thirds computation for facial proportions"
```

---

### Task 2: Add Rule of Fifths computation

**Files:**
- Modify: `lib/detection/facialProportions.ts`
- Modify: `lib/detection/__tests__/facialProportions.test.ts`

- [ ] **Step 1: Write failing test for Rule of Fifths**

Add to `facialProportions.test.ts`:

```typescript
describe('Rule of Fifths', () => {
  it('returns equal fifths for ideal proportions', () => {
    // Face width 500px, divided into 5 equal 100px segments
    const kp = makeKeypoints({
      10: p(250, 0),
      70: p(200, 100), 300: p(300, 100),
      129: p(225, 200), 358: p(275, 200),
      152: p(250, 300),
      // Horizontal: evenly spaced at 0, 100, 200, 300, 400, 500
      234: p(0, 150),     // face edge R
      33: p(100, 150),    // R eye outer
      133: p(200, 150),   // R eye inner
      362: p(300, 150),   // L eye inner
      263: p(400, 150),   // L eye outer
      454: p(500, 150),   // face edge L
    });
    const result = computeFacialProportions(kp);
    expect(result.fifths.segments).toHaveLength(5);
    for (const seg of result.fifths.segments) {
      expect(seg).toBeCloseTo(100, 0);
    }
    expect(result.fifths.deviation).toBeCloseTo(0, 1);
  });

  it('detects unequal fifths', () => {
    const kp = makeKeypoints({
      10: p(250, 0),
      70: p(200, 100), 300: p(300, 100),
      129: p(225, 200), 358: p(275, 200),
      152: p(250, 300),
      234: p(0, 150),
      33: p(80, 150),    // narrower first segment
      133: p(180, 150),
      362: p(300, 150),  // wider third segment
      263: p(420, 150),
      454: p(500, 150),
    });
    const result = computeFacialProportions(kp);
    expect(result.fifths.deviation).toBeGreaterThan(0);
    // First segment = 80, third = 120 → not equal
    expect(result.fifths.segments[0]).toBeCloseTo(80, 0);
    expect(result.fifths.segments[2]).toBeCloseTo(120, 0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/detection/__tests__/facialProportions.test.ts`
Expected: FAIL — fifths segments are all 0 (placeholder)

- [ ] **Step 3: Implement Rule of Fifths**

Replace the `computeFacialProportions` function body in `facialProportions.ts` and add `computeFifths`:

```typescript
function computeFifths(kp: Point[]): FifthsAnalysis {
  // 6 horizontal landmark x-coordinates, left to right
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
```

Update `computeFacialProportions`:

```typescript
export function computeFacialProportions(kp: Point[]): FacialProportions {
  const thirds = computeThirds(kp);
  const fifths = computeFifths(kp);

  const goldenRatios: GoldenRatios = {
    faceHeightToWidth: 0,
    mouthToNoseWidth: 0,
    eyeSpanToMouthWidth: 0,
    interEyeToNoseWidth: 0,
    midToLowerThird: 0,
  };

  return { thirds, fifths, goldenRatios };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/detection/__tests__/facialProportions.test.ts`
Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/detection/facialProportions.ts lib/detection/__tests__/facialProportions.test.ts
git commit -m "feat: add Rule of Fifths computation for facial proportions"
```

---

### Task 3: Add Golden Ratio metrics

**Files:**
- Modify: `lib/detection/facialProportions.ts`
- Modify: `lib/detection/__tests__/facialProportions.test.ts`

- [ ] **Step 1: Write failing test for golden ratios**

Add to `facialProportions.test.ts`:

```typescript
describe('Golden Ratios', () => {
  it('computes all 5 golden ratio values', () => {
    const kp = makeKeypoints({
      // Vertical
      10: p(250, 0),
      70: p(200, 100), 300: p(300, 100),    // brow inners
      129: p(225, 200), 358: p(275, 200),    // nostrils
      152: p(250, 300),                       // chin
      // Horizontal
      234: p(50, 150), 454: p(450, 150),     // cheekbones (face width = 400)
      33: p(100, 150), 263: p(400, 150),     // outer eyes (span = 300)
      133: p(175, 150), 362: p(325, 150),    // inner eyes (dist = 150)
      61: p(150, 250), 291: p(350, 250),     // mouth corners (width = 200)
    });
    const result = computeFacialProportions(kp);
    const gr = result.goldenRatios;

    // Face height 300 / face width 400 = 0.75
    expect(gr.faceHeightToWidth).toBeCloseTo(0.75, 2);
    // Mouth 200 / nose 50 = 4.0
    expect(gr.mouthToNoseWidth).toBeCloseTo(4.0, 2);
    // Eye span 300 / mouth 200 = 1.5
    expect(gr.eyeSpanToMouthWidth).toBeCloseTo(1.5, 2);
    // Inter-eye 150 / nose 50 = 3.0
    expect(gr.interEyeToNoseWidth).toBeCloseTo(3.0, 2);
    // Middle 100 / lower 100 = 1.0
    expect(gr.midToLowerThird).toBeCloseTo(1.0, 2);
  });

  it('handles phi-ideal face proportions', () => {
    // Construct a face where faceHeight/faceWidth ≈ 1.618
    const faceW = 250;
    const faceH = 250 * 1.618;
    const noseW = 50;
    const mouthW = noseW * 1.618;
    const eyeSpan = mouthW * 1.618;

    const kp = makeKeypoints({
      10: p(200, 0),
      70: p(175, faceH / 3), 300: p(225, faceH / 3),
      129: p(200 - noseW / 2, faceH * 2 / 3), 358: p(200 + noseW / 2, faceH * 2 / 3),
      152: p(200, faceH),
      234: p(200 - faceW / 2, faceH / 2), 454: p(200 + faceW / 2, faceH / 2),
      33: p(200 - eyeSpan / 2, faceH / 3), 263: p(200 + eyeSpan / 2, faceH / 3),
      133: p(200 - noseW, faceH / 3), 362: p(200 + noseW, faceH / 3),
      61: p(200 - mouthW / 2, faceH * 0.75), 291: p(200 + mouthW / 2, faceH * 0.75),
    });
    const gr = computeFacialProportions(kp).goldenRatios;
    expect(gr.faceHeightToWidth).toBeCloseTo(1.618, 1);
    expect(gr.mouthToNoseWidth).toBeCloseTo(1.618, 1);
    expect(gr.eyeSpanToMouthWidth).toBeCloseTo(1.618, 1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/detection/__tests__/facialProportions.test.ts`
Expected: FAIL — golden ratios are all 0

- [ ] **Step 3: Implement golden ratio computation**

Add `computeGoldenRatios` to `facialProportions.ts`:

```typescript
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
```

Update `computeFacialProportions`:

```typescript
export function computeFacialProportions(kp: Point[]): FacialProportions {
  const thirds = computeThirds(kp);
  const fifths = computeFifths(kp);
  const goldenRatios = computeGoldenRatios(kp, thirds);
  return { thirds, fifths, goldenRatios };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/detection/__tests__/facialProportions.test.ts`
Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/detection/facialProportions.ts lib/detection/__tests__/facialProportions.test.ts
git commit -m "feat: add golden ratio metrics to facial proportions"
```

---

### Task 4: Integrate proportions into featureRating.ts

**Files:**
- Modify: `lib/detection/featureRating.ts`
- Modify: `lib/detection/__tests__/featureRating.test.ts`

- [ ] **Step 1: Write failing test for proportions ratings**

Add to `featureRating.test.ts`:

```typescript
it('includes proportions ratings', () => {
  const result = makeMockResult();
  // Add keypoints needed for proportions (must have 478 points)
  result.keypoints = makeProportionKeypoints();
  const ratings = computeFeatureRatings(result);
  expect(ratings.proportions).toBeDefined();
  expect(typeof ratings.proportions.overall).toBe('number');
  expect(typeof ratings.proportions.thirds).toBe('number');
  expect(typeof ratings.proportions.fifths).toBe('number');
  expect(typeof ratings.proportions.goldenRatio).toBe('number');
  expect(ratings.proportions.overall).toBeGreaterThanOrEqual(5);
  expect(ratings.proportions.overall).toBeLessThanOrEqual(10);
});

it('includes proportions in overall score', () => {
  const result = makeMockResult();
  result.keypoints = makeProportionKeypoints();
  const ratings = computeFeatureRatings(result);
  // Overall should now factor in proportions
  expect(ratings.overall).toBeGreaterThanOrEqual(5);
  expect(ratings.overall).toBeLessThanOrEqual(10);
});
```

Add the helper function in the test file:

```typescript
function makeProportionKeypoints(): Point[] {
  const kp: Point[] = Array.from({ length: 478 }, () => ({ x: 200, y: 200, z: 0 }));
  // Rule of Thirds landmarks (equal thirds: 0, 100, 200, 300)
  kp[10]  = { x: 200, y: 0, z: 0 };   // forehead top
  kp[70]  = { x: 170, y: 100, z: 0 };  // R brow inner
  kp[300] = { x: 230, y: 100, z: 0 };  // L brow inner
  kp[129] = { x: 180, y: 200, z: 0 };  // L nostril
  kp[358] = { x: 220, y: 200, z: 0 };  // R nostril
  kp[152] = { x: 200, y: 300, z: 0 };  // chin
  // Rule of Fifths landmarks (equal fifths: 0, 80, 160, 240, 320, 400)
  kp[234] = { x: 0, y: 150, z: 0 };    // face edge R
  kp[33]  = { x: 80, y: 150, z: 0 };   // R eye outer
  kp[133] = { x: 160, y: 150, z: 0 };  // R eye inner
  kp[362] = { x: 240, y: 150, z: 0 };  // L eye inner
  kp[263] = { x: 320, y: 150, z: 0 };  // L eye outer
  kp[454] = { x: 400, y: 150, z: 0 };  // face edge L
  // Golden Ratio landmarks
  kp[61]  = { x: 140, y: 250, z: 0 };  // mouth corner L
  kp[291] = { x: 260, y: 250, z: 0 };  // mouth corner R
  return kp;
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/detection/__tests__/featureRating.test.ts`
Expected: FAIL — `ratings.proportions` is undefined

- [ ] **Step 3: Add proportions rating to featureRating.ts**

Add the new interface and function to `featureRating.ts`:

```typescript
import { computeFacialProportions } from './facialProportions';

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
```

Add the `rateProportions` function:

```typescript
const PHI = 1.618;

function rateProportions(result: FiveAnalysisResult): ProportionRatings {
  if (!result.keypoints || result.keypoints.length < 478) {
    return { overall: 7.5, thirds: 7.5, fifths: 7.5, goldenRatio: 7.5 };
  }

  const props = computeFacialProportions(result.keypoints);

  // Thirds: deviation 0 = perfect → score 1.0, deviation 0.3+ → low score
  const thirdsScore = toDisplay(Math.max(0, 1.0 - props.thirds.deviation * 2.5));

  // Fifths: deviation 0 = perfect → score 1.0
  const fifthsScore = toDisplay(Math.max(0, 1.0 - props.fifths.deviation * 2.5));

  // Golden ratio: average of 5 phi-based ideal scores
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
```

Update `computeFeatureRatings`:

```typescript
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
```

Note: Overall weights change from `0.30/0.20/0.25/0.25` to `0.25/0.15/0.20/0.20/0.20` to accommodate proportions.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/detection/__tests__/featureRating.test.ts`
Expected: All tests PASS (existing tests still pass because `makeMockResult()` has `keypoints: []` which triggers the fallback)

- [ ] **Step 5: Run all tests to check for regressions**

Run: `npx vitest run`
Expected: All 90+ tests PASS

- [ ] **Step 6: Commit**

```bash
git add lib/detection/featureRating.ts lib/detection/__tests__/featureRating.test.ts
git commit -m "feat: integrate facial proportions into feature rating system"
```

---

### Task 5: Update Score tab UI

**Files:**
- Modify: `components/result/FeatureRatings.tsx`

- [ ] **Step 1: Add proportions section to FeatureRatings component**

Update `FeatureRatings.tsx` — add proportions bars below the existing feature bars:

```tsx
'use client';

import type { FiveAnalysisResult } from '@/lib/detection/types';
import { computeFeatureRatings } from '@/lib/detection/featureRating';

interface Props {
  result: FiveAnalysisResult;
}

const FEATURES = ['eyebrows', 'eyes', 'lips', 'nose'] as const;

const PROPORTION_ITEMS = [
  { key: 'thirds' as const, label: 'Rule of Thirds' },
  { key: 'fifths' as const, label: 'Rule of Fifths' },
  { key: 'goldenRatio' as const, label: 'Golden Ratio' },
];

function barColor(score: number): string {
  if (score >= 8.5) return 'bg-emerald-400';
  if (score >= 7.5) return 'bg-green-400';
  if (score >= 6.5) return 'bg-amber-400';
  return 'bg-orange-400';
}

function scoreColor(score: number): string {
  if (score >= 8.5) return 'text-emerald-500';
  if (score >= 7.5) return 'text-green-500';
  if (score >= 6.5) return 'text-amber-500';
  return 'text-orange-500';
}

function RatingBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-text-primary">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor(score)}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className={`w-10 text-right text-sm font-bold ${scoreColor(score)}`}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export default function FeatureRatings({ result }: Props) {
  const ratings = computeFeatureRatings(result);

  return (
    <div className="space-y-4">
      {/* Feature Ratings */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <h3 className="text-lg font-bold font-heading text-accent mb-4">Feature Ratings</h3>
        <div className="space-y-3">
          {FEATURES.map((key) => (
            <RatingBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} score={ratings[key].overall} />
          ))}
        </div>
      </div>

      {/* Facial Proportions */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <h3 className="text-lg font-bold font-heading text-accent mb-4">Facial Proportions</h3>
        <div className="space-y-3">
          {PROPORTION_ITEMS.map((item) => (
            <RatingBar key={item.key} label={item.label} score={ratings.proportions[item.key]} />
          ))}
        </div>
      </div>

      {/* Overall Score */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">Overall Score</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor(ratings.overall)}`}
                style={{ width: `${ratings.overall * 10}%` }}
              />
            </div>
            <span className={`text-lg font-bold ${scoreColor(ratings.overall)}`}>
              {ratings.overall.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build succeeds**

Run: `npx next build 2>&1 | tail -10`
Expected: Build succeeds with no TypeScript errors

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add components/result/FeatureRatings.tsx
git commit -m "feat: display facial proportions and golden ratio scores in Score tab"
```

---

### Task 6: Add proportions score bounds test and final cleanup

**Files:**
- Modify: `lib/detection/__tests__/featureRating.test.ts`

- [ ] **Step 1: Update the "all scores between 5 and 10" test**

Update the existing score bounds test in `featureRating.test.ts` to include proportions:

```typescript
it('all scores are between 5 and 10', () => {
  const result = makeMockResult();
  const ratings = computeFeatureRatings(result);
  const allScores = [
    ratings.eyes.overall, ratings.eyes.shape, ratings.eyes.size, ratings.eyes.spacing, ratings.eyes.symmetry,
    ratings.eyebrows.overall, ratings.eyebrows.arch, ratings.eyebrows.spacing, ratings.eyebrows.thickness,
    ratings.lips.overall, ratings.lips.cupidBow, ratings.lips.proportion, ratings.lips.shape, ratings.lips.thickness, ratings.lips.width,
    ratings.nose.overall, ratings.nose.bridge, ratings.nose.length, ratings.nose.proportion, ratings.nose.width,
    ratings.proportions.overall, ratings.proportions.thirds, ratings.proportions.fifths, ratings.proportions.goldenRatio,
    ratings.overall,
  ];
  for (const score of allScores) {
    expect(score).toBeGreaterThanOrEqual(5);
    expect(score).toBeLessThanOrEqual(10);
  }
});
```

- [ ] **Step 2: Run all tests**

Run: `npx vitest run`
Expected: All tests PASS (90 existing + ~10 new = ~100 total)

- [ ] **Step 3: Commit**

```bash
git add lib/detection/__tests__/featureRating.test.ts
git commit -m "test: add proportions score bounds validation"
```

---

## Self-Review Checklist

1. **Spec coverage:**
   - Rule of Thirds (三庭): Task 1 ✓
   - Rule of Fifths (五眼): Task 2 ✓
   - Golden Ratio enhancement: Task 3 ✓
   - Integration into scoring: Task 4 ✓
   - UI display: Task 5 ✓
   - Test coverage: Tasks 1-4, 6 ✓

2. **Placeholder scan:** No TBD/TODO. All code blocks complete. Golden ratio placeholders in Task 1 are explicitly replaced in Task 3.

3. **Type consistency:**
   - `FacialProportions` defined in Task 1, consumed in Task 4 via `computeFacialProportions()`
   - `ProportionRatings` defined in Task 4, consumed in Task 5 via `ratings.proportions`
   - `FeatureRatings.proportions` added in Task 4, displayed in Task 5
   - All property names consistent: `thirds`, `fifths`, `goldenRatio`
