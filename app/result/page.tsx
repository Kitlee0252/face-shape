// app/result/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [imgDims, setImgDims] = useState({ w: 0, h: 0, nw: 0, nh: 0 });

  const [genderTab, setGenderTab] = useState<'female' | 'male'>('female');

  // Load pending image or cached result from sessionStorage.
  // Runs on mount and also on re-navigation (pageshow fires for bfcache).
  useEffect(() => {
    const loadFromSession = () => {
      const pending = sessionStorage.getItem('pendingImage');
      if (pending) {
        setPendingImage(pending);
        setImageUrl(pending);
        setCachedResult(null); // Clear stale cached result
        return;
      }
      // Fallback: returning to result page with cached data
      const data = sessionStorage.getItem('faceResult');
      const img = sessionStorage.getItem('resultImage');
      if (data) setCachedResult(JSON.parse(data));
      if (img) setImageUrl(img);
    };

    loadFromSession();

    // Re-check when page is shown again (covers bfcache and tab switches)
    const handlePageShow = () => loadFromSession();
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Run detection if we have a pending image
  const detection = useDetection(pendingImage);

  // Determine what to display
  const isDetecting = pendingImage !== null && detection.phase !== 'done' && detection.phase !== 'error';
  const resultData = detection.result ?? cachedResult;
  const showLandmarks = detection.phase === 'done' && detection.keypoints.length > 0;

  // Track image rendered dimensions for canvas overlay
  const updateImgDims = useCallback(() => {
    const el = imgRef.current;
    if (el) {
      setImgDims({
        w: el.clientWidth,
        h: el.clientHeight,
        nw: el.naturalWidth,
        nh: el.naturalHeight,
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateImgDims);
    return () => window.removeEventListener('resize', updateImgDims);
  }, [updateImgDims]);

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
      {detection.poseWarning && (
        <div className="max-w-5xl mx-auto mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          {detection.poseWarning}
        </div>
      )}
      <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-[400px_1fr] lg:gap-8">
        {/* Left: Image with overlays */}
        <div className="lg:sticky lg:top-24 lg:self-start mb-8 lg:mb-0">
          <div className="relative">
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
            {showLandmarks && resultData && detection.sourceWidth > 0 && (
              <CanvasOverlay
                keypoints={detection.keypoints}
                ratios={resultData.faceShape.ratios}
                containerWidth={imgDims.w}
                containerHeight={imgDims.h}
                imageNaturalWidth={detection.sourceWidth}
                imageNaturalHeight={detection.sourceHeight}
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
