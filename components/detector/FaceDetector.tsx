'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import UploadZone from '@/components/upload/UploadZone';
import CanvasOverlay from '@/components/detector/CanvasOverlay';
import FiveAnalysisResults from '@/components/result/FiveAnalysisResults';
import { detectLandmarks } from '@/lib/detection/landmarks';
import { classifyFaceShape } from '@/lib/detection/faceShape';
import { classifyEyeShape } from '@/lib/detection/eyeShape';
import { classifyNoseShape } from '@/lib/detection/noseShape';
import { classifyLipShape } from '@/lib/detection/lipShape';
import { classifyEyebrowShape } from '@/lib/detection/eyebrowShape';
import type { FiveAnalysisResult } from '@/lib/detection/types';

type Status = 'idle' | 'loading' | 'detecting' | 'done' | 'error';

interface FaceDetectorProps {
  initialFile?: File | null;
  onReset?: () => void;
}

function runAnalysis(keypoints: import('@/lib/detection/types').Point[]): FiveAnalysisResult {
  return {
    faceShape: classifyFaceShape(keypoints),
    eyeShape: classifyEyeShape(keypoints),
    noseShape: classifyNoseShape(keypoints),
    lipShape: classifyLipShape(keypoints),
    eyebrowShape: classifyEyebrowShape(keypoints),
    keypoints,
  };
}

export default function FaceDetector({ initialFile, onReset }: FaceDetectorProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [result, setResult] = useState<FiveAnalysisResult | null>(null);

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
        let source: HTMLImageElement | HTMLCanvasElement = img;
        if (img.naturalWidth > maxW) {
          const scale = maxW / img.naturalWidth;
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.naturalWidth * scale);
          canvas.height = Math.round(img.naturalHeight * scale);
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          source = canvas;
        }

        setStatus('detecting');
        const keypoints = await detectLandmarks(source);

        if (keypoints.length === 0) {
          setStatus('error');
          setError('No face detected. Try a clearer photo with good lighting.');
          return;
        }

        setResult(runAnalysis(keypoints));
        setStatus('done');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Detection failed');
        console.error(err);
      }
    };
  }, []);

  const initialFileProcessed = useRef(false);

  useEffect(() => {
    if (initialFile && !initialFileProcessed.current) {
      initialFileProcessed.current = true;
      handleImage(initialFile);
    }
  }, [initialFile, handleImage]);

  const handleReset = useCallback(() => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setStatus('idle');
    setImageSrc('');
    setResult(null);
    setError('');
    if (onReset) {
      onReset();
    }
  }, [imageSrc, onReset]);

  return (
    <div className="flex flex-col items-center gap-6">
      {status === 'idle' && <UploadZone onImage={handleImage} />}

      {(status === 'loading' || status === 'detecting') && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-sm text-text-secondary">
            {status === 'loading' ? 'Loading face detection model...' : 'Analyzing your face...'}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={handleReset}
            className="rounded-full bg-surface px-5 py-2.5 text-sm font-medium text-primary hover:bg-border transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {status === 'done' && result && (
        <div className="flex w-full flex-col items-center gap-6">
          <CanvasOverlay imageSrc={imageSrc} result={result.faceShape} />
          <FiveAnalysisResults result={result} />
          <button
            onClick={handleReset}
            className="rounded-full bg-surface px-5 py-2.5 text-sm font-medium text-primary hover:bg-border transition-colors"
          >
            Try another photo
          </button>
        </div>
      )}
    </div>
  );
}
