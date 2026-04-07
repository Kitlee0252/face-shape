'use client';

import { useState } from 'react';
import HeroSection from '@/components/home/HeroSection';
import TrustBar from '@/components/home/TrustBar';
import FaceDetector from '@/components/detector/FaceDetector';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  return (
    <main className="flex-1">
      {!uploadedFile ? (
        <>
          <HeroSection onImage={setUploadedFile} />
          <TrustBar />
        </>
      ) : (
        <div className="flex flex-col items-center px-4 py-12">
          <div className="w-full max-w-2xl">
            <FaceDetector
              initialFile={uploadedFile}
              onReset={() => setUploadedFile(null)}
            />
          </div>
        </div>
      )}
    </main>
  );
}
