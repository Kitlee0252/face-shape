# Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign FaceShapeAI frontend from scaffold to production-ready pages with high-end minimal design (Coral accent), full SEO infrastructure, and recommendation content.

**Architecture:** Next.js App Router with static export. Design system via Tailwind CSS custom theme + Google Fonts (Playfair Display + Inter). All 11 pages (homepage, result, 7 guides, about, privacy, terms) + SEO (sitemap, robots, JSON-LD, OG tags). Recommendation data as static TypeScript files.

**Tech Stack:** Next.js 16, TypeScript, TailwindCSS 4, Google Fonts, `@mediapipe/tasks-vision`

---

## File Map

### Create
```
app/globals.css                          — Design system CSS tokens + Tailwind theme
app/layout.tsx                           — Update: Google Fonts, metadata, body classes
app/page.tsx                             — Homepage: compose all home sections
app/result/page.tsx                      — Result page: two-column layout
app/face-shape/[type]/page.tsx           — Guide pages: SSG with generateStaticParams
app/about/page.tsx                       — About page
app/privacy/page.tsx                     — Privacy policy page
app/terms/page.tsx                       — Terms of service page
app/sitemap.ts                           — Dynamic sitemap for all 11 pages
app/robots.ts                            — robots.txt pointing to sitemap
components/shared/Header.tsx             — Sticky nav with scroll blur
components/shared/Footer.tsx             — Minimal centered footer
components/shared/SEOHead.tsx            — JSON-LD Schema generator
components/home/HeroSection.tsx          — Badge + h1 + upload + privacy pill
components/home/TrustBar.tsx             — 4-stat row
components/home/HowItWorks.tsx           — 3-step section
components/home/ResultsPreview.tsx       — "What You'll Get" demo
components/home/ShapeGrid.tsx            — 7+1 shape cards grid
components/home/FAQ.tsx                  — Accordion + FAQPage Schema
components/result/RecommendationCard.tsx — Image + title + "why it works"
lib/data/faceShapes.ts                   — 7 shape definitions (description, celebrities, FAQs)
lib/data/hairstyles.ts                   — Hairstyle recommendations by shape × gender
lib/data/glasses.ts                      — Glasses recommendations by shape
lib/data/makeup.ts                       — Makeup tips by shape
```

### Modify
```
components/upload/UploadZone.tsx          — Restyle with design system
components/detector/FaceDetector.tsx      — Update loading/error UI
components/result/FiveAnalysisResults.tsx — Restyle cards with design tokens
components/result/FaceShapeResult.tsx     — Delete (merged into FiveAnalysisResults)
```

---

## Task 1: Design System + Layout Shell

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `components/shared/Header.tsx`
- Create: `components/shared/Footer.tsx`

- [ ] **Step 1: Replace globals.css with design tokens**

```css
@import "tailwindcss";

@theme inline {
  --color-primary: #0F172A;
  --color-background: #FFFFFF;
  --color-background-alt: #FAFBFC;
  --color-accent: #E8856C;
  --color-accent-light: #FFF1ED;
  --color-accent-dark: #C4664E;
  --color-text-secondary: #64748B;
  --color-text-tertiary: #94A3B8;
  --color-border: #E2E8F0;
  --color-surface: #F1F5F9;
  --color-success: #22C55E;
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
}

body {
  font-family: var(--font-body);
  color: var(--color-primary);
  background: var(--color-background);
}

h1, h2, h3, h4 {
  font-family: var(--font-heading);
}
```

- [ ] **Step 2: Update layout.tsx — Google Fonts + global metadata**

Replace Geist fonts with Playfair Display + Inter via `next/font/google`. Set global metadata with site title, description, OG tags. Set `lang="en"`. Apply font CSS variables to `<html>`.

- [ ] **Step 3: Create Header.tsx**

Sticky header: logo ("FaceShape" + coral "AI" in Playfair Display), nav links (Face Shapes, How It Works, About), "Try Now" dark pill CTA. Scroll behavior: transparent bg → `backdrop-blur-md` + bottom border after 50px scroll (use `useEffect` + scroll listener). Mobile: hamburger button toggling a slide-down menu.

