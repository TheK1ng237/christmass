import { randomInt } from "node:crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { contrast } from "@/lib/cards/color";
import { finalizeDesign, getOccasionProfile, type Look } from "@/lib/cards/occasion-profile";
import {
  CardDesignsSchema,
  DECORATION_POSITIONS,
  DECORATION_TYPES,
  LAYOUTS,
  PAPERS,
  type GenerateRequest,
} from "@/lib/schemas/card-design";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const HEADING_STYLES = ["serif", "script", "sans", "display"] as const;
const BODY_STYLES = ["serif", "sans"] as const;
const DESIGN_IDS = ["design-a", "design-b", "design-c", "design-d"] as const;

function normalizeEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
  path: string,
  repairs: string[]
): T {
  const valid = typeof value === "string" ? allowed.find((candidate) => candidate === value) : undefined;
  if (valid) return valid;
  repairs.push(path);
  return fallback;
}

function normalizeGeneratedDesigns(
  value: unknown,
  modes: readonly ("light" | "dark")[]
): { value: unknown; repairs: string[] } {
  if (!isRecord(value) || !Array.isArray(value.designs)) return { value, repairs: [] };

  const repairs: string[] = [];
  const designs = value.designs.map((design, i) => {
    if (!isRecord(design)) return design;
    const normalized: Record<string, unknown> = { ...design };
    const mode = modes[i];

    // Le mode est déterminé par le look et ne dépend pas de la réponse de Gemini.
    if (isRecord(design.paletteSpec) && mode && design.paletteSpec.mode !== mode) {
      normalized.paletteSpec = { ...design.paletteSpec, mode };
      repairs.push(`designs[${i}].paletteSpec.mode`);
    }

    if (typeof design.concept === "string" && design.concept.length > 120) {
      normalized.concept = design.concept.slice(0, 120).trimEnd();
      repairs.push(`designs[${i}].concept`);
    }

    // layout, palette, paysage et id sont imposés par le code : on neutralise les écarts de Gemini.
    normalized.id = DESIGN_IDS[i] ?? "design-a";
    normalized.layout = normalizeEnum(design.layout, LAYOUTS, "luxury-stationery", `designs[${i}].layout`, repairs);
    delete normalized.scene;

    normalized.paper = normalizeEnum(design.paper, PAPERS, "plain", `designs[${i}].paper`, repairs);

    if (isRecord(design.typography)) {
      normalized.typography = {
        ...design.typography,
        headingStyle: normalizeEnum(design.typography.headingStyle, HEADING_STYLES, "serif", `designs[${i}].typography.headingStyle`, repairs),
        bodyStyle: normalizeEnum(design.typography.bodyStyle, BODY_STYLES, "serif", `designs[${i}].typography.bodyStyle`, repairs),
      };
    }

    if (Array.isArray(design.decorations)) {
      // Les décors inconnus sont écartés plutôt que remplacés au hasard.
      normalized.decorations = design.decorations
        .filter(
          (d) =>
            isRecord(d) &&
            typeof d.type === "string" &&
            (DECORATION_TYPES as readonly string[]).includes(d.type)
        )
        .map((d, j) => {
          const decoration = d as Record<string, unknown>;
          return {
            type: decoration.type,
            position: normalizeEnum(decoration.position, DECORATION_POSITIONS, "corners", `designs[${i}].decorations[${j}].position`, repairs),
          };
        })
        .slice(0, 8);
    }
    return normalized;
  });

  return { value: { ...value, designs }, repairs };
}

function shuffle<T>(values: readonly T[]): T[] {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function extractJsonPayload(rawText: string): unknown {
  const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/g, "").trim();
  const candidate = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return JSON.parse(candidate ? candidate[0] : cleaned);
}

/* ------------------------------------------------------------------ */
/* Couleurs dynamiques : mise en page et décors restent ceux des looks  */
/* validés, seule la palette change à chaque génération.               */
/* ------------------------------------------------------------------ */

type Harmony = "mono" | "analogous" | "complementary" | "triad";
type Palette = Look["palette"];

