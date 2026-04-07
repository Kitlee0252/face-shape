# Detailed Feature Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match competitor (faceshapedetector.ai) feature analysis output — each facial feature gets Characteristics (classifications), Measurements (raw numbers), and Ratings (sub-scores with progress bars), presented in a tabbed UI.

**Architecture:** Expand 4 classifiers to return additional classifications (symmetry, shape variants) and raw pixel measurements. Add per-feature sub-rating system. Replace stacked-cards result UI with a tabbed layout: Shape | Score | Eyes | Brows | Lips | Nose.

**Tech Stack:** TypeScript, Vitest, React (Next.js App Router), TailwindCSS 4

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/detection/types.ts` | Modify | Add new classification types + measurement interfaces |
| `lib/detection/eyeShape.ts` | Modify | Add shape class, symmetry, raw measurements |
| `lib/detection/eyebrowShape.ts` | Modify | Add thickness, length, symmetry, raw measurements |
| `lib/detection/lipShape.ts` | Modify | Add cupid's bow, shape class, symmetry, raw measurements |
| `lib/detection/noseShape.ts` | Modify | Add bridge, shape, proportion, raw measurements |
| `lib/detection/featureRating.ts` | Rewrite | Sub-ratings per feature (not just 4 totals) |
| `lib/detection/__tests__/eyeShape.test.ts` | Modify | Test new fields |
| `lib/detection/__tests__/eyebrowShape.test.ts` | Modify | Test new fields |
| `lib/detection/__tests__/lipShape.test.ts` | Modify | Test new fields |
| `lib/detection/__tests__/noseShape.test.ts` | Modify | Test new fields |
| `lib/detection/__tests__/featureRating.test.ts` | Create | Test sub-ratings |
| `components/result/AnalysisTabs.tsx` | Create | Tabbed container: Shape/Score/Eyes/Brows/Lips/Nose |
| `components/result/FeaturePanel.tsx` | Create | Reusable panel: Characteristics + Measurements + Ratings |
| `components/result/FeatureRatings.tsx` | Modify | Score tab — summary ratings for all features |
| `components/result/FiveAnalysisResults.tsx` | Delete | Replaced by AnalysisTabs |
| `app/result/page.tsx` | Modify | Use AnalysisTabs instead of FiveAnalysisResults |

## Competitor Data Mapping

What the competitor shows per feature vs what we currently have:

### Eyes
| Competitor Field | Our Current Source | Gap |
|---|---|---|
| Shape: Round | size classification (large/medium/small) | Need shape class: round/almond/narrow |
| Size: Large | `size` field | Have it |
| Spacing: Wide | `spacing` field | Have it |
| Symmetry: Good | Not computed | Need left/right comparison |
| Aspect_ratio: 2.6 | `sizeRatio` (inverted) | Need width/height ratio |
| Avg_height: 13.6 | Computed internally, not returned | Need to expose |
| Avg_width: 35.5 | Computed internally, not returned | Need to expose |
| Distance: 55.0 | `spacingRatio` only | Need raw pixel distance |
| Left_width / Right_width | Computed per-eye, not returned | Need to expose |
| Ratings: Overall/Shape/Size/Spacing/Symmetry | Single overall score | Need 5 sub-ratings |

### Eyebrows
| Competitor Field | Our Current Source | Gap |
|---|---|---|
| Arch: Straight | `shape` field | Have it (rename for display) |
| Shape: Long | Not computed | Need length classification |
| Spacing: Wide | `spacing` ratio only | Need classification label |
| Symmetry: Good | Not computed | Need left/right comparison |
| Thickness: Very Thin | Not computed | Need arch height classification |
| Height: 0.0 | Not computed | Need arch height measurement |
| Left_length / Right_length | Computed internally, not returned | Need to expose |
| Length: 66.0 | Not computed | Need average length |
| Spacing: 35.1 | `spacing` ratio only | Need raw distance |
| Ratings: Arch/Overall/Spacing/Thickness | Single overall score | Need 4 sub-ratings |

### Lips
| Competitor Field | Our Current Source | Gap |
|---|---|---|
| Cupid_bow: Moderate | Not computed | Need cupid's bow analysis |
| Shape: Top-heavy | `upperLowerRatio` exists | Need shape classification |
| Symmetry: Asymmetric | Not computed | Need left/right comparison |
| Thickness: Thin | `thickness` field | Have it |
| Width: Wide | `width` field | Have it |
| Height: 7.0 | Computed internally | Need to expose total height |
| Upper_height / Lower_height | Computed internally | Need to expose |
| Upper_lower_ratio: 1.5 | `upperLowerRatio` field | Have it |
| Width: 62.0 | Computed internally | Need raw width |
| Width_ratio: 8.9 | `widthRatio` field | Have it (×100 for display) |
| Ratings: Cupid_bow/Overall/Proportion/Shape/Thickness/Width | Single overall | Need 6 sub-ratings |

### Nose
| Competitor Field | Our Current Source | Gap |
|---|---|---|
| Bridge: Very high | `bridgeAngle` only | Need height classification |
| Length: Very Long | `length` field | Have it |
| Proportion: Disproportioned | Not computed | Need proportion assessment |
| Shape: Curved | Not computed | Need shape classification |
| Width: Wide | `width` field | Have it |
| Bridge_height: 48.0 | Not directly computed | Need bridge height measurement |
| Bridge_width: 37.0 | Not directly computed | Need bridge width measurement |
| Length: 68.0 | Computed internally | Need raw length |
| Width: 37.0 | Computed internally | Need raw width (same as nostril span) |
| Width_ratio: 0.5 | `widthRatio` field | Have it |
| Ratings: Bridge/Length/Overall/Proportion/Width | Single overall | Need 5 sub-ratings |

---

## Tasks

### Task 1: Expand types.ts

**Files:**
- Modify: `lib/detection/types.ts`

- [ ] **Step 1: Add new classification types and expand interfaces**

Add these types and expand all four result interfaces with new classification fields and a `detailed` measurements object:

```typescript
// --- Shared ---
export type SymmetryLevel = 'excellent' | 'good' | 'moderate' | 'asymmetric';

