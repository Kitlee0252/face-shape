import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/data/blogPosts';

export const metadata: Metadata = {
  title: 'Face Shape Blog — Tips, Guides & Style Advice | FaceShapeAI',
  description: 'Expert guides on hairstyles, glasses, makeup, and more for every face shape. Find your most flattering look with tips backed by facial geometry.',
  alternates: { canonical: 'https://faceshapeai.org/blog' },
};

const CATEGORY_LABELS: Record<string, string> = {
  styling: 'Styling',
  guide: 'Guide',
  personality: 'Personality',
  comparison: 'Comparison',
};

export default function BlogListingPage() {
  const sorted = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="font-heading text-4xl font-bold text-center mb-4">Blog</h1>
        <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
          Expert guides on hairstyles, glasses, makeup, and more — tailored to every face shape.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="border border-border rounded-2xl p-6 hover:border-accent hover:shadow-md transition-all flex flex-col"
            >
              <span className="text-xs font-semibold bg-accent-light text-accent-dark px-3 py-1 rounded-full self-start mb-3">
                {CATEGORY_LABELS[post.category] ?? post.category}
              </span>
              <h2 className="font-heading text-lg font-semibold mb-2 leading-snug">{post.title}</h2>
              <p className="text-sm text-text-secondary leading-relaxed flex-1">{post.excerpt}</p>
              <span className="text-xs text-text-tertiary mt-4">{post.publishDate}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
