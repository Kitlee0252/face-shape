import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_POSTS, getBlogPost } from '@/lib/data/blogPosts';
import { FACE_SHAPE_LABELS } from '@/lib/detection/types';

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | FaceShapeAI`,
    description: post.description,
    alternates: { canonical: `https://faceshapeai.org/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://faceshapeai.org/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishDate,
    },
  };
}

function estimateReadingTime(post: ReturnType<typeof getBlogPost>): number {
  if (!post) return 1;
  let text = post.intro;
  if (post.shapeBreakdown) {
    text += post.shapeBreakdown.heading;
    for (const s of post.shapeBreakdown.shapes) {
      text += s.title + s.description + s.recommendations.join(' ') + (s.tip ?? '') + (s.avoid?.join(' ') ?? '');
    }
  }
  if (post.comparison) {
    text += post.comparison.summary;
    for (const r of post.comparison.rows) text += r.aspect + r.shapeA + r.shapeB;
    text += post.comparison.shapeA.traits.join(' ') + post.comparison.shapeB.traits.join(' ');
  }
  if (post.steps) {
    for (const s of post.steps.items) text += s.title + s.description;
  }
  for (const f of post.faqs) text += f.question + f.answer;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 230));
}

const CATEGORY_LABELS: Record<string, string> = {
  styling: 'Styling',
  guide: 'Guide',
  personality: 'Personality',
  comparison: 'Comparison',
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const readingTime = estimateReadingTime(post);

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishDate,
    author: { '@type': 'Organization', name: 'FaceShapeAI', url: 'https://faceshapeai.org' },
    publisher: { '@type': 'Organization', name: 'FaceShapeAI', url: 'https://faceshapeai.org' },
    mainEntityOfPage: `https://faceshapeai.org/blog/${post.slug}`,
  };

  const faqSchema = post.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  } : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://faceshapeai.org' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://faceshapeai.org/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://faceshapeai.org/blog/${post.slug}` },
    ],
  };

  const relatedPosts = post.relatedSlugs
    .map((s) => getBlogPost(s))
    .filter((p): p is NonNullable<typeof p> => p != null);

  return (
    <main className="flex-1">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <div className="max-w-[680px] mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-tertiary mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-text-secondary">{post.title}</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold bg-accent-light text-accent-dark px-3 py-1 rounded-full">
              {CATEGORY_LABELS[post.category] ?? post.category}
            </span>
            <span className="text-xs text-text-tertiary">{post.publishDate}</span>
            <span className="text-xs text-text-tertiary">{readingTime} min read</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold leading-tight">{post.title}</h1>
        </header>

        {/* Intro */}
        <p className="text-text-secondary leading-relaxed text-lg mb-12">{post.intro}</p>

        {/* Shape Breakdown */}
        {post.shapeBreakdown && (
          <section className="mb-12">
            <h2 className="font-heading text-2xl font-bold mb-8">{post.shapeBreakdown.heading}</h2>
            <div className="space-y-8">
              {post.shapeBreakdown.shapes.map((section) => (
                <div key={section.shape} className="border border-border rounded-2xl p-6">
                  <h3 className="font-heading text-xl font-semibold mb-2">{section.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-4">{section.description}</p>
                  <h4 className="text-sm font-semibold mb-2">Recommended:</h4>
                  <ul className="space-y-1.5 mb-4">
                    {section.recommendations.map((rec) => (
                      <li key={rec} className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-success flex-shrink-0 mt-0.5">&#x2713;</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                  {section.avoid && section.avoid.length > 0 && (
                    <>
                      <h4 className="text-sm font-semibold mb-2">Avoid:</h4>
                      <ul className="space-y-1.5 mb-4">
                        {section.avoid.map((item) => (
                          <li key={item} className="text-sm text-text-secondary flex items-start gap-2">
                            <span className="text-red-500 flex-shrink-0 mt-0.5">&#x2715;</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {section.tip && (
                    <div className="bg-accent-light rounded-xl p-4 text-sm text-accent-dark">
                      <span className="font-semibold">Pro tip:</span> {section.tip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comparison */}
        {post.comparison && (
          <section className="mb-12">
            <h2 className="font-heading text-2xl font-bold mb-8">Side-by-Side Comparison</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-border rounded-2xl p-5">
                <h3 className="font-heading text-lg font-semibold mb-3">{post.comparison.shapeA.name}</h3>
                <ul className="space-y-1.5">
                  {post.comparison.shapeA.traits.map((t) => (
                    <li key={t} className="text-sm text-text-secondary">{t}</li>
                  ))}
                </ul>
              </div>
              <div className="border border-border rounded-2xl p-5">
                <h3 className="font-heading text-lg font-semibold mb-3">{post.comparison.shapeB.name}</h3>
                <ul className="space-y-1.5">
                  {post.comparison.shapeB.traits.map((t) => (
                    <li key={t} className="text-sm text-text-secondary">{t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-semibold">Aspect</th>
                    <th className="text-left py-3 pr-4 font-semibold">{post.comparison.shapeA.name}</th>
                    <th className="text-left py-3 font-semibold">{post.comparison.shapeB.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {post.comparison.rows.map((row) => (
                    <tr key={row.aspect} className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">{row.aspect}</td>
                      <td className="py-3 pr-4 text-text-secondary">{row.shapeA}</td>
                      <td className="py-3 text-text-secondary">{row.shapeB}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-text-secondary leading-relaxed mt-6">{post.comparison.summary}</p>
          </section>
        )}

        {/* Steps */}
        {post.steps && (
          <section className="mb-12">
            <h2 className="font-heading text-2xl font-bold mb-8">{post.steps.heading}</h2>
            <div className="space-y-4">
              {post.steps.items.map((step, i) => (
                <div key={step.title} className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white text-sm font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-sm">{step.title}</p>
                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {post.faqs.length > 0 && (
          <section className="mb-12">
            <h2 className="font-heading text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {post.faqs.map((faq) => (
                <div key={faq.question}>
                  <p className="text-sm font-semibold mb-1">{faq.question}</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="text-center py-12 border-t border-border">
          <h2 className="font-heading text-2xl font-bold mb-4">Detect Your Face Shape Now</h2>
          <p className="text-text-secondary mb-6">Upload a photo and get instant AI-powered face shape analysis — 100% free and private.</p>
          <Link
            href="/#try"
            className="inline-block bg-accent text-white font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Try the Detector
          </Link>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 border-t border-border">
            <h2 className="font-heading text-xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="border border-border rounded-2xl p-5 hover:border-accent hover:shadow-md transition-all"
                >
                  <span className="text-xs font-semibold bg-accent-light text-accent-dark px-2 py-0.5 rounded-full">
                    {CATEGORY_LABELS[related.category] ?? related.category}
                  </span>
                  <p className="font-semibold mt-2 text-sm">{related.title}</p>
                  <p className="text-xs text-text-secondary mt-1">{related.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
