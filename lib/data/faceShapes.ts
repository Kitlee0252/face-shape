import type { FaceShapeType } from '@/lib/detection/types';

export interface FaceShapeData {
  name: string;
  icon: string;
  tagline: string;
  description: string;
  characteristics: string[];
  celebrities: { name: string; gender: 'female' | 'male' }[];
  avoid: { hairstyles: string[]; glasses: string[] };
  faqs: { question: string; answer: string }[];
  relatedShapes: FaceShapeType[];
}

export const FACE_SHAPES: Record<FaceShapeType, FaceShapeData> = {
  oval: {
    name: 'Oval',
    icon: '🥚',
    tagline: 'The universally balanced face shape',
    description:
      'An oval face is slightly longer than it is wide, with a gently rounded jawline and forehead that are roughly the same width. Often considered the most versatile face shape, it pairs well with nearly every hairstyle, frame, and makeup approach.',
    characteristics: [
      'Face length is about one and a half times the width',
      'Forehead and jaw are approximately the same width',
      'Cheekbones are the widest part of the face',
      'Jawline curves gently with no sharp angles',
    ],
    celebrities: [
      { name: 'Beyoncé', gender: 'female' },
      { name: 'George Clooney', gender: 'male' },
      { name: 'Jessica Alba', gender: 'female' },
      { name: 'Idris Elba', gender: 'male' },
    ],
    avoid: {
      hairstyles: [
        'Excessive volume on top that elongates the face',
        'Heavy, blunt bangs that shorten the face',
        'Overly slicked-back styles that expose forehead width',
      ],
      glasses: [
        'Frames that are wider than the broadest part of the face',
        'Oversized frames that overwhelm your balanced proportions',
        'Very narrow frames that look undersized',
      ],
    },
    faqs: [
      {
        question: 'What makes an oval face shape so versatile?',
        answer:
          'The oval face has naturally balanced proportions — the forehead and jaw are similar in width, while the cheekbones sit as the widest point. This symmetry means most hairstyles, glasses, and makeup techniques work harmoniously without needing to correct or offset any dominant feature.',
      },
      {
        question: 'How do I know if my face is oval and not oblong?',
        answer:
          'Both shapes are longer than they are wide, but the key difference is degree. An oval face has a length-to-width ratio around 1.5:1 with soft curves, while an oblong face is noticeably longer (closer to 1.7:1 or more) with straighter sides and less curvature at the jaw.',
      },
      {
        question: 'What bangs work best for an oval face?',
        answer:
          'Almost any bang style flatters an oval face. Side-swept bangs add movement, curtain bangs frame the cheekbones beautifully, and wispy fringe keeps the look soft. The only style to use cautiously is a very heavy, blunt fringe, which can visually shorten the face.',
      },
      {
        question: 'Should I contour an oval face?',
        answer:
          'Since the oval shape is already well-proportioned, contouring is about enhancing rather than reshaping. Light contour beneath the cheekbones and along the temples adds definition without altering the natural balance. Focus on highlighting the high points for a radiant finish.',
      },
      {
        question: 'Do oval faces change with age?',
        answer:
          'All faces evolve over time. Oval faces may appear slightly more elongated as skin loses elasticity and soft tissue shifts downward. Maintaining volume in the mid-face area through hairstyle choices and makeup techniques helps preserve the balanced look.',
      },
    ],
    relatedShapes: ['oblong', 'diamond'],
  },

  round: {
    name: 'Round',
    icon: '🌕',
    tagline: 'Soft curves and youthful symmetry',
    description:
      'A round face is nearly as wide as it is long, with full cheeks, a rounded chin, and few angular features. This shape tends to look youthful and approachable, and styling strategies often focus on adding definition and the illusion of length.',
    characteristics: [
      'Face width and length are almost equal',
      'Full, prominent cheeks are the widest area',
      'Rounded chin without a strong point',
      'Soft, curved hairline with minimal angles',
    ],
    celebrities: [
      { name: 'Selena Gomez', gender: 'female' },
      { name: 'Leonardo DiCaprio', gender: 'male' },
      { name: 'Chrissy Teigen', gender: 'female' },
      { name: 'Jack Black', gender: 'male' },
    ],
    avoid: {
      hairstyles: [
        'Chin-length bobs that emphasize roundness',
        'Heavy side volume without height on top',
        'Round, uniform curls that mirror the face shape',
      ],
      glasses: [
        'Small circular frames that echo the round shape',
        'Rimless frames that lack structural contrast',
        'Very curved oval frames without angles',
      ],
    },
    faqs: [
      {
        question: 'How can I make my round face look slimmer?',
        answer:
          'The goal is to create the illusion of length and angles. Hairstyles with volume at the crown, side-swept bangs, and layers that fall below the chin all help elongate the face. Strategic contouring along the temples and under the cheekbones adds definition without looking overdone.',
      },
      {
        question: 'What is the difference between a round face and a square face?',
        answer:
          'Both shapes have similar width and length, but the defining difference is the jawline. A round face has a curved, soft jaw and chin, while a square face features a strong, angular jawline with a broad, flat chin. The overall impression of a round face is curves; a square face is angles.',
      },
      {
        question: 'Are round faces more youthful-looking?',
        answer:
          'Yes, the soft curves and fuller cheeks associated with round faces tend to appear more youthful. The lack of sharp angles gives a naturally friendly, approachable look. This also means round faces often age gracefully, as the fullness in the cheeks resists the hollowing that can make other shapes appear older.',
      },
      {
        question: 'What earrings suit a round face?',
        answer:
          'Long, dangling earrings and angular drop styles work best because they draw the eye downward and create vertical lines. Avoid large hoops and round button studs that reinforce the circular shape. Geometric or rectangular drops offer a flattering contrast.',
      },
      {
        question: 'Should I avoid bangs with a round face?',
        answer:
          'Not at all — the right bangs can actually enhance a round face. Side-swept and curtain bangs create diagonal lines that slim the face, while a deep side part adds asymmetry. The only style to skip is a straight, heavy blunt fringe, which cuts across the widest point and shortens the face.',
      },
    ],
    relatedShapes: ['oval', 'square'],
  },

  square: {
    name: 'Square',
    icon: '⬜',
    tagline: 'Strong angles and a defined jawline',
    description:
      'A square face is characterized by a broad forehead, wide cheekbones, and a strong, angular jawline that is roughly the same width as the forehead. The face length and width are similar, creating a powerful, structured appearance that photographs beautifully.',
    characteristics: [
      'Forehead, cheekbones, and jaw are nearly equal in width',
      'Strong, angular jawline with minimal taper',
      'Face width and length are close to equal',
      'Broad, relatively flat chin',
    ],
    celebrities: [
      { name: 'Angelina Jolie', gender: 'female' },
      { name: 'Brad Pitt', gender: 'male' },
      { name: 'Olivia Wilde', gender: 'female' },
      { name: 'Henry Cavill', gender: 'male' },
    ],
    avoid: {
      hairstyles: [
        'Blunt, jaw-length bobs that highlight the angular jaw',
        'Straight, flat hair with a center part',
        'Very short buzz cuts that expose the full jaw structure',
      ],
      glasses: [
        'Boxy, angular frames that duplicate the jaw shape',
        'Very small frames that look disproportionate',
        'Narrow rectangular frames that emphasize width',
      ],
    },
    faqs: [
      {
        question: 'How do I soften a square face shape?',
        answer:
          'Introduce curves and softness through styling. Hairstyles with layers, waves, and side-swept elements break up the angular lines. Rounded or oval glasses frames provide contrast to the jaw. In makeup, contouring along the outer jawline corners and using a rounded blush placement draws attention to the center of the face.',
      },
      {
        question: 'Is a square face shape attractive?',
        answer:
          'Absolutely. The strong jawline and balanced proportions of a square face are highly photogenic and project confidence. Many top models and actors have square faces precisely because the defined bone structure catches light dramatically. The key is working with the angles, not against them.',
      },
      {
        question: 'What length hair is best for a square face?',
        answer:
          'Medium to long lengths tend to be most flattering because they soften the jawline. Layers that start below the chin draw the eye past the widest point of the jaw. If you prefer shorter styles, opt for textured, piece-y cuts rather than blunt lines that sit at jaw level.',
      },
      {
        question: 'Can I wear my hair up with a square face?',
        answer:
          'Yes — the key is to leave some soft, face-framing pieces loose around the temples and jawline. A messy bun with tendrils, a loose low chignon, or a textured ponytail with volume on top all work beautifully. Avoid overly slicked, tight updos that fully expose the angular jawline.',
      },
      {
        question: 'How does a square face differ from a rectangle or oblong face?',
        answer:
          'The main difference is the length-to-width ratio. A square face has nearly equal width and length, while an oblong (rectangular) face is noticeably longer than it is wide. Both share the strong, angular jawline, but the oblong face has more vertical space between the forehead and chin.',
      },
    ],
    relatedShapes: ['round', 'oblong'],
  },

  heart: {
    name: 'Heart',
    icon: '💛',
    tagline: 'Wide at the brow, delicate at the chin',
    description:
      'A heart-shaped face features a broad forehead and cheekbones that taper to a narrow, often pointed chin. This creates a natural inverted triangle that is elegant and distinctive. Styling focuses on balancing the wider upper face with the narrower lower third.',
    characteristics: [
      'Forehead is the widest part of the face',
      'Cheekbones are wide and prominent',
      'Chin is narrow and may come to a soft point',
      'Face tapers significantly from temples to jawline',
    ],
    celebrities: [
      { name: 'Reese Witherspoon', gender: 'female' },
      { name: 'Ryan Gosling', gender: 'male' },
      { name: 'Scarlett Johansson', gender: 'female' },
      { name: 'Nick Jonas', gender: 'male' },
    ],
    avoid: {
      hairstyles: [
        'Heavy volume at the temples that widens the forehead',
        'Slicked-back styles that emphasize the broad upper face',
        'Very short pixie cuts without fringe to offset the forehead',
      ],
      glasses: [
        'Top-heavy frames like aviators that mirror the wider forehead',
        'Narrow bottom-rimless frames that accentuate the chin',
        'Very wide frames that extend past the temples',
      ],
    },
    faqs: [
      {
        question: 'What bangs are best for a heart-shaped face?',
        answer:
          'Side-swept bangs are the gold standard for heart shapes because they break up the broad forehead diagonally. Curtain bangs that part in the middle and sweep to the sides also work well. Wispy, layered fringe softens the forehead without the heaviness of a blunt cut.',
      },
      {
        question: 'How can I add width to my narrow chin?',
        answer:
          'Hairstyles with volume or curl at chin level are the most effective way to balance the lower face. A layered bob, waves that start at the jaw, or a lob with flipped ends all create the illusion of width. In makeup, applying highlighter along the chin and jawline brings light to the lower face.',
      },
      {
        question: "What is the difference between a heart face and an inverted triangle?",
        answer:
          "They are very similar and often used interchangeably. The subtle distinction is that a classic heart shape includes a widow's peak at the hairline, while an inverted triangle may have a straighter hairline. Both share the wider forehead tapering to a narrower chin.",
      },
      {
        question: 'Should I avoid updos with a heart-shaped face?',
        answer:
          'Not at all, but technique matters. Avoid very tight, high buns that pull everything away from the forehead. Instead, choose styles with loose pieces framing the temples and some volume at or below the ears to balance the width. A low textured bun or side-swept updo is especially flattering.',
      },
      {
        question: 'Why do my glasses always feel top-heavy?',
        answer:
          'Because the heart shape is widest at the forehead, frames that sit high or have thick top bars can exaggerate this. Look for frames with low-set temples, bottom-heavy designs, or light, thin upper rims. Oval and round frames help soften the angular upper face and draw attention downward.',
      },
    ],
    relatedShapes: ['diamond', 'triangle'],
  },

  oblong: {
    name: 'Oblong',
    icon: '📐',
    tagline: 'Elongated and elegantly proportioned',
    description:
      'An oblong (sometimes called rectangular) face is noticeably longer than it is wide, with a forehead, cheekbones, and jaw that are fairly similar in width. The straight sides and extended length give a distinguished, statuesque look. Styling aims to add width and minimize excess length.',
    characteristics: [
      'Face is significantly longer than it is wide',
      'Forehead, cheekbones, and jaw are similar in width',
      'Sides of the face appear relatively straight',
      'Chin may be flat or slightly rounded without strong taper',
    ],
    celebrities: [
      { name: 'Sarah Jessica Parker', gender: 'female' },
      { name: 'Adam Driver', gender: 'male' },
      { name: 'Liv Tyler', gender: 'female' },
      { name: 'Ben Affleck', gender: 'male' },
    ],
    avoid: {
      hairstyles: [
        'Long, straight hair with no layers that drags the face down',
        'Excessive height or volume at the crown',
        'Very short styles that expose the full face length',
      ],
      glasses: [
        'Small, narrow frames that get lost on the longer face',
        'Tiny round frames that emphasize length',
        'Frames with high-set temples that add vertical height',
      ],
    },
    faqs: [
      {
        question: 'How can I make my oblong face look shorter?',
        answer:
          'Focus on adding width and breaking up the vertical line. Side-swept bangs or a full fringe cut across the forehead, visually shortening the face. Hairstyles with volume at the sides — such as waves, curls, or a layered bob — add horizontal dimension. Wide glasses frames also help.',
      },
      {
        question: 'What is the best hair length for an oblong face?',
        answer:
          'Medium-length styles, especially those that hit between the chin and shoulders, are ideal. This range adds width at the jaw without dragging the face down. If you prefer long hair, add layers that start at the cheekbones to create volume in the mid-face area.',
      },
      {
        question: 'Are bangs a good idea for an oblong face?',
        answer:
          'Bangs are one of the most effective tools for balancing an oblong face. They visually shorten the forehead and reduce the overall perceived length. Side-swept, curtain, and blunt bangs all work — blunt bangs create the strongest horizontal line and are particularly effective.',
      },
      {
        question: 'What glasses shape adds width to an oblong face?',
        answer:
          'Oversized, wide frames are your friend. Aviators, large wayfarers, and bold rectangular frames that extend slightly past the face add horizontal balance. Decorative or colored temples also draw the eye outward. Avoid small, narrow frames that look undersized on the longer face.',
      },
      {
        question: 'How is an oblong face different from an oval face?',
        answer:
          'The primary difference is the length-to-width ratio. An oval face has a moderate ratio (about 1.5:1) with curved contours, while an oblong face is more elongated (1.7:1 or higher) with straighter sides. Oblong faces also tend to have a less curved jawline and more uniform width throughout.',
      },
    ],
    relatedShapes: ['oval', 'square'],
  },

  diamond: {
    name: 'Diamond',
    icon: '💎',
    tagline: 'Dramatic cheekbones and a sculpted silhouette',
    description:
      'A diamond face shape is defined by wide, high cheekbones that sit as the dominant feature, with a narrow forehead and a narrow, angular jawline. This dramatic bone structure creates striking angles and is relatively rare, making it a standout shape that responds beautifully to strategic styling.',
    characteristics: [
      'Cheekbones are significantly wider than forehead and jaw',
      'Forehead is narrow compared to the mid-face',
      'Chin is narrow and often pointed',
      'Face has an angular, sculpted quality',
    ],
    celebrities: [
      { name: 'Rihanna', gender: 'female' },
      { name: 'Robert Pattinson', gender: 'male' },
      { name: 'Vanessa Hudgens', gender: 'female' },
      { name: 'Johnny Depp', gender: 'male' },
    ],
    avoid: {
      hairstyles: [
        'Styles with maximum volume at the cheekbones',
        'Very short, cropped cuts that expose the narrow forehead',
        'Center parts with slicked-flat sides',
      ],
      glasses: [
        'Very narrow frames that sit below the cheekbones',
        'Frameless or rimless styles that lack definition',
        'Angular cat-eye frames that over-emphasize the cheekbones',
      ],
    },
    faqs: [
      {
        question: 'How rare is the diamond face shape?',
        answer:
          'The diamond is one of the rarest face shapes. Its defining feature — cheekbones that are significantly wider than both the forehead and the jawline — occurs in a small percentage of the population. This rarity is part of what makes it so striking and sought-after in modeling and fashion.',
      },
      {
        question: 'How do I balance wide cheekbones?',
        answer:
          'The strategy is to add fullness at the forehead and chin levels to match the cheekbones. Hairstyles with volume at the temples or fringe across the forehead widen the upper face. Styles with texture or curl at the jawline fill in the narrower lower face. The result is a more balanced, oval-like silhouette.',
      },
      {
        question: 'What glasses flatter a diamond face?',
        answer:
          'Oval and rimless frames soften the angular features, while frames with detailing on the brow line (like browline or cat-eye frames) add width at the forehead. The frame width should match or slightly exceed the cheekbone width. Avoid narrow frames that sit awkwardly against the prominent cheeks.',
      },
      {
        question: 'Is a diamond face the same as a heart face?',
        answer:
          'They are related but distinct. Both have narrow jaws, but the widest point differs: a heart face is widest at the forehead, while a diamond face is widest at the cheekbones. A heart shape tapers smoothly from forehead to chin; a diamond shape narrows both above and below the cheekbones.',
      },
      {
        question: 'What contouring technique works for a diamond face?',
        answer:
          'Since the cheekbones are already prominent, avoid heavy contour there. Instead, apply subtle contour at the very top of the forehead hairline and the tip of the chin to soften the points. Use highlighter on the center of the forehead and along the jawline to create the illusion of width in those areas.',
      },
    ],
    relatedShapes: ['heart', 'oval'],
  },

  triangle: {
    name: 'Triangle',
    icon: '🔺',
    tagline: 'A strong jaw anchored by a broader base',
    description:
      'A triangle (or pear-shaped) face is widest at the jawline and narrows toward the forehead. This shape features a prominent, often squared jaw with a comparatively narrow brow and temple area. Styling strategies focus on adding volume and width to the upper face to balance the strong lower third.',
    characteristics: [
      'Jawline is the widest part of the face',
      'Forehead is noticeably narrower than the jaw',
      'Cheekbones sit between forehead and jaw width',
      'Face appears to widen from temples down to the jaw',
    ],
    celebrities: [
      { name: 'Kelly Osbourne', gender: 'female' },
      { name: 'Gene Wilder', gender: 'male' },
      { name: 'Minnie Driver', gender: 'female' },
      { name: 'Jake Gyllenhaal', gender: 'male' },
    ],
    avoid: {
      hairstyles: [
        'Chin-length bobs that add volume at the already wide jaw',
        'Slicked-back styles that make the narrow forehead more apparent',
        'Very long, straight hair without volume at the crown',
      ],
      glasses: [
        'Bottom-heavy frames that draw attention to the jaw',
        'Narrow frames that make the forehead look even smaller',
        'Frames narrower than the jawline',
      ],
    },
    faqs: [
      {
        question: 'How do I balance a wide jawline with a narrow forehead?',
        answer:
          'The key is to add volume and visual weight to the upper face. Hairstyles with height or fullness at the crown, side-swept bangs, and wide headbands all widen the forehead area. Glasses with bold top frames or decorative upper details also help. In makeup, highlighting the forehead and temples while lightly contouring the jawline creates balance.',
      },
      {
        question: 'What is the difference between a triangle and an inverted triangle face?',
        answer:
          'They are opposites. A triangle (pear) face is widest at the jaw and narrowest at the forehead, while an inverted triangle (heart) face is widest at the forehead and narrowest at the chin. The styling strategies are essentially reversed — triangle faces need upper volume, heart faces need lower volume.',
      },
      {
        question: 'What hairstyles should I avoid with a triangle face?',
        answer:
          'Avoid styles that add width at the jawline, such as chin-length bobs with blunt ends. Also steer clear of flat, slicked-back looks that expose the narrow forehead. Very long hair without layers can drag the face down and emphasize the jaw. Instead, choose styles with crown volume and layers starting above the chin.',
      },
      {
        question: 'Do wide jawlines look masculine on women?',
        answer:
          'Not at all. A strong jawline conveys confidence and is a sought-after feature across all genders. Many stunning models and actors have prominent jawlines. The key is to style in a way that feels balanced — softening around the jaw if desired, or leaning into the angularity for a bold, editorial look.',
      },
      {
        question: 'What hats or accessories work for a triangle face?',
        answer:
          'Wide-brimmed hats, berets, and headbands are excellent because they add width at the top of the head. Statement earrings that sit close to the face (studs, small hoops) are better than long dangly styles that extend toward the jaw. Scarves worn loosely around the neck can also soften the jawline.',
      },
    ],
    relatedShapes: ['square', 'heart'],
  },
};
