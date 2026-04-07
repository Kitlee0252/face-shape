import type { FaceShapeType } from '@/lib/detection/types';

export interface Hairstyle {
  name: string;
  description: string;
  whyItWorks: string;
}

export const HAIRSTYLES: Record<FaceShapeType, { female: Hairstyle[]; male: Hairstyle[] }> = {
  oval: {
    female: [
      {
        name: 'Long Layers',
        description: 'Flowing layers that start below the collarbone with face-framing pieces.',
        whyItWorks:
          'The graduated layers complement the oval face\'s balanced proportions without disrupting its natural symmetry. Face-framing pieces highlight the cheekbones beautifully.',
      },
      {
        name: 'Classic Bob',
        description: 'A chin-length bob with a clean, blunt hemline.',
        whyItWorks:
          'The structured cut emphasizes the oval face\'s even proportions, and the chin-length line draws attention to the jawline without overwhelming it.',
      },
      {
        name: 'Curtain Bangs',
        description: 'Soft, center-parted bangs that sweep outward along the cheekbones.',
        whyItWorks:
          'Curtain bangs frame the oval face\'s balanced structure and highlight the cheekbones — the widest and most flattering point of this shape.',
      },
      {
        name: 'Beachy Waves',
        description: 'Loose, tousled waves with natural-looking texture throughout.',
        whyItWorks:
          'The relaxed texture adds movement and body without distorting the oval face\'s harmonious width-to-length ratio. Volume is distributed evenly.',
      },
      {
        name: 'Sleek Middle Part',
        description: 'Straight, glossy hair parted cleanly down the center.',
        whyItWorks:
          'Few face shapes can pull off a center part this cleanly. The oval face\'s symmetry is perfectly showcased, and the straight lines emphasize its elegant proportions.',
      },
    ],
    male: [
      {
        name: 'Classic Side Part',
        description: 'Neatly combed hair with a defined part on one side.',
        whyItWorks:
          'This timeless style works because the oval face\'s balanced proportions pair naturally with the clean asymmetry of a side part. The slight offset adds interest without competing with the face\'s structure.',
      },
      {
        name: 'Textured Quiff',
        description: 'Volume and texture swept upward and back from the forehead.',
        whyItWorks:
          'The added height at the front enhances the oval face without over-elongating it, while the texture keeps the look modern and dimensional.',
      },
      {
        name: 'Buzz Cut',
        description: 'Short, uniform-length hair all over the head.',
        whyItWorks:
          'The oval face is one of the few shapes that truly suits a buzz cut. With no hair to distract, the balanced bone structure and gentle jawline become the focal point.',
      },
      {
        name: 'Medium-Length Waves',
        description: 'Natural waves falling to ear or collar length with loose movement.',
        whyItWorks:
          'The waves add body at the sides that mirrors the oval face\'s cheekbone width, keeping proportions harmonious while adding a relaxed, textured quality.',
      },
      {
        name: 'Pompadour',
        description: 'Hair swept upward and back with height at the front and tapered sides.',
        whyItWorks:
          'The lifted front section adds just enough vertical emphasis to enhance the oval face\'s natural length, while tapered sides maintain the balanced width.',
      },
    ],
  },

  round: {
    female: [
      {
        name: 'Long Side-Swept Layers',
        description: 'Layers starting below the chin with a deep side part.',
        whyItWorks:
          'The diagonal line of the side part and the vertical flow of long layers create an elongating effect that counterbalances the round face\'s equal width and length.',
      },
      {
        name: 'Textured Lob',
        description: 'A shoulder-length cut with choppy, piece-y ends.',
        whyItWorks:
          'Falling just past the chin, the lob\'s length draws the eye downward and creates a slimming frame. The textured ends add angular dimension to soften curves.',
      },
      {
        name: 'Voluminous High Ponytail',
        description: 'Hair pulled up high with volume at the crown and loose face-framing strands.',
        whyItWorks:
          'Height at the crown adds vertical length to the round face, while face-framing tendrils create a slimming V-shape around the full cheeks.',
      },
      {
        name: 'Side-Swept Bangs with Layers',
        description: 'Angled fringe sweeping across the forehead paired with long layers.',
        whyItWorks:
          'The diagonal fringe breaks up the round face\'s horizontal symmetry, creating an asymmetrical line that adds the illusion of angles and length.',
      },
      {
        name: 'Straight and Sleek Below Shoulders',
        description: 'Smooth, straight hair extending well past the shoulders.',
        whyItWorks:
          'The long, unbroken vertical lines have a strong slimming effect on the round face. The below-shoulder length ensures the eye travels downward, counteracting the width.',
      },
    ],
    male: [
      {
        name: 'Textured Crop',
        description: 'Short on the sides with a slightly longer, textured top.',
        whyItWorks:
          'The contrast between tight sides and a lifted top creates height that elongates the round face. The asymmetric texture adds angular interest to an otherwise curved shape.',
      },
      {
        name: 'Faux Hawk',
        description: 'Hair styled upward in a central ridge with shorter sides.',
        whyItWorks:
          'The central height draws the eye upward, adding significant vertical length to the round face. The tapered sides slim the profile and introduce structure.',
      },
      {
        name: 'Undercut with Swept-Back Top',
        description: 'Buzzed or faded sides with longer hair on top swept backward.',
        whyItWorks:
          'The dramatic contrast between shaved sides and voluminous top creates a strong vertical axis that elongates the round face and defines the cheekbone area.',
      },
      {
        name: 'Spiky Fringe',
        description: 'Textured, upward-pointing fringe with shorter sides.',
        whyItWorks:
          'Vertical spikes and texture at the forehead add height and angular dimension, directly countering the softness and equal proportions of a round face.',
      },
      {
        name: 'Angular Side Part',
        description: 'A sharp, defined side part with the longer section combed across the top.',
        whyItWorks:
          'The hard part creates a strong diagonal line that breaks the round face\'s symmetry. The swept volume on top adds asymmetric height for an elongating effect.',
      },
    ],
  },

  square: {
    female: [
      {
        name: 'Soft Waves Past the Shoulders',
        description: 'Loose, flowing waves that fall below the shoulders.',
        whyItWorks:
          'The soft, curved movement of the waves counteracts the square face\'s angular jawline. The below-shoulder length draws attention away from the strong jaw.',
      },
      {
        name: 'Side-Parted Long Layers',
        description: 'A deep side part with cascading layers starting below the chin.',
        whyItWorks:
          'The off-center part creates asymmetry that softens the square face\'s structural symmetry, while layers below the chin gently camouflage the angular jaw.',
      },
      {
        name: 'Wispy Bangs with Texture',
        description: 'Light, feathery bangs paired with textured, layered lengths.',
        whyItWorks:
          'Wispy bangs soften the broad forehead of a square face, while the overall texture breaks up the sharp lines, giving the face a more rounded appearance.',
      },
      {
        name: 'Layered Shag',
        description: 'A heavily layered cut with tousled, piece-y movement throughout.',
        whyItWorks:
          'The abundance of layers creates soft, irregular movement that wraps around the square face\'s angles. The shaggy texture draws attention away from the strong jaw.',
      },
      {
        name: 'Loose Low Bun',
        description: 'A relaxed, messy bun worn at the nape with face-framing pieces.',
        whyItWorks:
          'The loose strands around the temples and jaw create a softening veil over the angular features, while the low placement keeps the overall silhouette balanced.',
      },
    ],
    male: [
      {
        name: 'Textured Fringe',
        description: 'Longer top hair styled forward with piece-y texture across the forehead.',
        whyItWorks:
          'Forward-styled fringe softens the square face\'s broad forehead. The textured, irregular ends break up the strong horizontal line across the brow.',
      },
      {
        name: 'Medium-Length Messy Waves',
        description: 'Ear-to-chin-length hair with natural wave and relaxed movement.',
        whyItWorks:
          'The tousled waves create soft curves around the square face, disguising the angular jaw beneath layers of textured movement. The medium length avoids exposing the full jawline.',
      },
      {
        name: 'Short Back and Sides with Longer Top',
        description: 'Graduated cut with shorter back and sides, leaving length on top for styling.',
        whyItWorks:
          'Height and texture on top offset the square face\'s equal proportions, while the tapered sides avoid adding width that would emphasize the broad jaw.',
      },
      {
        name: 'Tousled Side Part',
        description: 'A relaxed side part with natural-looking, lightly tousled volume.',
        whyItWorks:
          'The casual asymmetry of the side part counteracts the square face\'s strong symmetry, and the tousled texture adds softness to the angular jawline.',
      },
      {
        name: 'Layered Curtain Style',
        description: 'Longer hair parted in the middle with layers framing the face.',
        whyItWorks:
          'The curtain-style layers drape around the square jaw, visually rounding the angles. The center part works because the layers provide enough soft movement to offset the structural symmetry.',
      },
    ],
  },

  heart: {
    female: [
      {
        name: 'Chin-Length Bob with Volume',
        description: 'A bob cut to chin length with added body and movement at the ends.',
        whyItWorks:
          'Volume at the chin level adds width to the narrow lower face, creating balance with the wider forehead and cheekbones of the heart shape.',
      },
      {
        name: 'Long Waves with Side Part',
        description: 'Below-shoulder waves starting from a deep side part.',
        whyItWorks:
          'The side part minimizes the broad forehead, while the flowing waves add fullness at the jaw level to balance the heart face\'s tapering lower third.',
      },
      {
        name: 'Curtain Bangs with Lob',
        description: 'Center-parted, face-framing bangs paired with a shoulder-length cut.',
        whyItWorks:
          'Curtain bangs soften and partially conceal the wide forehead, while the lob length adds weight and volume precisely at the narrow chin area.',
      },
      {
        name: 'Textured Pixie with Side Fringe',
        description: 'A short pixie cut with longer, swept fringe across the forehead.',
        whyItWorks:
          'The side fringe breaks up the wide forehead, while the short overall length keeps the focus on the cheekbones — the heart face\'s most photogenic feature.',
      },
      {
        name: 'Low Wavy Ponytail',
        description: 'A loose, low ponytail with soft waves and face-framing tendrils.',
        whyItWorks:
          'The low placement avoids adding height that would elongate the already-tapered heart shape. Face-framing pieces soften the temples and add perceived width near the jaw.',
      },
    ],
    male: [
      {
        name: 'Medium-Length Textured Top',
        description: 'A versatile length on top with natural texture and shorter sides.',
        whyItWorks:
          'The textured top conceals some of the broader forehead, while the moderate length avoids creating excess height that would exaggerate the heart face\'s tapered silhouette.',
      },
      {
        name: 'Side-Swept Fringe',
        description: 'Longer fringe swept to one side with a graduated fade on the opposite side.',
        whyItWorks:
          'The diagonal sweep of the fringe breaks the broad forehead line, while the fade adds clean structure that draws attention to the cheekbones.',
      },
      {
        name: 'Crew Cut with Soft Fringe',
        description: 'A traditional crew cut with a slightly longer, softened front.',
        whyItWorks:
          'The soft fringe takes visual weight off the forehead, and the overall short length keeps proportions clean without emphasizing the narrower chin.',
      },
      {
        name: 'Textured Crop with Fringe',
        description: 'Short, choppy layers on top with textured fringe falling forward.',
        whyItWorks:
          'The forward-falling fringe disguises the width of the forehead, and the choppy texture adds irregular movement that counteracts the heart face\'s smooth taper.',
      },
      {
        name: 'Slicked-Back with Volume',
        description: 'Hair pushed back loosely with height and body rather than flat against the scalp.',
        whyItWorks:
          'The volume prevents the forehead from looking overly exposed. The backward sweep draws the eye up and back rather than across the wide temple area.',
      },
    ],
  },

  oblong: {
    female: [
      {
        name: 'Full Blunt Bangs',
        description: 'Thick, straight-cut bangs that reach the eyebrows.',
        whyItWorks:
          'Blunt bangs create a strong horizontal line across the forehead, visually shortening the oblong face\'s excess length and making the face appear more proportional.',
      },
      {
        name: 'Shoulder-Length Waves',
        description: 'Wavy hair cut to shoulder length with volume at the sides.',
        whyItWorks:
          'Side volume adds width that counterbalances the oblong face\'s elongated proportions. The shoulder length prevents the hair from dragging the face downward.',
      },
      {
        name: 'Layered Bob with Side Part',
        description: 'A chin-to-shoulder bob with graduated layers and an off-center part.',
        whyItWorks:
          'The horizontal dimension of the bob adds width, while layers create volume at the cheekbones — the area that needs the most visual expansion to shorten the oblong shape.',
      },
      {
        name: 'Voluminous Curls',
        description: 'Big, bouncy curls with maximum body and movement.',
        whyItWorks:
          'The expansive width of voluminous curls is the most effective way to add horizontal dimension to an oblong face. The rounded curl pattern also echoes a more oval silhouette.',
      },
      {
        name: 'Side-Swept Bob',
        description: 'A bob with a deep side part that sweeps hair across the forehead.',
        whyItWorks:
          'The diagonal sweep shortens the forehead, while the bob\'s width at jaw level fills out the lower face. Together, these create a rounder, more balanced frame for the elongated shape.',
      },
    ],
    male: [
      {
        name: 'Textured Fringe with Side Volume',
        description: 'Longer fringe across the forehead with textured, fuller sides.',
        whyItWorks:
          'The fringe shortens the forehead while the side volume adds crucial width. Together they reduce the oblong face\'s length-to-width ratio toward a more balanced proportion.',
      },
      {
        name: 'Side Part with Full Sides',
        description: 'A classic part with slightly longer, fuller hair on the sides.',
        whyItWorks:
          'Unlike most styles for other shapes, keeping the sides full is essential for an oblong face. The added width at the ears creates horizontal balance against the vertical length.',
      },
      {
        name: 'Curly Medium Length',
        description: 'Natural curls or waves at a medium length, worn relaxed.',
        whyItWorks:
          'Curls and waves naturally expand outward, adding the side volume that oblong faces need. The medium length avoids both the elongating effect of long hair and the exposure of a very short cut.',
      },
      {
        name: 'Messy Fringe Crop',
        description: 'Short, textured hair with a deliberately tousled fringe.',
        whyItWorks:
          'The messy fringe conceals forehead length, while the overall short texture adds body and width at the top. The irregular styling breaks up the long vertical lines.',
      },
      {
        name: 'Slicked-Side Style',
        description: 'Hair combed to the side with some volume and a natural finish.',
        whyItWorks:
          'The horizontal direction of the side sweep counters the vertical emphasis of the oblong face. Keeping some volume rather than slicking flat ensures the sides contribute width.',
      },
    ],
  },

  diamond: {
    female: [
      {
        name: 'Tucked-Behind-Ear Bob',
        description: 'A chin-length bob styled with one side tucked behind the ear.',
        whyItWorks:
          'Tucking one side exposes the dramatic cheekbones while the opposite side adds volume at the jaw, balancing the diamond face\'s narrow lower third.',
      },
      {
        name: 'Side-Swept Bangs with Long Layers',
        description: 'Angled bangs sweeping across the forehead with cascading layers.',
        whyItWorks:
          'The bangs add visual width to the diamond face\'s narrow forehead, while long layers soften the prominent cheekbones and add fullness at the jawline.',
      },
      {
        name: 'Textured Waves at Jaw Level',
        description: 'Loose, textured waves concentrated from the jaw downward.',
        whyItWorks:
          'Volume and movement at the jawline fills out the narrow lower face, creating balance with the wide cheekbones that define the diamond shape.',
      },
      {
        name: 'Voluminous Half-Up Style',
        description: 'The top half pulled back with volume at the crown and loose pieces around the face.',
        whyItWorks:
          'Crown volume adds width to the narrow forehead area, while the loose lower half provides coverage and softness around the prominent cheekbones.',
      },
      {
        name: 'Deep Side-Part Lob',
        description: 'A shoulder-length cut with a dramatic side part and textured ends.',
        whyItWorks:
          'The deep part creates fullness on one side that widens the narrow forehead. The lob\'s textured ends add dimension at the jaw, balancing the diamond\'s widest point at the cheeks.',
      },
    ],
    male: [
      {
        name: 'Textured Quiff with Fringe',
        description: 'A lifted quiff with some fringe falling forward and textured styling.',
        whyItWorks:
          'The quiff adds width at the forehead to match the diamond face\'s wide cheekbones, while the soft fringe prevents the narrow temples from looking too exposed.',
      },
      {
        name: 'Side Part with Volume',
        description: 'A classic part with the longer section styled with body and height.',
        whyItWorks:
          'Volume on top widens the narrow upper face, and the asymmetric part breaks up the angular diamond silhouette into a softer, more oval impression.',
      },
      {
        name: 'Medium-Length Swept Back',
        description: 'Collar-length hair pushed back with natural movement and volume.',
        whyItWorks:
          'The medium length reaches the jawline, adding volume to the narrow lower face. Sweeping back opens up the cheekbones — the diamond face\'s strongest feature.',
      },
      {
        name: 'Layered Mid-Length',
        description: 'Multiple layers at a medium length with natural texture throughout.',
        whyItWorks:
          'Layers at different levels create width at both the forehead and jaw, the two narrower areas of the diamond face. The varied lengths soften the angular cheekbone prominence.',
      },
      {
        name: 'Messy Top with Tapered Sides',
        description: 'Tousled, textured top with a gradual taper on the sides.',
        whyItWorks:
          'The messy volume on top widens the forehead area. The gradual taper — rather than a sharp fade — avoids over-emphasizing the cheekbones where the head is naturally widest.',
      },
    ],
  },

  triangle: {
    female: [
      {
        name: 'Voluminous Blowout',
        description: 'A full, bouncy blowout with maximum volume at the crown and temples.',
        whyItWorks:
          'The upper volume creates width at the forehead and temple level to balance the triangle face\'s wider jawline. The rounded silhouette offsets the angular lower face.',
      },
      {
        name: 'Side-Swept Bangs with Volume',
        description: 'Full, sweeping bangs paired with volume-boosted layers around the crown.',
        whyItWorks:
          'The bangs widen the narrow forehead of the triangle face, while the crown volume creates an upper-face emphasis that draws attention away from the broad jaw.',
      },
      {
        name: 'Layered Shoulder Length with Flipped Ends',
        description: 'Shoulder-length cut with layers that flip outward, especially at the crown.',
        whyItWorks:
          'The flipped layers add width at the eye and temple level, directly balancing the triangle face\'s wider jaw. The movement creates a softer overall silhouette.',
      },
      {
        name: 'Textured Pixie with Volume on Top',
        description: 'A short pixie cut with height and texture concentrated at the crown.',
        whyItWorks:
          'Maximum volume on top with minimal length at the jaw creates the perfect counterbalance. The short length avoids adding any visual weight where the triangle face is already widest.',
      },
      {
        name: 'Wide Headband with Waves',
        description: 'A statement headband paired with loose waves or curls.',
        whyItWorks:
          'The headband adds width and visual interest at the top of the head, expanding the narrow forehead area. Paired with waves, it creates a full, balanced frame for the triangular features.',
      },
    ],
    male: [
      {
        name: 'Voluminous Quiff',
        description: 'A full, lifted quiff with significant height and body at the front.',
        whyItWorks:
          'The dramatic height at the front and crown adds visual weight to the narrow upper face, counterbalancing the triangle face\'s prominent jawline with upper-face presence.',
      },
      {
        name: 'Textured Pompadour',
        description: 'A textured, modern pompadour with height and fullness at the front.',
        whyItWorks:
          'The pompadour\'s height creates the upper-face volume that triangle faces need. The textured finish keeps it modern while adding width at the forehead level.',
      },
      {
        name: 'Side Part with Height',
        description: 'A defined side part with the longer section styled upward for volume.',
        whyItWorks:
          'The lifted top section adds width and height above the ears, directly expanding the narrower upper portion of the triangle face. The asymmetric part adds angular interest.',
      },
      {
        name: 'Fluffy Fringe Forward',
        description: 'A longer, full fringe styled forward with body and movement.',
        whyItWorks:
          'The fluffy fringe adds fullness across the forehead — the triangle face\'s narrowest area. The forward direction also draws the eye up and away from the broad jawline.',
      },
      {
        name: 'Medium-Length Layered Top',
        description: 'Longer top layers with shorter sides, styled with texture and body.',
        whyItWorks:
          'The layered top creates volume and width at the crown, while the shorter sides prevent adding bulk at the cheek and jaw level where the triangle face is already full.',
      },
    ],
  },
};
