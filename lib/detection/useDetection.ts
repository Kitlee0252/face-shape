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
