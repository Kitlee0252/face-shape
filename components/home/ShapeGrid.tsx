import Link from 'next/link';

const shapes = [
  { type: 'oval', icon: '🥚', label: 'Oval', desc: 'Balanced proportions' },
  {
    type: 'round',
    icon: '🔵',
    label: 'Round',
    desc: 'Equal width & length',
  },
  { type: 'square', icon: '⬜', label: 'Square', desc: 'Strong jawline' },
  {
    type: 'heart',
    icon: '💜',
    label: 'Heart',
    desc: 'Wide forehead, narrow chin',
  },
  { type: 'oblong', icon: '📐', label: 'Oblong', desc: 'Elongated shape' },
  {
    type: 'diamond',
    icon: '💎',
    label: 'Diamond',
    desc: 'Wide cheekbones',
  },
  {
    type: 'triangle',
    icon: '🔺',
    label: 'Triangle',
    desc: 'Wide jaw, narrow forehead',
  },
];

export default function ShapeGrid() {
  return (
    <section id="shapes" className="py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-12 font-heading">
        7 Face Shape Types
      </h2>
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {shapes.map((shape) => (
          <Link
            key={shape.type}
            href={`/face-shape/${shape.type}`}
            className="border border-border rounded-2xl p-6 text-center hover:border-accent hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-14 h-14 bg-surface rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
              {shape.icon}
            </div>
            <div className="text-sm font-semibold">{shape.label}</div>
            <div className="text-xs text-text-tertiary mt-1">{shape.desc}</div>
          </Link>
        ))}
        {/* Mixed card — not a link */}
        <div className="border border-dashed border-accent rounded-2xl p-6 text-center">
          <div className="w-14 h-14 bg-accent-light rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
            ✨
          </div>
          <div className="text-sm font-semibold text-accent-dark">Mixed</div>
          <div className="text-xs text-text-tertiary mt-1">
            Hybrid detection
          </div>
        </div>
      </div>
    </section>
  );
}
