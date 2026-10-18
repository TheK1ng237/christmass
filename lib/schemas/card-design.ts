import { z } from "zod";

const ColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const LAYOUTS = [
  "luxury-stationery", // papier ivoire, feuille posée, ruban, houx
  "editorial-poster", // couverture de magazine, titre vertical géant
  "botanical-frame", // papier découpé, fleurs, cadre photo incliné
  "illustrated-scene", // scène festive saturée, cadeaux, confettis
  "hero-object", // un objet-héros centré (rose, lys, cravate…), cadre fin, capitales espacées
  "side-cluster", // texte à gauche, grappe d'objets débordant sur le bord droit
  "type-stack", // titre géant empilé sur un champ de fleurs ou une photo
  "scene-panel", // grand panneau-paysage (coucher de soleil, nuit, feux d'artifice…) et texte à côté
] as const;

export const SCENES = ["sunset", "night", "fireworks", "dawn", "meadow"] as const;

export const DECORATION_TYPES = [
  "ribbon",
  "holly",
  "berries",
  "flowers",
  "tulips",
  "leaves",
  "stars",
  "confetti",
  "frame",
  "gift",
  "balloons",
  "hearts",
  "eggs",
  "feathers",
  "lily",
  "cross",
  "rose",
  "arcs",
  "sunset",
  "birds",
  "tie",
] as const;

export const DECORATION_POSITIONS = [
  "top",
  "bottom",
  "corners",
  "left",
  "right",
  "background",
] as const;

export const PAPERS = ["ivory", "white", "blush", "kraft", "night", "plain"] as const;

export const PaletteSpecSchema = z.object({
  hue: z.number().min(0).max(360),
  harmony: z.enum(["mono", "analogous", "complementary", "triad"]),
  mode: z.enum(["light", "dark"]),
  saturation: z.number().min(20).max(90).optional(),
});

/** Réglages de mise en page, tous bornés : le rendu reste sûr quelle que soit la réponse de l'IA. */
export const LayoutParamsSchema = z.object({
  align: z.enum(["left", "center", "right"]).optional(),
  density: z.enum(["airy", "balanced", "rich"]).optional(),
  frame: z.enum(["none", "thin", "double"]).optional(),
  shape: z.enum(["arch", "rect", "round"]).optional(),
  side: z.enum(["left", "right"]).optional(),
  inset: z.number().min(8).max(20).optional(),
});

/** Placement libre d'un décor, en % de la carte. */
export const PlacementSchema = z.object({
  type: z.enum(DECORATION_TYPES),
  x: z.number().min(-25).max(110),
  y: z.number().min(-25).max(110),
  w: z.number().min(5).max(100),
  rot: z.number().min(-180).max(180).optional(),
  flip: z.enum(["x", "y", "xy"]).optional(),
  layer: z.enum(["back", "front"]).optional(),
  o: z.number().min(0.15).max(1).optional(),
});

export const CardDesignSchema = z.object({
  id: z.enum(["design-a", "design-b", "design-c", "design-d"]),
  concept: z.string().min(3).max(120),
  layout: z.enum(LAYOUTS),
  // Texture de papier. Optionnelle pour rester compatible avec les cartes déjà enregistrées.
  paper: z.enum(PAPERS).optional(),
  // Paysage du layout "scene-panel".
  scene: z.enum(SCENES).optional(),
  // Génération « libre » : paramètres qui ont produit la palette, réglages de mise en page, placements.
  paletteSpec: PaletteSpecSchema.optional(),
  layoutParams: LayoutParamsSchema.optional(),
  placements: z.array(PlacementSchema).max(8).optional(),
  seed: z.number().int().optional(),
  palette: z.object({
    background: ColorSchema,
    primary: ColorSchema,
    accent: ColorSchema,
    text: ColorSchema,
  }),
  typography: z.object({
    headingStyle: z.enum(["serif", "script", "sans", "display"]),
    bodyStyle: z.enum(["serif", "sans"]),
  }),
  decorations: z
    .array(
      z.object({
        type: z.enum(DECORATION_TYPES),
        position: z.enum(DECORATION_POSITIONS),
      })
    )
    .max(8),
  content: z.object({
    // Petite ligne au-dessus du titre : "Pour Maman", "27 septembre"…
    kicker: z.string().max(60).optional(),
    title: z.string().min(1).max(100),
    message: z.string().min(1).max(1200),
    signature: z.string().max(100),
  }),
});

export const CardDesignsSchema = z.object({
  designs: z.array(CardDesignSchema).length(4),
});

export const GenerateRequestSchema = z.object({
  occasion: z.string().trim().min(1).max(80),
  // Identifiant d'événement de l'app (christmas, birthday…) : permet d'adapter la DA.
  occasionId: z
    .enum(["christmas", "newyear", "valentine", "easter", "birthday", "mothersday", "fathersday"])
    .optional(),
  recipient: z.string().trim().min(1).max(100),
  // Lien avec le destinataire : "ma mère", "mon collègue Paul"…
  relation: z.string().trim().max(60).optional(),
  tone: z.enum(["warm", "formal", "funny", "emotional", "spiritual"]),
  message: z.string().trim().max(1200).optional(),
  language: z.enum(["fr", "en"]).default("fr"),
  // "free" : l'IA compose mise en page, palette et placements ; "curated" : looks validés à la main.
  variation: z.enum(["curated", "free"]).optional(),
});

export type CardDesign = z.infer<typeof CardDesignSchema>;
export type CardDesignsPayload = z.infer<typeof CardDesignsSchema>;
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type CardLayout = (typeof LAYOUTS)[number];
export type DecorationType = (typeof DECORATION_TYPES)[number];
export type DecorationPosition = (typeof DECORATION_POSITIONS)[number];
export type CardScene = (typeof SCENES)[number];
export type CardPaper = (typeof PAPERS)[number];
export type CardPalette = CardDesign["palette"];
export type PaletteSpec = z.infer<typeof PaletteSpecSchema>;
export type LayoutParams = z.infer<typeof LayoutParamsSchema>;
export type Placement = z.infer<typeof PlacementSchema>;