// --- Eye Shape (expanded) ---
export type EyeShapeClass = 'round' | 'almond' | 'narrow';

export interface EyeShapeResult {
  // Existing classifications
  slope: EyeSlope;
  size: EyeSize;
  spacing: EyeSpacing;
  // New classifications
  shape: EyeShapeClass;
  symmetry: SymmetryLevel;
  // Existing ratios
  slopeAngle: number;
  sizeRatio: number;
  spacingRatio: number;
  // New: raw measurements
  detailed: {
    aspectRatio: number;   // width / height
    avgHeight: number;     // pixels
    avgWidth: number;      // pixels
    distance: number;      // inter-eye px
    leftWidth: number;     // pixels
    rightWidth: number;    // pixels
  };
}

// --- Eyebrow Shape (expanded) ---
export type BrowThickness = 'thick' | 'medium' | 'thin' | 'very thin';
export type BrowLength = 'long' | 'medium' | 'short';

export interface EyebrowShapeResult {
  // Existing
  shape: BrowShape;       // arch type: straight/arched/high-arched
  slope: BrowSlope;
  archAngle: number;
  spacing: number;        // ratio
  // New classifications
  thickness: BrowThickness;
  length: BrowLength;
  symmetry: SymmetryLevel;
  // New: raw measurements
  detailed: {
    height: number;        // arch height px
    leftLength: number;    // px
    rightLength: number;   // px
    length: number;        // avg px
    spacing: number;       // raw inter-brow distance px
  };
}

// --- Lip Shape (expanded) ---
export type CupidBow = 'pronounced' | 'moderate' | 'flat';
export type LipShapeClass = 'top-heavy' | 'balanced' | 'bottom-heavy';

export interface LipShapeResult {
  // Existing
  thickness: LipThickness;
  width: LipWidth;
  upperLowerRatio: number;
  thicknessRatio: number;
  widthRatio: number;
  // New classifications
  cupidBow: CupidBow;
  shapeClass: LipShapeClass;
  symmetry: SymmetryLevel;
  // New: raw measurements
  detailed: {
    height: number;        // total lip height px
    upperHeight: number;   // px
    lowerHeight: number;   // px
    width: number;         // lip width px
  };
}

// --- Nose Shape (expanded) ---
export type NoseBridge = 'very high' | 'high' | 'medium' | 'low';
export type NoseShapeClass = 'straight' | 'curved' | 'concave';
export type NoseProportion = 'proportioned' | 'slightly disproportioned' | 'disproportioned';

