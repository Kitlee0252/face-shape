interface RecommendationCardProps {
  name: string;
  description?: string;
  whyItWorks: string;
}

export default function RecommendationCard({ name, whyItWorks }: RecommendationCardProps) {
  return (
    <div className="border border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div className="w-full h-32 rounded-xl bg-surface mb-3 flex items-center justify-center">
        <span className="text-text-tertiary text-xs">Image</span>
      </div>
      <p className="text-sm font-semibold">{name}</p>
      <p className="text-xs text-text-secondary mt-1 leading-relaxed">{whyItWorks}</p>
    </div>
  );
}
