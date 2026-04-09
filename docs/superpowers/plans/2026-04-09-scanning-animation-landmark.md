# Scanning Animation & Landmark Visualization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move face detection to the result page so users see a scanning animation during analysis, then landmark visualization on the photo.

**Architecture:** Homepage becomes upload-only (store image → navigate). Result page orchestrates three phases: scanning animation during model load + detection, landmark reveal on completion, then full result display. Existing CanvasOverlay is adapted for animated landmark drawing.

**Tech Stack:** Next.js 16 (App Router), TypeScript, TailwindCSS 4, MediaPipe FaceLandmarker, Canvas API

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `app/page.tsx` | Remove FaceDetector, handle upload → resize → sessionStorage → navigate inline |
| Create | `components/result/ScanningOverlay.tsx` | Pure CSS scanning line animation overlay |
| Create | `components/result/AnalysisSkeleton.tsx` | Skeleton placeholder for right-column content |
| Modify | `components/detector/CanvasOverlay.tsx` | Add fade-in opacity transition, accept `visible` prop |
| Create | `lib/detection/useDetection.ts` | Custom hook: orchestrates model load → detect → analyze on result page |
| Modify | `app/result/page.tsx` | Three-phase rendering: scanning → landmark reveal → results |

---

### Task 1: Create `useDetection` Hook

Extract detection + analysis logic into a reusable hook that runs on the result page.

**Files:**
- Create: `lib/detection/useDetection.ts`

- [ ] **Step 1: Create the hook file**

```typescript
// lib/detection/useDetection.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import { detectLandmarks } from '@/lib/detection/landmarks';
import { classifyFaceShape } from '@/lib/detection/faceShape';
import { classifyEyeShape } from '@/lib/detection/eyeShape';
import { classifyNoseShape } from '@/lib/detection/noseShape';
import { classifyLipShape } from '@/lib/detection/lipShape';
import { classifyEyebrowShape } from '@/lib/detection/eyebrowShape';
import type { FiveAnalysisResult, Point } from '@/lib/detection/types';

export type DetectionPhase = 'idle' | 'loading' | 'detecting' | 'done' | 'error';

interface DetectionState {
  phase: DetectionPhase;
  result: FiveAnalysisResult | null;
  keypoints: Point[];
  error: string;
}

function runAnalysis(keypoints: Point[]): FiveAnalysisResult {
  return {
    faceShape: classifyFaceShape(keypoints),
    eyeShape: classifyEyeShape(keypoints),
    noseShape: classifyNoseShape(keypoints),
    lipShape: classifyLipShape(keypoints),
    eyebrowShape: classifyEyebrowShape(keypoints),
    keypoints,
  };
}

/**
 * Runs face detection and analysis on the given image data URL.
 * Designed to be called once on the result page.
 */
export function useDetection(imageDataUrl: string | null) {
  const [state, setState] = useState<DetectionState>({
    phase: 'idle',
    result: null,
    keypoints: [],
    error: '',
  });
  const ran = useRef(false);

  useEffect(() => {
    if (!imageDataUrl || ran.current) return;
    ran.current = true;

    const run = async () => {
      try {
        setState((s) => ({ ...s, phase: 'loading' }));

        // Load image from data URL
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = imageDataUrl;
        });

        // Resize for performance (same logic as old FaceDetector)
        const maxW = 640;
        let source: HTMLImageElement | HTMLCanvasElement = img;
        if (img.naturalWidth > maxW) {
          const scale = maxW / img.naturalWidth;
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.naturalWidth * scale);
          canvas.height = Math.round(img.naturalHeight * scale);
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          source = canvas;
        }

        setState((s) => ({ ...s, phase: 'detecting' }));
        const keypoints = await detectLandmarks(source);

        if (keypoints.length === 0) {
          setState((s) => ({
            ...s,
            phase: 'error',
            error: 'No face detected. Try a clearer photo with good lighting.',
          }));
          return;
        }

        const result = runAnalysis(keypoints);

        // Persist result for page refreshes (same format as before, without keypoints)
        const { keypoints: _kp, ...resultData } = result;
        sessionStorage.setItem('faceResult', JSON.stringify(resultData));
        sessionStorage.setItem('resultImage', imageDataUrl);
        sessionStorage.removeItem('pendingImage');

        setState({ phase: 'done', result, keypoints, error: '' });
      } catch (err) {
        setState((s) => ({
          ...s,
          phase: 'error',
          error: err instanceof Error ? err.message : 'Detection failed',
        }));
      }
    };

    run();
  }, [imageDataUrl]);

  return state;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `useDetection.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/detection/useDetection.ts
