import { contrast } from "@/lib/cards/color";
import { sanitizePlacements } from "@/lib/cards/composition";
import type {
  CardDesign,
  CardLayout,
  CardPalette,
  CardPaper,
  CardScene,
  DecorationPosition,
  DecorationType,
} from "@/lib/schemas/card-design";
import type { EventType, Language } from "@/lib/types";

/**
 * Direction artistique par occasion.
 * Chaque occasion propose 4 « looks » : une mise en page, une palette accordée à
 * cette mise en page, une paire typographique et, si besoin, un paysage.
 * Le rendu (card-renderer) sait dessiner chacun de ces éléments.
 */

type HeadingStyle = CardDesign["typography"]["headingStyle"];
type BodyStyle = CardDesign["typography"]["bodyStyle"];

export interface Look {
  layout: CardLayout;
  palette: CardPalette;
  heading: HeadingStyle;
  body: BodyStyle;
  paper?: CardPaper;
  scene?: CardScene;
  concept: Record<Language, string>;
  /** Consigne artistique donnée à Gemini pour cette carte. */
  direction: string;
}

export interface OccasionProfile {
  id: EventType;
  /** Les 4 looks de l'occasion, un par mise en page. */
  looks: Look[];
  layouts: CardLayout[];
  palettes: CardPalette[];
  /** Décors cohérents avec l'occasion : ils sont garantis dans la carte finale. */
  kit: DecorationType[];
  /** Décors neutres autorisés partout. */
  neutral: DecorationType[];
  /** Objet-héros du layout "hero-object". */
  hero?: DecorationType;
  imagery: string;
  kicker: Record<Language, string>;
}

const NEUTRAL: DecorationType[] = ["frame", "stars", "confetti", "ribbon", "leaves"];

const pal = (background: string, primary: string, accent: string, text: string): CardPalette => ({
  background,
  primary,
  accent,
  text,
});

function profile(
  data: Omit<OccasionProfile, "layouts" | "palettes" | "neutral"> & { neutral?: DecorationType[] }
): OccasionProfile {
  return {
    ...data,
    neutral: data.neutral ?? NEUTRAL,
    layouts: data.looks.map((look) => look.layout),
    palettes: data.looks.map((look) => look.palette),
  };
}

