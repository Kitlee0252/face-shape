# Face Shape Algorithm Improvements

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve face shape classification accuracy by adding 3D distance, fixing forehead landmarks, adding new features (widthGradient, jawlineCurvature), renaming jawAngle to chinAngle, and adding head pose detection.

**Architecture:** Incremental changes to the existing rule-based scoring system. Each task is self-contained: modify source, update types, adjust scoring rules, fix tests. No new files needed except a pose utility.

**Tech Stack:** TypeScript, MediaPipe FaceLandmarker (478-point), Vitest

---

## File Map

| File | Changes |
|------|---------|
| `lib/detection/geometry.ts` | distance() add z-axis |
| `lib/detection/types.ts` | Rename jawAngle → chinAngle, add widthGradient + jawlineCurvature |
| `lib/detection/faceShape.ts` | New landmarks, new measurements, updated SHAPE_RULES + weights |
| `lib/detection/__tests__/geometry.test.ts` | Update z-coordinate test |
| `lib/detection/__tests__/faceShape.test.ts` | Update helper + test ratios for new features |
| `components/result/AnalysisTabs.tsx` | Display new stats, rename label |
| `components/detector/CanvasOverlay.tsx` | Rename jawAngle display |
| `lib/detection/headPose.ts` | NEW: pose estimation + warning threshold |
| `lib/detection/useDetection.ts` | Integrate pose check |

---

### Task 1: distance() → 3D

**Files:**
- Modify: `lib/detection/geometry.ts:4-6`
- Modify: `lib/detection/__tests__/geometry.test.ts:31-33`

- [ ] **Step 1: Update distance() to include z-axis**

```typescript
// geometry.ts line 4-6
export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}
```

- [ ] **Step 2: Update the z-coordinate test**

```typescript
// geometry.test.ts - replace "ignores z coordinate" test
it('includes z coordinate in distance', () => {
  // 3-4-5 in xy, z adds 12 → sqrt(25 + 144) = 13
  expect(distance(p(0, 0, 0), p(3, 4, 12))).toBe(13);
});
```

- [ ] **Step 3: Run tests**

Run: `pnpm vitest run lib/detection/__tests__/geometry.test.ts`
Expected: All pass. Existing tests use z=0, so no change.

---

### Task 2: Rename jawAngle → chinAngle

**Files:**
- Modify: `lib/detection/types.ts:22,32-33`
- Modify: `lib/detection/faceShape.ts` (SHAPE_RULES keys, extractMeasurements, computeRatios, scoreShape)
- Modify: `lib/detection/__tests__/faceShape.test.ts` (keypointsFromRatios param name)
- Modify: `components/result/AnalysisTabs.tsx:154`
- Modify: `components/detector/CanvasOverlay.tsx:128`

- [ ] **Step 1: Rename in types.ts**

FaceMeasurements: `jawAngle` → `chinAngle`
FaceRatios: `jawAngle` → `chinAngle`, update JSDoc

- [ ] **Step 2: Rename in faceShape.ts**

- SHAPE_RULES: `jawAngle` key → `chinAngle` in all 7 shapes
- weight array comment: `[aspect, forehead, jaw, jawAngle]` → `[aspect, forehead, jaw, chinAngle]`
- extractMeasurements: `jawAngle` → `chinAngle`
- computeRatios: `jawAngle` → `chinAngle`
- scoreShape: `rule.jawAngle` → `rule.chinAngle`, `ratios.jawAngle` → `ratios.chinAngle`

- [ ] **Step 3: Rename in tests**

faceShape.test.ts: `jawAngleDeg` param name → `chinAngleDeg` in keypointsFromRatios

- [ ] **Step 4: Rename in UI components**

AnalysisTabs.tsx line 154: `"Jaw Angle"` → `"Chin Angle"`, `ratios.jawAngle` → `ratios.chinAngle`
CanvasOverlay.tsx line 128: `ratios.jawAngle` → `ratios.chinAngle`

- [ ] **Step 5: Run full test suite**

