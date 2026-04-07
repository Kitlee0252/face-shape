'use client';

interface CharItem {
  label: string;
  value: string;
}

interface MeasItem {
  label: string;
  value: number;
}

interface RatingItem {
  label: string;
  score: number;
}

interface FeaturePanelProps {
  icon: string;
  title: string;
  summary: string;
  characteristics: CharItem[];
  measurements: MeasItem[];
  ratings: RatingItem[];
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

export default function FeaturePanel({
  icon,
  title,
  summary,
  characteristics,
  measurements,
  ratings,
}: FeaturePanelProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="text-lg font-bold font-heading text-primary">{title}</h3>
          <p className="text-sm text-text-secondary mt-0.5">{summary}</p>
        </div>
      </div>

      {/* Two-column grid: Characteristics + Measurements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Characteristics */}
        <div>
          <h4 className="text-sm font-semibold text-accent mb-2">Characteristics</h4>
          <div className="space-y-1.5">
            {characteristics.map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-text-secondary">{item.label}</span>
                <span className="font-medium text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Measurements */}
        <div>
          <h4 className="text-sm font-semibold text-accent mb-2">Measurements</h4>
          <div className="space-y-1.5">
            {measurements.map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-text-secondary">{item.label}</span>
                <span className="font-medium text-primary">
                  {Number.isInteger(item.value) ? item.value : item.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div>
        <h4 className="text-sm font-semibold text-accent mb-3">Ratings</h4>
        <div className="space-y-3">
          {ratings.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-24 text-sm text-text-primary">{item.label}</span>
              <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor(item.score)}`}
                  style={{ width: `${item.score * 10}%` }}
                />
              </div>
              <span className={`w-12 text-right text-sm font-bold ${scoreColor(item.score)}`}>
                {item.score.toFixed(1)}/10
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