export const OCCASION_PROFILES: Record<EventType, OccasionProfile> = {
  christmas: profile({
    id: "christmas",
    kit: ["holly", "berries", "ribbon", "stars", "gift"],
    hero: "gift",
    imagery:
      "papier ivoire texturé, ruban de satin rouge, branches de houx et baies, dorures, coffrets rouge et or, nuit étoilée et collines enneigées",
    kicker: { fr: "Joyeux Noël", en: "Merry Christmas" },
    looks: [
      {
        layout: "luxury-stationery",
        palette: pal("#F4EEE3", "#8E1B2E", "#B8935A", "#2A2321"),
        heading: "script",
        body: "serif",
        paper: "ivory",
        concept: { fr: "Papeterie ivoire, ruban de satin et houx", en: "Ivory stationery, satin ribbon and holly" },
        direction: "feuille ivoire posée sur un papier texturé, ruban de satin rouge noué, houx et baies aux coins, filets dorés",
      },
      {
        layout: "illustrated-scene",
        palette: pal("#B3202F", "#F6E3B8", "#E8C26B", "#FFF6E8"),
        heading: "serif",
        body: "serif",
        paper: "plain",
        concept: { fr: "Scène rouge et or, cadeaux et confettis", en: "Red and gold scene, gifts and confetti" },
        direction: "fond rouge profond avec halo de lumière, coffrets rouge et or au sol, confettis dorés, titre doré",
      },
      {
        layout: "scene-panel",
        palette: pal("#12251D", "#EFE3C2", "#C9A15B", "#FFF8EA"),
        heading: "script",
        body: "serif",
        paper: "night",
        scene: "night",
        concept: { fr: "Nuit de Noël sur les collines enneigées", en: "Christmas night over snowy hills" },
        direction: "grand panneau nocturne : lune, étoiles, collines enneigées et sapins, texte doré à côté",
      },
      {
        layout: "type-stack",
        palette: pal("#143024", "#F3E6C4", "#D4AF5A", "#FFF9EC"),
        heading: "serif",
        body: "sans",
        paper: "night",
        concept: { fr: "Titre géant sur un champ de houx", en: "Giant title over a field of holly" },
        direction: "titre géant empilé en capitales sur un champ dense de houx et de baies, filets blancs fins décalés",
      },
    ],
  }),

  newyear: profile({
    id: "newyear",
    kit: ["stars", "confetti", "frame"],
    imagery: "nuit de minuit, étoiles fines, gerbes d'étincelles, confettis dorés, typographie d'affiche, champagne et or",
    kicker: { fr: "Bonne année", en: "Happy New Year" },
    looks: [
      {
        layout: "editorial-poster",
        palette: pal("#101528", "#F2E3B5", "#D4AF5A", "#FFF9EA"),
        heading: "display",
        body: "serif",
        paper: "plain",
        concept: { fr: "Affiche de minuit en capitales dorées", en: "Midnight poster in golden capitals" },
        direction: "affiche éditoriale bleu nuit, titre vertical géant, photo en arche, étoiles fines",
      },
      {
        layout: "illustrated-scene",
        palette: pal("#F6EBD3", "#1B1B1F", "#B8893B", "#1B1B1F"),
        heading: "serif",
        body: "serif",
        paper: "plain",
        concept: { fr: "Champagne et gerbe d'étincelles", en: "Champagne and a burst of sparks" },
        direction: "fond champagne, gerbe d'étincelles dorée au centre, confettis noirs et or",
      },
      {
        layout: "scene-panel",
        palette: pal("#1A1033", "#F8E7C0", "#E0687A", "#FFF8EE"),
        heading: "script",
        body: "serif",
        paper: "night",
        scene: "fireworks",
        concept: { fr: "Feux d'artifice sur la ville", en: "Fireworks over the city" },
        direction: "panneau nocturne avec feux d'artifice roses et dorés au-dessus d'une ligne de toits",
      },
      {
        layout: "type-stack",
        palette: pal("#0B0B12", "#F2E3B5", "#D4AF5A", "#FFFFFF"),
        heading: "display",
        body: "sans",
        paper: "night",
        concept: { fr: "L'année en chiffres géants", en: "The year in giant numerals" },
        direction: "année ou titre en chiffres géants empilés, champ d'étincelles dorées, filets blancs décalés",
      },
    ],
  }),

  valentine: profile({
    id: "valentine",
    kit: ["rose", "hearts", "arcs", "flowers", "ribbon"],
    hero: "rose",
    imagery: "rose rouge, arcs de couleur, papier rose poudré, fleurs en papier découpé, cœurs, lettre d'amour, cuivre et bordeaux",
    kicker: { fr: "Pour toi", en: "For you" },
    looks: [
      {
        layout: "botanical-frame",
        palette: pal("#FBEFEF", "#B3173E", "#E8899B", "#3A1F26"),
        heading: "serif",
        body: "serif",
        paper: "white",
        concept: { fr: "Papier découpé rose et tulipes", en: "Pink paper-cut and tulips" },
        direction: "papier clair, cadre photo incliné, fleurs en papier découpé aux ombres douces",
      },
      {
        layout: "luxury-stationery",
        palette: pal("#3A0F1D", "#F7D5DB", "#E5566D", "#FFF3F4"),
        heading: "script",
        body: "serif",
        paper: "ivory",
        concept: { fr: "Lettre d'amour sur fond bordeaux", en: "Love letter on burgundy" },
        direction: "feuille crème sur un fond bordeaux profond, ruban rose, fleurs en papier",
      },
      {
        layout: "hero-object",
        palette: pal("#6B3A2A", "#F3D9C8", "#D9A27A", "#FFF3EA"),
        heading: "serif",
        body: "sans",
        paper: "plain",
        concept: { fr: "Une rose, des arcs de cuivre, un filet d'or", en: "A rose, copper arcs, a gold line" },
        direction: "dégradé cuivre avec arcs concentriques, une rose rouge centrée, capitales très espacées, cadre fin doré",
      },
      {
        layout: "type-stack",
        palette: pal("#1B2A2A", "#F7EFE6", "#E4572E", "#FFFFFF"),
        heading: "serif",
        body: "sans",
        paper: "night",
        concept: { fr: "LOVE géant sur un champ de roses", en: "Giant LOVE over a rose field" },
        direction: "titre géant en capitales serif empilées sur un champ dense de roses orangées et de feuillage sombre",
      },
    ],
  }),

  easter: profile({
    id: "easter",
    kit: ["eggs", "lily", "feathers", "flowers", "tulips", "cross"],
    hero: "lily",
    imagery: "œufs décorés et tachetés, plumes, lys blanc, croix dorée, lumière douce d'une fenêtre, pastel bleu et vert",
    kicker: { fr: "Joyeuses Pâques", en: "Happy Easter" },
    looks: [
      {
        layout: "botanical-frame",
        palette: pal("#F4F7EA", "#7A5C9E", "#A8C686", "#2F3A2A"),
        heading: "serif",
        body: "serif",
        paper: "white",
        concept: { fr: "Printemps en papier découpé", en: "Spring in paper-cut" },
        direction: "papier clair, cadre incliné avec tulipes, fleurs de papier, feuillages tendres",
      },
      {
        layout: "side-cluster",
        palette: pal("#B6CFE2", "#4A4F57", "#A58B5E", "#3F454D"),
        heading: "serif",
        body: "sans",
        paper: "kraft",
        concept: { fr: "Œufs et plumes sur béton bleuté", en: "Eggs and feathers on blue plaster" },
        direction: "fond minéral bleu gris, titre à gauche, grappe d'œufs tachetés, de plumes et de fleurs sur le bord droit",
      },
      {
        layout: "hero-object",
        palette: pal("#EFE9E1", "#9A7430", "#C9A15B", "#4A423A"),
        heading: "script",
        body: "serif",
        paper: "ivory",
        concept: { fr: "Lys blancs et croix dorée à la lumière d'une fenêtre", en: "White lilies and a golden cross in window light" },
        direction: "fond greige avec lumière de fenêtre, croix dorée, titre script doré, lys blancs au centre",
      },
      {
        layout: "illustrated-scene",
        palette: pal("#FFF7DD", "#4F7CAC", "#E7B93E", "#2B3440"),
        heading: "serif",
        body: "serif",
        paper: "plain",
        concept: { fr: "Scène de printemps aux œufs peints", en: "Spring scene with painted eggs" },
        direction: "fond beurre, halo de lumière, œufs peints et fleurs au sol, confettis pastel",
      },
    ],
  }),

  birthday: profile({
    id: "birthday",
    kit: ["balloons", "confetti", "gift", "stars"],
    hero: "gift",
    imagery: "affiche de magazine maximaliste, titre géant, ballons, cadeaux, confettis, espace photo en arche",
    kicker: { fr: "Joyeux anniversaire", en: "Happy birthday" },
    looks: [
      {
        layout: "editorial-poster",
        palette: pal("#4B2E4E", "#F6ECE0", "#F2A7B5", "#FFF8F0"),
        heading: "display",
        body: "serif",
        paper: "plain",
        concept: { fr: "Affiche de magazine en prune et crème", en: "Plum and cream magazine cover" },
        direction: "titre vertical géant, photo dans une arche, ballons pastel, signature manuscrite qui chevauche la photo",
      },
      {
        layout: "illustrated-scene",
        palette: pal("#FFF1DC", "#D9482B", "#F3A712", "#2B1B17"),
        heading: "serif",
        body: "serif",
        paper: "plain",
        concept: { fr: "Scène festive aux cadeaux et ballons", en: "Festive scene with gifts and balloons" },
        direction: "fond crème solaire, gros cadeau rouge et or au sol, ballons, confettis",
      },
      {
        layout: "type-stack",
        palette: pal("#1F1B2E", "#E9D8FF", "#FF8FAB", "#FFFFFF"),
        heading: "display",
        body: "sans",
        paper: "night",
        concept: { fr: "HAPPY BIRTH DAY en capitales géantes", en: "HAPPY BIRTH DAY in giant capitals" },
        direction: "titre géant empilé, champ de ballons, de cadeaux et de confettis sur fond nuit",
      },
      {
        layout: "side-cluster",
        palette: pal("#F7DDE4", "#B0225C", "#F2B134", "#3A1F2B"),
        heading: "serif",
        body: "sans",
        paper: "white",
        concept: { fr: "Grappe de ballons et de cadeaux sur rose poudré", en: "Cluster of balloons and gifts on powder pink" },
        direction: "fond rose poudré, titre à gauche, grappe de ballons, cadeaux et étoiles qui déborde sur le bord droit",
      },
    ],
  }),

  mothersday: profile({
    id: "mothersday",
    kit: ["flowers", "tulips", "leaves", "ribbon"],
    hero: "tulips",
    imagery: "papier découpé rose, anémones, tulipes, feuillages, coffret rose pâle, aube douce, grande typographie serif",
    kicker: { fr: "Pour la meilleure des mamans", en: "For the best mom ever" },
    looks: [
      {
        layout: "botanical-frame",
        palette: pal("#FBF6F4", "#E58AA0", "#F2B8C0", "#3A2F31"),
        heading: "serif",
        body: "serif",
        paper: "white",
        concept: { fr: "Anémones en papier découpé et cadre incliné", en: "Paper-cut anemones and tilted frame" },
        direction: "papier blanc texturé, cadre photo incliné, anémones roses aux ombres portées, grand titre serif sombre",
      },
      {
        layout: "luxury-stationery",
        palette: pal("#FFF3EA", "#E48A68", "#9DB38A", "#3B2E2A"),
        heading: "script",
        body: "serif",
        paper: "ivory",
        concept: { fr: "Papeterie pêche et sauge", en: "Peach and sage stationery" },
        direction: "feuille crème sur papier pêche, fleurs de papier et feuillage sauge aux coins",
      },
      {
        layout: "hero-object",
        palette: pal("#F6E1E4", "#C9506B", "#F2B8C0", "#4A2A32"),
        heading: "serif",
        body: "serif",
        paper: "blush",
        concept: { fr: "Bouquet de tulipes sous un filet fin", en: "Tulip bouquet under a fine frame" },
        direction: "fond rose pâle, bouquet de tulipes centré, capitales espacées, cadre fin",
      },
      {
        layout: "side-cluster",
        palette: pal("#FFF0E6", "#D4694F", "#9DB38A", "#3B2E2A"),
        heading: "serif",
        body: "sans",
        paper: "white",
        concept: { fr: "Fleurs et feuillages qui débordent sur le bord", en: "Flowers and foliage spilling over the edge" },
        direction: "fond abricot clair, titre à gauche, grappe de fleurs en papier et de feuillages sur le bord droit",
      },
    ],
  }),

  fathersday: profile({
    id: "fathersday",
    kit: ["tie", "birds", "frame", "sunset", "stars", "ribbon"],
    hero: "tie",
    imagery: "papeterie sobre, bleu nuit et laiton, cravate à pois, coucher de soleil, oiseaux en vol, cadre fin, cuir et papier",
    kicker: { fr: "Pour le meilleur des papas", en: "For the best dad" },
    looks: [
      {
        layout: "editorial-poster",
        palette: pal("#14233B", "#E9DFC8", "#C49A4A", "#F6F1E6"),
        heading: "display",
        body: "serif",
        paper: "plain",
        concept: { fr: "Affiche bleu nuit et laiton", en: "Midnight blue and brass poster" },
        direction: "affiche éditoriale bleu nuit, titre vertical géant, photo en arche, filets laiton",
      },
      {
        layout: "luxury-stationery",
        palette: pal("#EFE9DD", "#2F4858", "#B7893F", "#1F2A33"),
        heading: "serif",
        body: "serif",
        paper: "ivory",
        concept: { fr: "Papeterie sable, ardoise et laiton", en: "Sand, slate and brass stationery" },
        direction: "feuille blanche sur papier sable, ruban ardoise, cadre fin laiton",
      },
      {
        layout: "hero-object",
        palette: pal("#DCE8F5", "#2F5D95", "#7FA6D6", "#22344D"),
        heading: "script",
        body: "sans",
        paper: "plain",
        concept: { fr: "Chemise bleu ciel et cravate à pois", en: "Sky-blue shirt and polka-dot tie" },
        direction: "fond bleu très pâle, cravate à pois centrée, titre script bleu, texte compact en dessous",
      },
      {
        layout: "scene-panel",
        palette: pal("#D3D5D0", "#B5441F", "#E9822B", "#2B2A28"),
        heading: "script",
        body: "sans",
        paper: "plain",
        scene: "sunset",
        concept: { fr: "Coucher de soleil sur l'herbe haute", en: "Sunset over tall grass" },
        direction: "grand panneau coucher de soleil orange avec oiseaux et herbe sombre, titre rouille à côté",
      },
    ],
  }),
};

