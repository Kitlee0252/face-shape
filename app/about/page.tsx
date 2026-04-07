import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about FaceShapeAI — a free, private, AI-powered face shape detector.',
  alternates: { canonical: 'https://faceshapeai.org/about' },
};

export default function AboutPage() {
  return (
    <main className="flex-1">
      <div className="max-w-[680px] mx-auto px-4 py-16">
        <h1 className="font-heading text-4xl font-bold mb-8">
          About FaceShapeAI
        </h1>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          What is FaceShapeAI?
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          FaceShapeAI is a free, AI-powered face shape detection tool. Simply
          upload a photo and our technology instantly maps your facial features,
          classifies your face shape across five dimensions, and delivers
          personalized style recommendations for hairstyles, glasses, and makeup
          — all in seconds.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          How It Works
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Our detector uses MediaPipe FaceLandmarker to map 478 precise facial
          landmarks on your photo. From there, a rule-based classification system
          analyzes geometric proportions — widths, ratios, and angles — to
          determine your face shape from seven possible types: oval, round,
          square, heart, oblong, diamond, and triangle. The same landmark data
          powers our eye, nose, lip, and eyebrow analysis. All processing
          happens entirely in your browser.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Privacy First
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Your photos never leave your browser. There are zero server uploads, no
          accounts to create, and no personal data collection of any kind. Every
          step of the detection and analysis pipeline runs client-side using
          WebAssembly and JavaScript. Don&apos;t take our word for it — open your
          browser&apos;s DevTools Network tab while using the tool and verify for
          yourself that no image data is transmitted.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Our Technology
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          FaceShapeAI is built with Next.js, MediaPipe FaceLandmarker, and
          TailwindCSS. Our detection algorithms are based on peer-reviewed
          geometric classification methods, adapted into open-source rule-based
          systems that run entirely in the browser. No cloud inference, no API
          calls — just fast, private analysis on your device.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Contact
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Questions or feedback? Email us at{' '}
          <a
            href="mailto:hello@faceshapeai.org"
            className="text-accent hover:text-accent-dark underline"
          >
            hello@faceshapeai.org
          </a>
        </p>
      </div>
    </main>
  );
}
