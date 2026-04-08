import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'FaceShapeAI terms of service. Read the terms governing your use of our free face shape detection tool.',
  alternates: { canonical: 'https://faceshapeai.org/terms' },
};

export default function TermsPage() {
  return (
    <main className="flex-1">
      <div className="max-w-[680px] mx-auto px-4 py-16">
        <h1 className="font-heading text-4xl font-bold mb-8">
          Terms of Service
        </h1>
        <p className="text-text-tertiary text-sm mb-8">
          Last updated: April 2026
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Service Description
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          FaceShapeAI provides a free, AI-powered face shape analysis tool. By
          using our website and services, you agree to the following terms. If
          you do not agree, please discontinue use of the service.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Acceptable Use
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          You may use FaceShapeAI for personal, non-commercial purposes. You
          agree not to upload photos of other individuals without their consent.
          You may not attempt to reverse-engineer, scrape, or misuse the service
          in any way that disrupts its normal operation or infringes on the
          rights of others.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Disclaimer
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          FaceShapeAI is not a medical tool and does not provide medical or
          professional advice. All results are algorithmic estimates based on
          geometric analysis of facial landmarks, not clinical assessments. Style
          recommendations for hairstyles, glasses, and makeup are provided for
          entertainment and inspiration purposes only. Always consult a qualified
          professional for personalized advice.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Limitation of Liability
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          FaceShapeAI is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo; without warranties of any kind, either express or
          implied. To the fullest extent permitted by law, FaceShapeAI shall not
          be liable for any indirect, incidental, special, consequential, or
          punitive damages, or any loss of profits or revenues, whether incurred
          directly or indirectly, arising from your use of or inability to use
          the service.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Intellectual Property
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          The FaceShapeAI tool, including its design, code, and content, is owned
          by FaceShapeAI. All rights are reserved. Photos you upload remain your
          property at all times — as described in our Privacy Policy, we never
          access, store, or transmit your images.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Changes to Terms
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          We may update these terms at any time. Changes will be posted on this
          page with an updated revision date. Continued use of the service after
          changes are posted constitutes acceptance of the revised terms.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Contact
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          If you have questions about these terms, please contact us at{' '}
          <a
            href="mailto:lee.xiaoxiong@gmail.com"
            className="text-accent hover:text-accent-dark underline"
          >
            lee.xiaoxiong@gmail.com
          </a>
        </p>
      </div>
    </main>
  );
}