Run: `pnpm vitest run`
Expected: All 90 tests pass (pure rename, no logic change).

---

### Task 3: Fix forehead landmarks (71/301 → 103/332)

**Files:**
- Modify: `lib/detection/faceShape.ts:23-24` (LANDMARKS)
- Modify: `lib/detection/faceShape.ts:58-106` (SHAPE_RULES forehead ranges)
- Modify: `lib/detection/__tests__/faceShape.test.ts` (test ratios if needed)

- [ ] **Step 1: Update LANDMARKS**

```typescript
const LANDMARKS = {
  foreheadLeft: 103,   // was 71 (eyebrow level) → 103 (FACE_OVAL upper forehead)
  foreheadRight: 332,  // was 301 (eyebrow level) → 332 (FACE_OVAL upper forehead)
  // ... rest unchanged
};
```

- [ ] **Step 2: Adjust forehead ratio ranges**

Points 103/332 are on the FACE_OVAL above the eye, giving ~8-12% wider forehead measurement than eyebrow-level 71/301. Shift all forehead ranges up by ~0.08:

| Shape | Old forehead | New forehead |
|-------|-------------|-------------|
| oval | [0.74, 0.92] | [0.82, 1.00] |
| round | [0.80, 0.98] | [0.88, 1.06] |
| square | [0.85, 1.02] | [0.93, 1.10] |
| heart | [0.85, 1.08] | [0.93, 1.16] |
| oblong | [0.72, 0.94] | [0.80, 1.02] |
| diamond | [0.62, 0.82] | [0.70, 0.90] |
| triangle | [0.62, 0.82] | [0.70, 0.90] |

- [ ] **Step 3: Update test ratios**

keypointsFromRatios test values may need adjustment — the test helper uses LANDMARKS constants dynamically, so synthetic placement stays correct. But the "ideal" ratio values in test cases should match new ranges.

- [ ] **Step 4: Run tests**

Run: `pnpm vitest run lib/detection/__tests__/faceShape.test.ts`
Expected: All pass after ratio adjustments.

---

### Task 4: Add widthGradient feature

**Files:**
- Modify: `lib/detection/types.ts` (FaceRatios)
- Modify: `lib/detection/faceShape.ts` (computeRatios, SHAPE_RULES, scoreShape)
- Modify: `lib/detection/__tests__/faceShape.test.ts` (verify widthGradient in results)
- Modify: `components/result/AnalysisTabs.tsx` (display)

widthGradient = (foreheadWidth - jawWidth) / faceHeight — no new landmarks needed.

- [ ] **Step 1: Add to types**

```typescript
interface FaceRatios {
  aspectRatio: number;
  foreheadRatio: number;
  jawRatio: number;
  chinAngle: number;
  widthGradient: number;  // (foreheadWidth - jawWidth) / faceHeight
}
```

- [ ] **Step 2: Compute in faceShape.ts**

```typescript
function computeRatios(m: FaceMeasurements): FaceRatios {
  return {
    aspectRatio: m.faceHeight / m.cheekboneWidth,
    foreheadRatio: m.foreheadWidth / m.cheekboneWidth,
    jawRatio: m.jawWidth / m.cheekboneWidth,
    chinAngle: m.chinAngle,
    widthGradient: (m.foreheadWidth - m.jawWidth) / m.faceHeight,
  };
}
```

- [ ] **Step 3: Add ranges + weights to SHAPE_RULES**

Add `widthGradient: [min, max]` to each shape. Weight array becomes 5 elements: `[aspect, forehead, jaw, chinAngle, widthGradient]`.

| Shape | widthGradient range | weight |
|-------|-------------------|--------|
| oval | [-0.02, 0.10] | 0.6 |
| round | [-0.06, 0.06] | 0.4 |
| square | [-0.06, 0.06] | 0.4 |
| heart | [0.08, 0.25] | 1.5 |
| oblong | [-0.04, 0.08] | 0.4 |
| diamond | [-0.06, 0.08] | 0.8 |
| triangle | [-0.25, -0.04] | 1.5 |

