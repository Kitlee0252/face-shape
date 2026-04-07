'use client';

import { useRef, useState, useCallback } from 'react';
import { detectLandmarks, drawLandmarks } from '@/lib/detection/landmarks';

type Status = 'idle' | 'loading-model' | 'detecting' | 'done' | 'error';

export default function LandmarkDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [info, setInfo] = useState('');

  const handleFile = useCallback(async (file: File) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;

    img.onload = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Resize to max 640px width for performance
      const maxW = 640;
      const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      try {
        setStatus('loading-model');
        setInfo('Loading face detection model (~4MB)...');

        const t0 = performance.now();
        const keypoints = await detectLandmarks(img);
        const dt = Math.round(performance.now() - t0);

        if (keypoints.length === 0) {
          setStatus('error');
          setInfo('No face detected. Try a clearer photo with good lighting.');
          return;
        }

        setStatus('detecting');

        // Draw landmarks on canvas
        drawLandmarks(ctx, keypoints, scale);

        // Calculate key ratios
        const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
          Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

        const cheekboneW = dist(keypoints[234], keypoints[454]);
        const ratios = {
          aspect: (dist(keypoints[10], keypoints[152]) / cheekboneW).toFixed(2),
          forehead: (dist(keypoints[71], keypoints[301]) / cheekboneW).toFixed(2),
          jaw: (dist(keypoints[58], keypoints[288]) / cheekboneW).toFixed(2),
        };

        console.log('Keypoints:', keypoints.length, 'Time:', dt, 'ms');
        console.log('Ratios:', ratios);

        setInfo(
          `${keypoints.length} landmarks | ${dt}ms | ` +
          `Aspect=${ratios.aspect} Forehead=${ratios.forehead} Jaw=${ratios.jaw}`
        );
        setStatus('done');
      } catch (err) {
        setStatus('error');
        setInfo(`Error: ${err instanceof Error ? err.message : String(err)}`);
        console.error(err);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Face Landmark Detection Demo</h1>
      <p className="text-sm text-gray-500">
        Upload a face photo to verify the detection pipeline works.
        All processing happens in your browser.
      </p>

      <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-8 py-6 transition hover:border-blue-500">
        <span className="text-gray-600">
          {status === 'idle' ? 'Click to upload a face photo' : 'Upload another photo'}
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>

      {info && (
        <p className={`text-sm font-mono ${status === 'error' ? 'text-red-500' : 'text-gray-600'}`}>
          {info}
        </p>
      )}

      <canvas ref={canvasRef} className="max-w-full rounded-lg shadow-lg" />
    </div>
  );
}
