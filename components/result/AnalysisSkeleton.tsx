// components/result/AnalysisSkeleton.tsx
export default function AnalysisSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Tab bar skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-16 rounded-full bg-surface" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)] space-y-4">
        {/* Title */}
        <div className="h-6 w-48 rounded bg-surface" />
        {/* Confidence bar */}
        <div className="h-4 w-full rounded-full bg-surface" />
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-surface" />
          ))}
        </div>
        {/* Score bars */}
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-surface" style={{ width: `${80 - i * 12}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