const HARMONIES: Harmony[] = ["mono", "analogous", "complementary", "triad"];
const HARMONY_OFFSET: Record<Harmony, number> = { mono: 0, analogous: 32, complementary: 180, triad: 120 };
/** Écart maximal (en degrés) entre la teinte de l'IA et la teinte d'inspiration du look. */
const MAX_HUE_DRIFT = 70;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l * 100];
  const s = d / (1 - Math.abs(2 * l - 1));
  let hue = 0;
  if (max === r) hue = ((g - b) / d) % 6;
  else if (max === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;
  return [(hue * 60 + 360) % 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number) {
  const sat = clamp(s, 0, 100) / 100;
  const lum = clamp(l, 0, 100) / 100;
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * lum - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lum - c / 2;
  const [r, g, b] =
    hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
  return `#${[r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("")}`;
}

/** Pousse la luminosité d'une couleur jusqu'à obtenir le contraste voulu. */
function pushContrast(color: string, background: string, target: number, dark: boolean) {
  const [h, s0, l0] = hexToHsl(color);
  let s = s0;
  let l = l0;
  for (let i = 0; i < 24 && contrast(hslToHex(h, s, l), background) < target; i++) {
    l = dark ? Math.min(98, l + 3) : Math.max(2, l - 3);
    if (i > 12) s = Math.max(10, s - 4);
  }
  return hslToHex(h, s, l);
}

function paletteFromSpec(hue: number, harmony: Harmony, saturation: number, dark: boolean): Palette {
  const sat = clamp(saturation, 20, 90);
  const hue2 = (hue + HARMONY_OFFSET[harmony]) % 360;
  const palette: Palette = dark
    ? {
        background: hslToHex(hue, clamp(sat * 0.7, 28, 60), 17),
        text: hslToHex(hue, 22, 95),
        primary: hslToHex(hue, clamp(sat * 0.6, 25, 70), 88),
        accent: hslToHex(hue2, clamp(sat + 10, 45, 85), harmony === "mono" ? 70 : 62),
      }
    : {
        background: hslToHex(hue, clamp(sat * 0.6, 22, 55), 94),
        text: hslToHex(hue, 28, 13),
        primary: hslToHex(hue, clamp(sat, 45, 80), 34),
        accent: hslToHex(hue2, clamp(sat, 40, 75), harmony === "mono" ? 58 : 52),
      };
  return {
    ...palette,
    text: pushContrast(palette.text, palette.background, 7, dark),
    primary: pushContrast(palette.primary, palette.background, 3.4, dark),
  };
}

/** Teinte « de voix » d'un look : celle de la couleur la plus chargée (primaire ou accent). */
function lookHue(palette: Palette) {
  const chroma = (hex: string) => {
    const [, s, l] = hexToHsl(hex);
    return s * (1 - Math.abs(l / 50 - 1));
  };
  const source = chroma(palette.accent) > chroma(palette.primary) ? palette.accent : palette.primary;
  return hexToHsl(source)[0];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Palette dynamique d'un look. Le mode clair ou sombre reste celui du look (les mises en page
 * en dépendent) ; la teinte, l'harmonie et la saturation viennent de l'IA, bornées autour de
 * la teinte d'inspiration. Sans réponse exploitable, la variation est tirée au hasard.
 */
export function dynamicPalette(look: Look, rawSpec: unknown): Palette {
  const dark = hexToHsl(look.palette.background)[2] < 40;
  const base = lookHue(look.palette);

  const spec = isRecord(rawSpec) ? rawSpec : {};
  const aiHue = typeof spec.hue === "number" && Number.isFinite(spec.hue) ? spec.hue : undefined;
  const aiHarmony = HARMONIES.find((harmony) => harmony === spec.harmony);
  const aiSat = typeof spec.saturation === "number" && Number.isFinite(spec.saturation) ? spec.saturation : undefined;

  const targetHue = aiHue ?? base + randomInt(-MAX_HUE_DRIFT, MAX_HUE_DRIFT + 1);
  const delta = clamp(((targetHue - base + 540) % 360) - 180, -MAX_HUE_DRIFT, MAX_HUE_DRIFT);
  const harmony = aiHarmony ?? HARMONIES[randomInt(HARMONIES.length)];
  const saturation = aiSat ?? 45 + randomInt(26);

  return paletteFromSpec(base + delta, harmony, saturation, dark);
}

export async function generateCardDesigns(input: GenerateRequest) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY manquante dans l'environnement");
  }

  const profile = getOccasionProfile(input.occasionId, input.occasion);

  // 4 looks par occasion : chacun impose sa mise en page, sa palette accordée et son paysage.
  // L'ordre est mélangé pour que la carte « A » ne soit pas toujours la même.
  const looks = shuffle(profile.looks);

  const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = ai.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: "application/json", temperature: 1 },
  });

  const who = input.relation ? `${input.recipient} (${input.relation})` : input.recipient;
  const language = input.language === "fr" ? "français" : "English";
  const allowed = [...profile.kit, ...profile.neutral].join(", ");

  const compositions = looks
    .map(
      (look, i) => `COMPOSITION ${"ABCD"[i]} (id "${DESIGN_IDS[i]}") : layout imposé "${look.layout}"
Direction : ${look.direction}
Palette d'inspiration (à ne pas recopier) : ${JSON.stringify(look.palette)}
Teinte d'inspiration : ${Math.round(lookHue(look.palette))}° ; mode imposé : ${hexToHsl(look.palette.background)[2] < 40 ? "dark" : "light"}${look.scene ? `\nPaysage imposé : "${look.scene}"` : ""}
Typographie conseillée : headingStyle "${look.heading}", bodyStyle "${look.body}"`
    )
    .join("\n\n");

  const example = looks.map((look, i) => ({
    id: DESIGN_IDS[i],
    concept: "…",
    layout: look.layout,
    paper: look.paper ?? "plain",
    palette: look.palette,
    paletteSpec: {
      hue: Math.round(lookHue(look.palette)),
      harmony: "analogous",
      mode: hexToHsl(look.palette.background)[2] < 40 ? "dark" : "light",
      saturation: 55,
    },
    ...(look.scene ? { scene: look.scene } : {}),
    typography: { headingStyle: look.heading, bodyStyle: look.body },
    decorations: [{ type: profile.kit[i % profile.kit.length], position: "corners" }],
    content: { kicker: "…", title: "…", message: "…", signature: "…" },
  }));

  const prompt = `
Tu es directeur artistique d'une maison de papeterie et de cartes de vœux haut de gamme, avec trente ans de métier. Tu ne livres pas "un texte sur un fond coloré" : tu définis, pour chaque carte, un concept graphique cohérent où le message, la typographie, les décors et le papier racontent la même histoire. Un moteur de rendu dessine ensuite chaque élément que tu choisis.

BRIEF
- Occasion : ${input.occasion}
- Destinataire : ${who}
- Ton : ${input.tone}
- Langue des textes : ${language}
- Message de l'utilisateur : ${input.message?.trim() ? `"${input.message.trim()}" (conserve son sens, améliore-le légèrement, ne l'allonge pas)` : "aucun, rédige un message personnel, naturel et concret"}
- Imagerie propre à l'occasion : ${profile.imagery}

LES 4 COMPOSITIONS
${compositions}

CE QUE TU DÉCIDES POUR CHACUNE
0. "paletteSpec" : { hue 0-360, harmony "mono" | "analogous" | "complementary" | "triad", mode "light" | "dark", saturation 20-90 }. Le mode doit reprendre exactement celui imposé pour la composition ; le code en déduit une palette lisible. Choisis une teinte à moins de 70° de la teinte d'inspiration, différente à chaque génération et différente d'une carte à l'autre ; invente un vrai parti pris de couleur (jamais deux cartes de la même teinte).
1. "concept" : une phrase de 120 caractères maximum qui décrit l'idée graphique (matière, objets, ambiance) et qui s'applique aux décors choisis.
2. "paper" : ${PAPERS.join(" | ")}
3. "typography" : headingStyle parmi ${HEADING_STYLES.join(" | ")} ; bodyStyle parmi ${BODY_STYLES.join(" | ")}. Mélange les registres comme un vrai designer : sérif classique, script pour la signature, sans espacé pour les petites lignes.
4. "decorations" : 3 à 6 éléments. Types autorisés pour cette occasion : ${allowed}. Positions : ${DECORATION_POSITIONS.join(", ")}. Choisis des décors qui existent dans l'imagerie de l'occasion et varie leurs positions.
5. "content" : kicker (court : date, "Pour Maman"…), title (1 à 3 mots forts, pas de phrase ; pour une composition à titre géant, un seul mot ou un nombre), message (150 à 280 caractères, naturel, jamais générique, sans formule toute faite), signature (courte).

RÈGLES
- Les 4 compositions doivent avoir des titres, des messages et des concepts réellement différents : quatre voix, pas quatre variantes.
- Respecte exactement les layouts et paysages imposés ; la palette, elle, est à inventer à chaque fois.
- Valeurs d'énumération : uniquement celles listées, sans traduction ni variante.

Réponds uniquement avec ce JSON :
${JSON.stringify({ designs: example }, null, 2)}
`;

  const result = await model.generateContent(prompt);
  const raw = extractJsonPayload(result.response.text());
  const rawDesigns: unknown[] = isRecord(raw) && Array.isArray(raw.designs) ? raw.designs : [];
  const normalized = normalizeGeneratedDesigns(
    raw,
    looks.map((look) => (hexToHsl(look.palette.background)[2] < 40 ? "dark" : "light"))
  );
  if (normalized.repairs.length > 0) {
    console.warn("Valeurs d'énumération Gemini normalisées", normalized.repairs);
  }

  const validated = CardDesignsSchema.safeParse(normalized.value);
  if (!validated.success) {
    throw new Error(`Réponse Gemini invalide: ${validated.error.message}`);
  }

  return validated.data.designs.map((design, index) => {
    const look = looks[index];
    return finalizeDesign(
      {
        ...design,
        id: DESIGN_IDS[index],
        layout: look.layout,
        palette: dynamicPalette(look, isRecord(rawDesigns[index]) ? rawDesigns[index].paletteSpec : undefined),
        scene: look.scene,
      },
      profile,
      input.language
    );
  });
}