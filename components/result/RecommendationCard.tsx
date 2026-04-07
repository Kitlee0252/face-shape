import Image from 'next/image';

interface RecommendationCardProps {
  name: string;
  description?: string;
  whyItWorks: string;
  imageUrl?: string;
}

export default function RecommendationCard({ name, whyItWorks, imageUrl }: RecommendationCardProps) {
  return (
    <div className="border border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
      {imageUrl ? (
        <div className="w-full aspect-square rounded-xl overflow-hidden mb-3">
          <Image
            src={imageUrl}
            alt={name}
            width={300}
            height={300}
            className="w-full h-full object-cover object-top"
          />
        </div>
      ) : (
        <div className="w-full h-32 rounded-xl bg-surface mb-3 flex items-center justify-center">
          <span className="text-text-tertiary text-xs">Image</span>
        </div>
      )}
      <p className="text-sm font-semibold">{name}</p>
      <p className="text-xs text-text-secondary mt-1 leading-relaxed">{whyItWorks}</p>
    </div>
  );
}
