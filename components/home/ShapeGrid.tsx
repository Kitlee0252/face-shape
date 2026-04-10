import Link from 'next/link';
import Image from 'next/image';

const shapes = [
  { type: 'oval', label: 'Oval', desc: 'Balanced proportions' },
  { type: 'round', label: 'Round', desc: 'Equal width & length' },
  { type: 'square', label: 'Square', desc: 'Strong jawline' },
  { type: 'heart', label: 'Heart', desc: 'Wide forehead, narrow chin' },
  { type: 'oblong', label: 'Oblong', desc: 'Elongated shape' },
  { type: 'diamond', label: 'Diamond', desc: 'Wide cheekbones' },
  { type: 'triangle', label: 'Triangle', desc: 'Wide jaw, narrow forehead' },
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
            <div className="w-14 h-14 rounded-full mx-auto mb-3 overflow-hidden">
              <Image
                src={`/images/shapes/${shape.type}.jpg`}
                alt={`${shape.label} face shape`}
                width={56}
                height={56}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-sm font-semibold">{shape.label}</h3>
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
