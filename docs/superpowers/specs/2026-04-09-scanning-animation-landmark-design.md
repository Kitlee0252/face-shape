# Scanning Animation & Landmark Visualization Design

**Date:** 2026-04-09
**Status:** Approved

## Overview

Restructure the upload-to-result flow so that users are immediately navigated to the result page after uploading a photo. The result page runs detection while displaying a scanning animation, then reveals facial landmark points and analysis results.

## Data Flow Restructuring

### Current Flow
```
Homepage upload → FaceDetector loads model + detects + analyzes → stores faceResult + resultImage → router.push('/result') → Result page displays results
```

### New Flow
```
Homepage upload → stores pendingImage (data URL) → router.push('/result')
→ Result page reads pendingImage → loads MediaPipe model → detects landmarks → runs analysis
→ stores faceResult + resultImage → clears pendingImage → displays results
```

### Key Changes
- **Homepage FaceDetector**: Simplified to pure upload component. No longer loads MediaPipe or runs detection.
- **Result page**: New detection orchestration layer handles model loading → detection → analysis.
- **keypoints**: Kept in memory for landmark drawing, not stored in sessionStorage.
- **sessionStorage keys**:
  - `pendingImage` (new): Raw data URL from upload, read and cleared by result page.
  - `faceResult`: Same as before, written by result page after detection.
  - `resultImage`: Same as before, written by result page after detection.

## Result Page Three-Phase Experience

### Phase 1: Scanning Animation (loading + detecting)

**Left column (photo):**
- Display uploaded photo with a semi-transparent dark overlay
- Overlay a glowing horizontal scan line that sweeps top-to-bottom repeatedly
- Scan line spec:
  - Width: 100% of photo
  - Height: ~3px core, with gradient glow above and below
  - Color: brand `primary` color
  - Animation: top → bottom in ~2s per cycle, CSS animation, loops until detection completes

**Right column (content area):**
- Status text updates: "Loading AI model..." → "Analyzing facial features..."
- Skeleton placeholders mimicking the AnalysisTabs layout

### Phase 2: Landmark Reveal (~1s transition)

Triggered when detection + analysis completes:
- Scan line stops and fades out
- Dark overlay fades out
- 478 landmark points fade in on the photo (Canvas overlay)
- 4 measurement lines draw in sequence:
  - Red: Face height (foreheadTop → chin)
  - Yellow: Forehead width
  - Cyan: Cheekbone width
  - Purple: Jaw width
- Reuses existing `CanvasOverlay` drawing logic, adapted for animated reveal

### Phase 3: Final Result Display

- Landmark visualization persists on the photo (does not fade out)
- Right column renders AnalysisTabs + recommendations (same as current result page)
- "Try another photo" link available

## Component Changes

### Homepage (`app/page.tsx` + `FaceDetector.tsx`)
- FaceDetector simplified: upload → convert to data URL → store `pendingImage` → navigate
- Remove MediaPipe loading, detection, and analysis from FaceDetector
- Remove `loading` / `detecting` / `done` status states (only `idle` and `error` needed)

### Result Page (`app/result/page.tsx`)
- New detection orchestration: reads `pendingImage`, loads model, detects, analyzes
- Three-phase rendering based on detection status
- Manages keypoints in component state for Canvas overlay

### New Component: `ScanningOverlay`
- Pure CSS animation component overlaid on the photo
- Props: `active: boolean` (controls animation and visibility)
- Fade-out transition when `active` becomes false

### Adapted Component: `CanvasOverlay`
- Already exists with landmark + measurement line drawing
- Add fade-in animation support (opacity transition)
- Accept keypoints as prop, render when available

## Error Handling

- If no face detected: show error message on result page with "Try another photo" button (same UX as current FaceDetector error state, but on result page)
- If pendingImage missing (direct URL access to /result): redirect to homepage or show existing faceResult if available
