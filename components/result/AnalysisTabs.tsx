'use client';

import { useState } from 'react';
import type { FiveAnalysisResult } from '@/lib/detection/types';
import { FACE_SHAPE_LABELS } from '@/lib/detection/types';
import type { FaceShapeType } from '@/lib/detection/types';
import { computeFeatureRatings } from '@/lib/detection/featureRating';
import FeaturePanel from './FeaturePanel';
import FeatureRatings from './FeatureRatings';

interface Props {
  result: FiveAnalysisResult;
}

type TabId = 'shape' | 'score' | 'eyes' | 'brows' | 'lips' | 'nose';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'shape', label: 'Shape', icon: '\u{1F464}' },
  { id: 'score', label: 'Score', icon: '\u2B50' },
  { id: 'eyes', label: 'Eyes', icon: '\u{1F441}' },
  { id: 'brows', label: 'Brows', icon: '\u{1F928}' },
  { id: 'lips', label: 'Lips', icon: '\u{1F444}' },
  { id: 'nose', label: 'Nose', icon: '\u{1F443}' },
];

/**
 * Normalize result data to handle old sessionStorage format
 * that may be missing new fields (detailed, shape, symmetry, etc.)
 */
function normalizeResult(result: FiveAnalysisResult): FiveAnalysisResult {
  const eye = result.eyeShape;
  const brow = result.eyebrowShape;
  const lip = result.lipShape;
  const nose = result.noseShape;

  const face = result.faceShape;
  return {
    ...result,
    faceShape: {
      ...face,
      ratios: {
        ...face.ratios,
        widthGradient: face.ratios.widthGradient ?? 0,
        jawlineCurvature: face.ratios.jawlineCurvature ?? 0,
      },
    },
    eyeShape: {
      ...eye,
      shape: eye.shape ?? 'almond',
      symmetry: eye.symmetry ?? 'good',
      detailed: eye.detailed ?? {
        aspectRatio: eye.sizeRatio > 0 ? 1 / eye.sizeRatio : 0,
        avgHeight: 0, avgWidth: 0, distance: 0, leftWidth: 0, rightWidth: 0,
      },
    },
    eyebrowShape: {
      ...brow,
      thickness: brow.thickness ?? 'medium',
      length: brow.length ?? 'medium',
      symmetry: brow.symmetry ?? 'good',
      detailed: brow.detailed ?? {
        height: 0, leftLength: 0, rightLength: 0, length: 0, spacing: 0,
      },
    },
    lipShape: {
      ...lip,
      cupidBow: lip.cupidBow ?? 'moderate',
      shapeClass: lip.shapeClass ?? 'balanced',
      symmetry: lip.symmetry ?? 'good',
      detailed: lip.detailed ?? {
        height: 0, upperHeight: 0, lowerHeight: 0, width: 0,
      },
    },
    noseShape: {
      ...nose,
      bridge: nose.bridge ?? 'medium',
      shapeClass: nose.shapeClass ?? 'straight',
      proportion: nose.proportion ?? 'proportioned',
      detailed: nose.detailed ?? {
        bridgeHeight: 0, bridgeWidth: 0, length: 0, width: 0,
      },
    },
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatSpacing(s: string): string {
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function barColor(score: number): string {
  if (score >= 8.5) return 'bg-emerald-400';
  if (score >= 7.5) return 'bg-green-500';
  if (score >= 6.5) return 'bg-amber-400';
  return 'bg-orange-400';
}

function scoreColor(score: number): string {
  if (score >= 8.5) return 'text-emerald-500';
  if (score >= 7.5) return 'text-green-600';
  if (score >= 6.5) return 'text-amber-500';
  return 'text-orange-500';
}

/* ---------- Shape Tab ---------- */

function ShapeTab({ result }: Props) {
  const { faceShape } = result;
  const { primary, secondary, all, ratios } = faceShape;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">{'\u{1F464}'}</span>
        <div>
          <h3 className="text-lg font-bold font-heading text-primary">Face Shape</h3>
          <p className="text-sm text-text-secondary mt-0.5">
            Your face shape is{' '}
            <span className="font-semibold text-primary">
              {FACE_SHAPE_LABELS[primary.type]}
            </span>
            {secondary && (
              <>
                {' '}
                with{' '}
                <span className="font-semibold text-primary">
                  {FACE_SHAPE_LABELS[secondary.type]}
                </span>{' '}
                traits
              </>
            )}
            .
          </p>
        </div>
      </div>

      {/* Primary confidence */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-text-secondary">Confidence</span>
          <span className="font-bold text-primary">{Math.round(primary.confidence * 100)}%</span>
        </div>
        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${Math.round(primary.confidence * 100)}%` }}
          />
        </div>
      </div>

      {/* Ratio stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
        <StatBox label="Aspect" value={ratios.aspectRatio.toFixed(2)} />
        <StatBox label="Forehead" value={ratios.foreheadRatio.toFixed(2)} />
        <StatBox label="Jaw" value={ratios.jawRatio.toFixed(2)} />
        <StatBox label="Chin Angle" value={`${Math.round(ratios.chinAngle)}\u00B0`} />
        <StatBox label="Gradient" value={ratios.widthGradient.toFixed(2)} />
        <StatBox label="Jawline" value={ratios.jawlineCurvature.toFixed(2)} />
      </div>

      {/* All 7 shape scores */}
      <h4 className="text-sm font-semibold text-accent mb-3">Shape Scores</h4>
      <div className="space-y-2">
        {all
          .slice()
          .sort((a, b) => b.confidence - a.confidence)
          .map((score) => (
            <div key={score.type} className="flex items-center gap-3">
              <span className="w-20 text-sm text-text-primary">
                {FACE_SHAPE_LABELS[score.type]}
              </span>
              <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    score.type === primary.type ? 'bg-accent' : 'bg-gray-300'
                  }`}
                  style={{ width: `${Math.round(score.confidence * 100)}%` }}
                />
              </div>
              <span
                className={`w-12 text-right text-sm font-bold ${
                  score.type === primary.type ? 'text-accent' : 'text-text-secondary'
                }`}
              >
                {Math.round(score.confidence * 100)}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-xl px-3 py-2">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="text-base font-semibold text-primary">{value}</p>
    </div>
  );
}

/* ---------- Score Tab ---------- */

function ScoreTab({ result }: Props) {
  return <FeatureRatings result={result} />;
}

/* ---------- Eyes Tab ---------- */

function EyesTab({ result }: Props) {
  const { eyeShape } = result;
  const ratings = computeFeatureRatings(result);

  const summary = `Eyes: ${capitalize(eyeShape.size)} ${eyeShape.shape}-shaped eyes with ${formatSpacing(eyeShape.spacing).toLowerCase()} spacing.`;

  return (
    <FeaturePanel
      icon={'\u{1F441}'}
      title="Eye Analysis"
      summary={summary}
      characteristics={[
        { label: 'Shape', value: capitalize(eyeShape.shape) },
        { label: 'Size', value: capitalize(eyeShape.size) },
        { label: 'Spacing', value: formatSpacing(eyeShape.spacing) },
        { label: 'Symmetry', value: capitalize(eyeShape.symmetry) },
      ]}
      measurements={[
        { label: 'Aspect Ratio', value: eyeShape.detailed.aspectRatio },
        { label: 'Avg Height', value: eyeShape.detailed.avgHeight },
        { label: 'Avg Width', value: eyeShape.detailed.avgWidth },
        { label: 'Distance', value: eyeShape.detailed.distance },
        { label: 'Left Width', value: eyeShape.detailed.leftWidth },
        { label: 'Right Width', value: eyeShape.detailed.rightWidth },
      ]}
      ratings={[
        { label: 'Overall', score: ratings.eyes.overall },
        { label: 'Shape', score: ratings.eyes.shape },
        { label: 'Size', score: ratings.eyes.size },
        { label: 'Spacing', score: ratings.eyes.spacing },
        { label: 'Symmetry', score: ratings.eyes.symmetry },
      ]}
    />
  );
}

/* ---------- Brows Tab ---------- */

function BrowsTab({ result }: Props) {
  const { eyebrowShape } = result;
  const ratings = computeFeatureRatings(result);

  const spacingLabel =
    eyebrowShape.spacing >= 1.1
      ? 'wide'
      : eyebrowShape.spacing <= 0.9
        ? 'close'
        : 'standard';

  const summary = `Eyebrows: ${capitalize(eyebrowShape.thickness)} ${eyebrowShape.shape} with ${spacingLabel} spacing.`;

  return (
    <FeaturePanel
      icon={'\u{1F928}'}
      title="Eyebrow Analysis"
      summary={summary}
      characteristics={[
        { label: 'Arch', value: capitalize(eyebrowShape.shape) },
        { label: 'Shape', value: capitalize(eyebrowShape.length) },
        { label: 'Spacing', value: capitalize(spacingLabel) },
        { label: 'Symmetry', value: capitalize(eyebrowShape.symmetry) },
        { label: 'Thickness', value: capitalize(eyebrowShape.thickness) },
      ]}
      measurements={[
        { label: 'Height', value: eyebrowShape.detailed.height },
        { label: 'Left Length', value: eyebrowShape.detailed.leftLength },
        { label: 'Length', value: eyebrowShape.detailed.length },
        { label: 'Right Length', value: eyebrowShape.detailed.rightLength },
        { label: 'Spacing', value: eyebrowShape.detailed.spacing },
      ]}
      ratings={[
        { label: 'Arch', score: ratings.eyebrows.arch },
        { label: 'Overall', score: ratings.eyebrows.overall },
        { label: 'Spacing', score: ratings.eyebrows.spacing },
        { label: 'Thickness', score: ratings.eyebrows.thickness },
      ]}
    />
  );
}

/* ---------- Lips Tab ---------- */

function LipsTab({ result }: Props) {
  const { lipShape } = result;
  const ratings = computeFeatureRatings(result);

  const summary = `Lips: ${capitalize(lipShape.width)} ${lipShape.thickness} lips with ${lipShape.shapeClass} shape.`;

  return (
    <FeaturePanel
      icon={'\u{1F444}'}
      title="Lip Analysis"
      summary={summary}
      characteristics={[
        { label: 'Cupid Bow', value: capitalize(lipShape.cupidBow) },
        { label: 'Shape', value: capitalize(lipShape.shapeClass) },
        { label: 'Symmetry', value: capitalize(lipShape.symmetry) },
        { label: 'Thickness', value: capitalize(lipShape.thickness) },
        { label: 'Width', value: capitalize(lipShape.width) },
      ]}
      measurements={[
        { label: 'Height', value: lipShape.detailed.height },
        { label: 'Lower Height', value: lipShape.detailed.lowerHeight },
        { label: 'Upper Height', value: lipShape.detailed.upperHeight },
        { label: 'Upper/Lower Ratio', value: lipShape.upperLowerRatio },
        { label: 'Width', value: lipShape.detailed.width },
        { label: 'Width Ratio', value: lipShape.widthRatio },
      ]}
      ratings={[
        { label: 'Cupid Bow', score: ratings.lips.cupidBow },
        { label: 'Overall', score: ratings.lips.overall },
        { label: 'Proportion', score: ratings.lips.proportion },
        { label: 'Shape', score: ratings.lips.shape },
        { label: 'Thickness', score: ratings.lips.thickness },
        { label: 'Width', score: ratings.lips.width },
      ]}
    />
  );
}

/* ---------- Nose Tab ---------- */

function NoseTab({ result }: Props) {
  const { noseShape } = result;
  const ratings = computeFeatureRatings(result);

  const summary = `Nose: ${capitalize(noseShape.width)} ${noseShape.length} nose with ${noseShape.bridge} bridge.`;

  return (
    <FeaturePanel
      icon={'\u{1F443}'}
      title="Nose Analysis"
      summary={summary}
      characteristics={[
        { label: 'Bridge', value: capitalize(noseShape.bridge) },
        { label: 'Length', value: capitalize(noseShape.length) },
        { label: 'Proportion', value: capitalize(noseShape.proportion) },
        { label: 'Shape', value: capitalize(noseShape.shapeClass) },
        { label: 'Width', value: capitalize(noseShape.width) },
      ]}
      measurements={[
        { label: 'Bridge Height', value: noseShape.detailed.bridgeHeight },
        { label: 'Bridge Width', value: noseShape.detailed.bridgeWidth },
        { label: 'Length', value: noseShape.detailed.length },
        { label: 'Width', value: noseShape.detailed.width },
        { label: 'Width Ratio', value: noseShape.widthRatio },
      ]}
      ratings={[
        { label: 'Bridge', score: ratings.nose.bridge },
        { label: 'Length', score: ratings.nose.length },
        { label: 'Overall', score: ratings.nose.overall },
        { label: 'Proportion', score: ratings.nose.proportion },
        { label: 'Width', score: ratings.nose.width },
      ]}
    />
  );
}

/* ---------- Main Component ---------- */

export default function AnalysisTabs({ result: rawResult }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('shape');
  const result = normalizeResult(rawResult);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex overflow-x-auto gap-1 mb-4 pb-1 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-accent text-white rounded-full'
                : 'text-text-secondary hover:text-primary px-4 py-2'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'shape' && <ShapeTab result={result} />}
      {activeTab === 'score' && <ScoreTab result={result} />}
      {activeTab === 'eyes' && <EyesTab result={result} />}
      {activeTab === 'brows' && <BrowsTab result={result} />}
      {activeTab === 'lips' && <LipsTab result={result} />}
      {activeTab === 'nose' && <NoseTab result={result} />}
    </div>
  );
}
