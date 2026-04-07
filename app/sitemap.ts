import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const SHAPES = ['oval', 'round', 'square', 'heart', 'oblong', 'diamond', 'triangle'];
const BASE = 'https://faceshapeai.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  return [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    ...SHAPES.map((s) => ({
      url: `${BASE}/face-shape/${s}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
  ];
}
