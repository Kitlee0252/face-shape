import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { Point } from './types';

let landmarker: FaceLandmarker | null = null;

export async function initDetector(): Promise<FaceLandmarker> {
  if (landmarker) return landmarker;

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'IMAGE',
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  });

  return landmarker;
}

export async function detectLandmarks(
  image: HTMLImageElement | HTMLCanvasElement
): Promise<Point[]> {
  const det = await initDetector();
  const result = det.detect(image);

  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    return [];
  }

  // MediaPipe returns normalized coordinates (0-1), convert to pixel coordinates
  const width =
    image instanceof HTMLImageElement ? image.naturalWidth : image.width;
  const height =
    image instanceof HTMLImageElement ? image.naturalHeight : image.height;

  return result.faceLandmarks[0].map((p) => ({
    x: p.x * width,
    y: p.y * height,
    z: p.z * width,
  }));
}