- [ ] **Step 4: Create Footer.tsx**

Single centered line: `© 2026 FaceShapeAI · Privacy · Terms · About`. Links to `/privacy`, `/terms`, `/about`. `text-sm text-text-tertiary`, top border.

- [ ] **Step 5: Wire Header + Footer into layout.tsx**

Add `<Header />` and `<Footer />` around `{children}` in the root layout.

- [ ] **Step 6: Verify build**

Run: `pnpm build`
Expected: Compiles successfully, no type errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Set up design system: Tailwind tokens, Google Fonts, Header, Footer"
```

---

## Task 2: Homepage — Hero + Upload + Trust Bar

**Files:**
- Create: `components/home/HeroSection.tsx`
- Create: `components/home/TrustBar.tsx`
- Modify: `components/upload/UploadZone.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Restyle UploadZone.tsx**

Update classes to match design system: `border-2 border-dashed border-border rounded-[20px]`, hover state `hover:border-accent hover:bg-accent-light`. Upload icon in coral circle (`bg-accent-light text-accent rounded-xl`). Text: h3 "Drop your photo here", sub "or click to browse · JPG, PNG · Max 5MB" in `text-text-tertiary text-sm`.

- [ ] **Step 2: Create HeroSection.tsx**

Accept `onImage: (file: File) => void` prop to pass through to UploadZone. Structure:
1. Badge: `✦ AI-Powered · 100% Private` (inline-flex, accent-light bg, accent-dark text, pill shape)
2. H1: "Discover Your Face Shape in Seconds" (font-heading, text-[52px] leading-tight, max-w-[700px], mx-auto)
3. Subtitle: description text (text-lg, text-text-secondary, max-w-[520px])
4. `<UploadZone onImage={onImage} />`
5. Privacy pill: shield SVG (green) + "Your photo never leaves your browser" (bg-surface, border, pill, text-xs)

All centered with `text-center`, section padding `py-20 px-4`.

- [ ] **Step 3: Create TrustBar.tsx**

4-stat row: `50,000+` / `< 3s` / `5` / `7` with labels. Numbers in `font-heading text-2xl font-bold`. Labels in `text-xs text-text-tertiary`. Flex row centered with `gap-12`, `border-t border-border py-8`. On mobile: 2×2 grid.

- [ ] **Step 4: Update app/page.tsx**

Import and compose: HeroSection (passing handleImage callback for upload) + TrustBar. Keep FaceDetector for the detection flow — when user uploads from HeroSection, switch to detection mode.

- [ ] **Step 5: Verify build + visual check**

Run: `pnpm build`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add homepage Hero section with upload zone and trust bar"
```

---

## Task 3: Homepage — How It Works + Results Preview + Shape Grid

**Files:**
- Create: `components/home/HowItWorks.tsx`
- Create: `components/home/ResultsPreview.tsx`
- Create: `components/home/ShapeGrid.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create HowItWorks.tsx**

Alt background section (`bg-background-alt`). Section title "How It Works" (font-heading, text-3xl, text-center). 3 steps in flex row (column on mobile). Each step: numbered circle (w-10 h-10, rounded-full, bg-accent-light, text-accent, font-bold) → h4 title → p description. Content:
1. "Upload Photo" / "Drop a front-facing photo or use your camera. We never store your image."
2. "AI Analysis" / "Our AI maps 478 facial landmarks and analyzes 5 dimensions in under 3 seconds."
3. "Get Recommendations" / "See your face shape with visual overlay, plus personalized style recommendations."

- [ ] **Step 2: Create ResultsPreview.tsx**

Alt background section. Title "What You'll Get". Two-column layout (stack on mobile):
- Left: 300×380px rounded placeholder div with gradient bg + colored horizontal lines simulating measurement overlay + "Detection Visualization" label
- Right: stacked preview cards — Face Shape (name + confidence bar), Eye Shape (tags), Nose Shape (tags), Best Hairstyles (3 gray thumbnail squares). Cards: `bg-white rounded-2xl border border-border p-4`. Tags: `bg-accent-light text-accent-dark text-xs rounded-full px-3 py-1`.

