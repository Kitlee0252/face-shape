# Blog System Design Spec

## Overview

Add a data-driven blog system to faceshapeai.org, covering 10 SEO-targeted articles. One fixed page template renders all posts — adding a new article only requires adding data to `blogPosts.ts`, no page code changes.

## Motivation

- Main competitor (faceshapedetector.ai) has 10 blog posts covering face shape long-tail keywords
- We currently have 0 blog pages — missing significant organic traffic
- 4 of our 10 topics target keywords the competitor does NOT cover (glasses, sunglasses, makeup, beard)

## Blog Topics (10 articles)

| # | Slug | Target Keyword | Strategy |
|---|------|---------------|----------|
| 1 | `face-shape-and-haircut` | face shape haircut, best haircut for face shape | Match competitor |
| 2 | `celebrity-face-shapes` | celebrity face shapes | Match competitor |
| 3 | `glasses-for-face-shape` | glasses for face shape, eyeglasses face shape | Competitor gap |
| 4 | `sunglasses-for-face-shape` | sunglasses for face shape | Competitor gap |
| 5 | `face-shape-and-personality` | face shape personality, face shape meaning | Match competitor |
| 6 | `face-shape-makeup-contouring` | face shape contouring, makeup for face shape | Competitor gap |
| 7 | `beard-for-face-shape` | beard style face shape, best beard | Competitor gap |
| 8 | `hat-for-face-shape` | hat for face shape | Match competitor |
| 9 | `oval-vs-round-face` | oval vs round face, difference | Match competitor |
| 10 | `how-to-determine-face-shape` | how to determine face shape, measure face shape | Funnel entry |

## Architecture

### File Structure

```
app/blog/
  page.tsx                    # Blog listing page (SSG)
  [slug]/
    page.tsx                  # Blog post template (SSG, one template for all 10)

lib/data/
  blogPosts.ts                # All blog post data + types
```

### Pattern

Follows the exact same pattern as existing face shape guide pages:
- `generateStaticParams()` generates all 10 pages at build time
- `generateMetadata()` produces per-post title, description, canonical, OG tags
- Data sourced from `lib/data/blogPosts.ts` (like `faceShapes.ts`)
- Template has conditional sections — renders only what the data provides

## Data Structure

```typescript
// lib/data/blogPosts.ts

import type { FaceShapeType } from '@/lib/detection/types';

type BlogCategory = 'styling' | 'guide' | 'personality' | 'comparison';

interface ShapeSection {
  shape: FaceShapeType;
  title: string;              // e.g., "Oval Face: The All-Rounder"
  description: string;
  recommendations: string[];
  avoid?: string[];
  tip?: string;
}

interface ComparisonRow {
  aspect: string;             // e.g., "Jawline"
  shapeA: string;             // e.g., "Rounded, soft"
  shapeB: string;             // e.g., "Angular, defined"
}

interface Step {
  title: string;              // e.g., "Measure Your Forehead"
  description: string;
}

export interface BlogPost {
  // --- Metadata ---
  slug: string;
  title: string;
  description: string;        // meta description (< 160 chars)
  excerpt: string;            // listing page summary (1-2 sentences)
  publishDate: string;        // ISO date "2026-04-08"
  category: BlogCategory;
  keywords: string[];

  // --- Content sections (all optional except intro + faqs) ---
  intro: string;

  shapeBreakdown?: {
    heading: string;           // e.g., "Best Haircuts by Face Shape"
    shapes: ShapeSection[];
  };

  comparison?: {
    shapeA: { name: string; traits: string[] };
    shapeB: { name: string; traits: string[] };
    rows: ComparisonRow[];
    summary: string;
  };

  steps?: {
    heading: string;           // e.g., "How to Measure Your Face Shape"
    items: Step[];
  };

  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  // 10 entries here
];
```

### Section Usage by Post

