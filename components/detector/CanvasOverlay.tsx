'use client';

import { useEffect, useRef } from 'react';
import type { Point, FaceShapeResult } from '@/lib/detection/types';
import { LANDMARKS } from '@/lib/detection/faceShape';

interface CanvasOverlayProps {
  imageSrc: string;
  result: FaceShapeResult;
}

const MEASUREMENT_LINES: { label: string; from: number; to: number; color: string }[] = [
  { label: 'Face height', from: LANDMARKS.foreheadTop, to: LANDMARKS.chin, color: '#ef4444' },
  { label: 'Forehead', from: LANDMARKS.foreheadLeft, to: LANDMARKS.foreheadRight, color: '#eab308' },
  { label: 'Cheekbone', from: LANDMARKS.cheekboneLeft, to: LANDMARKS.cheekboneRight, color: '#22d3ee' },
  { label: 'Jaw', from: LANDMARKS.jawLeft, to: LANDMARKS.jawRight, color: '#a855f7' },
];

export default function CanvasOverlay({ imageSrc, result }: CanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const maxW = 640;
      const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      const kp = result.keypoints;

      // Draw all landmarks as small dots
      ctx.fillStyle = 'rgba(0, 255, 100, 0.4)';
      for (const p of kp) {
        ctx.beginPath();
        ctx.arc(p.x * scale, p.y * scale, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw measurement lines
      for (const line of MEASUREMENT_LINES) {
        const p1 = kp[line.from];
        const p2 = kp[line.to];
        if (!p1 || !p2) continue;

        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(p1.x * scale, p1.y * scale);
        ctx.lineTo(p2.x * scale, p2.y * scale);
        ctx.stroke();
        ctx.setLineDash([]);

        // Endpoints
        for (const p of [p1, p2]) {
          ctx.fillStyle = line.color;
          ctx.beginPath();
          ctx.arc(p.x * scale, p.y * scale, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Label
        const mx = ((p1.x + p2.x) / 2) * scale;
        const my = ((p1.y + p2.y) / 2) * scale;
        ctx.font = '600 11px system-ui';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 3;
        ctx.strokeText(line.label, mx + 8, my + 4);
        ctx.fillText(line.label, mx + 8, my + 4);
      }

      // Draw jaw angle arc
      const jawL = kp[LANDMARKS.jawLeft];
      const chin = kp[LANDMARKS.chin];
      const jawR = kp[LANDMARKS.jawRight];
      if (jawL && chin && jawR) {
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        const radius = 20;
        const a1 = Math.atan2(jawL.y - chin.y, jawL.x - chin.x);
        const a2 = Math.atan2(jawR.y - chin.y, jawR.x - chin.x);
        ctx.beginPath();
        ctx.arc(chin.x * scale, chin.y * scale, radius, a2, a1);
        ctx.stroke();

        ctx.font = '600 11px system-ui';
        ctx.fillStyle = '#f97316';
        ctx.fillText(
          `${Math.round(result.ratios.jawAngle)}°`,
          chin.x * scale + radius + 4,
          chin.y * scale - 4
        );
      }
    };
  }, [imageSrc, result]);

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full rounded-xl shadow-lg"
    />
  );
}
