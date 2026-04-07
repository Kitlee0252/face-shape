import type { FaceShapeType } from '@/lib/detection/types';

export interface MakeupTip {
  area: string;
  tip: string;
}

export const MAKEUP: Record<FaceShapeType, MakeupTip[]> = {
  oval: [
    {
      area: 'Contour',
      tip: 'Apply light contour beneath the cheekbones and along the temples to enhance your naturally balanced structure. Keep it subtle — the goal is definition, not reshaping.',
    },
    {
      area: 'Blush',
      tip: 'Smile and apply blush to the apples of the cheeks, blending slightly upward toward the temples. The oval face can carry most blush placements, so experiment freely.',
    },
    {
      area: 'Highlight',
      tip: 'Dab highlighter on the high points: the tops of the cheekbones, the bridge of the nose, and the center of the forehead. This enhances the oval face\'s naturally balanced bone structure.',
    },
    {
      area: 'Eyebrows',
      tip: 'A soft, natural arch complements the oval face\'s proportions. Avoid over-plucking or creating a very high arch — the face is already well-balanced and doesn\'t need dramatic correction.',
    },
    {
      area: 'Lip Focus',
      tip: 'Nearly any lip shape works. Play up the natural lip line with liner for definition, or go bold with a statement color. The balanced face allows the lips to be a focal point without throwing off proportions.',
    },
  ],

  round: [
    {
      area: 'Contour',
      tip: 'Apply contour along the sides of the forehead, beneath the cheekbones, and along the jawline to sculpt angles. Blend in downward strokes to create vertical lines that elongate the face.',
    },
    {
      area: 'Blush',
      tip: 'Apply blush slightly above the apples of the cheeks, sweeping diagonally toward the temples. Avoid placing blush directly on the apples, as this can emphasize the roundness.',
    },
    {
      area: 'Highlight',
      tip: 'Focus highlighter in a vertical strip down the center of the face — the forehead center, nose bridge, and chin. This central column of light creates the illusion of length.',
    },
    {
      area: 'Eyebrows',
      tip: 'A defined, angled arch adds the angular dimension that a round face naturally lacks. The peak of the arch draws the eye upward, elongating the face vertically.',
    },
    {
      area: 'Lip Focus',
      tip: 'Define the cupid\'s bow with liner to create a subtle peak that echoes angular lines. A slightly darker lip in matte shades adds structure and draws the eye down to the lower face.',
    },
  ],

  square: [
    {
      area: 'Contour',
      tip: 'Concentrate contour on the outer corners of the forehead and the outer edges of the jawline. This softens the two widest points and creates a more rounded silhouette from the strong angles.',
    },
    {
      area: 'Blush',
      tip: 'Apply blush in a rounded, circular motion on the apples of the cheeks, keeping it toward the center of the face. This rounded placement creates soft curves that contrast with the angular jawline.',
    },
    {
      area: 'Highlight',
      tip: 'Highlight the center of the forehead, the bridge of the nose, and the center of the chin to draw the eye inward. This focuses attention on the middle of the face rather than the wide outer edges.',
    },
    {
      area: 'Eyebrows',
      tip: 'A soft, curved brow with a gentle rounded arch works best. Avoid very angular or flat brows — curved brows introduce the softness that counterbalances the square face\'s strong bone structure.',
    },
    {
      area: 'Lip Focus',
      tip: 'A rounded lip shape with a softly defined cupid\'s bow adds curves to the lower face. Use a lip gloss or satin finish to create light play that softens the strong chin area.',
    },
  ],

  heart: [
    {
      area: 'Contour',
      tip: 'Apply contour to the temples and sides of the forehead to narrow the wider upper face. Add a touch beneath the cheekbones and blend downward to create balance with the narrow chin.',
    },
    {
      area: 'Blush',
      tip: 'Sweep blush below the apples of the cheeks, blending toward the ears. This lower placement adds fullness to the mid and lower face, balancing the wider forehead and cheekbones.',
    },
    {
      area: 'Highlight',
      tip: 'Apply highlighter to the chin, along the jawline, and on the center of the forehead. Adding light to the chin visually widens the narrow lower face, creating a more proportional look.',
    },
    {
      area: 'Eyebrows',
      tip: 'A soft, rounded brow with a low arch keeps the upper face from looking too wide. Avoid very arched or angular brows that draw attention upward where the face is already broad.',
    },
    {
      area: 'Lip Focus',
      tip: 'Fuller lip looks add weight to the narrow lower face. Use a lip liner slightly outside the natural lip line and choose medium-to-bold shades that draw the eye downward.',
    },
  ],

  oblong: [
    {
      area: 'Contour',
      tip: 'Apply contour along the very top of the forehead at the hairline and beneath the chin. These two applications visually shorten the face by reducing the visible distance between hairline and chin.',
    },
    {
      area: 'Blush',
      tip: 'Apply blush horizontally across the cheeks, extending outward toward the ears rather than blending upward. The horizontal sweep adds width and creates a visual break in the face\'s vertical length.',
    },
    {
      area: 'Highlight',
      tip: 'Focus highlighter on the cheekbone tops and the outer corners of the brow bone. Avoid highlighting the center of the forehead and chin, as this creates a vertical light line that emphasizes length.',
    },
    {
      area: 'Eyebrows',
      tip: 'A flat or low-arched brow creates a horizontal line that shortens the face. Extend the brows slightly outward for extra width. Avoid high arches that add perceived height to the already-long face.',
    },
    {
      area: 'Lip Focus',
      tip: 'A wider-looking lip draws attention horizontally. Use liner to slightly extend the lip corners and choose lighter, glossy shades that reflect light outward rather than drawing the eye vertically.',
    },
  ],

  diamond: [
    {
      area: 'Contour',
      tip: 'Lightly contour the tip of the chin and the very top of the forehead to soften the narrow points. Avoid heavy cheekbone contour — the diamond face already has dramatic cheek definition.',
    },
    {
      area: 'Blush',
      tip: 'Apply blush just below the cheekbones, blending toward the center of the face. This softens the angular cheekbones rather than emphasizing them, creating a more rounded mid-face.',
    },
    {
      area: 'Highlight',
      tip: 'Highlight the center of the forehead and the center of the chin to add visual width to the narrower points. Keep highlighter off the cheekbone peaks to avoid making them look even more prominent.',
    },
    {
      area: 'Eyebrows',
      tip: 'A soft, curved brow with gentle fullness adds width to the narrow forehead. The rounded shape also echoes curves that balance the diamond face\'s angular cheekbone structure.',
    },
    {
      area: 'Lip Focus',
      tip: 'Play up the lips to draw attention to the lower face and balance the dominant cheekbones. A bold lip color or a slightly overlaid liner adds visual weight where the diamond face tapers.',
    },
  ],

  triangle: [
    {
      area: 'Contour',
      tip: 'Apply contour along the outer jawline and chin to visually narrow the widest area. Blend upward to soften the strong jaw angles. Avoid contouring the forehead, which is already narrow.',
    },
    {
      area: 'Blush',
      tip: 'Place blush higher on the cheekbones, sweeping upward toward the temples. This high placement lifts the focus to the upper face and adds color and width where the triangle face is narrowest.',
    },
    {
      area: 'Highlight',
      tip: 'Generously highlight the forehead, temples, and outer brow bone. Adding light to the upper face broadens it visually, creating balance against the wider jawline below.',
    },
    {
      area: 'Eyebrows',
      tip: 'Fuller, extended brows add crucial width to the narrow forehead. A soft horizontal or gently arched shape is ideal — the extra brow length expands the perceived width of the upper face.',
    },
    {
      area: 'Lip Focus',
      tip: 'Keep the lip look subtle and natural to avoid drawing attention to the lower face. Neutral tones and matte finishes work best. Let the eye and brow area be the star of the look.',
    },
  ],
};