| # | Slug | intro | shapeBreakdown | comparison | steps | faqs |
|---|------|:-----:|:--------------:|:----------:|:-----:|:----:|
| 1 | face-shape-and-haircut | Y | Y | | | Y |
| 2 | celebrity-face-shapes | Y | Y | | | Y |
| 3 | glasses-for-face-shape | Y | Y | | | Y |
| 4 | sunglasses-for-face-shape | Y | Y | | | Y |
| 5 | face-shape-and-personality | Y | Y | | | Y |
| 6 | face-shape-makeup-contouring | Y | Y | | | Y |
| 7 | beard-for-face-shape | Y | Y | | | Y |
| 8 | hat-for-face-shape | Y | Y | | | Y |
| 9 | oval-vs-round-face | Y | | Y | | Y |
| 10 | how-to-determine-face-shape | Y | | | Y | Y |

## Page Templates

### Blog Listing Page (`app/blog/page.tsx`)

- Static page, no client-side state
- Responsive card grid: 1 col mobile, 2 col `sm:`, 3 col `lg:`
- Each card: title, excerpt, date, category badge
- Sorted by publishDate descending
- SEO: title "Face Shape Blog — Tips, Guides & Style Advice", canonical `/blog`

### Blog Post Page (`app/blog/[slug]/page.tsx`)

Template sections rendered in order (skipped if data absent):

1. **Breadcrumb** — Home > Blog > {post title}
2. **Hero** — title (h1), category badge, publish date, reading time (calculated from content length)
3. **Intro** — opening paragraphs
4. **Shape Breakdown** — section heading (h2) + cards for each face shape, each card has:
   - Shape name + icon (h3)
   - Description paragraph
   - Recommendations list (ul)
   - Avoid list (ul, if present)
   - Pro tip callout (if present)
5. **Comparison Table** — two-column trait lists + difference table rows (for oval-vs-round)
6. **Steps** — numbered step cards with title + description (for how-to-determine)
7. **FAQ** — accordion-style Q&A with FAQPage JSON-LD
8. **CTA** — "Detect Your Face Shape Now" button linking to `/#try`
9. **Related Posts** — horizontal scroll of related post cards

### Reading Time

Calculated at render time: total character count of intro + all section text / 1500 (average reading speed in chars/min for English), rounded up.

## SEO

### Per-Post Metadata (`generateMetadata`)

```typescript
{
  title: `${post.title} | FaceShapeAI`,
  description: post.description,
  alternates: { canonical: `https://faceshapeai.org/blog/${post.slug}` },
  openGraph: {
    title: post.title,
    description: post.excerpt,
    url: `https://faceshapeai.org/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.publishDate,
  }
}
```

### JSON-LD Schemas

Each blog post includes:

1. **BlogPosting** — title, description, datePublished, author (FaceShapeAI), url
2. **FAQPage** — from `post.faqs` array
3. **BreadcrumbList** — Home > Blog > {post title}

### Sitemap Update

```typescript
// app/sitemap.ts — add:
...BLOG_POSTS.map((post) => ({
  url: `${BASE}/blog/${post.slug}`,
  lastModified: post.publishDate,
  changeFrequency: 'weekly' as const,
  priority: 0.7,
})),
```

## Navigation Update

Add "Blog" to Header navigation:

```typescript
const navLinks = [
  { label: "Face Shapes", href: "/#shapes" },
  { label: "How It Works", href: "/#how" },
  { label: "Blog", href: "/blog" },        // NEW
  { label: "About", href: "/about" },
];
```

## Styling

Follows existing project patterns:

- **Container**: `max-w-[680px]` for post content (matches About page)
- **Headings**: `font-heading` (Playfair Display), h1 `text-3xl`, h2 `text-2xl`, h3 `text-xl`
- **Body**: `font-body` (Inter), `text-text-secondary` for paragraphs
- **Cards**: `border border-border rounded-2xl p-6` with hover shadow
- **Category badge**: small pill with `bg-accent-light text-accent-dark`
- **FAQ accordion**: click to expand, smooth transition
- **CTA button**: `bg-primary text-white rounded-full px-8 py-3`
- **Responsive**: `px-4` mobile, grid breakpoints at `sm:` and `lg:`

## Out of Scope

- Comments system
- Author profiles (single author: FaceShapeAI)
- Blog images/thumbnails (can add later via image generation)
- Category filtering on listing page (10 posts don't need it)
- Pagination (10 posts fit one page)
- RSS feed
