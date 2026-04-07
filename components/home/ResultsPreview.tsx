export default function ResultsPreview() {
  return (
    <section className="bg-background-alt py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-12 font-heading">
        What You&apos;ll Get
      </h2>
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: photo mockup */}
        <div className="w-full lg:w-[300px] h-[380px] rounded-2xl bg-gradient-to-br from-surface to-border flex items-center justify-center relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-x-8 top-[30%] h-[2px] bg-red-400/30 rounded" />
          <div className="absolute inset-x-12 top-[48%] h-[2px] bg-cyan-400/30 rounded" />
          <div className="absolute inset-x-10 top-[68%] h-[2px] bg-purple-400/30 rounded" />
          <span className="text-sm text-text-tertiary z-10">
            Detection Visualization
          </span>
        </div>

        {/* Right: result cards */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Card 1 — Face Shape */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="text-[11px] text-text-tertiary uppercase tracking-wide">
              Face Shape
            </div>
            <div className="text-xl font-bold font-heading mt-1">Oval</div>
            <div className="h-1 bg-surface rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-accent rounded-full"
                style={{ width: '87%' }}
              />
            </div>
          </div>

          {/* Card 2 — Eye Shape */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="text-[11px] text-text-tertiary uppercase tracking-wide">
              Eye Shape
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span className="bg-accent-light text-accent-dark text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                Upturned
              </span>
              <span className="bg-accent-light text-accent-dark text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                Medium
              </span>
              <span className="bg-accent-light text-accent-dark text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                Standard
              </span>
            </div>
          </div>

          {/* Card 3 — Nose Shape */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="text-[11px] text-text-tertiary uppercase tracking-wide">
              Nose Shape
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span className="bg-accent-light text-accent-dark text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                Medium width
              </span>
              <span className="bg-accent-light text-accent-dark text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                Medium length
              </span>
            </div>
          </div>

          {/* Card 4 — Best Hairstyles */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="text-[11px] text-text-tertiary uppercase tracking-wide">
              Best Hairstyles
            </div>
            <div className="flex gap-2 mt-2">
              <div className="w-14 h-14 rounded-lg bg-surface" />
              <div className="w-14 h-14 rounded-lg bg-surface" />
              <div className="w-14 h-14 rounded-lg bg-surface" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
