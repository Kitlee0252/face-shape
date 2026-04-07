import type { FaceShapeType } from '@/lib/detection/types';

export interface GlassesRec {
  name: string;
  style: string;
  whyItWorks: string;
}

export const GLASSES: Record<FaceShapeType, GlassesRec[]> = {
  oval: [
    {
      name: 'Classic Wayfarer',
      style: 'Wayfarer',
      whyItWorks:
        'The wayfarer\'s balanced rectangular-to-square shape mirrors the oval face\'s natural proportions. The slightly wider top adds subtle structure without overwhelming the gentle curves.',
    },
    {
      name: 'Geometric Frames',
      style: 'Geometric',
      whyItWorks:
        'Angular geometric frames add a modern edge to the oval face\'s soft contours. The face\'s balanced proportions mean it can carry bold frame shapes that might overpower other face types.',
    },
    {
      name: 'Rounded Aviator',
      style: 'Aviator',
      whyItWorks:
        'The teardrop shape of aviators complements the oval face\'s gentle curves. The slightly wider frame adds interesting dimension without disturbing the harmonious proportions.',
    },
    {
      name: 'Browline Frames',
      style: 'Browline',
      whyItWorks:
        'Browline frames draw attention to the upper face and brow area, adding a touch of vintage structure. On an oval face, the bold top bar frames the eyes without creating imbalance.',
    },
    {
      name: 'Rectangular Frames',
      style: 'Rectangular',
      whyItWorks:
        'Clean rectangular lines add definition to the oval face\'s rounded features. The horizontal emphasis of the frame complements the face\'s natural length without exaggerating it.',
    },
  ],

  round: [
    {
      name: 'Angular Rectangular Frames',
      style: 'Rectangular',
      whyItWorks:
        'The sharp corners and straight lines of rectangular frames provide the angular contrast that round faces need. The horizontal frame shape also draws the eye outward, creating a slimming effect.',
    },
    {
      name: 'Bold Wayfarer',
      style: 'Wayfarer',
      whyItWorks:
        'The wayfarer\'s angular top line and slightly trapezoidal shape introduce structure and definition to the round face. The wider top creates the illusion of a broader brow area.',
    },
    {
      name: 'D-Frame',
      style: 'Geometric',
      whyItWorks:
        'The flat top edge of a D-frame introduces a sharp horizontal line that counters the round face\'s curves. This straight-edged silhouette adds the angles the face naturally lacks.',
    },
    {
      name: 'Browline Glasses',
      style: 'Browline',
      whyItWorks:
        'The strong upper rim emphasizes the brow line and draws attention upward, away from the round face\'s fuller cheeks. The angular top contrasts beautifully with the soft facial curves.',
    },
    {
      name: 'Cat-Eye Frames',
      style: 'Cat-Eye',
      whyItWorks:
        'The upswept outer corners of cat-eye frames lift the visual line of the face, creating an elongating and slimming effect on round features. The angular shape adds definition to soft contours.',
    },
  ],

  square: [
    {
      name: 'Round Metal Frames',
      style: 'Round',
      whyItWorks:
        'Circular frames soften the square face\'s angular jawline and strong brow line. The curved shape creates a pleasing contrast with the face\'s structural geometry.',
    },
    {
      name: 'Oval Frames',
      style: 'Oval',
      whyItWorks:
        'The smooth, curved lines of oval frames counterbalance the square face\'s sharp features. The soft shape draws attention to the eyes rather than the jaw angles.',
    },
    {
      name: 'Rounded Aviator',
      style: 'Aviator',
      whyItWorks:
        'The curved teardrop shape of aviators softens the hard angles of a square face. The wider-at-top silhouette draws the eye upward and away from the prominent jawline.',
    },
    {
      name: 'Rimless Frames',
      style: 'Rimless',
      whyItWorks:
        'Rimless frames let the square face\'s strong bone structure speak for itself without adding competing angles. The minimal design softens the overall look without hiding the face\'s natural power.',
    },
    {
      name: 'Curved Cat-Eye',
      style: 'Cat-Eye',
      whyItWorks:
        'The rounded, upswept shape of cat-eye frames introduces curves that balance the square face\'s straight lines. The lifted outer corners add a softening vertical element to the horizontal jawline.',
    },
  ],

  heart: [
    {
      name: 'Light Oval Frames',
      style: 'Oval',
      whyItWorks:
        'Thin, oval frames add gentle width at the lower face without top-heaviness. Their rounded shape softens the heart face\'s angular cheekbones and pointed chin.',
    },
    {
      name: 'Round Wire Frames',
      style: 'Round',
      whyItWorks:
        'Round frames balance the heart face by adding curved width at the mid-face level. The circular shape echoes softness and avoids emphasizing the wider forehead or narrow chin.',
    },
    {
      name: 'Rimless or Semi-Rimless',
      style: 'Rimless',
      whyItWorks:
        'Frames with a light or absent upper rim avoid adding visual weight to the already-wide forehead. The minimalist design keeps the focus on the eyes and cheekbones.',
    },
    {
      name: 'Low-Bridge Rectangular',
      style: 'Rectangular',
      whyItWorks:
        'Rectangular frames with a low-set bridge sit lower on the face, adding width at the narrow mid-to-lower face area. The horizontal shape creates balance below the wide forehead.',
    },
    {
      name: 'Bottom-Heavy Frames',
      style: 'Browline (inverted)',
      whyItWorks:
        'Frames with thicker lower rims draw the eye downward, adding visual weight to the narrower chin area. This rebalances the heart face\'s natural top-heaviness.',
    },
  ],

  oblong: [
    {
      name: 'Oversized Wayfarer',
      style: 'Wayfarer',
      whyItWorks:
        'Large wayfarers span more of the face width, adding horizontal dimension that shortens the oblong face\'s length. The bold frame also breaks up the long vertical expanse.',
    },
    {
      name: 'Wide Aviator',
      style: 'Aviator',
      whyItWorks:
        'Wide aviators add significant horizontal breadth to the oblong face. The large lenses cover more vertical space, visually shortening the distance between forehead and chin.',
    },
    {
      name: 'Bold Round Frames',
      style: 'Round',
      whyItWorks:
        'Large, round frames break the oblong face\'s long lines with circular curves. The width of oversized rounds adds the horizontal dimension that this face shape needs most.',
    },
    {
      name: 'Deep Rectangular Frames',
      style: 'Rectangular',
      whyItWorks:
        'Tall, deep rectangular frames cover more vertical face area, making the face appear shorter. Choose frames that extend slightly past the face width for maximum widening effect.',
    },
    {
      name: 'Decorative-Temple Frames',
      style: 'Embellished',
      whyItWorks:
        'Frames with bold or decorative temples draw the eye outward to the sides, counteracting the oblong face\'s dominant vertical lines with horizontal visual interest.',
    },
  ],

  diamond: [
    {
      name: 'Oval Frames',
      style: 'Oval',
      whyItWorks:
        'The gentle curves of oval frames soften the diamond face\'s angular cheekbones without competing with its dramatic bone structure. The shape flatters without overpowering.',
    },
    {
      name: 'Browline Frames',
      style: 'Browline',
      whyItWorks:
        'The bold upper rim adds width at the narrow forehead level, helping balance the diamond face\'s prominent cheekbones. The frame creates visual weight where the face needs it most.',
    },
    {
      name: 'Upswept Cat-Eye',
      style: 'Cat-Eye',
      whyItWorks:
        'The cat-eye\'s upward sweep at the outer corners widens the upper face, adding dimension to the narrow temples. The shape echoes and enhances the diamond face\'s natural angularity.',
    },
    {
      name: 'Rimless with Bold Brow Bar',
      style: 'Rimless',
      whyItWorks:
        'A frameless lower edge avoids adding width at the cheekbones, while the brow bar adds structure at the forehead. This asymmetric design addresses the diamond face\'s unique proportions.',
    },
    {
      name: 'Rounded Square Frames',
      style: 'Rounded Square',
      whyItWorks:
        'The combination of structure and curves complements the diamond face\'s mix of angles and narrowing. The frame width should align with the cheekbones for a harmonious, balanced fit.',
    },
  ],

  triangle: [
    {
      name: 'Bold Cat-Eye Frames',
      style: 'Cat-Eye',
      whyItWorks:
        'The upswept shape and wider top of cat-eye frames add visual weight to the narrow forehead, directly counterbalancing the triangle face\'s broad jawline with upper-face emphasis.',
    },
    {
      name: 'Prominent Browline',
      style: 'Browline',
      whyItWorks:
        'The heavy upper rim of browline frames adds width and structure at the brow level — exactly where the triangle face is narrowest. This creates a strong counterweight to the wide jaw.',
    },
    {
      name: 'Aviator Frames',
      style: 'Aviator',
      whyItWorks:
        'Aviators are wider at the top and narrower at the bottom, making them an ideal shape for triangle faces. The teardrop profile widens the upper face while tapering away from the jaw.',
    },
    {
      name: 'Bold-Top Wayfarer',
      style: 'Wayfarer',
      whyItWorks:
        'The wayfarer\'s wider upper frame adds presence at the temple and brow area. Choosing a bold, thick-framed version maximizes the widening effect on the triangle face\'s narrow forehead.',
    },
    {
      name: 'Colorful Wide Frames',
      style: 'Decorative',
      whyItWorks:
        'Eye-catching frames with bold colors or patterns draw attention to the upper face. The wider the frame sits at the temple, the more it balances the triangle face\'s dominant lower jaw.',
    },
  ],
};
