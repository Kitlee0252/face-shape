# Frontend Design Spec — FaceShapeAI

**Style**: High-end minimal (Glossier/Aesop aesthetic)
**Accent**: Coral (#E8856C)
**Approved**: 2026-04-07

---

## 1. Design System

### Typography
- **Headings**: Playfair Display (serif), weights 500/700
- **Body**: Inter (sans-serif), weights 400/500/600
- **Sizing**: h1 52px, h2 32px, h3 16px, body 14-18px, caption 12px

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#0F172A` | Text, nav background |
| `--background` | `#FFFFFF` | Primary background |
| `--background-alt` | `#FAFBFC` | Alternating section background |
| `--accent` | `#E8856C` | CTA, active states, progress bars |
| `--accent-light` | `#FFF1ED` | Tags, badges, hover backgrounds |
| `--accent-dark` | `#C4664E` | Accent text on light backgrounds |
| `--text-secondary` | `#64748B` | Body text, descriptions |
| `--text-tertiary` | `#94A3B8` | Captions, labels |
| `--border` | `#E2E8F0` | Card borders, dividers |
| `--surface` | `#F1F5F9` | Input backgrounds, skeleton loaders |
| `--success` | `#22C55E` | Privacy badge |

### Spacing & Radius
- Section gap: 64px
- Element gap: 16-32px
- Button radius: 999px (pill)
- Card radius: 16px
- Upload zone radius: 20px
- Shadow (cards): `0 4px 12px rgba(0,0,0,0.06)`
- Shadow (elevated): `0 8px 24px rgba(0,0,0,0.1)`

---

## 2. Page Designs

### 2.1 Homepage (`/`)

**Sections in order:**

1. **Header** (sticky)
   - Logo: "FaceShape" + "AI" in accent color, Playfair Display
   - Links: Face Shapes, How It Works, About
   - CTA button: "Try Now" (dark pill)
   - Scroll behavior: transparent → backdrop-blur + subtle border
   - Mobile: hamburger menu

2. **Hero**
   - Badge: "✦ AI-Powered · 100% Private" (accent-light bg)
   - H1: "Discover Your Face Shape in Seconds" (Playfair, 52px)
   - Subtitle: "Upload a photo and get personalized hairstyle, glasses, and makeup recommendations — all processed in your browser." (Inter, 18px, secondary color)
   - Upload zone: dashed border, upload icon, "Drop your photo here", "or click to browse · JPG, PNG · Max 5MB"
   - Upload hover: border → accent, background → accent-light
   - Privacy pill below upload: shield icon (green) + "Your photo never leaves your browser"

3. **Trust Bar**
   - 4 stats in a row, centered, separated by section border
   - "50,000+ Faces analyzed" / "< 3s Detection time" / "5 Analysis dimensions" / "7 Face shape types"
   - Numbers: Playfair 24px bold. Labels: Inter 12px tertiary.

4. **How It Works** (alt background)
   - Section title: "How It Works" (Playfair, 32px, centered)
   - 3 steps in a row, each with: numbered circle (accent-light bg, accent text) → h4 title → description
   - Step 1: Upload Photo. Step 2: AI Analysis. Step 3: Get Recommendations.

5. **What You'll Get** (alt background)
   - Section title: "What You'll Get"
   - Left: photo placeholder with colored measurement overlay lines (simulating Canvas visualization)
   - Right: stacked result cards showing Face Shape (with confidence bar), Eye Shape (tags), Nose Shape (tags), Best Hairstyles (thumbnail grid)

6. **7 Face Shape Types**
   - Section title: "7 Face Shape Types"
   - 4-column grid (2 on mobile), 7 shape cards + 1 "Mixed" card (dashed accent border)
   - Each card: icon → name → one-line description
   - Cards link to `/face-shape/[type]`
   - Hover: accent border + subtle shadow lift

7. **FAQ**
   - Accordion component, 8-10 questions
   - FAQPage JSON-LD Schema markup
   - Questions from PRD: how accurate, is it free, privacy, what face shapes, etc.

8. **Footer**
   - Single centered line: © 2026 FaceShapeAI · Privacy · Terms · About

### 2.2 Result Page (`/result`)

**Layout**: two-column on desktop, single-column stack on mobile.

**Left column** (sticky on desktop):
- Canvas overlay: user photo with landmark dots (green, small), measurement dashed lines (red/yellow/cyan/purple), jaw angle arc (orange), labels
- "Try another photo" button below

**Right column** (scrollable):
- **Face Shape card**: label → shape name (Playfair, 28px) → confidence bar (accent fill) → percentage → secondary shape if detected ("Mixed with Heart, 72%")
- **Eye Shape card**: label → tags (slope, size, spacing) → measurement stats grid
- **Nose Shape card**: label → tags (width, length) → stats
- **Lip Shape card**: label → tags (thickness, width) → upper/lower ratio stat
- **Eyebrow Shape card**: label → tags (shape, slope) → arch angle stat
- **All Scores card**: 7 shapes listed with horizontal bars, sorted by confidence

**Recommendation section** (below both columns, full-width):
- "Recommended for You" section title
- Sub-sections: Hairstyles / Glasses / Makeup Tips
- Each recommendation: image thumbnail (rounded) + title + "Why it works" explanation
- 3-5 items per category, horizontal scroll on mobile

### 2.3 Face Shape Guide Pages (`/face-shape/[type]`)

**SSG with `generateStaticParams`** for all 7 types.

**Layout**:
1. **Hero**: Shape name (Playfair, 48px) + characteristic description + accent-colored feature tags
2. **Celebrity examples**: 3-4 names with photos in a horizontal row
3. **Best Hairstyles**: gender tabs (Women / Men), 5 cards each with photo + name + explanation
4. **Best Glasses**: 5 cards with frame photo + style name + why it suits
5. **Makeup Tips**: numbered list with section illustrations
6. **What to Avoid**: red-flagged items (hairstyles/glasses to avoid)
7. **FAQ**: 4-5 shape-specific questions with Schema markup
8. **CTA**: "Find Your Face Shape" button linking back to homepage tool
9. **Related Shapes**: "You might also like" — 2-3 related shape cards

### 2.4 Static Pages (About / Privacy / Terms)

- Centered single-column, max-width 680px
- Playfair h1, Inter body
- Minimal styling, generous line height (1.7)

---

## 3. Component Inventory

| Component | File | Notes |
|-----------|------|-------|
| Header | `components/shared/Header.tsx` | Sticky, transparent→blur on scroll, hamburger on mobile |
| Footer | `components/shared/Footer.tsx` | Single centered line |
| UploadZone | `components/upload/UploadZone.tsx` | Existing, restyle with design system |
| CanvasOverlay | `components/detector/CanvasOverlay.tsx` | Existing, no design changes |
| FaceDetector | `components/detector/FaceDetector.tsx` | Existing, update loading/error states styling |
| FiveAnalysisResults | `components/result/FiveAnalysisResults.tsx` | Existing, restyle cards with design system |
| RecommendationCard | `components/result/RecommendationCard.tsx` | New: image + title + explanation |
| ShapeCard | `components/home/ShapeCard.tsx` | New: icon + name + description, links to guide |
| HowItWorks | `components/home/HowItWorks.tsx` | New: 3-step with numbered circles |
| TrustBar | `components/home/TrustBar.tsx` | New: 4 stats row |
| HeroSection | `components/home/HeroSection.tsx` | New: badge + h1 + subtitle + upload + privacy pill |
| FAQ | `components/home/FAQ.tsx` | New: accordion + FAQPage Schema |
| ResultsPreview | `components/home/ResultsPreview.tsx` | New: "What You'll Get" mockup section |
| SEOHead | `components/shared/SEOHead.tsx` | New: JSON-LD Schema generator |

---

## 4. Responsive Breakpoints

| Breakpoint | Layout changes |
|------------|---------------|
| ≥1024px | Full layout. Result page: 2 columns. Shape grid: 4 columns. |
| 768-1023px | Shape grid: 3 columns. Result page: 2 columns (narrower). |
| <768px | Single column. Result photo stacks above cards. Shape grid: 2 columns. Nav → hamburger. Recommendations: horizontal scroll. |

---

## 5. Global CSS Setup

- TailwindCSS with custom theme extending design tokens above
- Google Fonts: Playfair Display (500, 700) + Inter (400, 500, 600)
- Dark mode: not in MVP scope (add in P1)
- Animations: subtle only — hover scale on cards (1.02), fade-in on scroll for sections, spinner for loading state

---

## 6. Data Sources

- **Recommendation data** (hairstyles, glasses, makeup): static TypeScript files in `lib/data/` — `hairstyles.ts`, `glasses.ts`, `makeup.ts`. Keyed by face shape type. Each entry: name, image path, description ("why it works"). Images in `public/images/hairstyles/` and `public/images/glasses/`. AI-assisted content generation, manually curated.
- **Face shape guide content**: static data in `lib/data/faceShapes.ts`. Each shape: description, characteristics, celebrity examples, avoid list, FAQs. Used by both homepage ShapeCard grid and guide pages.
- **Trust bar counter**: hardcoded initially ("50,000+"), replace with Cloudflare KV in P1.

---

## 7. SEO Infrastructure

- Each page: unique `<title>` + `<meta description>` via Next.js `metadata` export
- Open Graph + Twitter Card meta tags on all pages
- JSON-LD: `SoftwareApplication` (homepage), `FAQPage` (homepage + guide pages), `Article` + `BreadcrumbList` (guide pages)
- `app/sitemap.ts`: all 11 pages with `lastmod`
- `app/robots.ts`: allow all, point to sitemap
- Canonical: self-referencing on every page
- `next.config.ts`: redirect www → non-www (or vice versa) via Cloudflare Page Rules
