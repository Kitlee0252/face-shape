# Contour Profile Face Shape Classification

## Goal

Replace the current point-to-point width measurements (foreheadRatio, jawRatio, widthGradient, jawlineCurvature) with a FACE_OVAL contour profile analysis. The current measurements cluster too tightly across different face shapes (forehead 0.88-0.93, jaw 0.84-0.91 for all tested faces), making them ineffective discriminators. Contour profiling captures the full width distribution from forehead to chin, amplifying the differences between face shapes.

## Architecture

A new pure function `extractContourFeatures(keypoints) → ContourFeatures` in `contourProfile.ts` replaces the old `extractMeasurements` pipeline. The scoring system in `faceShape.ts` switches from 6 old dimensions to 6 new dimensions (2 retained + 4 contour-derived).

## Contour Sampling

FACE_OVAL has 36 ordered landmarks. Split into right half (top → chin) and left half (chin → top):

```
Right: 10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152
Left:  152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10
```

At 11 equally-spaced vertical heights (h=0.0 to h=1.0, where 0=foreheadTop.y and 1=chin.y), interpolate the x-coordinate on each half-contour to get `widths[11]`.

Interpolation: for a target height `targetY`, find the two adjacent contour points that bracket it vertically, then linearly interpolate x. Width at that height = rightX - leftX.

## Features Extracted (4 new)

### 1. peakPosition (0-1)

Position of the widest layer, normalized to face height.

```
peakPosition = argmax(widths) / 10
```

- Diamond: 0.25-0.45 (cheekbones widest, upper-mid face)
- Heart: 0.2-0.4 (wide upper face)
- Triangle: 0.45-0.65 (widest in lower half)
- Oval/Round/Square: 0.3-0.5 (mid-face)

### 2. topBottomRatio

Average width of upper half vs lower half.

```
topAvg = mean(widths[0..5])
bottomAvg = mean(widths[5..10])
topBottomRatio = topAvg / bottomAvg
```

- Heart: >1.10 (upper face wider)
- Triangle: <0.92 (lower face wider)
- Others: 0.95-1.10 (balanced)

Key discriminator for heart vs triangle — the pair that the old system could never distinguish.

### 3. taperRate (0-1)

How much width decreases from peak to chin.

```
peakIdx = argmax(widths)
taperRate = (widths[peakIdx] - widths[10]) / widths[peakIdx]
```

- Heart: 0.70-0.90 (sharp taper to pointed chin)
- Diamond: 0.60-0.80
- Oval: 0.55-0.70 (gentle taper)
- Round: 0.40-0.60 (moderate taper)
- Square: 0.30-0.50 (minimal taper, wide jaw)
- Triangle: 0.25-0.50 (wide bottom, minimal taper)

Key discriminator for square vs round — square barely tapers, round tapers more.

### 4. flatness (0-1)

How uniform the middle section widths are. Computed as 1 minus the coefficient of variation of the middle 7 layers.

```
midWidths = widths[2..8]
flatness = 1 - (std(midWidths) / mean(midWidths))
```

- Square/Round: 0.88-0.96 (very flat, rectangular/circular profile)
- Oval: 0.82-0.90 (slight curvature)
- Heart: 0.78-0.88 (tapers noticeably)
- Diamond: 0.72-0.84 (peaked in middle, narrow at extremes)

## Scoring System

### Retained features (2)

- **aspectRatio** = faceHeight / cheekboneWidth (landmarks 10/152, 234/454) — has real variation 1.13-1.27 in test data
- **chinAngle** = angle at chin between jaw points (landmarks 58/152/288) — 96-106° in test data, calibrated ranges

### Deleted features (4)

- foreheadRatio — all faces measure 0.88-0.93, no discrimination
- jawRatio — all faces measure 0.84-0.91, no discrimination
- widthGradient — derived from bad forehead/jaw, also no discrimination
- jawlineCurvature — ranges didn't match real data, minimal discrimination with low weight

### New SHAPE_RULES structure

```typescript
{
  aspect: [min, max],
  chinAngle: [min, max],
  peakPosition: [min, max],
  topBottomRatio: [min, max],
  taperRate: [min, max],
  flatness: [min, max],
  weight: [number, number, number, number, number, number]
}
```

### Target ranges per shape

