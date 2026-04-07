const stats = [
  { number: '50,000+', label: 'Faces analyzed' },
  { number: '< 3s', label: 'Detection time' },
  { number: '5', label: 'Analysis dimensions' },
  { number: '7', label: 'Face shape types' },
];

export default function TrustBar() {
  return (
    <section className="border-t border-border py-8 px-4">
      <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-8 md:gap-12">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold font-heading">{stat.number}</div>
            <div className="text-xs text-text-tertiary mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
