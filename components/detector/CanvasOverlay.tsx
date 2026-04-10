'use client';

import { useEffect, useRef } from 'react';
import { FaceLandmarker } from '@mediapipe/tasks-vision';
import type { Point, FaceShapeResult } from '@/lib/detection/types';
import { LANDMARKS } from '@/lib/detection/faceShape';

interface CanvasOverlayProps {
  keypoints: Point[];
  ratios: FaceShapeResult['ratios'];
  containerWidth: number;
  containerHeight: number;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  visible: boolean;
}

/** Feature contour groups with colors */
const CONTOUR_GROUPS: { connections: { start: number; end: number }[]; color: string; width: number }[] = [
  { connections: FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, color: 'rgba(56, 189, 248, 0.6)', width: 1.5 },
  { connections: FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, color: 'rgba(74, 222, 128, 0.8)', width: 1.2 },
  { connections: FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, color: 'rgba(74, 222, 128, 0.8)', width: 1.2 },
  { connections: FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, color: 'rgba(251, 191, 36, 0.7)', width: 1.2 },
  { connections: FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, color: 'rgba(251, 191, 36, 0.7)', width: 1.2 },
  { connections: FaceLandmarker.FACE_LANDMARKS_LIPS, color: 'rgba(251, 113, 133, 0.8)', width: 1.2 },
];

const MEASUREMENT_LINES: { label: string; from: number; to: number; color: string }[] = [
  { label: 'Face height', from: LANDMARKS.foreheadTop, to: LANDMARKS.chin, color: '#ef4444' },
  { label: 'Forehead', from: LANDMARKS.foreheadLeft, to: LANDMARKS.foreheadRight, color: '#eab308' },
  { label: 'Cheekbone', from: LANDMARKS.cheekboneLeft, to: LANDMARKS.cheekboneRight, color: '#22d3ee' },
  { label: 'Jaw', from: LANDMARKS.jawLeft, to: LANDMARKS.jawRight, color: '#a855f7' },
];

export default function CanvasOverlay({
  keypoints,
  ratios,
  containerWidth,
  containerHeight,
  imageNaturalWidth,
  imageNaturalHeight,
  visible,
}: CanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || keypoints.length === 0 || containerWidth === 0) return;

    const scaleX = containerWidth / imageNaturalWidth;
    const scaleY = containerHeight / imageNaturalHeight;

    canvas.width = containerWidth;
    canvas.height = containerHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, containerWidth, containerHeight);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw feature contours using MediaPipe connection groups
    for (const group of CONTOUR_GROUPS) {
      ctx.strokeStyle = group.color;
      ctx.lineWidth = group.width;
      ctx.setLineDash([]);
      for (const conn of group.connections) {
        const p1 = keypoints[conn.start];
        const p2 = keypoints[conn.end];
        if (!p1 || !p2) continue;
        ctx.beginPath();
        ctx.moveTo(p1.x * scaleX, p1.y * scaleY);
        ctx.lineTo(p2.x * scaleX, p2.y * scaleY);
        ctx.stroke();
      }
    }

    // Draw measurement lines (thinner, dashed)
    for (const line of MEASUREMENT_LINES) {
      const p1 = keypoints[line.from];
      const p2 = keypoints[line.to];
      if (!p1 || !p2) continue;

      ctx.strokeStyle = line.color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(p1.x * scaleX, p1.y * scaleY);
      ctx.lineTo(p2.x * scaleX, p2.y * scaleY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Endpoints
      for (const p of [p1, p2]) {
        ctx.fillStyle = line.color;
        ctx.beginPath();
        ctx.arc(p.x * scaleX, p.y * scaleY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Label
      const mx = ((p1.x + p2.x) / 2) * scaleX;
      const my = ((p1.y + p2.y) / 2) * scaleY;
      ctx.font = '500 10px system-ui';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 2.5;
      ctx.strokeText(line.label, mx + 6, my + 3);
      ctx.fillText(line.label, mx + 6, my + 3);
    }

    // Draw jaw angle arc
    const jawL = keypoints[LANDMARKS.jawLeft];
    const chin = keypoints[LANDMARKS.chin];
    const jawR = keypoints[LANDMARKS.jawRight];
    if (jawL && chin && jawR) {
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      const radius = 16;
      const a1 = Math.atan2(jawL.y - chin.y, jawL.x - chin.x);
      const a2 = Math.atan2(jawR.y - chin.y, jawR.x - chin.x);
      ctx.beginPath();
      ctx.arc(chin.x * scaleX, chin.y * scaleY, radius, a2, a1);
      ctx.stroke();

      ctx.font = '500 10px system-ui';
      ctx.fillStyle = '#f97316';
      ctx.fillText(
        `${Math.round(ratios.chinAngle)}°`,
        chin.x * scaleX + radius + 3,
        chin.y * scaleY - 3
      );
    }
  }, [keypoints, ratios, containerWidth, containerHeight, imageNaturalWidth, imageNaturalHeight]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 z-20 transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