- [ ] **Step 3: Create ShapeGrid.tsx**

Section title "7 Face Shape Types". 4-column grid (3 on tablet, 2 on mobile). 7 shape cards + 1 "Mixed" card. Each card: `border border-border rounded-2xl p-6 text-center hover:border-accent hover:shadow-md transition-all cursor-pointer`. Icon (emoji in circle), h4 name, p description. Mixed card: dashed accent border. Cards are `<Link>` to `/face-shape/[type]`. Shape data: inline array of `{ type, icon, label, description }`.

- [ ] **Step 4: Add all three to app/page.tsx**

Compose below TrustBar: `<HowItWorks />` → `<ResultsPreview />` → `<ShapeGrid />`.

- [ ] **Step 5: Verify build**

Run: `pnpm build`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add homepage sections: How It Works, Results Preview, Shape Grid"
```

---

## Task 4: Homepage — FAQ + SEO Schema

**Files:**
- Create: `components/home/FAQ.tsx`
- Create: `components/shared/SEOHead.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create FAQ.tsx**

Accordion component with 8 FAQ items. Each item: question button (flex, justify-between, font-semibold, text-left, py-4, border-b) + collapsible answer div. Use `useState` for open index. Content sourced from PRD:
1. "What is a face shape detector?" — Explains AI-powered tool
2. "How accurate is the face shape detection?" — 478 landmarks, rule-based
3. "Is this tool free to use?" — Yes, completely free
4. "Is my photo safe?" — Browser-only processing, never uploaded
5. "What face shapes can be detected?" — 7 types + mixed
6. "What other facial features are analyzed?" — 5 dimensions explained
7. "How should I take my photo?" — Front-facing, good lighting, hair back
8. "Can I use this on mobile?" — Yes, works on all devices + camera

Also embed FAQPage JSON-LD as a `<script type="application/ld+json">` within the component.

- [ ] **Step 2: Create SEOHead.tsx**

Utility component that accepts `type: 'software' | 'faq' | 'article' | 'breadcrumb'` and renders appropriate JSON-LD `<script>` tag. For homepage: `SoftwareApplication` schema with name, description, applicationCategory, offers (free), aggregateRating. Export as a function `generateSchema(type, data)` returning the JSON object, and a component `<SchemaScript data={...} />` that renders it.

- [ ] **Step 3: Add FAQ to page.tsx, add homepage metadata export**

