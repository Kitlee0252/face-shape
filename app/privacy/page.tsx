import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Your Photos Stay Private',
  description:
    'FaceShapeAI processes all photos in your browser — nothing is uploaded to any server. Learn how our face shape detector protects your privacy and data.',
  alternates: { canonical: 'https://faceshapeai.org/privacy' },
};

export default function PrivacyPage() {
  return (
    <main className="flex-1">
      <div className="max-w-[680px] mx-auto px-4 py-16">
        <h1 className="font-heading text-4xl font-bold mb-8">
          Privacy Policy
        </h1>
        <p className="text-text-tertiary text-sm mb-8">
          Last updated: April 2026
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Information We Collect
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          We do not collect personal data. FaceShapeAI is designed so that your
          photos and facial analysis results are processed entirely within your
          browser. No images, biometric data, or personally identifiable
          information is ever sent to our servers.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Photo Processing
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          All face detection and analysis runs client-side using MediaPipe
          FaceLandmarker via WebAssembly. Your photos are never uploaded, stored,
          or transmitted to any server. The processing happens entirely on your
          device and the image data remains in your browser&apos;s memory only
          during the active session.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Cookies
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          We use minimal cookies for Google Analytics 4 (if enabled) to
          understand aggregate, anonymous usage patterns such as page views and
          session duration. We do not use tracking cookies for advertising or
          cross-site tracking purposes.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Third-Party Services
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          We may use the following third-party services: Google Analytics for
          anonymous usage statistics, and Cloudflare for CDN delivery and
          security. Neither service has access to your photos or facial analysis
          results, as that data never leaves your browser.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Data Retention
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          We retain no personal data. Your analysis results exist only in your
          browser session and are discarded when you close the page or navigate
          away. There is nothing stored on our end to delete.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Changes to This Policy
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          We may update this privacy policy from time to time. Any changes will
          be posted on this page with an updated revision date. We encourage you
          to review this policy periodically.
        </p>

        <h2 className="font-heading text-xl font-semibold mb-3 mt-8">
          Contact
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          If you have questions about this privacy policy, please contact us at{' '}
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
