'use client';

import { useState } from 'react';

const faqItems = [
  {
    question: 'What is a face shape detector?',
    answer:
      'A face shape detector is an AI-powered tool that analyzes your facial features to determine your face shape. Our tool uses MediaPipe technology to map 478 facial landmarks and classify your face into one of 7 shape categories: oval, round, square, heart, oblong, diamond, or triangle.',
  },
  {
    question: 'How accurate is the face shape detection?',
    answer:
      'Our AI analyzes 478 facial landmarks across 5 dimensions (face shape, eye shape, nose shape, lip shape, and eyebrow shape) using a rule-based classification system. Accuracy depends on photo quality \u2014 a clear, front-facing photo with good lighting gives the best results.',
  },
  {
    question: 'Is this tool completely free?',
    answer:
      'Yes, FaceShapeAI is 100% free to use with no signup required. There are no hidden fees, premium tiers, or usage limits.',
  },
  {
    question: 'Is my photo safe and private?',
    answer:
      "Absolutely. Your photo is processed entirely in your browser using on-device AI. It is never uploaded to any server. You can verify this yourself by checking the Network tab in your browser's developer tools \u2014 you'll see zero image upload requests.",
  },
  {
    question: 'What face shapes can be detected?',
    answer:
      "We detect 7 face shape types: Oval, Round, Square, Heart, Oblong, Diamond, and Triangle. We also support mixed face shape detection \u2014 if your face has characteristics of multiple shapes, we'll show both your primary and secondary face shape with confidence percentages.",
  },
  {
    question: 'What other facial features are analyzed?',
    answer:
      'Beyond face shape, we analyze 4 additional dimensions: eye shape (slope, size, and spacing), nose shape (width and length), lip shape (thickness and width), and eyebrow shape (arch and slope). Together, these 5 dimensions give you a comprehensive facial analysis.',
  },
  {
    question: 'How should I take my photo for best results?',
    answer:
      'For the most accurate results: face the camera directly, use good even lighting, pull hair back from your face, maintain a neutral expression, and make sure only one face is in the photo.',
  },
  {
    question: 'Can I use this on my phone?',
    answer:
      'Yes! FaceShapeAI works on all devices \u2014 desktop, tablet, and mobile. On mobile, you can either upload an existing photo or take a new one with your camera.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-12 font-heading">
        Frequently Asked Questions
      </h2>
      <div className="max-w-2xl mx-auto">
        {faqItems.map((item, i) => (
          <div key={i}>
            <button
              className="w-full flex items-center justify-between py-4 border-b border-border text-left"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
            >
              <h3 className="text-sm font-semibold text-primary pr-4">
                {item.question}
              </h3>
              <svg
                className={`w-5 h-5 shrink-0 text-text-secondary transition-transform duration-200 ${
                  openIndex === i ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openIndex === i && (
              <p className="pb-4 border-b border-border text-sm text-text-secondary leading-relaxed">
                {item.answer}
              </p>
            )}
          </div>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
