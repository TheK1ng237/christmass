import { contrast, hslToHex, hexToHsl } from "@/lib/cards/color";
import type { CardPalette, PaletteSpec } from "@/lib/schemas/card-design";

/**
 * Génère une palette complète et lisible à partir de 3 paramètres :
 * une teinte, une harmonie et un mode clair ou sombre.
 */

const HARMONY_OFFSET: Record<PaletteSpec["harmony"], number> = {
  mono: 0,
  analogous: 32,
  complementary: 180,
  triad: 120,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function generatePalette(spec: PaletteSpec): CardPalette {
  const hue = ((spec.hue % 360) + 360) % 360;
  const sat = clamp(spec.saturation ?? 55, 20, 90);
  const hue2 = (hue + HARMONY_OFFSET[spec.harmony]) % 360;
  const dark = spec.mode === "dark";

  const palette: CardPalette = dark
    ? {
        background: hslToHex(hue, clamp(sat * 0.55, 18, 48), 11),
        text: hslToHex(hue, 22, 95),
        primary: hslToHex(hue, clamp(sat * 0.6, 25, 70), 88),
        accent: hslToHex(hue2, clamp(sat + 10, 45, 85), spec.harmony === "mono" ? 70 : 62),
      }
    : {
        background: hslToHex(hue, clamp(sat * 0.6, 22, 55), 94),
        text: hslToHex(hue, 28, 13),
        primary: hslToHex(hue, clamp(sat, 45, 80), 34),
        accent: hslToHex(hue2, clamp(sat, 40, 75), spec.harmony === "mono" ? 58 : 52),
      };

  return repairPalette(palette, dark);
}

/** Pousse la luminosité des couleurs jusqu'à obtenir un contraste correct. */
export function repairPalette(palette: CardPalette, dark = false): CardPalette {
  const push = (color: string, background: string, target: number) => {
    const [h, s0, l0] = hexToHsl(color);
    let s = s0;
    let l = l0;
    for (let i = 0; i < 24 && contrast(hslToHex(h, s, l), background) < target; i++) {
      l = dark ? Math.min(98, l + 3) : Math.max(2, l - 3);
      if (i > 12) s = Math.max(10, s - 4);
    }
    return hslToHex(h, s, l);
  };
  return {
    ...palette,
    text: push(palette.text, palette.background, 7),
    primary: push(palette.primary, palette.background, 3.4),
  };
}
