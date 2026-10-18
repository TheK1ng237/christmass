"use client";

import { useId } from "react";

import { darken, lighten, luminance, mix, seeded } from "@/lib/cards/color";
import type { CardPalette, DecorationPosition, DecorationType } from "@/lib/schemas/card-design";

/**
 * Décors supplémentaires : œufs, plumes, rose, lys, coucher de soleil, oiseaux,
 * cravate, arcs et croix. Branchés dans decorations.tsx (Asset + anchorsFor).
 */

export interface ExtraAnchor {
  l?: number;
  r?: number;
  t?: number;
  b?: number;
  w: number;
  rot?: number;
  flip?: "x" | "y" | "xy";
  o?: number;
}

const svgStyle = { display: "block", overflow: "visible" } as const;

/* ---------------- Pâques ---------------- */

const EGG = "M0 -52 C 32 -52 46 -4 46 22 C 46 52 24 72 0 72 C -24 72 -46 52 -46 22 C -46 -4 -32 -52 0 -52 Z";

function Eggs({ palette }: { palette: CardPalette }) {
  const id = useId().replace(/:/g, "");
  const shell = "#FBF8F2";
  const line = darken(palette.accent, 0.25);
  const blue = mix("#B9D3E6", palette.accent, 0.12);
  const speck = "#2a2424";
  const rnd = seeded(`eggs-${palette.accent}`);
  const specks = (n: number, spread: number) =>
    Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={(rnd() - 0.5) * spread} cy={-30 + rnd() * 90} r={0.9 + rnd() * 1.8} fill={speck} opacity={0.8} />
    ));
  return (
    <svg viewBox="0 0 230 250" width="100%" style={svgStyle} aria-hidden>
      <defs>
        <radialGradient id={`${id}-e`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={darken(shell, 0.1)} />
        </radialGradient>
        <clipPath id={`${id}-c`}>
          <path d={EGG} />
        </clipPath>
      </defs>
      <g transform="translate(100 120) scale(1.35)">
        <path d={EGG} fill={`url(#${id}-e)`} />
        <g clipPath={`url(#${id}-c)`}>
          <path d="M-50 -6 Q0 12 50 -6" stroke={line} strokeWidth={3} fill="none" />
          <path d="M-50 4 Q0 22 50 4" stroke={line} strokeWidth={1.2} fill="none" strokeDasharray="1 4" strokeLinecap="round" />
          <path d="M-50 46 Q0 64 50 46" stroke={line} strokeWidth={3} fill="none" />
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d="M0 0 L0 -15" stroke={line} strokeWidth={2} strokeLinecap="round" transform={`translate(0 26) rotate(${i * 45})`} />
          ))}
          <circle cx="0" cy="26" r="3" fill={line} />
        </g>
        <path d={EGG} fill="none" stroke={darken(shell, 0.2)} strokeWidth={1} />
      </g>
      <g transform="translate(184 70) rotate(14) scale(0.62)">
        <path d={EGG} fill={blue} />
        <g clipPath="none">{specks(14, 70)}</g>
      </g>
      <g transform="translate(176 190) rotate(-10) scale(0.5)">
        <path d={EGG} fill={shell} />
        {specks(12, 62)}
      </g>
    </svg>
  );
}

