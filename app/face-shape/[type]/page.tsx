import type { Metadata } from 'next';
import type { FaceShapeType } from '@/lib/detection/types';
import { FACE_SHAPES } from '@/lib/data/faceShapes';
import { HAIRSTYLES } from '@/lib/data/hairstyles';
import { GLASSES } from '@/lib/data/glasses';
import { MAKEUP } from '@/lib/data/makeup';
import { FACE_SHAPE_LABELS } from '@/lib/detection/types';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getShapeImage, getHairstyleImage, getGlassesImage } from '@/lib/utils/imagePaths';

const SHAPES: FaceShapeType[] = [
  'oval',
  'round',
  'square',
  'heart',
  'oblong',
  'diamond',
  'triangle',
];

export function generateStaticParams() {
  return SHAPES.map((type) => ({ type }));
}

type Props = { params: Promise<{ type: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const shape = FACE_SHAPES[type as FaceShapeType];
  if (!shape) return {};
  return {
    title: `${shape.name} Face Shape — Hairstyles & Tips`,
    description: `${shape.description} Find the best hairstyles, glasses, and makeup tips for ${shape.name.toLowerCase()} face shapes.`,
    alternates: {
      canonical: `https://faceshapeai.org/face-shape/${type}`,
    },
    openGraph: {
      title: `${shape.name} Face Shape Guide`,
      description: shape.tagline,
      url: `https://faceshapeai.org/face-shape/${type}`,
    },
  };
}

export default async function FaceShapeGuidePage({ params }: Props) {
  const { type } = await params;
  const shapeType = type as FaceShapeType;
  const shape = FACE_SHAPES[shapeType];

  if (!shape) {
    notFound();
  }

  const hairstyles = HAIRSTYLES[shapeType];
  const glasses = GLASSES[shapeType];
  const makeup = MAKEUP[shapeType];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: shape.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://faceshapeai.org',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Face Shapes',
        item: 'https://faceshapeai.org/face-shape',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${shape.name} Face Shape`,
        item: `https://faceshapeai.org/face-shape/${type}`,
      },
    ],
  };

  return (
    <main className="flex-1">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 1. Hero */}
      <section className="py-16 px-4 text-center">
        <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-6 border-2 border-accent/20 bg-white">
          <Image
            src={getShapeImage(shapeType)}
            alt={`${shape.name} face shape outline`}
            width={112}
            height={112}
            className="w-full h-full object-contain"
            priority
          />
        </div>
        <h1 className="text-5xl font-bold font-heading mb-4">
          {shape.name} Face Shape
        </h1>
        <p className="text-lg text-text-secondary mb-6 max-w-xl mx-auto">
          {shape.tagline}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {shape.characteristics.map((tag) => (
            <span
              key={tag}
              className="bg-accent-light text-accent-dark text-sm px-4 py-1.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* 2. Hairstyles */}
      <section className="py-12 px-4">
        <h2 className="text-2xl font-bold font-heading text-center mb-8">
          Best Hairstyles for {shape.name} Face
        </h2>

        {/* Women */}
        <div className="max-w-5xl mx-auto mb-10">
          <h3 className="text-lg font-semibold mb-4 text-text-secondary">
            Women
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hairstyles.female.map((style) => (
              <div
                key={style.name}
                className="border border-border rounded-2xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-3">
                  <Image
                    src={getHairstyleImage(shapeType, 'female', style.name)}
                    alt={`${style.name} hairstyle for ${shape.name} face`}
                    width={300}
                    height={192}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <p className="text-sm font-semibold">{style.name}</p>
                <p className="text-xs text-text-secondary mt-1">
                  {style.description}
                </p>
                <p className="text-xs text-text-tertiary mt-2 italic">
                  {style.whyItWorks}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Men */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-text-secondary">
            Men
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hairstyles.male.map((style) => (
              <div
                key={style.name}
                className="border border-border rounded-2xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-3">
                  <Image
                    src={getHairstyleImage(shapeType, 'male', style.name)}
                    alt={`${style.name} hairstyle for ${shape.name} face`}
                    width={300}
                    height={192}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <p className="text-sm font-semibold">{style.name}</p>
                <p className="text-xs text-text-secondary mt-1">
                  {style.description}
                </p>
                <p className="text-xs text-text-tertiary mt-2 italic">
                  {style.whyItWorks}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Glasses */}
      <section className="py-12 px-4 bg-background-alt">
        <h2 className="text-2xl font-bold font-heading text-center mb-8">
          Best Glasses for {shape.name} Face
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {glasses.map((g) => (
            <div
              key={g.name}
              className="border border-border rounded-2xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-3">
                <Image
                  src={getGlassesImage(shapeType, g.name)}
                  alt={`${g.name} glasses for ${shape.name} face`}
                  width={300}
                  height={192}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <p className="text-sm font-semibold">{g.name}</p>
              <span className="inline-block text-xs bg-accent-light text-accent-dark px-2 py-0.5 rounded-full mt-1">
                {g.style}
              </span>
              <p className="text-xs text-text-tertiary mt-2 italic">
                {g.whyItWorks}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Makeup Tips */}
      <section className="py-12 px-4">
        <h2 className="text-2xl font-bold font-heading text-center mb-8">
          Makeup &amp; Contour Tips
        </h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {makeup.map((tip, i) => (
            <div key={tip.area} className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white text-sm font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-sm">{tip.area}</p>
                <p className="text-sm text-text-secondary mt-0.5">
                  {tip.tip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. What to Avoid */}
      <section className="py-12 px-4 bg-background-alt">
        <h2 className="text-2xl font-bold font-heading text-center mb-8">
          What to Avoid
        </h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Hairstyles to Avoid
            </h3>
            <ul className="space-y-2">
              {shape.avoid.hairstyles.map((item) => (
                <li
                  key={item}
                  className="text-sm text-text-secondary flex items-start gap-2"
                >
                  <span className="text-red-500 flex-shrink-0 mt-0.5">
                    &#x2715;
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Glasses to Avoid
            </h3>
            <ul className="space-y-2">
              {shape.avoid.glasses.map((item) => (
                <li
                  key={item}
                  className="text-sm text-text-secondary flex items-start gap-2"
                >
                  <span className="text-red-500 flex-shrink-0 mt-0.5">
                    &#x2715;
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-12 px-4">
        <h2 className="text-2xl font-bold font-heading text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="max-w-2xl mx-auto">
          {shape.faqs.map((faq) => (
            <div key={faq.question} className="mb-6">
              <p className="text-sm font-semibold mb-1">{faq.question}</p>
              <p className="text-sm text-text-secondary leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CTA */}
      <section className="py-12 px-4 text-center">
        <h2 className="text-2xl font-bold font-heading mb-4">
          Ready to find your face shape?
        </h2>
        <Link
          href="/"
          className="inline-block bg-accent text-white font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          Try the Detector
        </Link>
      </section>

      {/* 9. Related Shapes */}
      <section className="py-12 px-4 bg-background-alt">
        <h2 className="text-2xl font-bold font-heading text-center mb-8">
          You Might Also Like
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {shape.relatedShapes.map((relType) => {
            const rel = FACE_SHAPES[relType];
            return (
              <Link
                key={relType}
                href={`/face-shape/${relType}`}
                className="border border-border rounded-2xl p-6 text-center hover:border-accent hover:shadow-md transition-all w-52"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2 bg-white">
                  <Image
                    src={getShapeImage(relType)}
                    alt={`${rel.name} face shape`}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="font-semibold">
                  {FACE_SHAPE_LABELS[relType]} Face
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {rel.tagline}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
