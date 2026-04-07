'use client';

import { useState, useCallback } from 'react';
import UploadZone from '@/components/upload/UploadZone';
import CanvasOverlay from '@/components/detector/CanvasOverlay';
import FaceShapeResultCard from '@/components/result/FaceShapeResult';
import { detectLandmarks } from '@/lib/detection/landmarks';
import { classifyFaceShape } from '@/lib/detection/faceShape';
import type { FaceShapeResult } from '@/lib/detection/types';

type Status = 'idle' | 'loading' | 'detecting' | 'done' | 'error';

export default function FaceDetector() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [result, setResult] = useState<FaceShapeResult | null>(null);

  const handleImage = useCallback(async (file: File) => {
    setError('');
    setResult(null);

    const url = URL.createObjectURL(file);
    setImageSrc(url);

    const img = new Image();
    img.src = url;

    img.onload = async () => {
      try {
        setStatus('loading');

        // Resize for performance
        const maxW = 640;
        if (img.naturalWidth > maxW) {
          const scale = maxW / img.naturalWidth;
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.naturalWidth * scale);
          canvas.height = Math.round(img.naturalHeight * scale);
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Re-detect on resized canvas
          setStatus('detecting');
          const keypoints = await detectLandmarks(canvas);

          if (keypoints.length === 0) {
            setStatus('error');
            setError('No face detected. Try a clearer photo with good lighting.');
            return;
          }

          setResult(classifyFaceShape(keypoints));
        } else {
          setStatus('detecting');
          const keypoints = await detectLandmarks(img);

          if (keypoints.length === 0) {
            setStatus('error');
            setError('No face detected. Try a clearer photo with good lighting.');
            return;
          }

          setResult(classifyFaceShape(keypoints));
        }

        setStatus('done');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Detection failed');
        console.error(err);
      }
    };
  }, []);

  const handleReset = useCallback(() => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setStatus('idle');
    setImageSrc('');
    setResult(null);
    setError('');
  }, [imageSrc]);

  return (
    <div className="flex flex-col items-center gap-6">
      {status === 'idle' && <UploadZone onImage={handleImage} />}

      {(status === 'loading' || status === 'detecting') && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-500">
            {status === 'loading' ? 'Loading face detection model...' : 'Analyzing your face...'}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={handleReset}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Try again
          </button>
        </div>
      )}

      {status === 'done' && result && (
        <div className="flex w-full flex-col items-center gap-6">
          <CanvasOverlay imageSrc={imageSrc} result={result} />
          <FaceShapeResultCard result={result} />
          <button
            onClick={handleReset}
            className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Try another photo
          </button>
        </div>
      )}
    </div>
  );
}
