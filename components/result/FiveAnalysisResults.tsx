'use client';

import type {
  FiveAnalysisResult,
  FaceShapeResult,
  EyeShapeResult,
  NoseShapeResult,
  LipShapeResult,
  EyebrowShapeResult,
} from '@/lib/detection/types';
import { FACE_SHAPE_LABELS } from '@/lib/detection/types';

interface Props {
  result: FiveAnalysisResult;
}

export default function FiveAnalysisResults({ result }: Props) {
  return (
    <div className="w-full max-w-md space-y-4">
      <FaceShapeCard result={result.faceShape} />
      <EyeShapeCard result={result.eyeShape} />
      <NoseShapeCard result={result.noseShape} />
      <LipShapeCard result={result.lipShape} />
      <EyebrowShapeCard result={result.eyebrowShape} />
      <AllScoresCard result={result.faceShape} />
    </div>
  );
}

// --- Face Shape ---

function FaceShapeCard({ result }: { result: FaceShapeResult }) {
  const { primary, secondary } = result;
  return (
    <Card title="Face Shape" icon="🔷">
      <h2 className="text-2xl font-bold text-gray-900">
        {FACE_SHAPE_LABELS[primary.type]}
      </h2>
      <ConfidenceBar value={primary.confidence} />
      {secondary && (
        <p className="mt-2 text-sm text-gray-500">
          Mixed with{' '}
          <span className="font-semibold text-gray-700">
            {FACE_SHAPE_LABELS[secondary.type]}
          </span>{' '}
          ({pct(secondary.confidence)})
        </p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="Aspect" value={result.ratios.aspectRatio.toFixed(2)} />
        <Stat label="Forehead" value={result.ratios.foreheadRatio.toFixed(2)} />
        <Stat label="Jaw" value={result.ratios.jawRatio.toFixed(2)} />
        <Stat label="Jaw angle" value={`${Math.round(result.ratios.jawAngle)}°`} />
      </div>
    </Card>
  );
}

// --- Eye Shape ---

function EyeShapeCard({ result }: { result: EyeShapeResult }) {
  return (
    <Card title="Eye Shape" icon="👁">
      <div className="flex flex-wrap gap-2">
        <Tag label={capitalize(result.slope)} />
        <Tag label={capitalize(result.size)} />
        <Tag label={formatSpacing(result.spacing)} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Slope" value={`${result.slopeAngle.toFixed(1)}°`} />
        <Stat label="Size ratio" value={result.sizeRatio.toFixed(2)} />
        <Stat label="Spacing" value={result.spacingRatio.toFixed(2)} />
      </div>
    </Card>
  );
}

// --- Nose Shape ---

function NoseShapeCard({ result }: { result: NoseShapeResult }) {
  return (
    <Card title="Nose Shape" icon="👃">
      <div className="flex flex-wrap gap-2">
        <Tag label={`${capitalize(result.width)} width`} />
        <Tag label={`${capitalize(result.length)} length`} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Width ratio" value={result.widthRatio.toFixed(2)} />
        <Stat label="Length ratio" value={result.lengthRatio.toFixed(2)} />
        <Stat label="Bridge angle" value={`${Math.round(result.bridgeAngle)}°`} />
      </div>
    </Card>
  );
}

// --- Lip Shape ---

function LipShapeCard({ result }: { result: LipShapeResult }) {
  return (
    <Card title="Lip Shape" icon="👄">
      <div className="flex flex-wrap gap-2">
        <Tag label={capitalize(result.thickness)} />
        <Tag label={`${capitalize(result.width)} width`} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Thickness" value={result.thicknessRatio.toFixed(2)} />
        <Stat label="Width ratio" value={result.widthRatio.toFixed(2)} />
        <Stat label="Upper/Lower" value={result.upperLowerRatio.toFixed(2)} />
      </div>
    </Card>
  );
}

// --- Eyebrow Shape ---

function EyebrowShapeCard({ result }: { result: EyebrowShapeResult }) {
  return (
    <Card title="Eyebrow Shape" icon="✏️">
      <div className="flex flex-wrap gap-2">
        <Tag label={capitalize(result.shape)} />
        <Tag label={`${capitalize(result.slope)} slope`} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="Arch angle" value={`${Math.round(result.archAngle)}°`} />
        <Stat label="Spacing" value={result.spacing.toFixed(2)} />
      </div>
    </Card>
  );
}

// --- All Face Shape Scores ---

function AllScoresCard({ result }: { result: FaceShapeResult }) {
  return (
    <Card title="All Face Shape Scores" icon="📊">
      <div className="space-y-2">
        {result.all.map((s) => (
          <div key={s.type} className="flex items-center gap-3">
            <span className="w-20 text-sm text-gray-600">
              {FACE_SHAPE_LABELS[s.type]}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-blue-400"
                style={{ width: `${Math.round(s.confidence * 100)}%` }}
              />
            </div>
            <span className="w-10 text-right text-xs text-gray-500">
              {pct(s.confidence)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// --- Shared UI Components ---

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-md">
      <p className="mb-2 text-sm font-medium text-gray-500">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-600">{pct(value)}</span>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
      {label}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-base font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatSpacing(s: string): string {
  return s.split('-').map(capitalize).join('-');
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}
