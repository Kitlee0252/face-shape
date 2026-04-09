// components/detector/CanvasOverlay.tsx
'use client';

import { useEffect, useRef } from 'react';
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

    // Draw all landmarks as small dots
    ctx.fillStyle = 'rgba(0, 255, 100, 0.4)';
    for (const p of keypoints) {
      ctx.beginPath();
      ctx.arc(p.x * scaleX, p.y * scaleY, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw measurement lines
    for (const line of MEASUREMENT_LINES) {
      const p1 = keypoints[line.from];
      const p2 = keypoints[line.to];
      if (!p1 || !p2) continue;

      ctx.strokeStyle = line.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(p1.x * scaleX, p1.y * scaleY);
      ctx.lineTo(p2.x * scaleX, p2.y * scaleY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Endpoints
      for (const p of [p1, p2]) {
        ctx.fillStyle = line.color;
        ctx.beginPath();
        ctx.arc(p.x * scaleX, p.y * scaleY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Label
      const mx = ((p1.x + p2.x) / 2) * scaleX;
      const my = ((p1.y + p2.y) / 2) * scaleY;
      ctx.font = '600 11px system-ui';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 3;
      ctx.strokeText(line.label, mx + 8, my + 4);
      ctx.fillText(line.label, mx + 8, my + 4);
    }

    // Draw jaw angle arc
    const jawL = keypoints[LANDMARKS.jawLeft];
    const chin = keypoints[LANDMARKS.chin];
    const jawR = keypoints[LANDMARKS.jawRight];
    if (jawL && chin && jawR) {
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      const radius = 20;
      const a1 = Math.atan2(jawL.y - chin.y, jawL.x - chin.x);
      const a2 = Math.atan2(jawR.y - chin.y, jawR.x - chin.x);
      ctx.beginPath();
      ctx.arc(chin.x * scaleX, chin.y * scaleY, radius, a2, a1);
      ctx.stroke();

      ctx.font = '600 11px system-ui';
      ctx.fillStyle = '#f97316';
      ctx.fillText(
        `${Math.round(ratios.jawAngle)}°`,
        chin.x * scaleX + radius + 4,
        chin.y * scaleY - 4
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