function Feather({ palette }: { palette: CardPalette }) {
  const id = useId().replace(/:/g, "");
  const c = mix(palette.primary, "#ffffff", 0.7);
  const barbs = Array.from({ length: 13 }, (_, i) => {
    const y = 24 + i * 11;
    const half = 26 * Math.sin((Math.PI * (y - 8)) / 184) + 4;
    return { y, half };
  });
  return (
    <svg viewBox="0 0 120 210" width="100%" style={svgStyle} aria-hidden>
      <defs>
        <linearGradient id={`${id}-f`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={darken(c, 0.12)} />
          <stop offset="0.5" stopColor={lighten(c, 0.3)} />
          <stop offset="1" stopColor={darken(c, 0.15)} />
        </linearGradient>
      </defs>
      <path d="M60 192 C 14 142 16 64 60 6 C 104 64 106 142 60 192 Z" fill={`url(#${id}-f)`} opacity={0.92} />
      {barbs.map((b, i) => (
        <g key={i} stroke={darken(c, 0.25)} strokeWidth={0.8} opacity={0.5}>
          <path d={`M60 ${b.y + 6} L${60 - b.half - 8} ${b.y - 6}`} />
          <path d={`M60 ${b.y + 6} L${60 + b.half + 8} ${b.y - 6}`} />
        </g>
      ))}
      <path d="M60 4 L60 204" stroke={darken(c, 0.35)} strokeWidth={1.6} />
    </svg>
  );
}

/** Lys blanc : pétales pointus, étamines dorées. */
function Lily({ palette }: { palette: CardPalette }) {
  const id = useId().replace(/:/g, "");
  const petal = "M0 0 C -28 -30 -24 -84 0 -112 C 24 -84 28 -30 0 0 Z";
  const gold = mix("#D49A3A", palette.accent, 0.25);
  const angles = [0, 58, 122, 180, 238, 302];
  return (
    <svg viewBox="0 0 260 260" width="100%" style={svgStyle} aria-hidden>
      <defs>
        <linearGradient id={`${id}-p`} x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0" stopColor="#E9E2CF" />
          <stop offset="0.45" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F4EFE6" />
        </linearGradient>
        <filter id={`${id}-s`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="1" dy="5" stdDeviation="4" floodColor="#40382c" floodOpacity="0.2" />
        </filter>
      </defs>
      <g transform="translate(130 140)" filter={`url(#${id}-s)`}>
        {angles.map((a, i) => (
          <g key={a} transform={`rotate(${a}) scale(${i % 2 ? 0.92 : 1})`}>
            <path d={petal} fill={`url(#${id}-p)`} stroke="#D9D0BC" strokeWidth={1} />
            <path d="M0 -6 C 2 -40 2 -70 0 -100" stroke="#CFC5AC" strokeWidth={1.2} fill="none" />
            <path d="M-8 -16 C -12 -50 -10 -74 -2 -96" stroke="#E4DCC8" strokeWidth={0.8} fill="none" />
          </g>
        ))}
        <circle r="9" fill="#C9D3A0" />
        {[-70, -38, -8, 24, 56, 90].map((a, i) => {
          const rad = (a * Math.PI) / 180;
          const len = 52 + (i % 2) * 12;
          const x = Math.cos(rad) * len;
          const y = Math.sin(rad) * len;
          return (
            <g key={a}>
              <path d={`M0 0 L${x} ${y}`} stroke="#B8C48A" strokeWidth={1.6} />
              <ellipse cx={x} cy={y} rx={4.6} ry={9} fill={gold} transform={`rotate(${a + 90} ${x} ${y})`} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function Cross({ palette }: { palette: CardPalette }) {
  const id = useId().replace(/:/g, "");
  const gold = mix("#D8B25E", palette.accent, 0.3);
  return (
    <svg viewBox="0 0 60 100" width="100%" style={svgStyle} aria-hidden>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={lighten(gold, 0.4)} />
          <stop offset="0.5" stopColor={gold} />
          <stop offset="1" stopColor={darken(gold, 0.3)} />
        </linearGradient>
      </defs>
      <rect x="26" y="2" width="8" height="96" fill={`url(#${id}-g)`} />
      <rect x="6" y="26" width="48" height="8" fill={`url(#${id}-g)`} />
    </svg>
  );
}

/* ---------------- Saint-Valentin ---------------- */

function Rose({ palette }: { palette: CardPalette }) {
  const id = useId().replace(/:/g, "");
  const pick = luminance(palette.primary) > 0.5 ? palette.accent : palette.primary;
  const red = luminance(pick) > 0.35 ? "#C2283B" : pick;
  const c = mix(red, "#C8283A", 0.25);
  const leaf = "M0 0 C 16 -10 40 -8 52 6 C 36 18 14 14 0 0 Z";
  return (
    <svg viewBox="0 0 160 270" width="100%" style={svgStyle} aria-hidden>
      <defs>
        <radialGradient id={`${id}-r`} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor={lighten(c, 0.22)} />
          <stop offset="1" stopColor={darken(c, 0.2)} />
        </radialGradient>
        <filter id={`${id}-s`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>
      <path d="M80 118 C 70 160, 92 214, 76 268" stroke="#5E7A3E" strokeWidth={5} fill="none" strokeLinecap="round" />
      <g transform="translate(77 176) rotate(-28)" fill="#3F6B3A">
        <path d={leaf} />
        <path d="M2 2 L48 6" stroke="#6E9A5A" strokeWidth={1.4} />
      </g>
      <g transform="translate(84 214) rotate(-205) scale(0.9)" fill="#4A7A42">
        <path d={leaf} />
        <path d="M2 2 L48 6" stroke="#79A664" strokeWidth={1.4} />
      </g>
      <g filter={`url(#${id}-s)`}>
        <path d="M80 126 C 56 124 40 104 44 82 C 48 58 70 46 92 50 C 116 54 126 78 118 100 C 112 118 98 128 80 126 Z" fill={darken(c, 0.15)} />
        <path d="M46 84 C 40 64 56 46 76 44 C 70 60 62 74 46 84 Z" fill={c} />
        <path d="M118 96 C 128 76 116 54 96 48 C 100 66 106 82 118 96 Z" fill={lighten(c, 0.08)} />
        <path d="M60 116 C 44 104 50 80 66 72 C 70 90 74 104 60 116 Z" fill={darken(c, 0.05)} />
        <path d="M100 118 C 116 108 118 86 108 72 C 98 86 92 102 100 118 Z" fill={c} />
        <circle cx="82" cy="84" r="30" fill={`url(#${id}-r)`} />
        <path d="M82 84 C 94 76 104 86 98 96 C 92 106 76 104 72 92 C 68 80 80 68 94 72" stroke={darken(c, 0.35)} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <path d="M62 70 C 66 62 76 58 86 60" stroke={lighten(c, 0.4)} strokeWidth={2} fill="none" opacity={0.7} strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Arcs concentriques en bandes larges (fond de carte). */
function Arcs({ palette }: { palette: CardPalette }) {
  const rings = Array.from({ length: 10 }, (_, i) => 26 + i * 12);
  const rings2 = Array.from({ length: 7 }, (_, i) => 22 + i * 12);
  return (
    <svg viewBox="0 0 100 140" width="100%" style={{ ...svgStyle, overflow: "hidden" }} preserveAspectRatio="xMidYMid slice" aria-hidden>
      {rings.map((r, i) => (
        <circle key={`a${r}`} cx="104" cy="44" r={r} fill="none" stroke={i % 2 ? "#000000" : palette.accent} strokeWidth={7} opacity={i % 2 ? 0.16 : 0.2} />
      ))}
      {rings2.map((r, i) => (
        <circle key={`b${r}`} cx="-4" cy="120" r={r} fill="none" stroke={i % 2 ? "#000000" : palette.accent} strokeWidth={7} opacity={i % 2 ? 0.14 : 0.16} />
      ))}
    </svg>
  );
}

/* ---------------- Fête des pères ---------------- */

function Sunset({ palette }: { palette: CardPalette }) {
  const id = useId().replace(/:/g, "");
  const rnd = seeded(`sunset-${palette.accent}`);
  const top = darken(palette.accent, 0.55);
  const mid = palette.accent;
  const low = lighten(palette.accent, 0.55);
  let grass = "M0 178";
  for (let x = 0; x <= 100; x += 2.2) {
    grass += ` L${x.toFixed(1)} ${(172 - rnd() * 7).toFixed(1)} L${(x + 1.1).toFixed(1)} ${(180 - rnd() * 3).toFixed(1)}`;
  }
  grass += " L100 190 L0 190 Z";
  const birds = [
    [26, 52, 1], [44, 44, 0.8], [34, 66, 0.9], [62, 58, 0.7], [18, 82, 0.8],
  ];
  return (
    <svg viewBox="0 0 100 190" width="100%" style={svgStyle} aria-hidden>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.45" stopColor={mid} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
      </defs>
      <rect width="100" height="190" fill={`url(#${id}-g)`} />
      <circle cx="40" cy="168" r="26" fill={lighten(low, 0.5)} opacity={0.9} />
      {birds.map(([x, y, s], i) => (
        <path key={i} d="M0 0 C 3 -4 7 -4 9 0 C 11 -4 15 -4 18 0 C 15 -1.5 11 -1 9 3 C 7 -1 3 -1.5 0 0 Z" fill="#1A100E" transform={`translate(${x} ${y}) scale(${s})`} />
      ))}
      <path d={grass} fill="#140C0B" />
    </svg>
  );
}

function Birds({ palette }: { palette: CardPalette }) {
  const c = darken(mix(palette.primary, palette.text, 0.5), 0.2);
  const birds = [
    [4, 36, 1.3], [38, 14, 1.1], [64, 40, 0.9], [24, 62, 0.8], [88, 18, 0.8],
  ];
  return (
    <svg viewBox="0 0 120 80" width="100%" style={svgStyle} aria-hidden>
      {birds.map(([x, y, s], i) => (
        <path key={i} d="M0 0 C 4 -5 9 -5 12 0 C 15 -5 20 -5 24 0 C 20 -2 15 -1 12 4 C 9 -1 4 -2 0 0 Z" fill={c} transform={`translate(${x} ${y}) scale(${s})`} />
      ))}
    </svg>
  );
}

function Tie({ palette }: { palette: CardPalette }) {
  const id = useId().replace(/:/g, "");
  const c = palette.accent;
  const dot = lighten(c, 0.4);
  const dots = [[60, 118], [44, 150], [76, 160], [58, 196], [40, 228], [74, 236], [56, 268]];
  return (
    <svg viewBox="0 0 120 310" width="100%" style={svgStyle} aria-hidden>
      <defs>
        <linearGradient id={`${id}-t`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={darken(c, 0.2)} />
          <stop offset="0.5" stopColor={lighten(c, 0.1)} />
          <stop offset="1" stopColor={darken(c, 0.25)} />
        </linearGradient>
      </defs>
      <path d="M0 0 L46 0 L60 26 L40 40 Z" fill="#F7F9FC" stroke="#DCE3EC" />
      <path d="M120 0 L74 0 L60 26 L80 40 Z" fill="#F7F9FC" stroke="#DCE3EC" />
      <path d="M44 22 L76 22 L84 62 L60 76 L36 62 Z" fill={`url(#${id}-t)`} />
      <path d="M36 62 L60 76 L84 62 L100 270 L60 304 L20 270 Z" fill={`url(#${id}-t)`} />
      <path d="M60 76 L60 300" stroke={darken(c, 0.3)} strokeWidth={1} opacity={0.35} />
      {dots.map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={4.6} ry={6} fill={dot} opacity={0.85} />
      ))}
    </svg>
  );
}

/* ---------------- dispatch ---------------- */

export const EXTRA_TYPES: readonly DecorationType[] = [
  "eggs", "feathers", "lily", "cross", "rose", "arcs", "sunset", "birds", "tie",
];

export function ExtraAsset({ type, palette }: { type: DecorationType; palette: CardPalette }) {
  switch (type) {
    case "eggs":
      return <Eggs palette={palette} />;
    case "feathers":
      return <Feather palette={palette} />;
    case "lily":
      return <Lily palette={palette} />;
    case "cross":
      return <Cross palette={palette} />;
    case "rose":
      return <Rose palette={palette} />;
    case "arcs":
      return <Arcs palette={palette} />;
    case "sunset":
      return <Sunset palette={palette} />;
    case "birds":
      return <Birds palette={palette} />;
    case "tie":
      return <Tie palette={palette} />;
    default:
      return null;
  }
}

export function extraAnchors(type: DecorationType, position: DecorationPosition): ExtraAnchor[] {
  const p = position;
  switch (type) {
    case "eggs":
      return p === "bottom" ? [{ r: -4, b: -2, w: 40 }, { l: -3, b: 4, w: 22, flip: "x" }]
        : p === "right" ? [{ r: -8, t: 30, w: 42 }]
        : p === "left" ? [{ l: -8, t: 30, w: 42, flip: "x" }]
        : p === "top" ? [{ l: -4, t: -4, w: 36, flip: "y" }]
        : p === "corners" ? [{ r: -5, t: 6, w: 34 }, { l: -5, b: -3, w: 30, flip: "x" }]
        : [{ r: 4, t: 46, w: 20, o: 0.35 }];
    case "feathers":
      return p === "left" ? [{ l: 0, t: 40, w: 12, rot: -16 }, { l: 8, t: 58, w: 9, rot: 10 }]
        : p === "right" ? [{ r: 0, t: 40, w: 12, rot: 16 }, { r: 8, t: 58, w: 9, rot: -10 }]
        : p === "top" ? [{ r: 10, t: -3, w: 12, rot: 160 }]
        : p === "bottom" ? [{ l: 8, b: -3, w: 12, rot: -20 }, { r: 12, b: -2, w: 10, rot: 24 }]
        : p === "corners" ? [{ l: 2, t: 6, w: 12, rot: -22 }, { r: 3, b: 4, w: 12, rot: 158 }]
        : [{ r: 6, t: 50, w: 10, rot: 20, o: 0.35 }];
    case "lily":
      return p === "corners" ? [{ l: -12, b: -4, w: 46 }, { r: -14, t: -4, w: 36, rot: 30 }]
        : p === "bottom" ? [{ r: -8, b: -6, w: 44 }, { l: -6, b: 0, w: 28, rot: -20 }]
        : p === "top" ? [{ l: -8, t: -6, w: 40 }]
        : p === "left" ? [{ l: -14, t: 38, w: 38 }]
        : p === "right" ? [{ r: -14, t: 38, w: 38, rot: 20 }]
        : [{ r: 4, t: 46, w: 24, o: 0.3 }];
    case "cross":
      return p === "bottom" ? [{ l: 46, b: 6, w: 8 }]
        : p === "left" ? [{ l: 6, t: 8, w: 7 }]
        : p === "right" ? [{ r: 6, t: 8, w: 7 }]
        : p === "corners" ? [{ l: 6, t: 5, w: 6 }, { r: 6, t: 5, w: 6 }]
        : p === "background" ? [{ l: 42, t: 44, w: 16, o: 0.12 }]
        : [{ l: 46, t: 5, w: 8 }];
    case "rose":
      return p === "bottom" ? [{ l: 38, b: -6, w: 24 }]
        : p === "left" ? [{ l: -2, b: -4, w: 24, rot: 8 }]
        : p === "right" ? [{ r: -2, b: -4, w: 24, rot: -8, flip: "x" }]
        : p === "top" ? [{ r: 8, t: -6, w: 20, rot: 180 }]
        : p === "corners" ? [{ l: -2, b: -6, w: 20, rot: 10 }, { r: -2, b: -6, w: 17, rot: -10, flip: "x" }]
        : [{ r: 4, t: 40, w: 16, o: 0.3 }];
    case "arcs":
      return [{ l: 0, t: 0, w: 100, flip: p === "left" ? "x" : undefined, o: p === "background" ? 1 : 0.85 }];
    case "sunset":
      return p === "right" ? [{ r: 6, t: 0, w: 46 }] : [{ l: 6, t: 0, w: 46 }];
    case "birds":
      return p === "bottom" ? [{ r: 8, b: 14, w: 22 }]
        : p === "corners" ? [{ l: 8, t: 14, w: 22 }, { r: 8, t: 22, w: 18, flip: "x" }]
        : p === "left" ? [{ l: 4, t: 36, w: 20 }]
        : p === "right" ? [{ r: 4, t: 36, w: 20, flip: "x" }]
        : p === "background" ? [{ l: 20, t: 40, w: 30, o: 0.4 }]
        : [{ l: 10, t: 8, w: 26 }];
    case "tie":
      return p === "left" ? [{ l: 4, t: -3, w: 16 }]
        : p === "right" ? [{ r: 4, t: -3, w: 16 }]
        : p === "corners" ? [{ l: 4, t: -3, w: 15 }, { r: 4, t: -3, w: 15 }]
        : p === "bottom" ? [{ l: 42, b: -3, w: 16, flip: "y" }]
        : p === "background" ? [{ l: 41, t: -3, w: 18, o: 0.22 }]
        : [{ l: 42, t: -3, w: 16 }];
    default:
      return [];
  }
}