| Shape | aspect | chinAngle | peakPos | topBottom | taper | flatness |
|-------|--------|-----------|---------|-----------|-------|----------|
| Oval | 1.25-1.5 | 95-135 | 0.3-0.5 | 0.95-1.10 | 0.55-0.70 | 0.82-0.90 |
| Round | 1.0-1.25 | 100-155 | 0.3-0.5 | 0.95-1.10 | 0.40-0.60 | 0.88-0.96 |
| Square | 1.0-1.25 | 85-105 | 0.3-0.5 | 0.95-1.10 | 0.30-0.50 | 0.88-0.96 |
| Heart | 1.15-1.5 | 90-125 | 0.2-0.4 | 1.10-1.35 | 0.70-0.90 | 0.78-0.88 |
| Oblong | 1.5-1.85 | 95-135 | 0.3-0.5 | 0.95-1.10 | 0.55-0.75 | 0.82-0.92 |
| Diamond | 1.15-1.5 | 90-130 | 0.25-0.45 | 0.90-1.10 | 0.60-0.80 | 0.72-0.84 |
| Triangle | 1.05-1.4 | 90-130 | 0.45-0.65 | 0.75-0.92 | 0.25-0.50 | 0.80-0.90 |

All weights start at 1.0 and will be calibrated from real data.

These ranges are estimates. After first deployment, console.log output from real photos will be used to recalibrate, same as chinAngle was recalibrated in the previous iteration.

### Key differentiators

| Confusable pair | Primary discriminator |
|-----------------|----------------------|
| Round vs Square | taperRate (square low, round higher) + chinAngle |
| Heart vs Diamond | topBottomRatio (heart >1.10, diamond ~1.0) |
| Heart vs Triangle | topBottomRatio (heart >1.10, triangle <0.92) |
| Oval vs Oblong | aspectRatio (oval <1.5, oblong >1.5) |
| Round vs Oval | aspectRatio + flatness (round flatter) |

## File Changes

### New file

- `lib/detection/contourProfile.ts` — FACE_OVAL contour sampling + 4 feature extraction

### Modified files

- `lib/detection/types.ts` — add `ContourFeatures` interface, update `FaceMeasurements` and `FaceRatios`
- `lib/detection/faceShape.ts` — new SHAPE_RULES (6 dims), replace `extractMeasurements`/`computeRatios`/`scoreShape`, remove old LANDMARKS (except cheekbone/chin/jaw for retained features)
- `lib/detection/__tests__/faceShape.test.ts` — test helper generates FACE_OVAL contour points for geometric shapes (ellipse, circle, rectangle, etc.)
- `components/result/AnalysisTabs.tsx` — display new 6 stats, remove old ones, add fallback for stale sessionStorage

### Unchanged files

- `lib/detection/geometry.ts` — distance/angleDeg/rangeScore unchanged
- `lib/detection/headPose.ts` — independent
- `lib/detection/eyeShape.ts`, `noseShape.ts`, `lipShape.ts`, `eyebrowShape.ts` — unaffected
- `lib/detection/useDetection.ts` — calls classifyFaceShape() which keeps same signature
- `components/detector/CanvasOverlay.tsx` — chinAngle display updated to use new ratios path

## Testing Strategy

### Unit tests for contourProfile.ts

Generate synthetic FACE_OVAL points for known geometric shapes:

- **Ellipse** (aspect 1.4) → should produce oval-like features: peakPosition ~0.4, topBottomRatio ~1.0, taperRate ~0.6, flatness ~0.85
- **Circle** → round features: peakPosition ~0.4, topBottomRatio ~1.0, taperRate ~0.5, flatness ~0.92
- **Rectangle** → square features: peakPosition ~0.4, topBottomRatio ~1.0, taperRate ~0.3, flatness ~0.95
- **Inverted triangle** → heart features: peakPosition ~0.3, topBottomRatio ~1.2, taperRate ~0.8, flatness ~0.80
- **Upright triangle** → triangle features: peakPosition ~0.6, topBottomRatio ~0.8, taperRate ~0.3, flatness ~0.82

### Integration tests for classifyFaceShape

Same pattern as existing tests — synthetic keypoints with geometric contours should classify to expected shapes.

### Real-data calibration

After deployment, console.log the 4 contour features for real photos. Adjust ranges to match observed data. This is expected and planned for.
