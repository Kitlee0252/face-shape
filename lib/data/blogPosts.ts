import type { FaceShapeType } from '@/lib/detection/types';

export type BlogCategory = 'styling' | 'guide' | 'personality' | 'comparison';

export interface ShapeSection {
  shape: FaceShapeType;
  title: string;
  description: string;
  recommendations: string[];
  avoid?: string[];
  tip?: string;
}

export interface ComparisonRow {
  aspect: string;
  shapeA: string;
  shapeB: string;
}

export interface Step {
  title: string;
  description: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  publishDate: string;
  category: BlogCategory;
  keywords: string[];
  intro: string;
  shapeBreakdown?: {
    heading: string;
    shapes: ShapeSection[];
  };
  comparison?: {
    shapeA: { name: string; traits: string[] };
    shapeB: { name: string; traits: string[] };
    rows: ComparisonRow[];
    summary: string;
  };
  steps?: {
    heading: string;
    items: Step[];
  };
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'face-shape-and-haircut',
    title: 'Face Shape and Haircut: Find the Ideal Haircut for Your Face Shape',
    description: 'Discover the best haircuts for every face shape. Learn how oval, round, square, heart, oblong, diamond, and triangle faces can find their most flattering hairstyles.',
    excerpt: 'Not every haircut works for every face. Learn which hairstyles flatter your specific face shape — backed by styling principles that actually work.',
    publishDate: '2026-04-08',
    category: 'styling',
    keywords: ['face shape haircut', 'best haircut for face shape', 'haircut for my face shape', 'hairstyle face shape guide'],
    intro: 'Choosing the right haircut is one of the most impactful style decisions you can make — and your face shape is the starting point. The goal is simple: create visual balance. A great haircut enhances your natural proportions by adding volume, length, or angles where they complement your features most. Whether your face is round, square, oval, or heart-shaped, understanding your geometry helps you walk into the salon with confidence instead of guesswork.',
    shapeBreakdown: {
      heading: 'Best Haircuts by Face Shape',
      shapes: [
        {
          shape: 'oval',
          title: 'Oval Face: The All-Rounder',
          description: 'Oval faces have balanced proportions — the forehead and jaw are similar in width, with cheekbones slightly wider. This symmetry means most haircuts work well without needing to correct anything.',
          recommendations: [
            'Textured layers that add movement without disrupting balance',
            'Curtain bangs that frame the cheekbones',
            'Bob cuts at chin or shoulder length',
            'Slicked-back styles that showcase balanced proportions',
            'Pixie cuts with soft layers',
          ],
          avoid: ['Very heavy, blunt bangs that shorten the face', 'Excessive top volume that elongates'],
          tip: 'You have the most versatile face shape — experiment freely. The only rule is to avoid styles that dramatically change your proportions.',
        },
        {
          shape: 'round',
          title: 'Round Face: Add Length and Angles',
          description: 'Round faces have similar width and length, with full cheeks and a soft jawline. The goal is to elongate and add definition.',
          recommendations: [
            'Long layers that fall below the chin to create vertical lines',
            'Side-swept bangs that add diagonal movement',
            'Asymmetrical bobs that break the circular silhouette',
            'High-volume styles on top to add height',
            'Textured lobs with face-framing pieces',
          ],
          avoid: ['Chin-length bobs that emphasize roundness', 'Center-parted curtain bangs at cheek level'],
          tip: 'Avoid anything that adds width at the cheeks. Think vertical lines and angles to create the illusion of length.',
        },
        {
          shape: 'square',
          title: 'Square Face: Soften the Angles',
          description: 'Square faces feature a strong, angular jawline with the forehead, cheekbones, and jaw roughly the same width. Softening those strong lines is the key.',
          recommendations: [
            'Soft, wispy layers that break up hard lines',
            'Side-parted styles that create asymmetry',
            'Long waves or curls that soften the jawline',
            'Textured fringe (not blunt) to soften the forehead',
            'Shoulder-length cuts with rounded layers',
          ],
          avoid: ['Blunt, one-length cuts that mirror the angular jawline', 'Severe slicked-back styles that expose the full jaw'],
          tip: 'Texture is your best friend. Anything that adds soft movement around the jawline and temples will balance your naturally strong bone structure.',
        },
        {
          shape: 'heart',
          title: 'Heart Face: Balance the Forehead and Chin',
          description: 'Heart-shaped faces have a wider forehead tapering to a narrow, sometimes pointed chin. The goal is to add width at the jaw and minimize the forehead.',
          recommendations: [
            'Chin-length bobs that add fullness at the jaw',
            'Side-swept bangs that reduce forehead width',
            'Medium-length layers with volume at the ends',
            'Textured lobs that flare outward near the chin',
            'Deep side parts to offset a wider forehead',
          ],
          avoid: ['Pixie cuts that expose the narrow chin', 'Slicked-back styles that highlight the wide forehead'],
          tip: 'Think "wider at the bottom." Styles that add volume or movement at chin level counterbalance the wider forehead.',
        },
        {
          shape: 'oblong',
          title: 'Oblong Face: Add Width, Reduce Length',
          description: 'Oblong faces are noticeably longer than they are wide, with straight sides and a long chin. The goal is to shorten the face visually by adding width.',
          recommendations: [
            'Chin-length or shoulder-length cuts to avoid adding more length',
            'Full, blunt bangs that shorten the forehead',
            'Waves and curls that add horizontal volume',
            'Layered bobs with side-swept fringe',
            'Voluminous styles at ear level',
          ],
          avoid: ['Very long, straight hair that adds vertical lines', 'High top volume without side volume'],
          tip: 'Bangs are your secret weapon — they visually shorten the face. Combine with side volume for maximum effect.',
        },
        {
          shape: 'diamond',
          title: 'Diamond Face: Soften Cheekbones, Add Forehead Width',
          description: 'Diamond faces have narrow forehead and jaw with prominent, wide cheekbones. The goal is to add width at the forehead and chin while softening cheekbones.',
          recommendations: [
            'Side-swept bangs that add width to the forehead',
            'Chin-length bobs that add fullness at the jaw',
            'Tucked-behind-the-ear styles that showcase cheekbones elegantly',
            'Textured layers starting below the cheekbones',
            'Wispy fringe to balance the narrow forehead',
          ],
          avoid: ['Styles that add volume at the cheekbones', 'Slicked-back styles that expose the narrow forehead'],
          tip: 'Your cheekbones are a standout feature — don\'t hide them, just balance them with width at the forehead and jaw.',
        },
        {
          shape: 'triangle',
          title: 'Triangle Face: Add Volume Up Top',
          description: 'Triangle (pear-shaped) faces have a narrow forehead with a wider jawline. The goal is to add width at the temples and forehead to balance the wider lower face.',
          recommendations: [
            'Side-swept bangs that add width at the forehead',
            'Voluminous styles at the crown and temples',
            'Layered cuts that taper narrower toward the jaw',
            'Textured pixie cuts with height on top',
            'Soft waves starting above the ears',
          ],
          avoid: ['Chin-length bobs that emphasize a wide jaw', 'Flat, straight styles that make the forehead look narrower'],
          tip: 'Volume at the top and temples is key. The more width you add above the cheekbones, the more balanced your face will look.',
        },
      ],
    },
    faqs: [
      {
        question: 'How do I know which haircut suits my face shape?',
        answer: 'First, determine your face shape by measuring your forehead, cheekbones, jawline, and face length — or use an AI face shape detector for instant results. Then follow the principle of balance: add volume where your face is narrower and keep things sleeker where it\'s wider.',
      },
      {
        question: 'Can I still get a haircut that isn\'t "recommended" for my face shape?',
        answer: 'Absolutely. Face shape guidelines are starting points, not rules. Personal style, hair texture, and lifestyle all matter. A skilled stylist can adapt almost any cut to work with your features.',
      },
      {
        question: 'Does hair texture affect which haircuts work for my face shape?',
        answer: 'Yes. Curly hair naturally adds volume and width, which is great for oblong faces but may need control for round faces. Fine, straight hair may need layers or texturizing to achieve the volume recommended for certain face shapes.',
      },
      {
        question: 'How often should I change my haircut based on face shape?',
        answer: 'Your face shape doesn\'t change, so the principles stay the same. However, trends evolve and your preferences may shift. Use your face shape as a constant guide while experimenting with current styles.',
      },
    ],
    relatedSlugs: ['celebrity-face-shapes', 'how-to-determine-face-shape'],
  },
];

/** Lookup a blog post by slug. Returns undefined if not found. */
export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