git commit -m "feat: add useDetection hook for result-page detection orchestration"
```

---

### Task 2: Create `ScanningOverlay` Component

A pure CSS animation overlay that shows a glowing scan line sweeping over the photo.

**Files:**
- Create: `components/result/ScanningOverlay.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/result/ScanningOverlay.tsx
'use client';

interface ScanningOverlayProps {
  active: boolean;
  statusText: string;
}

export default function ScanningOverlay({ active, statusText }: ScanningOverlayProps) {
  return (
    <div
      className={`absolute inset-0 z-10 transition-opacity duration-500 pointer-events-none ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 rounded-2xl" />

      {/* Scanning line */}
      {active && (
        <div
          className="absolute left-0 right-0 h-[3px] rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(232,133,108,0.1) 30%, #E8856C 50%, rgba(232,133,108,0.1) 70%, transparent 100%)',
            boxShadow: '0 0 20px 4px rgba(232,133,108,0.4), 0 0 60px 8px rgba(232,133,108,0.15)',
            animation: 'scanLine 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Status text */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="inline-flex items-center gap-2 bg-black/60 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          {statusText}
        </span>
      </div>

      {/* Keyframe animation */}
      <style jsx>{`
        @keyframes scanLine {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `ScanningOverlay.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/result/ScanningOverlay.tsx
git commit -m "feat: add ScanningOverlay component with glowing scan line animation"
```

---

### Task 3: Create `AnalysisSkeleton` Component

Skeleton placeholder that mimics the AnalysisTabs layout while detection runs.

**Files:**
- Create: `components/result/AnalysisSkeleton.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/result/AnalysisSkeleton.tsx
export default function AnalysisSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Tab bar skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-16 rounded-full bg-surface" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)] space-y-4">
        {/* Title */}
        <div className="h-6 w-48 rounded bg-surface" />
        {/* Confidence bar */}
        <div className="h-4 w-full rounded-full bg-surface" />
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-surface" />
          ))}
        </div>
        {/* Score bars */}
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-surface" style={{ width: `${80 - i * 12}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/result/AnalysisSkeleton.tsx
git commit -m "feat: add AnalysisSkeleton placeholder for loading state"
```

---

### Task 4: Adapt `CanvasOverlay` for Animated Reveal

Add a `visible` prop so the overlay can fade in after detection completes.

**Files:**
- Modify: `components/detector/CanvasOverlay.tsx`

- [ ] **Step 1: Update CanvasOverlay to accept `visible` prop and use keypoints directly**

The current CanvasOverlay takes `imageSrc` and draws the image onto a canvas. For the new design, it should overlay on top of the existing `<img>` element as a transparent canvas that only draws landmarks and measurement lines (no background image). It also needs a `visible` prop for fade-in.

Replace the full file content with:

```tsx
// components/detector/CanvasOverlay.tsx
'use client';

import { useEffect, useRef } from 'react';
import type { Point, FaceShapeResult } from '@/lib/detection/types';
import { LANDMARKS } from '@/lib/detection/faceShape';

interface CanvasOverlayProps {
  keypoints: Point[];
  ratios: FaceShapeResult['ratios'];
  containerWidth: number;
  containerHeight: number;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  visible: boolean;
}

const MEASUREMENT_LINES: { label: string; from: number; to: number; color: string }[] = [
  { label: 'Face height', from: LANDMARKS.foreheadTop, to: LANDMARKS.chin, color: '#ef4444' },
  { label: 'Forehead', from: LANDMARKS.foreheadLeft, to: LANDMARKS.foreheadRight, color: '#eab308' },
  { label: 'Cheekbone', from: LANDMARKS.cheekboneLeft, to: LANDMARKS.cheekboneRight, color: '#22d3ee' },
  { label: 'Jaw', from: LANDMARKS.jawLeft, to: LANDMARKS.jawRight, color: '#a855f7' },
];

export default function CanvasOverlay({
  keypoints,
  ratios,
  containerWidth,
  containerHeight,
  imageNaturalWidth,
  imageNaturalHeight,
  visible,
}: CanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || keypoints.length === 0 || containerWidth === 0) return;

    const scaleX = containerWidth / imageNaturalWidth;
    const scaleY = containerHeight / imageNaturalHeight;

    canvas.width = containerWidth;
    canvas.height = containerHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // Draw all landmarks as small dots
    ctx.fillStyle = 'rgba(0, 255, 100, 0.4)';
    for (const p of keypoints) {
      ctx.beginPath();
      ctx.arc(p.x * scaleX, p.y * scaleY, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw measurement lines
    for (const line of MEASUREMENT_LINES) {
      const p1 = keypoints[line.from];
      const p2 = keypoints[line.to];
      if (!p1 || !p2) continue;

      ctx.strokeStyle = line.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(p1.x * scaleX, p1.y * scaleY);
      ctx.lineTo(p2.x * scaleX, p2.y * scaleY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Endpoints
      for (const p of [p1, p2]) {
        ctx.fillStyle = line.color;
        ctx.beginPath();
        ctx.arc(p.x * scaleX, p.y * scaleY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Label
      const mx = ((p1.x + p2.x) / 2) * scaleX;
      const my = ((p1.y + p2.y) / 2) * scaleY;
      ctx.font = '600 11px system-ui';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 3;
      ctx.strokeText(line.label, mx + 8, my + 4);
      ctx.fillText(line.label, mx + 8, my + 4);
    }

    // Draw jaw angle arc
    const jawL = keypoints[LANDMARKS.jawLeft];
    const chin = keypoints[LANDMARKS.chin];
    const jawR = keypoints[LANDMARKS.jawRight];
    if (jawL && chin && jawR) {
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      const radius = 20;
      const a1 = Math.atan2(jawL.y - chin.y, jawL.x - chin.x);
      const a2 = Math.atan2(jawR.y - chin.y, jawR.x - chin.x);
      ctx.beginPath();
      ctx.arc(chin.x * scaleX, chin.y * scaleY, radius, a2, a1);
      ctx.stroke();

      ctx.font = '600 11px system-ui';
      ctx.fillStyle = '#f97316';
      ctx.fillText(
        `${Math.round(ratios.jawAngle)}°`,
        chin.x * scaleX + radius + 4,
        chin.y * scaleY - 4
      );
    }
  }, [keypoints, ratios, containerWidth, containerHeight, imageNaturalWidth, imageNaturalHeight]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 z-20 transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `CanvasOverlay.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/detector/CanvasOverlay.tsx
git commit -m "refactor: adapt CanvasOverlay as transparent overlay with fade-in support"
```

---

### Task 5: Simplify Homepage Upload Flow

Homepage no longer uses FaceDetector. Upload → resize → store in sessionStorage → navigate. FaceDetector.tsx becomes dead code (can be cleaned up later).

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Rewrite `app/page.tsx`**

Replace the full file content. Key change: the `handleImage` callback resizes the image to max 800px JPEG before storing in sessionStorage (avoids exceeding the ~5MB sessionStorage limit with raw camera photos).

```tsx
// app/page.tsx
'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from '@/components/home/HeroSection';
import TrustBar from '@/components/home/TrustBar';
import HowItWorks from '@/components/home/HowItWorks';
import ResultsPreview from '@/components/home/ResultsPreview';
import ShapeGrid from '@/components/home/ShapeGrid';
import FAQ from '@/components/home/FAQ';
import { SchemaScript, softwareAppSchema } from '@/components/shared/SEOHead';

export default function Home() {
  const router = useRouter();

  const handleImage = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        // Resize to max 800px and compress as JPEG to fit sessionStorage
        const maxW = 800;
        const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        sessionStorage.setItem('pendingImage', canvas.toDataURL('image/jpeg', 0.85));
        router.push('/result');
      };
      img.src = url;
    },
    [router]
  );

  return (
    <main className="flex-1">
      <HeroSection onImage={handleImage} />
      <TrustBar />
      <HowItWorks />
      <ResultsPreview />
      <ShapeGrid />
      <FAQ />
      <SchemaScript data={softwareAppSchema()} />
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "refactor: simplify homepage to upload-only, move detection to result page"
```

---

### Task 6: Rewrite Result Page with Three-Phase Rendering

The main integration task: result page reads `pendingImage`, runs detection, and renders the three phases.

**Files:**
- Modify: `app/result/page.tsx`

- [ ] **Step 1: Rewrite the result page**

Replace the full file content:

```tsx
// app/result/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AnalysisTabs from '@/components/result/AnalysisTabs';
import AnalysisSkeleton from '@/components/result/AnalysisSkeleton';
import ScanningOverlay from '@/components/result/ScanningOverlay';
import CanvasOverlay from '@/components/detector/CanvasOverlay';
import RecommendationCard from '@/components/result/RecommendationCard';
import { HAIRSTYLES } from '@/lib/data/hairstyles';
import { GLASSES } from '@/lib/data/glasses';
import { MAKEUP } from '@/lib/data/makeup';
import { getHairstyleImage, getGlassesImage } from '@/lib/utils/imagePaths';
import { useDetection } from '@/lib/detection/useDetection';
import type { FiveAnalysisResult, FaceShapeType } from '@/lib/detection/types';

export default function ResultPage() {
  // Image state
  const [imageUrl, setImageUrl] = useState<string>('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [cachedResult, setCachedResult] = useState<FiveAnalysisResult | null>(null);

  // Image dimensions for canvas overlay
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgDims, setImgDims] = useState({ w: 0, h: 0, nw: 0, nh: 0 });

  const [genderTab, setGenderTab] = useState<'female' | 'male'>('female');

  // Load pending image or cached result from sessionStorage
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingImage');
    if (pending) {
      setPendingImage(pending);
      setImageUrl(pending);
      return;
    }
    // Fallback: returning to result page with cached data
    const data = sessionStorage.getItem('faceResult');
    const img = sessionStorage.getItem('resultImage');
    if (data) setCachedResult(JSON.parse(data));
    if (img) setImageUrl(img);
  }, []);

  // Run detection if we have a pending image
  const detection = useDetection(pendingImage);

  // Determine what to display
  const isDetecting = pendingImage !== null && detection.phase !== 'done' && detection.phase !== 'error';
  const resultData = detection.result ?? cachedResult;
  const showLandmarks = detection.phase === 'done' && detection.keypoints.length > 0;

  // Track image rendered dimensions for canvas overlay
  const updateImgDims = () => {
    const el = imgRef.current;
    if (el) {
      setImgDims({
        w: el.clientWidth,
        h: el.clientHeight,
        nw: el.naturalWidth,
        nh: el.naturalHeight,
      });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateImgDims);
    return () => window.removeEventListener('resize', updateImgDims);
  }, []);

  // Status text for scanning overlay
  const statusText =
    detection.phase === 'loading'
      ? 'Loading AI model...'
      : detection.phase === 'detecting'
        ? 'Analyzing facial features...'
        : 'Preparing results...';

  // Error state
  if (detection.phase === 'error') {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24">
        <h1 className="text-2xl font-bold font-heading mb-4">Detection Failed</h1>
        <p className="text-text-secondary mb-6">{detection.error}</p>
        <Link
          href="/"
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
        >
          Try another photo
        </Link>
      </main>
    );
  }

  // No data at all (direct URL access without upload)
  if (!imageUrl && !pendingImage) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24">
        <h1 className="text-2xl font-bold font-heading mb-4">No results found</h1>
        <p className="text-text-secondary mb-6">Upload a photo first to get your face analysis.</p>
        <Link
          href="/"
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
        >
          Try the detector
        </Link>
      </main>
    );
  }

  const shapeType: FaceShapeType | undefined = resultData?.faceShape?.primary?.type;
  const hairstyleRecs = shapeType ? HAIRSTYLES[shapeType] : null;
  const glassesRecs = shapeType ? GLASSES[shapeType] : null;
  const makeupTips = shapeType ? MAKEUP[shapeType] : null;

  return (
    <main className="flex-1 px-4 py-12">
      <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-[400px_1fr] lg:gap-8">
        {/* Left: Image with overlays */}
        <div className="lg:sticky lg:top-24 lg:self-start mb-8 lg:mb-0">
          <div ref={containerRef} className="relative">
            {imageUrl && (
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Your face analysis"
                className="w-full rounded-2xl shadow-lg"
                onLoad={updateImgDims}
              />
            )}

            {/* Scanning animation overlay */}
            <ScanningOverlay active={isDetecting} statusText={statusText} />

            {/* Landmark canvas overlay */}
            {showLandmarks && resultData && imgDims.nw > 0 && (
              <CanvasOverlay
                keypoints={detection.keypoints}
                ratios={resultData.faceShape.ratios}
                containerWidth={imgDims.w}
                containerHeight={imgDims.h}
                imageNaturalWidth={imgDims.nw}
                imageNaturalHeight={imgDims.nh}
                visible={showLandmarks}
              />
            )}
          </div>
          <Link
            href="/"
            className="mt-4 block text-center text-sm text-text-secondary hover:text-accent transition-colors"
          >
            &larr; Try another photo
          </Link>
        </div>

        {/* Right: Results or skeleton */}
        <div>
          {isDetecting ? (
            <AnalysisSkeleton />
          ) : resultData ? (
            <>
              <AnalysisTabs result={resultData as FiveAnalysisResult} />

              {/* Recommendations */}
              <div className="mt-8 space-y-8">
                {/* Hairstyles */}
                {hairstyleRecs && (
                  <section>
                    <h2 className="text-xl font-bold font-heading mb-4">Recommended Hairstyles</h2>
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setGenderTab('female')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          genderTab === 'female'
                            ? 'bg-accent text-white'
                            : 'bg-surface text-text-secondary hover:bg-border'
                        }`}
                      >
                        Women
                      </button>
                      <button
                        onClick={() => setGenderTab('male')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          genderTab === 'male'
                            ? 'bg-accent text-white'
                            : 'bg-surface text-text-secondary hover:bg-border'
                        }`}
                      >
                        Men
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {hairstyleRecs[genderTab].map((item) => (
                        <RecommendationCard
                          key={item.name}
                          name={item.name}
                          description={item.description}
                          whyItWorks={item.whyItWorks}
                          imageUrl={shapeType ? getHairstyleImage(shapeType, genderTab, item.name) : undefined}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Glasses */}
                {glassesRecs && (
                  <section>
                    <h2 className="text-xl font-bold font-heading mb-4">Recommended Glasses</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {glassesRecs.map((item) => (
                        <RecommendationCard
                          key={item.name}
                          name={item.name}
                          description={item.style}
                          whyItWorks={item.whyItWorks}
                          imageUrl={shapeType ? getGlassesImage(shapeType, item.name) : undefined}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Makeup Tips */}
                {makeupTips && (
                  <section>
                    <h2 className="text-xl font-bold font-heading mb-4">Makeup Tips</h2>
                    <div className="space-y-3">
                      {makeupTips.map((tip, i) => (
                        <div
                          key={tip.area}
                          className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                        >
                          <p className="text-sm">
                            <span className="font-semibold">{i + 1}. {tip.area}:</span>{' '}
                            <span className="text-text-secondary">{tip.tip}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Verify the build passes**

Run: `npx next build 2>&1 | tail -10`
Expected: Build succeeds with all pages compiled

- [ ] **Step 4: Commit**

```bash
git add app/result/page.tsx
git commit -m "feat: result page with three-phase detection, scanning animation, and landmark overlay"
```

---

### Task 7: Manual Integration Test

Verify the full user flow works end-to-end.

**Files:** None (testing only)

- [ ] **Step 1: Start dev server**

Run: `pnpm run dev --port 3000`

- [ ] **Step 2: Test the full flow**

Open in browser and verify:

1. Homepage loads normally with upload zone visible (no FaceDetector dynamic import flash)
2. Upload a photo → immediately navigates to `/result`
3. Result page shows the photo with scanning animation (glowing line sweeping top→bottom)
4. Status text updates: "Loading AI model..." → "Analyzing facial features..."
5. Right column shows skeleton placeholders during detection
6. After detection completes:
   - Scanning overlay fades out
   - Landmark dots and measurement lines fade in on the photo
   - AnalysisTabs + recommendations appear on the right
7. Refreshing `/result` page shows cached result (from sessionStorage)
8. "Try another photo" link navigates back to homepage
9. Directly visiting `/result` without uploading shows "No results found" fallback

- [ ] **Step 3: Test error case**

Upload a photo with no face (e.g. a landscape). Verify the error page appears with "Try another photo" button.

- [ ] **Step 4: Test mobile layout**

Open on mobile viewport:
- Scanning overlay covers the photo correctly
- Skeleton and results stack vertically
- Landmark canvas scales properly on smaller screens

- [ ] **Step 5: Commit any fixes found during testing**

```bash
git add -A
git commit -m "fix: address issues found during integration testing"
```
