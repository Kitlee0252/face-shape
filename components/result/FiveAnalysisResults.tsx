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
    <div className="w-full space-y-4">
      <FaceShapeCard result={result.faceShape} />
      <EyeShapeCard result={result.eyeShape} />
      <NoseShapeCard result={result.noseShape} />
      <LipShapeCard result={result.lipShape} />
      <EyebrowShapeCard result={result.eyebrowShape} />
    </div>
  );
}

// --- Face Shape ---

function FaceShapeCard({ result }: { result: FaceShapeResult }) {
  const { primary, secondary } = result;
  return (
    <Card title="Face Shape">
      <h2 className="text-2xl font-bold font-heading">
        {FACE_SHAPE_LABELS[primary.type]}
      </h2>
      <ConfidenceBar value={primary.confidence} />
      {secondary && (
        <p className="mt-2 text-sm text-text-secondary">
          Mixed with{' '}
          <span className="font-semibold text-primary">
            {FACE_SHAPE_LABELS[secondary.type]}
          </span>{' '}
          ({`${Math.round(secondary.confidence * 100)}%`})
        </p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="Aspect" value={result.ratios.aspectRatio.toFixed(2)} />
        <Stat label="Forehead" value={result.ratios.foreheadRatio.toFixed(2)} />
        <Stat label="Jaw" value={result.ratios.jawRatio.toFixed(2)} />
        <Stat label="Jaw angle" value={`${Math.round(result.ratios.jawAngle)}\u00B0`} />
      </div>
    </Card>
  );
}

// --- Eye Shape ---

function EyeShapeCard({ result }: { result: EyeShapeResult }) {
  return (
    <Card title="Eye Shape">
      <div className="flex flex-wrap gap-2">
        <Tag label={capitalize(result.slope)} />
        <Tag label={capitalize(result.size)} />
        <Tag label={formatSpacing(result.spacing)} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Slope" value={`${result.slopeAngle.toFixed(1)}\u00B0`} />
        <Stat label="Size ratio" value={result.sizeRatio.toFixed(2)} />
        <Stat label="Spacing" value={result.spacingRatio.toFixed(2)} />
      </div>
    </Card>
  );
}

// --- Nose Shape ---

function NoseShapeCard({ result }: { result: NoseShapeResult }) {
  return (
    <Card title="Nose Shape">
      <div className="flex flex-wrap gap-2">
        <Tag label={`${capitalize(result.width)} width`} />
        <Tag label={`${capitalize(result.length)} length`} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Width ratio" value={result.widthRatio.toFixed(2)} />
        <Stat label="Length ratio" value={result.lengthRatio.toFixed(2)} />
        <Stat label="Bridge angle" value={`${Math.round(result.bridgeAngle)}\u00B0`} />
      </div>
    </Card>
  );
}

// --- Lip Shape ---

function LipShapeCard({ result }: { result: LipShapeResult }) {
  return (
    <Card title="Lip Shape">
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
    <Card title="Eyebrow Shape">
      <div className="flex flex-wrap gap-2">
        <Tag label={capitalize(result.shape)} />
        <Tag label={`${capitalize(result.slope)} slope`} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="Arch angle" value={`${Math.round(result.archAngle)}\u00B0`} />
        <Stat label="Spacing" value={result.spacing.toFixed(2)} />
      </div>
    </Card>
  );
}

// --- Shared UI Components ---

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <p className="mb-2 text-xs font-medium text-text-tertiary uppercase tracking-wide">
        {title}
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
          className="h-full rounded-full bg-accent"
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
      <span className="text-sm font-medium text-text-secondary">{`${Math.round(value * 100)}%`}</span>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="bg-accent-light text-accent-dark text-xs font-medium px-3 py-1 rounded-full">
      {label}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-xl px-3 py-2">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="text-base font-semibold text-primary">{value}</p>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatSpacing(s: string): string {
  return s.split('-').map(capitalize).join('-');
}
