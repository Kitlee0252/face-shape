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
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        // Clear old results so result page doesn't show stale data
        sessionStorage.removeItem('faceResult');
        sessionStorage.removeItem('resultImage');
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
