import type {
  CardLayout,
  CardScene,
  LayoutParams,
  Placement,
} from "@/lib/schemas/card-design";
import { DECORATION_TYPES, LayoutParamsSchema } from "@/lib/schemas/card-design";
import type { EventType } from "@/lib/types";

/**
 * Composition « libre » : ce que l'IA a le droit de décider, et les garde-fous
 * qui rendent n'importe quelle réponse sûre à afficher.
 */

/** Mises en page autorisées par occasion (les 4 looks validés y figurent toujours). */
export const LAYOUT_COMPAT: Record<EventType, CardLayout[]> = {
  christmas: ["luxury-stationery", "illustrated-scene", "scene-panel", "type-stack", "hero-object", "side-cluster"],
  newyear: ["editorial-poster", "illustrated-scene", "scene-panel", "type-stack", "hero-object", "luxury-stationery"],
  valentine: ["botanical-frame", "luxury-stationery", "hero-object", "type-stack", "side-cluster", "illustrated-scene"],
  easter: ["botanical-frame", "side-cluster", "hero-object", "illustrated-scene", "luxury-stationery", "scene-panel"],
  birthday: ["editorial-poster", "illustrated-scene", "type-stack", "side-cluster", "botanical-frame", "hero-object"],
  mothersday: ["botanical-frame", "luxury-stationery", "hero-object", "side-cluster", "illustrated-scene", "type-stack"],
  fathersday: ["editorial-poster", "luxury-stationery", "hero-object", "scene-panel", "type-stack", "side-cluster"],
};

export const SCENES_BY_EVENT: Record<EventType, CardScene[]> = {
  christmas: ["night", "dawn"],
  newyear: ["fireworks", "night"],
  valentine: ["dawn", "sunset"],
  easter: ["meadow", "dawn"],
  birthday: ["sunset", "dawn", "fireworks"],
  mothersday: ["dawn", "meadow"],
  fathersday: ["sunset", "dawn", "night"],
};

export const LAYOUT_BRIEFS: Record<CardLayout, string> = {
  "luxury-stationery":
    "Papeterie de luxe : feuille posée au centre d'un papier texturé, filets fins, ornements aux coins. Très aéré. Réglages utiles : inset (marge de la feuille), align, frame.",
  "editorial-poster":
    "Affiche éditoriale : titre vertical géant, photo ou arche, petit texte en colonne, signature manuscrite. Fort contraste. Réglage utile : shape (forme de l'arche).",
  "botanical-frame":
    "Papier découpé : cadre photo incliné avec bouquet, fleurs en papier aux ombres portées, grand titre en bas. Réglage utile : side (sens de l'inclinaison).",
  "illustrated-scene":
    "Scène festive : fond saturé avec halo, objets au sol, confettis, titre en haut. Réglage utile : density (quantité de confettis).",
  "hero-object":
    "Objet-héros centré (rose, lys, cravate, tulipes, cadeau), capitales espacées, cadre fin. Réglage utile : frame.",
  "side-cluster":
    "Texte à gauche, grappe d'objets qui déborde sur un bord. Réglage utile : side (bord où se place la grappe).",
  "type-stack":
    "Titre géant empilé en capitales sur un champ de fleurs, de ballons ou une photo, filets décalés. Réglage utile : frame.",
  "scene-panel":
    "Grand panneau-paysage (scene : sunset, night, fireworks, dawn, meadow) avec le texte à côté. Réglages utiles : side, shape.",
};

interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Zones occupées par le texte, en % de la carte : les décors libres ne doivent pas les couvrir. */
export const TEXT_ZONES: Record<CardLayout, Zone[]> = {
  "luxury-stationery": [{ x: 14, y: 16, w: 72, h: 66 }],
  "editorial-poster": [{ x: 6, y: 3, w: 36, h: 16 }, { x: 76, y: 3, w: 22, h: 94 }],
  "botanical-frame": [{ x: 9, y: 52, w: 82, h: 44 }],
  "illustrated-scene": [{ x: 9, y: 8, w: 82, h: 42 }],
  "hero-object": [{ x: 9, y: 9, w: 82, h: 22 }, { x: 10, y: 76, w: 80, h: 19 }],
  "side-cluster": [{ x: 6, y: 22, w: 58, h: 52 }],
  "type-stack": [{ x: 21, y: 22, w: 58, h: 70 }],
  "scene-panel": [{ x: 60, y: 20, w: 38, h: 46 }, { x: 5, y: 88, w: 55, h: 10 }],
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** Retire les réglages invalides plutôt que de faire échouer toute la génération. */
export function sanitizeLayoutParams(raw: unknown): LayoutParams | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const source = raw as Record<string, unknown>;
  const candidate: Record<string, unknown> = { ...source };
  if (typeof candidate.inset === "number") candidate.inset = clamp(candidate.inset, 8, 20);
  const parsed = LayoutParamsSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;

  // Réglage par réglage : on garde ceux qui sont valides.
  const kept: Record<string, unknown> = {};
  for (const key of Object.keys(LayoutParamsSchema.shape)) {
    const single = LayoutParamsSchema.safeParse({ [key]: candidate[key] });
    if (single.success && candidate[key] !== undefined) kept[key] = candidate[key];
  }
  return Object.keys(kept).length ? (kept as LayoutParams) : undefined;
}

/**
 * Nettoie les placements libres : valeurs bornées, types connus, et décalage hors
 * des zones de texte de la mise en page.
 */
export function sanitizePlacements(raw: unknown, layout: CardLayout): Placement[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const zones = TEXT_ZONES[layout];
  const result: Placement[] = [];

  for (const item of raw.slice(0, 8)) {
    if (typeof item !== "object" || item === null) continue;
    const p = item as Record<string, unknown>;
    if (typeof p.type !== "string" || !(DECORATION_TYPES as readonly string[]).includes(p.type)) continue;
    if (typeof p.x !== "number" || typeof p.y !== "number" || typeof p.w !== "number") continue;

    const w = clamp(p.w, 5, 100);
    let x = clamp(p.x, -25, 110);
    let y = clamp(p.y, -25, 110);

    // Centre approximatif de l'objet (hauteur ≈ 0,8 × largeur, en % de la hauteur de carte).
    const cx = () => x + w / 2;
    const cy = () => y + w * 0.4;
    for (const zone of zones) {
      const inside =
        cx() > zone.x + 3 && cx() < zone.x + zone.w - 3 && cy() > zone.y + 3 && cy() < zone.y + zone.h - 3;
      if (!inside) continue;
      const distances = [
        { side: "left", d: cx() - zone.x },
        { side: "right", d: zone.x + zone.w - cx() },
        { side: "top", d: cy() - zone.y },
        { side: "bottom", d: zone.y + zone.h - cy() },
      ].sort((a, b) => a.d - b.d);
      const nearest = distances[0].side;
      if (nearest === "left") x = zone.x - w * 0.8;
      else if (nearest === "right") x = zone.x + zone.w - w * 0.2;
      else if (nearest === "top") y = zone.y - w * 0.8;
      else y = zone.y + zone.h - w * 0.2;
    }

    const flip = p.flip === "x" || p.flip === "y" || p.flip === "xy" ? p.flip : undefined;
    result.push({
      type: p.type as Placement["type"],
      x: clamp(x, -25, 110),
      y: clamp(y, -25, 110),
      w,
      rot: typeof p.rot === "number" ? clamp(p.rot, -180, 180) : undefined,
      flip,
      layer: p.layer === "front" || p.layer === "back" ? p.layer : undefined,
      o: typeof p.o === "number" ? clamp(p.o, 0.15, 1) : undefined,
    });
  }

  return result.length ? result : undefined;
}
