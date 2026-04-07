const PREVIEW_RATINGS = [
  { label: 'Eyes', score: 8.5 },
  { label: 'Eyebrows', score: 7.1 },
  { label: 'Lips', score: 7.5 },
  { label: 'Nose', score: 7.2 },
];

function ratingBarColor(score: number): string {
  if (score >= 8.5) return 'bg-emerald-400';
  if (score >= 7.5) return 'bg-green-500';
  return 'bg-amber-400';
}

export default function ResultsPreview() {
  return (
    <section className="bg-background-alt py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-12 font-heading">
        What You&apos;ll Get
      </h2>
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: detection visualization mockup */}
        <div className="w-full lg:w-[300px] rounded-2xl bg-gradient-to-br from-surface to-border flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0 p-6 gap-4">
          {/* Face outline mockup */}
          <div className="w-40 h-52 rounded-[50%] border-2 border-accent/30 relative">
            <div className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[80%] h-[2px] bg-red-400/40 rounded" />
            <div className="absolute top-[38%] left-1/2 -translate-x-1/2 w-[90%] h-[2px] bg-yellow-400/40 rounded" />
            <div className="absolute top-[52%] left-1/2 -translate-x-1/2 w-[95%] h-[2px] bg-cyan-400/40 rounded" />
            <div className="absolute top-[68%] left-1/2 -translate-x-1/2 w-[70%] h-[2px] bg-purple-400/40 rounded" />
          </div>
          <span className="text-xs text-text-tertiary">AI Landmark Detection</span>
        </div>

        {/* Right: result preview cards */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Card 1 — Face Shape */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="text-[11px] text-text-tertiary uppercase tracking-wide">
              Face Shape
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-bold font-heading">Oval</span>
              <span className="text-sm font-semibold text-accent">87%</span>
            </div>
            <div className="h-1.5 bg-surface rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: '87%' }} />
            </div>
          </div>

          {/* Card 2 — Feature Ratings */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="text-[11px] text-text-tertiary uppercase tracking-wide mb-3">
              Feature Ratings
            </div>
            <div className="space-y-2">
              {PREVIEW_RATINGS.map((r) => (
                <div key={r.label} className="flex items-center gap-2">
                  <span className="w-20 text-xs text-text-secondary">{r.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ratingBarColor(r.score)}`}
                      style={{ width: `${r.score * 10}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-7 text-right">{r.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3 — Detailed Analysis */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="text-[11px] text-text-tertiary uppercase tracking-wide mb-2">
              Detailed Analysis
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Shape</span>
                <span className="font-semibold">Almond</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Symmetry</span>
                <span className="font-semibold">Good</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Size</span>
                <span className="font-semibold">Medium</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Spacing</span>
                <span className="font-semibold">Standard</span>
              </div>
            </div>
          </div>

          {/* Card 4 — Recommendations */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="text-[11px] text-text-tertiary uppercase tracking-wide mb-2">
              Personalized Recommendations
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-accent-light text-accent-dark text-[11px] font-medium px-2.5 py-1 rounded-full">
                Hairstyles
              </span>
              <span className="bg-accent-light text-accent-dark text-[11px] font-medium px-2.5 py-1 rounded-full">
                Glasses
              </span>
              <span className="bg-accent-light text-accent-dark text-[11px] font-medium px-2.5 py-1 rounded-full">
                Makeup Tips
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
