'use client';

import type { FaceShapeResult as Result } from '@/lib/detection/types';
import { FACE_SHAPE_LABELS } from '@/lib/detection/types';

interface FaceShapeResultProps {
  result: Result;
}

export default function FaceShapeResultCard({ result }: FaceShapeResultProps) {
  const { primary, secondary, ratios } = result;

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Primary result */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <p className="text-sm font-medium text-gray-500">Your face shape</p>
        <h2 className="mt-1 text-3xl font-bold text-gray-900">
          {FACE_SHAPE_LABELS[primary.type]}
        </h2>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${Math.round(primary.confidence * 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600">
            {Math.round(primary.confidence * 100)}%
          </span>
        </div>

        {secondary && (
          <div className="mt-3 rounded-lg bg-gray-50 px-4 py-2">
            <p className="text-sm text-gray-500">
              Mixed with{' '}
              <span className="font-semibold text-gray-700">
                {FACE_SHAPE_LABELS[secondary.type]}
              </span>{' '}
              ({Math.round(secondary.confidence * 100)}%)
            </p>
          </div>
        )}
      </div>

      {/* Measurements */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <p className="mb-3 text-sm font-medium text-gray-500">Measurements</p>
        <div className="grid grid-cols-2 gap-3">
          <MeasurementItem label="Aspect ratio" value={ratios.aspectRatio.toFixed(2)} />
          <MeasurementItem label="Forehead ratio" value={ratios.foreheadRatio.toFixed(2)} />
          <MeasurementItem label="Jaw ratio" value={ratios.jawRatio.toFixed(2)} />
          <MeasurementItem label="Jaw angle" value={`${Math.round(ratios.jawAngle)}°`} />
        </div>
      </div>

      {/* All scores */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <p className="mb-3 text-sm font-medium text-gray-500">All shapes</p>
        <div className="space-y-2">
          {result.all.map((s) => (
            <div key={s.type} className="flex items-center gap-3">
              <span className="w-20 text-sm text-gray-600">
                {FACE_SHAPE_LABELS[s.type]}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-400 transition-all"
                  style={{ width: `${Math.round(s.confidence * 100)}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs text-gray-500">
                {Math.round(s.confidence * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MeasurementItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  );
}