- [ ] **Step 4: Update scoreShape**

Add `sWG = rangeScore(ratios.widthGradient, rule.widthGradient[0], rule.widthGradient[1])` and include in weighted average.

- [ ] **Step 5: Update UI**

AnalysisTabs.tsx: add `<StatBox label="Gradient" value={ratios.widthGradient.toFixed(2)} />` to the grid.

- [ ] **Step 6: Run tests**

Run: `pnpm vitest run lib/detection/__tests__/faceShape.test.ts`
Expected: All pass. widthGradient is derived from existing forehead/jaw/height values already set in keypointsFromRatios.

---

### Task 5: Add jawlineCurvature feature

**Files:**
- Modify: `lib/detection/types.ts` (FaceMeasurements, FaceRatios)
- Modify: `lib/detection/faceShape.ts` (LANDMARKS, extractMeasurements, computeRatios, SHAPE_RULES, scoreShape)
- Modify: `lib/detection/__tests__/faceShape.test.ts` (place jawline landmarks in helper)
- Modify: `components/result/AnalysisTabs.tsx`

FACE_OVAL jawline landmarks (chin 152 → jaw angle):
- Left: 148, 176, 149, 150, 136, 172 → 58
- Right: 377, 400, 378, 379, 365, 397 → 288

Curvature = average perpendicular distance of mid-jawline points from the jaw-to-chin line, normalized by that line's length.

- [ ] **Step 1: Add to types**

```typescript
interface FaceMeasurements {
  // ... existing
  jawlineCurvature: number;  // raw average deviation in px
}
interface FaceRatios {
  // ... existing
  jawlineCurvature: number;  // normalized: avg deviation / jaw-to-chin distance
}
```

- [ ] **Step 2: Add jawline landmarks + compute curvature**

Use landmarks 176, 150, 136 (left) and 400, 379, 365 (right) as sample points.
For each side, compute perpendicular distance from the jaw-chin line.
Average both sides for symmetry.

- [ ] **Step 3: Add ranges + weights to SHAPE_RULES**

Weight array becomes 6 elements: `[aspect, forehead, jaw, chinAngle, widthGradient, jawlineCurvature]`.

| Shape | jawlineCurvature range | weight |
|-------|----------------------|--------|
| oval | [0.04, 0.10] | 0.4 |
| round | [0.07, 0.15] | 1.2 |
| square | [0.01, 0.06] | 1.2 |
| heart | [0.04, 0.12] | 0.4 |
| oblong | [0.03, 0.10] | 0.3 |
| diamond | [0.04, 0.10] | 0.4 |
| triangle | [0.03, 0.09] | 0.4 |

- [ ] **Step 4: Update test helper**

Place jawline landmarks in keypointsFromRatios. Add optional `jawlineCurvature` parameter to control how curved/straight the synthetic jaw is.

- [ ] **Step 5: Run tests**

Run: `pnpm vitest run lib/detection/__tests__/faceShape.test.ts`

---

### Task 6: Head pose detection + warning

**Files:**
- Create: `lib/detection/headPose.ts`
- Modify: `lib/detection/useDetection.ts` (add pose check, expose warning)
- Modify: `lib/detection/types.ts` (add PoseWarning to result)

- [ ] **Step 1: Create headPose.ts**

Estimate yaw from asymmetry of nose-to-cheek distances (3D).
Estimate pitch from forehead-nose vs nose-chin ratio.

```typescript
export interface PoseWarning {
  yawDeg: number;
  pitchDeg: number;
  warning: string | null;  // null = ok, string = user message
}
export function estimateHeadPose(keypoints: Point[]): PoseWarning
```

Thresholds: warn if |yaw| > 15° or |pitch| > 15°.

- [ ] **Step 2: Integrate into useDetection**

Call estimateHeadPose after landmark detection. If warning is non-null, include it in DetectionState so the UI can display it.

- [ ] **Step 3: Run tests**

Run: `pnpm vitest run`
Expected: All pass. New code is additive, no existing logic changed.
