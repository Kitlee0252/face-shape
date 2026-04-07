'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnalysisTabs from '@/components/result/AnalysisTabs';
import RecommendationCard from '@/components/result/RecommendationCard';
import { HAIRSTYLES } from '@/lib/data/hairstyles';
import { GLASSES } from '@/lib/data/glasses';
import { MAKEUP } from '@/lib/data/makeup';
import { getHairstyleImage, getGlassesImage } from '@/lib/utils/imagePaths';
import type { FiveAnalysisResult } from '@/lib/detection/types';
import type { FaceShapeType } from '@/lib/detection/types';

export default function ResultPage() {
  const [resultData, setResultData] = useState<FiveAnalysisResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [genderTab, setGenderTab] = useState<'female' | 'male'>('female');

  useEffect(() => {
    const data = sessionStorage.getItem('faceResult');
    const img = sessionStorage.getItem('resultImage');
    if (data) setResultData(JSON.parse(data));
    if (img) setImageUrl(img);
  }, []);

  if (!resultData) {
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
        {/* Left: Image */}
        <div className="lg:sticky lg:top-24 lg:self-start mb-8 lg:mb-0">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Your face analysis"
              className="w-full rounded-2xl shadow-lg"
            />
          )}
          <Link
            href="/"
            className="mt-4 block text-center text-sm text-text-secondary hover:text-accent transition-colors"
          >
            &larr; Try another photo
          </Link>
        </div>

        {/* Right: Results + Recommendations */}
        <div>
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
        </div>
      </div>
    </main>
  );
}