export interface NoseShapeResult {
  // Existing
  width: NoseWidth;
  length: NoseLength;
  bridgeAngle: number;
  widthRatio: number;
  lengthRatio: number;
  // New classifications
  bridge: NoseBridge;
  shapeClass: NoseShapeClass;
  proportion: NoseProportion;
  // New: raw measurements
  detailed: {
    bridgeHeight: number;  // px
    bridgeWidth: number;   // px
    length: number;        // nose length px
    width: number;         // nostril span px
  };
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: Type errors in classifiers (they don't return new fields yet). This confirms types are defined correctly and the classifiers need updating.

- [ ] **Step 3: Commit types**

```bash
git add lib/detection/types.ts
git commit -m "feat: expand type definitions for detailed feature analysis"
```

---

### Task 2: Expand Eye Classifier

**Files:**
- Modify: `lib/detection/eyeShape.ts`
- Modify: `lib/detection/__tests__/eyeShape.test.ts`

- [ ] **Step 1: Add new tests for shape, symmetry, and detailed measurements**

Append to `__tests__/eyeShape.test.ts`:

```typescript
describe('shape classification', () => {
  it('detects round eyes (high size ratio)', () => {
    const kp = makeEyeKeypoints({ slopeDeg: 0, sizeRatio: 0.42, spacingRatio: 1.0 });
    const result = classifyEyeShape(kp);
    expect(result.shape).toBe('round');
  });

  it('detects almond eyes (medium size ratio)', () => {
    const kp = makeEyeKeypoints({ slopeDeg: 0, sizeRatio: 0.33, spacingRatio: 1.0 });
    const result = classifyEyeShape(kp);
    expect(result.shape).toBe('almond');
  });

  it('detects narrow eyes (low size ratio)', () => {
    const kp = makeEyeKeypoints({ slopeDeg: 0, sizeRatio: 0.22, spacingRatio: 1.0 });
    const result = classifyEyeShape(kp);
    expect(result.shape).toBe('narrow');
  });
});

describe('symmetry classification', () => {
  it('detects excellent symmetry for identical eyes', () => {
    const kp = makeEyeKeypoints({ slopeDeg: 0, sizeRatio: 0.33, spacingRatio: 1.0 });
    const result = classifyEyeShape(kp);
    expect(result.symmetry).toBe('excellent');
  });
});

describe('detailed measurements', () => {
  it('includes all raw measurements', () => {
    const kp = makeEyeKeypoints({ slopeDeg: 0, sizeRatio: 0.33, spacingRatio: 1.0 });
    const result = classifyEyeShape(kp);
    expect(result.detailed.avgWidth).toBeGreaterThan(0);
    expect(result.detailed.avgHeight).toBeGreaterThan(0);
    expect(result.detailed.distance).toBeGreaterThan(0);
    expect(result.detailed.leftWidth).toBeGreaterThan(0);
    expect(result.detailed.rightWidth).toBeGreaterThan(0);
    expect(result.detailed.aspectRatio).toBeCloseTo(result.detailed.avgWidth / result.detailed.avgHeight, 1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/detection/__tests__/eyeShape.test.ts`
Expected: FAIL — `shape`, `symmetry`, `detailed` not in result.

- [ ] **Step 3: Update classifyEyeShape to return expanded result**

In `eyeShape.ts`, update `classifySingleEye` to also return `eyeHeight`:

```typescript
function classifySingleEye(kp: Point[], eye: { inner: number; outer: number; upper: number; lower: number }) {
  const inner = kp[eye.inner];
  const outer = kp[eye.outer];
  const upper = kp[eye.upper];
  const lower = kp[eye.lower];

  const dx = Math.abs(outer.x - inner.x);
  const dy = inner.y - outer.y;
  const slopeAngle = Math.atan2(dy, dx) * (180 / Math.PI);

  const eyeHeight = distance(upper, lower);
  const eyeWidth = distance(inner, outer);
  const sizeRatio = eyeHeight / eyeWidth;

  return { slopeAngle, sizeRatio, eyeWidth, eyeHeight };
}
```

Add shape classification based on sizeRatio:

```typescript
// Classify shape
let shape: EyeShapeClass;
if (avgSizeRatio > 0.36) shape = 'round';
else if (avgSizeRatio < 0.26) shape = 'narrow';
else shape = 'almond';
```

Add symmetry based on left/right width difference:

```typescript
// Classify symmetry
const widthDiff = Math.abs(right.eyeWidth - left.eyeWidth);
const avgWidth = (right.eyeWidth + left.eyeWidth) / 2;
const symmetryRatio = avgWidth > 0 ? widthDiff / avgWidth : 0;
let symmetry: SymmetryLevel;
if (symmetryRatio < 0.03) symmetry = 'excellent';
else if (symmetryRatio < 0.08) symmetry = 'good';
else if (symmetryRatio < 0.15) symmetry = 'moderate';
else symmetry = 'asymmetric';
```

Add detailed measurements to return:

```typescript
return {
  slope, size, spacing, shape, symmetry,
  slopeAngle: avgSlopeAngle,
  sizeRatio: avgSizeRatio,
  spacingRatio,
  detailed: {
    aspectRatio: avgSizeRatio > 0 ? 1 / avgSizeRatio : 0,
    avgHeight: (right.eyeHeight + left.eyeHeight) / 2,
    avgWidth: avgWidth,
    distance: interEyeDist,
    leftWidth: left.eyeWidth,
    rightWidth: right.eyeWidth,
  },
};
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run lib/detection/__tests__/eyeShape.test.ts`
Expected: ALL PASS (existing + new tests).

- [ ] **Step 5: Commit**

```bash
git add lib/detection/eyeShape.ts lib/detection/__tests__/eyeShape.test.ts
git commit -m "feat(eyes): add shape, symmetry, detailed measurements"
```

---

### Task 3: Expand Eyebrow Classifier

**Files:**
- Modify: `lib/detection/eyebrowShape.ts`
- Modify: `lib/detection/__tests__/eyebrowShape.test.ts`

- [ ] **Step 1: Add new tests**

Append to `__tests__/eyebrowShape.test.ts`:

```typescript
describe('thickness classification', () => {
  it('classifies brow thickness', () => {
    const kp = makeBrowKeypoints({ archAngleDeg: 150, slopeDy: 0, spacingRatio: 1.0 });
    const result = classifyEyebrowShape(kp);
    expect(['thick', 'medium', 'thin', 'very thin']).toContain(result.thickness);
  });
});

describe('length classification', () => {
  it('classifies brow length', () => {
    const kp = makeBrowKeypoints({ archAngleDeg: 150, slopeDy: 0, spacingRatio: 1.0 });
    const result = classifyEyebrowShape(kp);
    expect(['long', 'medium', 'short']).toContain(result.length);
  });
});

describe('detailed measurements', () => {
  it('includes raw measurements', () => {
    const kp = makeBrowKeypoints({ archAngleDeg: 150, slopeDy: 0, spacingRatio: 1.0 });
    const result = classifyEyebrowShape(kp);
    expect(result.detailed.length).toBeGreaterThan(0);
    expect(result.detailed.leftLength).toBeGreaterThan(0);
    expect(result.detailed.rightLength).toBeGreaterThan(0);
    expect(result.detailed.height).toBeGreaterThanOrEqual(0);
    expect(result.detailed.spacing).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/detection/__tests__/eyebrowShape.test.ts`
Expected: FAIL.

- [ ] **Step 3: Update classifyEyebrowShape**

In `eyebrowShape.ts`, update `classifySingleBrow` to return `browLength` and `archHeight`:

```typescript
function classifySingleBrow(kp: Point[], brow: { head: number; peak: number; tail: number }) {
  const head = kp[brow.head];
  const peak = kp[brow.peak];
  const tail = kp[brow.tail];

  const archAngle = angleDeg(head, peak, tail);
  const slopeDy = tail.y - head.y;
  const browLength = distance(head, tail);
  const normalizedSlope = browLength > 0 ? slopeDy / browLength : 0;

  // Arch height: perpendicular distance from peak to head-tail line
  const headTailDist = browLength;
  const headPeakDist = distance(head, peak);
  const peakTailDist = distance(peak, tail);
  // Using area method: area = 0.5 * base * height
  const s = (headTailDist + headPeakDist + peakTailDist) / 2;
  const area = Math.sqrt(Math.max(0, s * (s - headTailDist) * (s - headPeakDist) * (s - peakTailDist)));
  const archHeight = headTailDist > 0 ? (2 * area) / headTailDist : 0;

  return { archAngle, normalizedSlope, browLength, archHeight };
}
```

Add thickness classification:

```typescript
const avgArchHeight = (right.archHeight + left.archHeight) / 2;
let thickness: BrowThickness;
if (avgArchHeight > 8) thickness = 'thick';
else if (avgArchHeight > 4) thickness = 'medium';
else if (avgArchHeight > 2) thickness = 'thin';
else thickness = 'very thin';
```

Add length classification (relative to inter-eye distance):

```typescript
const avgBrowLength = (right.browLength + left.browLength) / 2;
const lengthRatio = eyeInnerDist > 0 ? avgBrowLength / eyeInnerDist : 1;
let length: BrowLength;
if (lengthRatio > 1.2) length = 'long';
else if (lengthRatio < 0.9) length = 'short';
else length = 'medium';
```

Add symmetry:

```typescript
const lengthDiff = Math.abs(right.browLength - left.browLength);
const symmetryRatio = avgBrowLength > 0 ? lengthDiff / avgBrowLength : 0;
let symmetry: SymmetryLevel;
if (symmetryRatio < 0.03) symmetry = 'excellent';
else if (symmetryRatio < 0.08) symmetry = 'good';
else if (symmetryRatio < 0.15) symmetry = 'moderate';
else symmetry = 'asymmetric';
```

Return expanded result with `detailed`:

```typescript
return {
  shape, slope, archAngle: avgArchAngle, spacing,
  thickness, length, symmetry,
  detailed: {
    height: avgArchHeight,
    leftLength: left.browLength,
    rightLength: right.browLength,
    length: avgBrowLength,
    spacing: browHeadDist,
  },
};
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run lib/detection/__tests__/eyebrowShape.test.ts`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/detection/eyebrowShape.ts lib/detection/__tests__/eyebrowShape.test.ts
git commit -m "feat(brows): add thickness, length, symmetry, detailed measurements"
```

---

### Task 4: Expand Lip Classifier

**Files:**
- Modify: `lib/detection/lipShape.ts`
- Modify: `lib/detection/__tests__/lipShape.test.ts`

- [ ] **Step 1: Add new tests**

Append to `__tests__/lipShape.test.ts`:

```typescript
describe('shape classification', () => {
  it('detects top-heavy lips', () => {
    const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.38, upperLowerRatio: 1.3 });
    const result = classifyLipShape(kp);
    expect(result.shapeClass).toBe('top-heavy');
  });

  it('detects balanced lips', () => {
    const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.38, upperLowerRatio: 0.9 });
    const result = classifyLipShape(kp);
    expect(result.shapeClass).toBe('balanced');
  });

  it('detects bottom-heavy lips', () => {
    const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.38, upperLowerRatio: 0.5 });
    const result = classifyLipShape(kp);
    expect(result.shapeClass).toBe('bottom-heavy');
  });
});

