'use client';

import UploadZone from '@/components/upload/UploadZone';

interface HeroSectionProps {
  onImage: (file: File) => void;
}

export default function HeroSection({ onImage }: HeroSectionProps) {
  return (
    <section className="text-center py-20 px-4">
      <span className="inline-flex items-center gap-1.5 bg-accent-light text-accent-dark text-xs font-medium px-4 py-1.5 rounded-full mb-6">
        &#10022; AI-Powered &middot; 100% Private
      </span>

      <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-[700px] mx-auto mb-4 font-heading">
        Discover Your Face Shape in Seconds
      </h1>

      <p className="text-lg text-text-secondary max-w-[520px] mx-auto mb-10 leading-relaxed">
        Upload a photo and get personalized hairstyle, glasses, and makeup
        recommendations — all processed in your browser.
      </p>

      <div className="max-w-[520px] mx-auto">
        <UploadZone onImage={onImage} />
      </div>

      <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-surface border border-border rounded-full text-xs text-text-secondary">
        <svg viewBox="0 0 24 24" fill="#22C55E" className="w-4 h-4">
          <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" />
        </svg>
        Your photo never leaves your browser
      </div>
    </section>
  );
}