Add `<FAQ />` after ShapeGrid. Add Next.js `metadata` export with:
- title: "Face Shape Detector — Find Your Face Shape in Seconds | FaceShapeAI"
- description: "Upload your photo to detect your face shape instantly. Get personalized hairstyle, glasses, and makeup recommendations. Free, private, no signup required."
- openGraph: title, description, url (https://faceshapeai.org), siteName, type: 'website'
- twitter: card: 'summary_large_image'
- alternates: canonical: 'https://faceshapeai.org'

- [ ] **Step 4: Verify build**

Run: `pnpm build`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add FAQ with Schema markup and homepage SEO metadata"
```

---

## Task 5: Face Shape Data + Recommendation Content

**Files:**
- Create: `lib/data/faceShapes.ts`
- Create: `lib/data/hairstyles.ts`
- Create: `lib/data/glasses.ts`
- Create: `lib/data/makeup.ts`

- [ ] **Step 1: Create faceShapes.ts**

Export `FACE_SHAPES` — a `Record<FaceShapeType, FaceShapeData>` where `FaceShapeData` contains:
- `name: string` (e.g., "Oval")
- `icon: string` (emoji)
- `tagline: string` (one-line, e.g., "The most balanced face shape")
- `description: string` (2-3 sentences about this shape)
- `characteristics: string[]` (3-4 bullet points)
- `celebrities: { name: string; gender: 'female' | 'male' }[]` (3-4 per shape)
- `avoid: { hairstyles: string[]; glasses: string[] }` (what to avoid)
- `faqs: { question: string; answer: string }[]` (4-5 per shape)
- `relatedShapes: FaceShapeType[]` (2-3 related)

Populate all 7 shapes with real content (real celebrity names, real style advice).

- [ ] **Step 2: Create hairstyles.ts**

Export `HAIRSTYLES` — `Record<FaceShapeType, { female: Hairstyle[]; male: Hairstyle[] }>` where `Hairstyle` = `{ name: string; description: string; whyItWorks: string }`. 5 female + 5 male per shape. No image paths yet (placeholder in P1).

- [ ] **Step 3: Create glasses.ts**

Export `GLASSES` — `Record<FaceShapeType, GlassesRec[]>` where `GlassesRec` = `{ name: string; style: string; whyItWorks: string }`. 5 per shape.

- [ ] **Step 4: Create makeup.ts**

Export `MAKEUP` — `Record<FaceShapeType, MakeupTip[]>` where `MakeupTip` = `{ area: string; tip: string }`. 4-5 tips per shape covering contour, blush, eyebrows, highlight.

- [ ] **Step 5: Verify build (type-check all data files)**

Run: `pnpm build`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add recommendation data: face shapes, hairstyles, glasses, makeup"
```

---

## Task 6: Result Page Redesign

**Files:**
- Create: `app/result/page.tsx`
- Modify: `components/result/FiveAnalysisResults.tsx`
- Create: `components/result/RecommendationCard.tsx`
- Modify: `components/detector/FaceDetector.tsx`
- Delete: `components/result/FaceShapeResult.tsx`

- [ ] **Step 1: Restyle FiveAnalysisResults.tsx**

Update all cards to use design tokens: `bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]`. Titles: `font-heading`. Tags: `bg-accent-light text-accent-dark rounded-full px-3 py-1 text-xs`. Confidence bars: `bg-accent`. Remove emoji prefixes from card titles — use clean text labels. Delete the separate AllScoresCard (fold it into FaceShapeCard as a collapsible "See all scores" section).

- [ ] **Step 2: Create RecommendationCard.tsx**

Props: `{ name: string; description: string; whyItWorks: string }`. Layout: placeholder image area (rounded, bg-surface, h-32) + name (font-semibold) + whyItWorks text (text-sm, text-text-secondary). Card wrapper: `border border-border rounded-2xl p-4 hover:shadow-md transition-shadow`.

- [ ] **Step 3: Update FaceDetector.tsx**

When detection completes, instead of showing results inline, store the `FiveAnalysisResult` in a URL-safe format (base64 JSON of ratios + classifications — NOT keypoints) and navigate to `/result?data=...`. Keep the Canvas overlay image as a data URL in sessionStorage. Update loading spinner to use accent color. Update error state styling.

- [ ] **Step 4: Create app/result/page.tsx**

Client component. Reads `?data=` from URL params, decodes result. Reads canvas image from sessionStorage. Two-column layout on desktop (`lg:grid lg:grid-cols-[400px_1fr] lg:gap-8`):
- Left: canvas image display (sticky top-24) + "Try another photo" link back to `/`
- Right: `<FiveAnalysisResults result={...} />` + Recommendation section

Recommendation section: import data from `lib/data/hairstyles.ts`, `glasses.ts`, `makeup.ts`. Filter by detected primary face shape. Render in 3 sub-sections with `<RecommendationCard>` in a horizontal scroll container on mobile.

Add page metadata: title "Your Face Shape Results | FaceShapeAI", noindex (results are dynamic).

- [ ] **Step 5: Delete FaceShapeResult.tsx**

Remove `components/result/FaceShapeResult.tsx` — its functionality is now in FiveAnalysisResults.

- [ ] **Step 6: Verify build**

Run: `pnpm build`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Redesign result page: two-column layout, recommendations, design tokens"
```

---

## Task 7: Face Shape Guide Pages

**Files:**
- Create: `app/face-shape/[type]/page.tsx`

- [ ] **Step 1: Create the guide page component**

Server component with `generateStaticParams` returning all 7 shape types. `generateMetadata` function producing per-shape title ("Oval Face Shape — Best Hairstyles, Glasses & Tips | FaceShapeAI"), description, canonical URL, OG tags.

Page layout sections:
1. Hero: shape name (font-heading text-5xl) + tagline + characteristic tags (accent-light pills)
2. Celebrity row: names in a flex row with gender indicator
3. Hairstyles: "Best Hairstyles" title + gender tabs (Women/Men, use client-side tab state) + 5 cards each using RecommendationCard
4. Glasses: "Best Glasses" title + 5 RecommendationCards
5. Makeup: "Makeup & Contour Tips" title + numbered list
6. Avoid: "What to Avoid" title + red-accent warning cards
7. FAQ: same accordion component reused from homepage, with shape-specific FAQs + FAQPage Schema
8. CTA: "Find Your Face Shape" accent button linking to `/`
9. Related: "You Might Also Like" + 2-3 ShapeCards linking to related guides

Import all data from `lib/data/faceShapes.ts`, `hairstyles.ts`, `glasses.ts`, `makeup.ts`.

Add BreadcrumbList JSON-LD: Home > Face Shapes > [Type].

- [ ] **Step 2: Verify all 7 routes generate**

Run: `pnpm build`
Expected: routes `/face-shape/oval`, `/face-shape/round`, etc. all listed in output.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add 7 face shape guide pages with SSG, recommendations, SEO"
```

---

## Task 8: Static Pages + SEO Infrastructure

**Files:**
- Create: `app/about/page.tsx`
- Create: `app/privacy/page.tsx`
- Create: `app/terms/page.tsx`
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

- [ ] **Step 1: Create about/page.tsx**

Metadata: title "About FaceShapeAI", canonical. Content: centered single-column (max-w-[680px] mx-auto), Playfair h1, Inter body. Sections: What is FaceShapeAI, How it works (brief), Privacy commitment, Technology (MediaPipe, browser-based), Contact.

- [ ] **Step 2: Create privacy/page.tsx**

Metadata: title "Privacy Policy | FaceShapeAI", canonical. Standard privacy policy covering: no data collection, browser-only processing, no cookies (except analytics), third-party services (GA4, Cloudflare), data retention (none), contact info.

- [ ] **Step 3: Create terms/page.tsx**

Metadata: title "Terms of Service | FaceShapeAI", canonical. Standard terms: service description, acceptable use, disclaimers (not medical/professional advice), limitation of liability, changes to terms.

- [ ] **Step 4: Create app/sitemap.ts**

```typescript
import type { MetadataRoute } from 'next';

const SHAPES = ['oval', 'round', 'square', 'heart', 'oblong', 'diamond', 'triangle'];
const BASE = 'https://faceshapeai.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  return [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    ...SHAPES.map(s => ({
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
```

- [ ] **Step 5: Create app/robots.ts**

```typescript
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/result'] },
    sitemap: 'https://faceshapeai.org/sitemap.xml',
  };
}
```

- [ ] **Step 6: Verify build — all 11+ routes generated**

Run: `pnpm build`
Expected output lists: `/`, `/about`, `/privacy`, `/terms`, `/face-shape/oval`, ..., `/face-shape/triangle`, `/sitemap.xml`, `/robots.txt`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add static pages (about, privacy, terms) + sitemap + robots.txt"
```

---

## Task 9: Final Polish + Cleanup

**Files:**
- Modify: `app/page.tsx` (ensure full homepage composition)
- Delete: `public/mockups/` (design review artifacts)
- Delete: `components/result/FaceShapeResult.tsx` (if not already removed)
- Run: full test suite + build

- [ ] **Step 1: Clean up mockup files**

```bash
rm -rf public/mockups/
```

- [ ] **Step 2: Run full test suite**

Run: `npx vitest run`
Expected: All 68 tests pass (detection logic unchanged).

- [ ] **Step 3: Verify production build**

Run: `pnpm build`
Expected: All routes generated, no errors, no warnings.

- [ ] **Step 4: Commit + push**

```bash
git add -A
git commit -m "Final cleanup: remove mockups, verify all tests and build"
git push
```