describe('detailed measurements', () => {
  it('includes raw measurements', () => {
    const kp = makeLipKeypoints({ thicknessRatio: 0.27, widthRatio: 0.38, upperLowerRatio: 0.7 });
    const result = classifyLipShape(kp);
    expect(result.detailed.height).toBeGreaterThan(0);
    expect(result.detailed.upperHeight).toBeGreaterThan(0);
    expect(result.detailed.lowerHeight).toBeGreaterThan(0);
    expect(result.detailed.width).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/detection/__tests__/lipShape.test.ts`
Expected: FAIL.

- [ ] **Step 3: Update classifyLipShape**

Add cupid's bow classification (based on upper lip center prominence):

```typescript
// Cupid's bow: how prominent the upper lip peak is
// Compare upper lip outer-to-inner distance vs average lip height
const cupidBowRatio = totalHeight > 0 ? upperHeight / totalHeight : 0.5;
let cupidBow: CupidBow;
if (cupidBowRatio > 0.45) cupidBow = 'pronounced';
else if (cupidBowRatio > 0.35) cupidBow = 'moderate';
else cupidBow = 'flat';
```

Add shape classification:

```typescript
let shapeClass: LipShapeClass;
if (upperLowerRatio > 1.1) shapeClass = 'top-heavy';
else if (upperLowerRatio < 0.65) shapeClass = 'bottom-heavy';
else shapeClass = 'balanced';
```

Add symmetry (based on corner height difference):

```typescript
const cornerHeightDiff = Math.abs(cornerL.y - cornerR.y);
const symmetryRatio = lipWidth > 0 ? cornerHeightDiff / lipWidth : 0;
let symmetry: SymmetryLevel;
if (symmetryRatio < 0.02) symmetry = 'excellent';
else if (symmetryRatio < 0.05) symmetry = 'good';
else if (symmetryRatio < 0.10) symmetry = 'moderate';
else symmetry = 'asymmetric';
```

Return with detailed:

```typescript
return {
  thickness, width, upperLowerRatio, thicknessRatio, widthRatio,
  cupidBow, shapeClass, symmetry,
  detailed: {
    height: totalHeight,
    upperHeight,
    lowerHeight,
    width: lipWidth,
  },
};
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run lib/detection/__tests__/lipShape.test.ts`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/detection/lipShape.ts lib/detection/__tests__/lipShape.test.ts
git commit -m "feat(lips): add cupid bow, shape class, symmetry, detailed measurements"
```

---

### Task 5: Expand Nose Classifier

**Files:**
- Modify: `lib/detection/noseShape.ts`
- Modify: `lib/detection/__tests__/noseShape.test.ts`

- [ ] **Step 1: Add new tests**

Append to `__tests__/noseShape.test.ts`:

```typescript
describe('bridge classification', () => {
  it('classifies nose bridge height', () => {
    const kp = makeNoseKeypoints({ noseWidthRatio: 0.25, noseLengthRatio: 0.28 });
    const result = classifyNoseShape(kp);
    expect(['very high', 'high', 'medium', 'low']).toContain(result.bridge);
  });
});

describe('shape classification', () => {
  it('classifies nose shape', () => {
    const kp = makeNoseKeypoints({ noseWidthRatio: 0.25, noseLengthRatio: 0.28 });
    const result = classifyNoseShape(kp);
    expect(['straight', 'curved', 'concave']).toContain(result.shapeClass);
  });
});

describe('proportion classification', () => {
  it('classifies proportion', () => {
    const kp = makeNoseKeypoints({ noseWidthRatio: 0.25, noseLengthRatio: 0.28 });
    const result = classifyNoseShape(kp);
    expect(['proportioned', 'slightly disproportioned', 'disproportioned']).toContain(result.proportion);
  });
});

describe('detailed measurements', () => {
  it('includes raw measurements', () => {
    const kp = makeNoseKeypoints({ noseWidthRatio: 0.25, noseLengthRatio: 0.28 });
    const result = classifyNoseShape(kp);
    expect(result.detailed.length).toBeGreaterThan(0);
    expect(result.detailed.width).toBeGreaterThan(0);
    expect(result.detailed.bridgeHeight).toBeGreaterThan(0);
    expect(result.detailed.bridgeWidth).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/detection/__tests__/noseShape.test.ts`
Expected: FAIL.

- [ ] **Step 3: Update classifyNoseShape**

Need additional landmarks for bridge width. Add landmark indices:

```typescript
const NOSE = {
  bridgeTop: 6,
  tip: 1,
  nostrilLeft: 129,
  nostrilRight: 358,
  bridgeLeft: 48,   // left side of bridge
  bridgeRight: 278, // right side of bridge
} as const;
```

Add bridge height classification (bridge-to-face-height ratio):

```typescript
// Bridge height: distance from bridge top to a reference midpoint
// Higher ratio = more prominent bridge
const bridgeHeight = distance(bridgeTop, tip);
const bridgeHeightRatio = faceHeight > 0 ? bridgeHeight / faceHeight : 0;
let bridge: NoseBridge;
if (bridgeHeightRatio > 0.35) bridge = 'very high';
else if (bridgeHeightRatio > 0.30) bridge = 'high';
else if (bridgeHeightRatio > 0.24) bridge = 'medium';
else bridge = 'low';
```

Add bridge width measurement:

```typescript
const bridgeLeft = keypoints[NOSE.bridgeLeft];
const bridgeRight = keypoints[NOSE.bridgeRight];
const bridgeWidth = distance(bridgeLeft, bridgeRight);
```

Add shape classification (based on bridge angle — angle formed at bridge midpoint):

```typescript
let shapeClass: NoseShapeClass;
if (bridgeAngle > 45) shapeClass = 'concave';
else if (bridgeAngle > 30) shapeClass = 'curved';
else shapeClass = 'straight';
```

Add proportion (how balanced width and length are):

```typescript
// Ideal: width ratio ~0.25, length ratio ~0.28-0.30
const widthDeviation = Math.abs(widthRatio - 0.25) / 0.25;
const lengthDeviation = Math.abs(lengthRatio - 0.29) / 0.29;
const avgDeviation = (widthDeviation + lengthDeviation) / 2;
let proportion: NoseProportion;
if (avgDeviation < 0.12) proportion = 'proportioned';
else if (avgDeviation < 0.25) proportion = 'slightly disproportioned';
else proportion = 'disproportioned';
```

Return with detailed:

```typescript
return {
  width: widthClass, length: lengthClass, bridgeAngle, widthRatio, lengthRatio,
  bridge, shapeClass, proportion,
  detailed: {
    bridgeHeight,
    bridgeWidth,
    length: noseLength,
    width: noseWidth,
  },
};
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run lib/detection/__tests__/noseShape.test.ts`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/detection/noseShape.ts lib/detection/__tests__/noseShape.test.ts
git commit -m "feat(nose): add bridge, shape, proportion, detailed measurements"
```

---

### Task 6: Expand Feature Rating System

**Files:**
- Rewrite: `lib/detection/featureRating.ts`
- Create: `lib/detection/__tests__/featureRating.test.ts`

- [ ] **Step 1: Write tests for sub-ratings**

Create `lib/detection/__tests__/featureRating.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { computeFeatureRatings } from '../featureRating';
import type { FiveAnalysisResult } from '../types';

function makeMockResult(overrides?: Partial<FiveAnalysisResult>): FiveAnalysisResult {
  return {
    faceShape: {} as any,
    eyeShape: {
      slope: 'straight', size: 'medium', spacing: 'standard',
      shape: 'almond', symmetry: 'good',
      slopeAngle: 1, sizeRatio: 0.33, spacingRatio: 1.0,
      detailed: { aspectRatio: 3.0, avgHeight: 13, avgWidth: 40, distance: 42, leftWidth: 40, rightWidth: 40 },
    },
    noseShape: {
      width: 'medium', length: 'medium', bridgeAngle: 35,
      widthRatio: 0.25, lengthRatio: 0.29,
      bridge: 'medium', shapeClass: 'straight', proportion: 'proportioned',
      detailed: { bridgeHeight: 50, bridgeWidth: 20, length: 70, width: 50 },
    },
    lipShape: {
      thickness: 'medium', width: 'medium',
      upperLowerRatio: 0.7, thicknessRatio: 0.28, widthRatio: 0.39,
      cupidBow: 'moderate', shapeClass: 'balanced', symmetry: 'good',
      detailed: { height: 20, upperHeight: 8, lowerHeight: 12, width: 60 },
    },
    eyebrowShape: {
      shape: 'arched', slope: 'flat', archAngle: 150, spacing: 1.0,
      thickness: 'medium', length: 'medium', symmetry: 'good',
      detailed: { height: 5, leftLength: 50, rightLength: 50, length: 50, spacing: 35 },
    },
    keypoints: [],
    ...overrides,
  };
}

describe('computeFeatureRatings', () => {
  it('returns sub-ratings for each feature', () => {
    const result = makeMockResult();
    const ratings = computeFeatureRatings(result);
    // Eyes
    expect(ratings.eyes.overall).toBeGreaterThanOrEqual(5);
    expect(ratings.eyes.overall).toBeLessThanOrEqual(10);
    expect(ratings.eyes.shape).toBeDefined();
    expect(ratings.eyes.size).toBeDefined();
    expect(ratings.eyes.spacing).toBeDefined();
    expect(ratings.eyes.symmetry).toBeDefined();
    // Brows
    expect(ratings.eyebrows.overall).toBeDefined();
    expect(ratings.eyebrows.arch).toBeDefined();
    expect(ratings.eyebrows.spacing).toBeDefined();
    expect(ratings.eyebrows.thickness).toBeDefined();
    // Lips
    expect(ratings.lips.overall).toBeDefined();
    expect(ratings.lips.cupidBow).toBeDefined();
    expect(ratings.lips.proportion).toBeDefined();
    expect(ratings.lips.shape).toBeDefined();
    expect(ratings.lips.thickness).toBeDefined();
    expect(ratings.lips.width).toBeDefined();
    // Nose
    expect(ratings.nose.overall).toBeDefined();
    expect(ratings.nose.bridge).toBeDefined();
    expect(ratings.nose.length).toBeDefined();
    expect(ratings.nose.proportion).toBeDefined();
    expect(ratings.nose.width).toBeDefined();
    // Summary
    expect(ratings.overall).toBeGreaterThanOrEqual(5);
    expect(ratings.overall).toBeLessThanOrEqual(10);
  });

  it('scores ideal proportions higher', () => {
    const ideal = makeMockResult();
    const ratings = computeFeatureRatings(ideal);
    expect(ratings.eyes.overall).toBeGreaterThan(7);
    expect(ratings.nose.overall).toBeGreaterThan(7);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/detection/__tests__/featureRating.test.ts`
Expected: FAIL — current ratings structure doesn't match.

- [ ] **Step 3: Rewrite featureRating.ts with sub-ratings**

Rewrite `lib/detection/featureRating.ts` to return per-feature sub-ratings:

```typescript
import type { FiveAnalysisResult } from './types';

export interface EyeRatings { overall: number; shape: number; size: number; spacing: number; symmetry: number; }
export interface BrowRatings { overall: number; arch: number; spacing: number; thickness: number; }
export interface LipRatings { overall: number; cupidBow: number; proportion: number; shape: number; thickness: number; width: number; }
export interface NoseRatings { overall: number; bridge: number; length: number; proportion: number; width: number; }

export interface FeatureRatings {
  eyes: EyeRatings;
  eyebrows: BrowRatings;
  lips: LipRatings;
  nose: NoseRatings;
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
  const symMap = { excellent: 1, good: 0.85, moderate: 0.6, asymmetric: 0.35 };
  const symmetry = toDisplay(symMap[r.eyeShape.symmetry]);
  const overall = round1((shape + size + spacing + symmetry) / 4);
  return { overall, shape, size, spacing, symmetry };
}

function rateBrows(r: FiveAnalysisResult): BrowRatings {
  const arch = toDisplay(idealScore(r.eyebrowShape.archAngle, 142, 162, 12));
  const spacing = toDisplay(idealScore(r.eyebrowShape.spacing, 0.88, 1.12, 0.15));
  const thickMap = { thick: 0.8, medium: 1.0, thin: 0.7, 'very thin': 0.5 };
  const thickness = toDisplay(thickMap[r.eyebrowShape.thickness]);
  const overall = round1((arch + spacing + thickness) / 3);
  return { overall, arch, spacing, thickness };
}

function rateLips(r: FiveAnalysisResult): LipRatings {
  const cupidMap = { pronounced: 0.9, moderate: 1.0, flat: 0.65 };
  const cupidBow = toDisplay(cupidMap[r.lipShape.cupidBow]);
  const proportion = toDisplay(idealScore(r.lipShape.upperLowerRatio, 0.55, 0.80, 0.15));
  const shapeMap = { 'top-heavy': 0.7, balanced: 1.0, 'bottom-heavy': 0.75 };
  const shape = toDisplay(shapeMap[r.lipShape.shapeClass]);
  const thickness = toDisplay(idealScore(r.lipShape.thicknessRatio, 0.24, 0.33, 0.06));
  const width = toDisplay(idealScore(r.lipShape.widthRatio, 0.36, 0.43, 0.05));
  const overall = round1((cupidBow + proportion + shape + thickness + width) / 5);
  return { overall, cupidBow, proportion, shape, thickness, width };
}

function rateNose(r: FiveAnalysisResult): NoseRatings {
  const bridgeMap = { 'very high': 0.65, high: 0.85, medium: 1.0, low: 0.7 };
  const bridge = toDisplay(bridgeMap[r.noseShape.bridge]);
  const length = toDisplay(idealScore(r.noseShape.lengthRatio, 0.26, 0.33, 0.05));
  const propMap = { proportioned: 1.0, 'slightly disproportioned': 0.7, disproportioned: 0.45 };
  const proportion = toDisplay(propMap[r.noseShape.proportion]);
  const width = toDisplay(idealScore(r.noseShape.widthRatio, 0.22, 0.27, 0.04));
  const overall = round1((bridge + length + proportion + width) / 4);
  return { overall, bridge, length, proportion, width };
}

export function computeFeatureRatings(result: FiveAnalysisResult): FeatureRatings {
  const eyes = rateEyes(result);
  const eyebrows = rateBrows(result);
  const lips = rateLips(result);
  const nose = rateNose(result);
  const overall = round1((eyes.overall * 0.30 + eyebrows.overall * 0.20 + lips.overall * 0.25 + nose.overall * 0.25));
  return { eyes, eyebrows, lips, nose, overall };
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run lib/detection/__tests__/featureRating.test.ts`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/detection/featureRating.ts lib/detection/__tests__/featureRating.test.ts
git commit -m "feat(ratings): expand to per-feature sub-ratings"
```

---

### Task 7: Create Tabbed UI Components

**Files:**
- Create: `components/result/FeaturePanel.tsx`
- Create: `components/result/AnalysisTabs.tsx`

- [ ] **Step 1: Create FeaturePanel — reusable Characteristics + Measurements + Ratings panel**

Create `components/result/FeaturePanel.tsx`:

```tsx
'use client';

interface CharItem { label: string; value: string; }
interface MeasItem { label: string; value: number; }
interface RatingItem { label: string; score: number; }

interface FeaturePanelProps {
  icon: string;
  title: string;
  summary: string;
  characteristics: CharItem[];
  measurements: MeasItem[];
  ratings: RatingItem[];
}

function barColor(score: number): string {
  if (score >= 8.5) return 'bg-emerald-400';
  if (score >= 7.5) return 'bg-green-500';
  if (score >= 6.5) return 'bg-amber-400';
  return 'bg-orange-400';
}

function scoreColor(score: number): string {
  if (score >= 8.5) return 'text-emerald-500';
  if (score >= 7.5) return 'text-green-600';
  if (score >= 6.5) return 'text-amber-500';
  return 'text-orange-500';
}

export default function FeaturePanel({ icon, title, summary, characteristics, measurements, ratings }: FeaturePanelProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <span className="text-3xl">{icon}</span>
        <div>
          <h2 className="text-xl font-bold font-heading">{title}</h2>
          <p className="text-sm text-text-secondary mt-0.5">{summary}</p>
        </div>
      </div>

      {/* Characteristics + Measurements grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Characteristics */}
        <div>
          <h3 className="text-sm font-bold text-accent mb-3">Characteristics</h3>
          <div className="space-y-2">
            {characteristics.map((c) => (
              <div key={c.label} className="flex justify-between text-sm">
                <span className="text-text-secondary">{c.label}</span>
                <span className="font-semibold text-primary">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Measurements */}
        <div>
          <h3 className="text-sm font-bold text-accent mb-3">Measurements</h3>
          <div className="space-y-2">
            {measurements.map((m) => (
              <div key={m.label} className="flex justify-between text-sm">
                <span className="text-text-secondary">{m.label}</span>
                <span className="font-medium">{m.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div>
        <h3 className="text-sm font-bold text-accent mb-3">Ratings</h3>
        <div className="space-y-2.5">
          {ratings.map((r) => (
            <div key={r.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">{r.label}</span>
                <span className={`font-bold ${scoreColor(r.score)}`}>{r.score.toFixed(1)}/10</span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor(r.score)}`}
                  style={{ width: `${r.score * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create AnalysisTabs — the tabbed container**

Create `components/result/AnalysisTabs.tsx`. This component maps data from `FiveAnalysisResult` to `FeaturePanel` props for each tab. The tabs are: Shape | Score | Eyes | Brows | Lips | Nose.

The Shape tab reuses the existing face shape display logic. The Score tab shows the summary ratings (what FeatureRatings currently shows). Eyes/Brows/Lips/Nose tabs each render a FeaturePanel.

Key implementation details:
- Tab state managed with `useState`
- Data mapping functions: `buildEyePanel(result, ratings)`, `buildBrowPanel(...)`, etc.
- Summary text generation: `"Eyes: Large round-shaped eyes with wide spacing."`
- All data comes from the `FiveAnalysisResult` that's already in sessionStorage

(Full code provided — ~250 lines with tab bar + 6 tab content renderers + data mapping helpers)

- [ ] **Step 3: Verify components render without errors**

Run: `pnpm build`
Expected: Build succeeds. (These are pure presentational components with no external deps.)

- [ ] **Step 4: Commit**

```bash
git add components/result/FeaturePanel.tsx components/result/AnalysisTabs.tsx
git commit -m "feat: add FeaturePanel and AnalysisTabs components"
```

---

### Task 8: Integrate into Result Page

**Files:**
- Modify: `app/result/page.tsx`
- Delete: `components/result/FiveAnalysisResults.tsx` (replaced by AnalysisTabs)
- Modify: `components/result/FeatureRatings.tsx` (used inside AnalysisTabs Score tab)

- [ ] **Step 1: Update result page imports**

Replace `FiveAnalysisResults` and `FeatureRatings` with `AnalysisTabs`:

```tsx
import AnalysisTabs from '@/components/result/AnalysisTabs';
// Remove: import FiveAnalysisResults
// Remove: import FeatureRatings
```

Replace the two component calls:

```tsx
{/* Before: */}
<FiveAnalysisResults result={resultData} />
<div className="mt-4"><FeatureRatings result={resultData} /></div>

{/* After: */}
<AnalysisTabs result={resultData as FiveAnalysisResult} />
```

- [ ] **Step 2: Build and test**

Run: `pnpm build && npx vitest run`
Expected: Build succeeds, 68+ tests pass.

- [ ] **Step 3: Delete old FiveAnalysisResults.tsx**

```bash
rm components/result/FiveAnalysisResults.tsx
```

- [ ] **Step 4: Final build verification**

Run: `pnpm build`
Expected: Clean build with no import errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: tabbed analysis UI matching competitor format

Replace stacked cards with tabbed layout:
- Shape: face shape with confidence + ratios
- Score: summary feature ratings with progress bars
- Eyes/Brows/Lips/Nose: characteristics + measurements + sub-ratings"
```

---

### Task 9: Full Integration Test + Push

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass (68 existing + ~15 new = ~83 total).

- [ ] **Step 2: Build for production**

Run: `pnpm build`
Expected: Clean static export, all pages generated.

- [ ] **Step 3: Push to deploy**

```bash
git push origin main
```

Cloudflare Pages auto-deploys from GitHub.
