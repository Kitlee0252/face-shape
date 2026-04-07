import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

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

export interface Point {
  x: number;
  y: number;
  z: number;
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
  const width = image instanceof HTMLImageElement ? image.naturalWidth : image.width;
  const height = image instanceof HTMLImageElement ? image.naturalHeight : image.height;

  return result.faceLandmarks[0].map((p) => ({
    x: p.x * width,
    y: p.y * height,
    z: p.z * width, // z is relative to face width
  }));
}

export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  keypoints: Point[],
  scale: number = 1
) {
  if (keypoints.length === 0) return;

  // Draw all 478 keypoints
  ctx.fillStyle = '#00ff00';
  for (const point of keypoints) {
    ctx.beginPath();
    ctx.arc(point.x * scale, point.y * scale, 1.5, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Highlight key measurement points from SPEC
  const highlights: Record<string, number[]> = {
    'Face height': [10, 152],        // forehead top → chin
    'Forehead width': [71, 301],     // forehead sides
    'Cheekbone width': [234, 454],   // cheekbone sides
    'Jaw width': [58, 288],          // jaw sides
  };

  const colors = ['#ff0000', '#ffff00', '#00ffff', '#ff00ff'];
  let colorIdx = 0;

  for (const [label, indices] of Object.entries(highlights)) {
    const color = colors[colorIdx++ % colors.length];
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    // Draw points
    for (const idx of indices) {
      if (idx < keypoints.length) {
        const p = keypoints[idx];
        ctx.beginPath();
        ctx.arc(p.x * scale, p.y * scale, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Draw measurement line
    if (indices.length === 2 && indices[0] < keypoints.length && indices[1] < keypoints.length) {
      const p1 = keypoints[indices[0]];
      const p2 = keypoints[indices[1]];
      ctx.beginPath();
      ctx.moveTo(p1.x * scale, p1.y * scale);
      ctx.lineTo(p2.x * scale, p2.y * scale);
      ctx.stroke();

      // Label
      ctx.font = '12px sans-serif';
      ctx.fillText(label, ((p1.x + p2.x) / 2) * scale + 6, ((p1.y + p2.y) / 2) * scale);
    }
  }
}
