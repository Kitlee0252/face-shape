'use client';

import type { FiveAnalysisResult } from '@/lib/detection/types';
import { computeFeatureRatings } from '@/lib/detection/featureRating';

interface Props {
  result: FiveAnalysisResult;
}

const FEATURES = ['eyebrows', 'eyes', 'lips', 'nose'] as const;

const PROPORTION_ITEMS = [
  { key: 'thirds' as const, label: 'Rule of Thirds' },
  { key: 'fifths' as const, label: 'Rule of Fifths' },
  { key: 'goldenRatio' as const, label: 'Golden Ratio' },
];

function barColor(score: number): string {
  if (score >= 8.5) return 'bg-emerald-400';
  if (score >= 7.5) return 'bg-green-400';
  if (score >= 6.5) return 'bg-amber-400';
  return 'bg-orange-400';
}

function scoreColor(score: number): string {
  if (score >= 8.5) return 'text-emerald-500';
  if (score >= 7.5) return 'text-green-500';
  if (score >= 6.5) return 'text-amber-500';
  return 'text-orange-500';
}

function RatingBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-text-primary">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor(score)}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className={`w-10 text-right text-sm font-bold ${scoreColor(score)}`}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export default function FeatureRatings({ result }: Props) {
  const ratings = computeFeatureRatings(result);

  return (
    <div className="space-y-4">
      {/* Feature Ratings */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <h3 className="text-lg font-bold font-heading text-accent mb-4">Feature Ratings</h3>
        <div className="space-y-3">
          {FEATURES.map((key) => (
            <RatingBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} score={ratings[key].overall} />
          ))}
        </div>
      </div>

      {/* Facial Proportions */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <h3 className="text-lg font-bold font-heading text-accent mb-4">Facial Proportions</h3>
        <div className="space-y-3">
          {PROPORTION_ITEMS.map((item) => (
            <RatingBar key={item.key} label={item.label} score={ratings.proportions[item.key]} />
          ))}
        </div>
      </div>

      {/* Overall Score */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">Overall Score</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor(ratings.overall)}`}
                style={{ width: `${ratings.overall * 10}%` }}
              />
            </div>
            <span className={`text-lg font-bold ${scoreColor(ratings.overall)}`}>
              {ratings.overall.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
