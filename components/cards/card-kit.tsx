"use client";

import type { CSSProperties } from "react";

import type { CardDesign, CardPaper } from "@/lib/schemas/card-design";

/** Briques partagées par toutes les mises en page de cartes. */

export const FONT = {
  playfair: 'var(--font-playfair), "Playfair Display", Georgia, serif',
  cormorant: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
  script: 'var(--font-script), "Great Vibes", "Brush Script MT", cursive',
  poster: 'var(--font-poster), Impact, "Arial Narrow", sans-serif',
  sans: 'var(--font-ui), "DM Sans", Arial, sans-serif',
};

export const HEADING = {
  serif: { family: FONT.playfair, weight: 600, caps: false, scale: 1, lh: 1.04, track: "-0.01em" },
  script: { family: FONT.script, weight: 400, caps: false, scale: 1.5, lh: 1.02, track: "0" },
  sans: { family: FONT.sans, weight: 700, caps: false, scale: 0.88, lh: 1.05, track: "-0.025em" },
  display: { family: FONT.poster, weight: 400, caps: true, scale: 1.3, lh: 0.95, track: "0.01em" },
} as const;

export function bodyFont(style: CardDesign["typography"]["bodyStyle"]) {
  return style === "sans"
    ? { family: FONT.sans, scale: 0.86, italic: false }
    : { family: FONT.cormorant, scale: 1, italic: false };
}

/** Réduit la taille quand le texte est long, pour ne jamais déborder. */
export function fitTitle(base: number, text: string) {
  const len = text.length;
  const k = len <= 11 ? 1 : len <= 18 ? 0.8 : len <= 28 ? 0.64 : 0.5;
  return base * k;
}

export function fitMessage(base: number, text: string) {
  const len = text.length;
  const k = len <= 180 ? 1 : len <= 280 ? 0.92 : len <= 420 ? 0.8 : len <= 640 ? 0.68 : 0.56;
  return base * k;
}

export const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .25  0 0 0 0 .2  0 0 0 0 .15  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
)}")`;

export const PAPER_GRAIN: Record<CardPaper, number> = {
  ivory: 0.32,
  white: 0.2,
  blush: 0.26,
  kraft: 0.5,
  night: 0.14,
  plain: 0.1,
};

export function Grain({ paper }: { paper: CardPaper }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: GRAIN,
        backgroundSize: "40cqw 40cqw",
        mixBlendMode: "multiply",
        opacity: PAPER_GRAIN[paper],
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

export function Photo({ src, style }: { src: string; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      crossOrigin="anonymous"
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }}
    />
  );
}

export function Ornament({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 12" style={{ width: "22cqw", display: "block", margin: "0 auto" }} aria-hidden>
      <path d="M0 6 H48 M72 6 H120" stroke={color} strokeWidth={1} />
      <path d="M60 1 L65 6 L60 11 L55 6 Z" fill={color} />
    </svg>
  );
}


export /** Gerbe d'étincelles : objet central de la scène quand l'occasion n'a pas de cadeau (Nouvel An). */
function Burst({ palette }: { palette: CardDesign["palette"] }) {
  const rays = Array.from({ length: 16 }, (_, i) => {
    const a = (i * Math.PI * 2) / 16;
    const long = i % 2 === 0;
    const r1 = 10;
    const r2 = long ? 46 : 32;
    return { x1: 50 + Math.cos(a) * r1, y1: 50 + Math.sin(a) * r1, x2: 50 + Math.cos(a) * r2, y2: 50 + Math.sin(a) * r2, long };
  });
  const star = "M50 36 C51 46 54 49 64 50 C54 51 51 54 50 64 C49 54 46 51 36 50 C46 49 49 46 50 36 Z";
  return (
    <div style={{ position: "absolute", left: "12%", bottom: "6%", width: "76%", zIndex: 2 }}>
      <svg viewBox="0 0 100 100" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
        <circle cx="50" cy="50" r="30" fill={palette.accent} opacity={0.1} />
        {rays.map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke={r.long ? palette.accent : palette.primary} strokeWidth={r.long ? 1.1 : 0.7} strokeLinecap="round" opacity={0.9} />
        ))}
        {rays.map((r, i) => (
          <circle key={`d${i}`} cx={r.x2 + (r.x2 - 50) * 0.08} cy={r.y2 + (r.y2 - 50) * 0.08} r={r.long ? 1.6 : 1} fill={palette.accent} />
        ))}
        <path d={star} fill={palette.accent} />
      </svg>
    </div>
  );
}