export function getOccasionProfile(id: EventType | undefined, occasionText?: string): OccasionProfile {
  if (id && OCCASION_PROFILES[id]) return OCCASION_PROFILES[id];

  const text = (occasionText ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const rules: [RegExp, EventType][] = [
    [/noel|christmas|xmas/, "christmas"],
    [/nouvel an|new year|reveillon/, "newyear"],
    [/valentin|amour|love/, "valentine"],
    [/paques|easter/, "easter"],
    [/anniversaire|birthday/, "birthday"],
    [/mere|maman|mother|mom/, "mothersday"],
    [/pere|papa|father|dad/, "fathersday"],
  ];
  const found = rules.find(([regex]) => regex.test(text));
  return OCCASION_PROFILES[found ? found[1] : "christmas"];
}

/** Style de typographie accepté par chaque mise en page. */
export const HEADING_BY_LAYOUT: Record<CardLayout, HeadingStyle[]> = {
  "luxury-stationery": ["script", "serif"],
  "editorial-poster": ["display", "sans", "serif"],
  "botanical-frame": ["serif", "sans"],
  "illustrated-scene": ["serif", "script", "display"],
  "hero-object": ["script", "serif", "display", "sans"],
  "side-cluster": ["serif", "display", "sans", "script"],
  "type-stack": ["serif", "display", "sans"],
  "scene-panel": ["script", "serif", "sans"],
};

const DEFAULT_POSITION: Record<DecorationType, DecorationPosition> = {
  holly: "corners",
  berries: "top",
  ribbon: "corners",
  flowers: "corners",
  tulips: "bottom",
  leaves: "left",
  stars: "background",
  confetti: "background",
  frame: "corners",
  gift: "bottom",
  balloons: "top",
  hearts: "background",
  eggs: "right",
  feathers: "corners",
  lily: "bottom",
  cross: "top",
  rose: "corners",
  arcs: "background",
  sunset: "left",
  birds: "top",
  tie: "right",
};

/** Ce que chaque mise en page a besoin de voir pour exister. */
const LAYOUT_ESSENTIALS: Record<CardLayout, DecorationType[]> = {
  "luxury-stationery": ["frame"],
  "editorial-poster": ["stars"],
  "botanical-frame": ["leaves"],
  "illustrated-scene": ["confetti"],
  "hero-object": [],
  "side-cluster": [],
  "type-stack": [],
  "scene-panel": [],
};

/** Objet principal posé au sol dans la scène festive (sans lui, le bas de la carte reste vide). */
const SCENE_OBJECT: Partial<Record<EventType, DecorationType>> = {
  christmas: "gift",
  birthday: "gift",
  easter: "eggs",
};

export const HERO_TYPES: DecorationType[] = ["rose", "lily", "tie", "tulips", "gift", "eggs", "flowers", "balloons"];

function paletteIsReadable(p: CardPalette) {
  return contrast(p.text, p.background) >= 4.5 && contrast(p.primary, p.background) >= 3;
}

function lookFor(profile: OccasionProfile, layout: CardLayout): Look | undefined {
  return profile.looks.find((look) => look.layout === layout);
}

/**
 * Dernier filet de sécurité après Gemini : garantit une carte lisible et dont
 * les décors correspondent à l'occasion et à la mise en page.
 */
export function finalizeDesign(
  design: CardDesign,
  profile: OccasionProfile,
  language: Language
): CardDesign {
  const look = lookFor(profile, design.layout);
  const allowed = new Set<DecorationType>([...profile.kit, ...profile.neutral]);
  const seen = new Set<string>();

  let decorations = design.decorations.filter((d) => {
    if (!allowed.has(d.type)) return false;
    const key = `${d.type}-${d.position}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Les tulipes sont dessinées par la mise en page "papier découpé" (cadre photo) ;
  // elles ne sont gardées que là où elles ont leur place.
  if (["luxury-stationery", "editorial-poster", "botanical-frame"].includes(design.layout)) {
    decorations = decorations.filter((d) => d.type !== "tulips");
  }
  // Les arcs concentriques ne servent que le layout « objet-héros ».
  if (design.layout !== "hero-object") {
    decorations = decorations.filter((d) => d.type !== "arcs");
  }
  // Le panneau « coucher de soleil » est trop large pour l'affiche éditoriale.
  if (design.layout === "editorial-poster") {
    decorations = decorations.filter((d) => d.type !== "sunset");
  }

  // Placements libres : mêmes règles que les décors positionnés, puis décalage hors des zones de texte.
  const rawPlacements = (design.placements ?? []).filter((p) => {
    if (!allowed.has(p.type)) return false;
    if (p.type === "tulips" && ["luxury-stationery", "editorial-poster", "botanical-frame"].includes(design.layout)) return false;
    if (p.type === "sunset" && design.layout === "editorial-poster") return false;
    if (p.type === "arcs" && design.layout !== "hero-object") return false;
    return true;
  });
  const placements = sanitizePlacements(rawPlacements, design.layout);

  const sceneObject = design.layout === "illustrated-scene" ? SCENE_OBJECT[profile.id] : undefined;
  const tulipsAllowed = !["luxury-stationery", "editorial-poster", "botanical-frame"].includes(design.layout);

  const present = new Set(decorations.map((d) => d.type));
  const required = [
    ...(sceneObject ? [sceneObject] : []),
    ...profile.kit.slice(0, 3),
    ...LAYOUT_ESSENTIALS[design.layout],
  ].filter(
    (type) =>
      (type !== "tulips" || tulipsAllowed) && (type !== "arcs" || design.layout === "hero-object")
  );

  for (const type of required) {
    if (!present.has(type) && decorations.length < 7) {
      decorations = [...decorations, { type, position: DEFAULT_POSITION[type] }];
      present.add(type);
    }
  }

  // Le layout "objet-héros" a toujours besoin d'un héros.
  if (design.layout === "hero-object" && profile.hero && !decorations.some((d) => HERO_TYPES.includes(d.type))) {
    decorations = [...decorations, { type: profile.hero, position: "bottom" }];
  }

  const headingOptions = HEADING_BY_LAYOUT[design.layout];
  const headingStyle = headingOptions.includes(design.typography.headingStyle)
    ? design.typography.headingStyle
    : look?.heading ?? headingOptions[0];

  const palette = paletteIsReadable(design.palette)
    ? design.palette
    : look?.palette ?? profile.palettes.find(paletteIsReadable) ?? profile.palettes[0];

  return {
    ...design,
    palette,
    paper: design.paper ?? look?.paper,
    scene: design.layout === "scene-panel" ? design.scene ?? look?.scene ?? "sunset" : undefined,
    placements,
    typography: { ...design.typography, headingStyle },
    decorations,
    content: {
      ...design.content,
      kicker: design.content.kicker?.trim() || profile.kicker[language],
    },
  };
}

type Copy = { title: string; message: string; signature: string; kicker?: string };

function sampleCopy(eventId: EventType, fr: boolean): Copy[] {
  const t = (a: string, b: string) => (fr ? a : b);
  const all: Record<EventType, Copy[]> = {
    christmas: [
      {
        title: t("Joyeux Noël", "Merry Christmas"),
        message: t(
          "Que cette fin d'année vous enveloppe de chaleur, de rires partagés et de tous ces petits instants qui font les grands souvenirs.",
          "May this season wrap you in warmth, shared laughter and all the small moments that become great memories."
        ),
        signature: t("Avec toute mon affection", "With all my love"),
      },
      {
        title: t("Noël est là", "Christmas is here"),
        message: t(
          "Une table pleine, des lumières douces et vous, au centre de tout. Je vous souhaite un Noël lumineux.",
          "A full table, soft lights and you at the centre of it all. Wishing you a radiant Christmas."
        ),
        signature: t("Avec tendresse", "Warmly"),
      },
      {
        title: t("Nuit de Noël", "Silent Night"),
        message: t(
          "Dehors, la neige. Dedans, vous. Que cette nuit soit la plus douce de l'année.",
          "Snow outside, you inside. May this be the gentlest night of the year."
        ),
        signature: t("Joyeuses fêtes", "Happy holidays"),
        kicker: t("24 décembre", "December 24"),
      },
      {
        title: t("NOËL", "NOEL"),
        message: t(
          "Que la paix, la joie et la lumière remplissent votre maison.",
          "May peace, joy and light fill your home."
        ),
        signature: t("Avec amour", "With love"),
        kicker: t("Joyeuses fêtes", "Season's greetings"),
      },
    ],
    newyear: [
      {
        title: t("Bonne année", "Happy New Year"),
        message: t(
          "Que cette nouvelle année ouvre des portes que vous n'aviez pas imaginées.",
          "May this new year open doors you never imagined."
        ),
        signature: t("À vous", "Yours"),
      },
      {
        title: "2027",
        message: t(
          "Minuit sonne : place aux projets, aux voyages et aux belles surprises.",
          "Midnight strikes: make way for projects, journeys and happy surprises."
        ),
        signature: t("Santé et bonheur", "Health and happiness"),
      },
      {
        title: t("Minuit", "Midnight"),
        message: t(
          "Trois, deux, un… que la nouvelle année éclate de couleurs pour vous.",
          "Three, two, one… may the new year burst into colour for you."
        ),
        signature: t("Tous mes vœux", "All my wishes"),
        kicker: t("31 décembre", "December 31"),
      },
      {
        title: "2027",
        message: t(
          "Une page blanche, mille possibles. Faites-en votre plus belle année.",
          "A blank page, a thousand possibilities. Make it your best year."
        ),
        signature: t("Bonne chance", "Good luck"),
        kicker: t("Bonne année", "Happy New Year"),
      },
    ],
    valentine: [
      {
        title: t("Pour toi", "For you"),
        message: t(
          "Il y a des mots qui ne disent jamais assez. Alors je te les offre tous, sur ce papier.",
          "Some words never say enough. So I am offering you all of them, on this paper."
        ),
        signature: t("Ton admirateur", "Your admirer"),
      },
      {
        title: t("Mon amour", "My love"),
        message: t(
          "Merci d'être ma maison, mon rire et mon refuge.",
          "Thank you for being my home, my laughter and my refuge."
        ),
        signature: t("Pour toujours", "Forever"),
      },
      {
        title: t("Joyeuse Saint-Valentin", "Happy Valentine's Day"),
        message: t(
          "Tu es la raison pour laquelle je suis qui je suis. Merci pour tout ce que tu fais pour nous.",
          "You are the reason I am who I am today. Thank you for everything you do for us."
        ),
        signature: "Jennifer",
        kicker: t("14 février", "February 14"),
      },
      {
        title: t("LOVE", "LOVE"),
        message: t(
          "Aujourd'hui et chaque jour, c'est toi que je choisis.",
          "Today and every day, it is you I choose."
        ),
        signature: t("Ton amour", "Your love"),
        kicker: t("14 février", "February 14"),
      },
    ],
    easter: [
      {
        title: t("Joyeuses Pâques", "Happy Easter"),
        message: t(
          "Que le printemps fasse éclore de la douceur dans chaque recoin de votre journée.",
          "May spring bring a little softness to every corner of your day."
        ),
        signature: t("Avec joie", "With joy"),
      },
      {
        title: t("Joyeuses Pâques", "Happy Easter"),
        message: t(
          "Je vous souhaite tout l'amour et le bonheur que seules les Pâques savent apporter. Belle fête en famille !",
          "Wishing you all the love and happiness that only Easter can bring. Have a joyous celebration with your family!"
        ),
        signature: t("En famille", "With family"),
        kicker: t("Bonnes fêtes", "Happy"),
      },
      {
        title: t("Joyeuses Pâques", "Happy Easter"),
        message: t(
          "Que la lumière de ce matin de renouveau vous accompagne toute l'année.",
          "May the light of this morning of renewal stay with you all year."
        ),
        signature: t("Dans la paix", "In peace"),
        kicker: t("Bonnes", "Happy"),
      },
      {
        title: t("Le printemps", "Spring"),
        message: t(
          "Un panier de tendresse et de chocolat pour toute la famille.",
          "A basket of tenderness and chocolate for the whole family."
        ),
        signature: t("Bises", "Hugs"),
      },
    ],
    birthday: [
      {
        title: t("Joyeux anniversaire", "Happy Birthday"),
        message: t(
          "Que ta nouvelle année t'ouvre des portes que tu n'avais jamais imaginées.",
          "May your new age unlock doors you never imagined."
        ),
        signature: "Alicia",
        kicker: t("27 septembre", "27th September"),
      },
      {
        title: t("C'est ton jour", "It's your day"),
        message: t(
          "Des ballons, des gâteaux, des rires. Aujourd'hui, tout est pour toi.",
          "Balloons, cake and laughter. Today, everything is for you."
        ),
        signature: t("Avec amour", "With love"),
      },
      {
        title: t("HAPPY BIRTH DAY", "HAPPY BIRTH DAY"),
        message: t(
          "Une année de plus, mille raisons de te célébrer.",
          "One more year, a thousand reasons to celebrate you."
        ),
        signature: t("Tes amis", "Your friends"),
        kicker: t("Ce soir on fête ça", "Tonight we celebrate"),
      },
      {
        title: t("Fête ça", "Celebrate"),
        message: t(
          "Souffle les bougies, fais un vœu, et laisse la fête commencer.",
          "Blow out the candles, make a wish, and let the party begin."
        ),
        signature: t("Bisous", "Hugs"),
        kicker: t("Joyeux anniversaire", "Happy birthday"),
      },
    ],
    mothersday: [
      {
        title: t("Fête des Mères", "Mother's Day"),
        message: t(
          "Merci pour ta patience, tes conseils et ton amour sans condition. Tu es ma plus belle inspiration.",
          "Thank you for your patience, your advice and your unconditional love. You are my greatest inspiration."
        ),
        signature: t("Ta fille qui t'aime", "Your loving daughter"),
      },
      {
        title: t("Merci Maman", "Thank you Mom"),
        message: t(
          "Pour chaque câlin, chaque repas et chaque je t'aime murmuré.",
          "For every hug, every meal and every whispered I love you."
        ),
        signature: t("Avec tout mon cœur", "With all my heart"),
      },
      {
        title: t("Maman", "Mom"),
        message: t(
          "Tu as semé l'amour partout où tu es passée. Aujourd'hui, c'est mon tour de te fleurir.",
          "You planted love everywhere you went. Today it is my turn to give you flowers."
        ),
        signature: t("Ton enfant", "Your child"),
        kicker: t("Tu es la meilleure", "You are my best"),
      },
      {
        title: t("Merci Maman", "Thank you Mom"),
        message: t(
          "Un bouquet de merci pour la femme qui m'a tout appris.",
          "A bouquet of thanks for the woman who taught me everything."
        ),
        signature: t("Je t'aime", "I love you"),
        kicker: t("Fête des Mères", "Mother's Day"),
      },
    ],
    fathersday: [
      {
        title: t("Fête des Pères", "Father's Day"),
        message: t(
          "Tu m'as appris à rester debout et à rire de tout. Merci d'être mon repère.",
          "You taught me to stand tall and laugh at everything. Thank you for being my compass."
        ),
        signature: t("Ton fils", "Your son"),
      },
      {
        title: t("Merci Papa", "Thank you Dad"),
        message: t(
          "Pour chaque conseil donné sans en avoir l'air.",
          "For every piece of advice offered without seeming to."
        ),
        signature: t("Avec fierté", "Proudly"),
      },
      {
        title: t("Joyeuse Fête des Pères", "Happy Father's Day"),
        message: t(
          "Merci pour ton exemple, ta patience et tous les dimanches en famille.",
          "Thank you for your example, your patience and all those family Sundays."
        ),
        signature: t("Ta fille", "Your daughter"),
        kicker: t("Pour le meilleur des papas", "To the best dad"),
      },
      {
        title: t("Fête des Pères", "Father's Day"),
        message: t(
          "Ceux qui sont partis veillent encore sur nous, ceux qui restent nous guident. Merci, papa.",
          "Those who left still watch over us, those who stay guide us. Thank you, Dad."
        ),
        signature: t("Avec amour", "With love"),
        kicker: t("Hommage", "Tribute"),
      },
    ],
  };
  return all[eventId];
}

/** Exemples fixes (page Modèles, accueil) : aucun appel IA nécessaire. */
export function buildSampleDesigns(eventId: EventType, language: Language): CardDesign[] {
  const profile = OCCASION_PROFILES[eventId];
  const copy = sampleCopy(eventId, language === "fr");
  const ids = ["design-a", "design-b", "design-c", "design-d"] as const;

  return profile.looks.map((look, index) => {
    const content = copy[index];
    const base: CardDesign = {
      id: ids[index],
      concept: look.concept[language],
      layout: look.layout,
      paper: look.paper,
      scene: look.scene,
      palette: look.palette,
      typography: { headingStyle: look.heading, bodyStyle: look.body },
      decorations: [],
      content: {
        title: content.title,
        message: content.message,
        signature: content.signature,
        kicker: content.kicker ?? profile.kicker[language],
      },
    };
    return finalizeDesign(base, profile, language);
  });
}
