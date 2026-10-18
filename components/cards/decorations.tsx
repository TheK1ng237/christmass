"use client";

import { useId, type CSSProperties, type ReactNode } from "react";

import { ExtraAsset, extraAnchors } from "@/components/cards/decorations-extra";
import { darken, lighten, mix, seeded } from "@/lib/cards/color";
import type {
  CardDesign,
  CardPalette,
  DecorationPosition,
  DecorationType,
} from "@/lib/schemas/card-design";

/**
 * Bibliothèque de décors dessinés en SVG.
 * Chaque type déclaré par Gemini ("holly", "ribbon"…) est réellement dessiné ici.
 * Les ancrages sont exprimés en % de la carte (portrait 5:7).
 */

type Flip = "x" | "y" | "xy";

interface Anchor {
  l?: number;
  r?: number;
  t?: number;
  b?: number;
  /** largeur en % de la carte */
  w: number;
  rot?: number;
  flip?: Flip;
  o?: number;
}

const LEAF_DARK = "#1E4D33";
const LEAF_MID = "#2F6B45";
const LEAF_LIGHT = "#4F9262";
const BERRY = "#C8283A";

/* ---------- briques de base ---------- */

function spikyLeafPath(len: number, width: number, spikes = 5) {
  const upper: string[] = [];
  const lower: string[] = [];
  const steps = spikes * 2;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const amp = width * Math.pow(Math.sin(Math.PI * t), 0.85);
    const y = i % 2 === 1 ? amp * 1.15 : amp * 0.6;
    upper.push(`${(len * t).toFixed(1)} ${(-y).toFixed(1)}`);
    lower.unshift(`${(len * t).toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M0 0 L${upper.join(" L")} L${len} 0 L${lower.join(" L")} Z`;
}

function Berry({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={BERRY} />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.35} r={r * 0.3} fill="#ffffff" opacity={0.55} />
      <circle cx={cx + r * 0.25} cy={cy + r * 0.3} r={r * 0.6} fill="#000" opacity={0.12} />
    </g>
  );
}

/** Branche de houx ancrée en haut à gauche, qui s'ouvre vers le bas droite. */
function Holly() {
  const leaves = [
    { a: 18, len: 128, w: 24 },
    { a: 48, len: 142, w: 26 },
    { a: 78, len: 120, w: 23 },
    { a: 33, len: 92, w: 18 },
  ];
  return (
    <svg viewBox="0 0 240 200" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      {leaves.map((leaf, i) => (
        <g key={i} transform={`translate(18 14) rotate(${leaf.a})`}>
          <path d={spikyLeafPath(leaf.len, leaf.w)} fill={i % 2 ? LEAF_MID : LEAF_DARK} stroke={LEAF_DARK} strokeWidth={2} strokeLinejoin="round" />
          <path d={spikyLeafPath(leaf.len, leaf.w)} fill={LEAF_LIGHT} opacity={0.3} transform="scale(0.96 0.5)" />
          <path d={`M0 0 L${leaf.len * 0.95} 0`} stroke={LEAF_LIGHT} strokeWidth={2} opacity={0.8} />
        </g>
      ))}
      <Berry cx={44} cy={46} r={11} />
      <Berry cx={62} cy={36} r={10} />
      <Berry cx={56} cy={60} r={11} />
      <Berry cx={36} cy={66} r={9} />
    </svg>
  );
}

function Berries() {
  return (
    <svg viewBox="0 0 120 100" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <path d="M10 8 C 30 20, 40 30, 52 46" stroke={LEAF_DARK} strokeWidth={3} fill="none" />
      <path d="M60 6 C 56 22, 56 34, 52 46" stroke={LEAF_DARK} strokeWidth={3} fill="none" />
      <Berry cx={52} cy={52} r={14} />
      <Berry cx={32} cy={44} r={12} />
      <Berry cx={72} cy={44} r={12} />
      <Berry cx={44} cy={72} r={11} />
      <Berry cx={66} cy={70} r={11} />
    </svg>
  );
}

/** Nœud de satin, boucles et deux pans. */
function SatinBow({ color }: { color: string }) {
  const id = useId().replace(/:/g, "");
  const light = lighten(color, 0.35);
  const dark = darken(color, 0.28);
  return (
    <svg viewBox="0 0 240 210" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.5" stopColor={color} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.5" stopColor={color} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      {/* pans */}
      <path d="M112 108 C 98 142, 82 170, 52 204 L 82 196 L 98 208 C 110 172, 120 142, 124 112 Z" fill={`url(#${id}-l)`} />
      <path d="M128 108 C 142 142, 158 170, 188 204 L 158 196 L 142 208 C 130 172, 120 142, 116 112 Z" fill={`url(#${id}-r)`} />
      {/* boucles */}
      <path d="M118 100 C 78 18, 4 22, 12 84 C 18 132, 84 128, 118 100 Z" fill={`url(#${id}-l)`} />
      <path d="M122 100 C 162 18, 236 22, 228 84 C 222 132, 156 128, 122 100 Z" fill={`url(#${id}-r)`} />
      <path d="M112 98 C 80 44, 40 40, 30 70" stroke={light} strokeWidth={3} fill="none" opacity={0.55} />
      <path d="M128 98 C 160 44, 200 40, 210 70" stroke={light} strokeWidth={3} fill="none" opacity={0.55} />
      <path d="M40 104 C 62 112, 90 110, 110 102" stroke={dark} strokeWidth={3} fill="none" opacity={0.35} />
      <path d="M200 104 C 178 112, 150 110, 130 102" stroke={dark} strokeWidth={3} fill="none" opacity={0.35} />
      {/* nœud */}
      <rect x="106" y="82" width="28" height="36" rx="10" fill={color} />
      <rect x="106" y="82" width="28" height="36" rx="10" fill={`url(#${id}-l)`} opacity={0.8} />
      <path d="M112 88 L112 112" stroke={light} strokeWidth={3} opacity={0.6} />
    </svg>
  );
}

/** Fleur en papier découpé : pétales en couches, ombre portée, cœur sombre. */
function PaperFlower({ palette }: { palette: CardPalette }) {
  const id = useId().replace(/:/g, "");
  const outer = lighten(palette.accent, 0.25);
  const inner = lighten(palette.primary, 0.1);
  const core = darken(mix(palette.primary, "#4a2a45", 0.6), 0.1);
  const petal = "M0 0 C -34 -16, -40 -72, 0 -96 C 40 -72, 34 -16, 0 0 Z";
  return (
    <svg viewBox="0 0 220 220" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <filter id={`${id}-s`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="2" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.22" />
        </filter>
      </defs>
      <g transform="translate(110 110)" filter={`url(#${id}-s)`}>
        {Array.from({ length: 7 }, (_, i) => (
          <path key={`o${i}`} d={petal} fill={outer} stroke={darken(outer, 0.08)} strokeWidth={1.2} transform={`rotate(${(i * 360) / 7})`} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <path key={`i${i}`} d={petal} fill={inner} stroke={darken(inner, 0.1)} strokeWidth={1} transform={`rotate(${(i * 360) / 7 + 25.7}) scale(0.72)`} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <path key={`c${i}`} d="M0 -10 L0 -44" stroke={darken(inner, 0.18)} strokeWidth={1} opacity={0.5} transform={`rotate(${(i * 360) / 7 + 25.7})`} />
        ))}
        <circle r={21} fill={core} />
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i * Math.PI * 2) / 14;
          return <circle key={i} cx={Math.cos(a) * 30} cy={Math.sin(a) * 30} r={2.6} fill={core} />;
        })}
        <circle r={8} fill={lighten(core, 0.25)} />
      </g>
    </svg>
  );
}

/** Branche de feuillage en papier découpé, ancrée en haut à gauche. */
function PaperLeaves({ palette }: { palette: CardPalette }) {
  const color = lighten(palette.accent, 0.1);
  const leaf = "M0 0 C 14 -10 24 -36 0 -62 C -24 -36 -14 -10 0 0 Z";
  const pairs = [
    { y: 34, s: 0.7, a: 52 },
    { y: 62, s: 0.85, a: 48 },
    { y: 92, s: 1, a: 44 },
    { y: 126, s: 1.05, a: 40 },
  ];
  return (
    <svg viewBox="0 0 160 220" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <path d="M26 6 C 36 60, 48 120, 70 200" stroke={darken(color, 0.12)} strokeWidth={3} fill="none" />
      {pairs.map((p, i) => {
        const x = 26 + (p.y / 200) * 40;
        return (
          <g key={i}>
            <path d={leaf} fill={color} stroke={darken(color, 0.1)} strokeWidth={1} transform={`translate(${x} ${p.y}) rotate(${p.a + 60}) scale(${p.s})`} />
            <path d={leaf} fill={mix(color, palette.primary, 0.25)} stroke={darken(color, 0.1)} strokeWidth={1} transform={`translate(${x} ${p.y}) rotate(${-p.a + 60 - 90}) scale(${p.s})`} />
          </g>
        );
      })}
      <path d={leaf} fill={color} transform="translate(26 6) rotate(160) scale(0.8)" />
    </svg>
  );
}

function Tulips({ palette }: { palette: CardPalette }) {
  const id = useId().replace(/:/g, "");
  const head = "M0 0 C -28 -4 -32 -52 -15 -70 L -6 -52 L 0 -76 L 6 -52 L 15 -70 C 32 -52 28 -4 0 0 Z";
  const stem = "#7E9A62";
  const stems = [
    { x: 60, y: 120, rot: -12, s: 1, c: palette.primary },
    { x: 110, y: 100, rot: 2, s: 1.12, c: lighten(palette.primary, 0.18) },
    { x: 160, y: 122, rot: 14, s: 0.96, c: mix(palette.primary, palette.accent, 0.35) },
  ];
  return (
    <svg viewBox="0 0 220 280" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <filter id={`${id}-s`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter={`url(#${id}-s)`}>
        <path d="M110 270 C 40 230, 20 170, 36 120" stroke={stem} strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.9} />
        <path d="M110 270 C 180 230, 200 170, 184 120" stroke={stem} strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.9} />
        {stems.map((t, i) => (
          <g key={i}>
            <path d={`M${t.x} ${t.y} L110 270`} stroke={stem} strokeWidth={5} fill="none" />
            <g transform={`translate(${t.x} ${t.y}) rotate(${t.rot}) scale(${t.s * 1.25})`}>
              <path d={head} fill={t.c} />
              <path d="M0 0 C -12 -6 -14 -40 0 -58 C 14 -40 12 -6 0 0 Z" fill={lighten(t.c, 0.28)} opacity={0.8} />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Coffret cadeau : boîte, couvercle, ruban or et nœud. */
function Gift({ palette }: { palette: CardPalette }) {
  const id = useId().replace(/:/g, "");
  const box = palette.primary;
  const band = palette.accent;
  return (
    <svg viewBox="0 0 200 210" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={darken(box, 0.12)} />
          <stop offset="0.45" stopColor={box} />
          <stop offset="1" stopColor={darken(box, 0.25)} />
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={lighten(band, 0.4)} />
          <stop offset="0.55" stopColor={band} />
          <stop offset="1" stopColor={darken(band, 0.25)} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="200" rx="80" ry="8" fill="#000" opacity={0.16} />
      <rect x="26" y="92" width="148" height="104" rx="4" fill={`url(#${id}-b)`} />
      {Array.from({ length: 6 }, (_, i) =>
        Array.from({ length: 2 }, (_, j) => (
          <path key={`${i}-${j}`} d={`M${34 + i * 12} ${150 + j * 22} l6 -6 l6 6`} stroke={band} strokeWidth={2} fill="none" opacity={0.75} />
        ))
      )}
      <rect x="18" y="68" width="164" height="32" rx="4" fill={`url(#${id}-b)`} />
      <rect x="18" y="68" width="164" height="7" fill="#fff" opacity={0.18} />
      <rect x="90" y="68" width="20" height="128" fill={`url(#${id}-g)`} />
      <path d="M100 68 C 70 20, 22 28, 40 56 C 52 76, 92 70, 100 68 Z" fill={`url(#${id}-g)`} />
      <path d="M100 68 C 130 20, 178 28, 160 56 C 148 76, 108 70, 100 68 Z" fill={`url(#${id}-g)`} />
      <path d="M52 44 C 66 40, 82 50, 94 64" stroke={lighten(band, 0.5)} strokeWidth={2} fill="none" opacity={0.7} />
      <rect x="90" y="58" width="20" height="20" rx="6" fill={darken(band, 0.05)} />
    </svg>
  );
}

function Balloons({ palette }: { palette: CardPalette }) {
  const colors = [palette.accent, palette.primary, mix(palette.accent, palette.primary, 0.5)];
  const balloons = [
    { cx: 56, cy: 66, rx: 40, ry: 52, c: colors[0] },
    { cx: 118, cy: 50, rx: 42, ry: 54, c: colors[1] },
    { cx: 150, cy: 112, rx: 34, ry: 44, c: colors[2] },
  ];
  return (
    <svg viewBox="0 0 200 300" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      {balloons.map((b, i) => (
        <path key={`s${i}`} d={`M${b.cx} ${b.cy + b.ry + 6} C ${b.cx + 10 * (i % 2 ? -1 : 1)} 190, 100 220, 100 296`} stroke="#fff" strokeOpacity={0.7} strokeWidth={1.6} fill="none" />
      ))}
      {balloons.map((b, i) => (
        <g key={i}>
          <ellipse cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={b.c} />
          <ellipse cx={b.cx + b.rx * 0.25} cy={b.cy + b.ry * 0.2} rx={b.rx * 0.7} ry={b.ry * 0.78} fill={darken(b.c, 0.14)} opacity={0.35} />
          <ellipse cx={b.cx - b.rx * 0.35} cy={b.cy - b.ry * 0.4} rx={b.rx * 0.16} ry={b.ry * 0.28} fill="#fff" opacity={0.55} transform={`rotate(-24 ${b.cx - b.rx * 0.35} ${b.cy - b.ry * 0.4})`} />
          <path d={`M${b.cx - 5} ${b.cy + b.ry + 8} L${b.cx} ${b.cy + b.ry} L${b.cx + 5} ${b.cy + b.ry + 8} Z`} fill={darken(b.c, 0.2)} />
        </g>
      ))}
    </svg>
  );
}

const HEART = "M0 9 C -22 -9 -22 -28 -9 -29 C -3 -30 0 -25 0 -22 C 0 -25 3 -30 9 -29 C 22 -28 22 -9 0 9 Z";
const SPARKLE = "M0 -10 C 1 -3 3 -1 10 0 C 3 1 1 3 0 10 C -1 3 -3 1 -10 0 C -3 -1 -1 -3 0 -10 Z";

/* ---------- ancrages ---------- */

function cornerAssetAnchors(position: DecorationPosition, w: number): Anchor[] {
  switch (position) {
    case "corners":
      return [
        { l: -6, t: -3, w },
        { r: -6, b: -3, w, flip: "xy" },
      ];
    case "top":
      return [{ r: -6, t: -3, w, flip: "x" }];
    case "bottom":
      return [{ l: -6, b: -3, w, flip: "y" }];
    case "left":
      return [{ l: -8, t: 38, w: w * 0.8 }];
    case "right":
      return [{ r: -8, t: 38, w: w * 0.8, flip: "x" }];
    default:
      return [
        { l: 6, b: 8, w: w * 0.55, flip: "y", o: 0.4 },
        { r: 6, t: 12, w: w * 0.55, flip: "x", o: 0.4 },
      ];
  }
}

function anchorsFor(
  type: DecorationType,
  position: DecorationPosition,
  layout?: CardDesign["layout"]
): Anchor[] {
  // L'affiche éditoriale réserve le coin haut-gauche au texte et la colonne de droite au titre.
  if (layout === "editorial-poster") {
    if (type === "gift") return [{ l: 40, b: 4, w: 31 }, { l: 33, b: 3, w: 15, rot: 8 }];
    if (type === "balloons") return [{ l: 40, t: -8, w: 32 }];
    if (type === "tie") return [{ l: 42, t: -4, w: 15 }];
    if (type === "birds") return [{ l: 42, t: 4, w: 24 }];
    if (type === "rose") return [{ l: 45, b: 3, w: 22 }];
    if (type === "ribbon" && position !== "left" && position !== "right" && position !== "background") {
      return [{ l: 41, t: -7, w: 30, rot: -6 }];
    }
  }
  switch (type) {
    case "holly":
      return cornerAssetAnchors(position, 46);
    case "leaves":
      return cornerAssetAnchors(position, 36);
    case "flowers":
      return position === "corners"
        ? [
            { l: -12, t: -6, w: 46, rot: -8 },
            { r: -14, b: -5, w: 42, rot: 20 },
            { l: -5, b: 18, w: 22, rot: 30 },
          ]
        : position === "top"
          ? [{ l: -8, t: -6, w: 40 }, { r: -10, t: 2, w: 28, rot: 14 }]
          : position === "bottom"
            ? [{ r: -10, b: -6, w: 42 }, { l: -6, b: 2, w: 26, rot: -16 }]
            : position === "left"
              ? [{ l: -14, t: 40, w: 34 }]
              : position === "right"
                ? [{ r: -14, t: 40, w: 34, rot: 20 }]
                : [{ r: 4, t: 46, w: 20, o: 0.35 }];
    case "tulips":
      return position === "bottom"
        ? [{ l: 4, b: -4, w: 34 }]
        : position === "left"
          ? [{ l: -4, b: 4, w: 32 }]
          : position === "right"
            ? [{ r: -4, b: 4, w: 32, flip: "x" }]
            : position === "corners"
              ? [{ l: -3, b: -3, w: 30 }, { r: -3, b: -3, w: 26, flip: "x" }]
              : position === "top"
                ? [{ r: 6, t: -2, w: 26, flip: "y", o: 0.9 }]
                : [{ r: 6, b: 6, w: 24, o: 0.35 }];
    case "berries":
      return position === "top"
        ? [{ l: 40, t: -2, w: 20 }]
        : position === "bottom"
          ? [{ r: 12, b: -2, w: 20, flip: "y" }]
          : position === "corners"
            ? [{ l: 38, t: -2, w: 18 }, { r: 8, b: 4, w: 16, flip: "xy" }]
            : position === "left"
              ? [{ l: -2, t: 48, w: 16 }]
              : position === "right"
                ? [{ r: -2, t: 48, w: 16, flip: "x" }]
                : [{ l: 8, t: 46, w: 12, o: 0.4 }];
    case "ribbon":
      return position === "top"
        ? [{ l: 28, t: -7, w: 44 }]
        : position === "bottom"
          ? [{ l: -6, b: -5, w: 46, rot: -8 }]
          : position === "corners"
            ? [{ r: -8, t: -6, w: 42, rot: 12 }, { l: -8, b: -6, w: 40, rot: -12 }]
            : position === "left"
              ? [{ l: -8, t: 44, w: 30, rot: -90 }]
              : position === "right"
                ? [{ r: -8, t: 44, w: 30, rot: 90 }]
                : [{ r: 6, t: 56, w: 24, rot: 18, o: 0.3 }];
    case "gift":
      return position === "bottom"
        ? [{ l: 30, b: 2, w: 40 }, { l: 6, b: 3, w: 20, rot: -8 }, { r: 5, b: 3, w: 24, rot: 6 }]
        : position === "corners"
          ? [{ r: 5, b: 3, w: 36 }, { l: 8, t: 22, w: 16, rot: -14 }]
          : position === "left"
            ? [{ l: 3, b: 6, w: 32 }]
            : position === "right"
              ? [{ r: 3, b: 6, w: 32 }]
              : position === "top"
                ? [{ r: 8, t: 6, w: 17, rot: 10 }, { l: 8, t: 14, w: 14, rot: -12 }]
                : [{ l: 8, t: 30, w: 14, rot: -10, o: 0.5 }, { r: 8, t: 46, w: 12, rot: 14, o: 0.5 }];
    case "balloons":
      return position === "bottom"
        ? [{ l: 4, b: -12, w: 30 }]
        : position === "left"
          ? [{ l: -2, t: 30, w: 26 }]
          : position === "right"
            ? [{ r: -2, t: 30, w: 26, flip: "x" }]
            : position === "corners"
              ? [{ r: 2, t: -6, w: 32 }, { l: 2, t: 54, w: 20, flip: "x", o: 0.9 }]
              : [{ r: 3, t: -7, w: 36 }, { l: 2, t: 4, w: 24, flip: "x" }];
    default:
      return extraAnchors(type, position);
  }
}

/* ---------- semis (étoiles, confettis, cœurs) ---------- */

interface Region {
  x: [number, number];
  y: [number, number];
}

function regionsFor(position: DecorationPosition): Region[] {
  switch (position) {
    case "top":
      return [{ x: [4, 96], y: [2, 20] }];
    case "bottom":
      return [{ x: [4, 96], y: [80, 98] }];
    case "left":
      return [{ x: [2, 16], y: [18, 82] }];
    case "right":
      return [{ x: [84, 98], y: [18, 82] }];
    case "corners":
      return [
        { x: [3, 26], y: [2, 16] },
        { x: [74, 97], y: [2, 16] },
        { x: [3, 26], y: [84, 98] },
        { x: [74, 97], y: [84, 98] },
      ];
    default:
      return [{ x: [2, 98], y: [2, 98] }];
  }
}

function Scatter({
  type,
  position,
  palette,
  seed,
  density = 1,
}: {
  type: "stars" | "confetti" | "hearts";
  position: DecorationPosition;
  palette: CardPalette;
  seed: string;
  density?: number;
}) {
  const rnd = seeded(`${seed}-${type}-${position}`);
  const regions = regionsFor(position);
  const count = Math.max(2, Math.round((type === "confetti" ? 26 : type === "stars" ? 9 : 7) * density));
  const colors = [palette.accent, palette.primary, mix(palette.accent, "#ffffff", 0.45), mix(palette.primary, palette.accent, 0.5)];
  const items: ReactNode[] = [];

  for (let i = 0; i < count; i++) {
    const region = regions[i % regions.length];
    let x = region.x[0] + rnd() * (region.x[1] - region.x[0]);
    const y = region.y[0] + rnd() * (region.y[1] - region.y[0]);
    // En arrière-plan, on laisse le centre de la carte respirer pour le texte.
    if (position === "background" && x > 22 && x < 78 && y > 24 && y < 76) {
      x = rnd() > 0.5 ? 4 + rnd() * 16 : 80 + rnd() * 16;
    }
    const color = colors[Math.floor(rnd() * colors.length)];
    const rot = Math.round(rnd() * 360);
    const size = type === "confetti" ? 1.4 + rnd() * 1.4 : type === "stars" ? 3 + rnd() * 3.4 : 3 + rnd() * 2.6;

    items.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: `${size}%`,
          transform: `rotate(${rot}deg)`,
          opacity: type === "hearts" ? 0.8 : 0.95,
        }}
      >
        {type === "confetti" ? (
          <div style={{ width: "100%", paddingBottom: i % 3 === 0 ? "100%" : "50%", background: color, borderRadius: i % 3 === 0 ? "50%" : "1px" }} />
        ) : (
          <svg viewBox="-24 -32 48 48" width="100%" style={{ display: "block" }} aria-hidden>
            <path d={type === "stars" ? SPARKLE : HEART} fill={color} transform={type === "stars" ? "translate(0 -8) scale(2)" : undefined} />
          </svg>
        )}
      </div>
    );
  }
  return <>{items}</>;
}

/* ---------- rendu ---------- */

function transformFor(a: Anchor) {
  const sx = a.flip === "x" || a.flip === "xy" ? -1 : 1;
  const sy = a.flip === "y" || a.flip === "xy" ? -1 : 1;
  const parts: string[] = [];
  if (a.rot) parts.push(`rotate(${a.rot}deg)`);
  if (sx !== 1 || sy !== 1) parts.push(`scale(${sx}, ${sy})`);
  return parts.length ? parts.join(" ") : undefined;
}

export function Asset({ type, palette }: { type: DecorationType; palette: CardPalette }) {
  switch (type) {
    case "holly":
      return <Holly />;
    case "berries":
      return <Berries />;
    case "ribbon":
      return <SatinBow color={palette.primary} />;
    case "flowers":
      return <PaperFlower palette={palette} />;
    case "leaves":
      return <PaperLeaves palette={palette} />;
    case "tulips":
      return <Tulips palette={palette} />;
    case "gift":
      return <Gift palette={palette} />;
    case "balloons":
      return <Balloons palette={palette} />;
    default:
      return <ExtraAsset type={type} palette={palette} />;
  }
}

/** Cadre fin à double filet et ornements d'angle. */
export function FrameOrnament({ palette }: { palette: CardPalette }) {
  const c = palette.accent;
  return (
    <svg viewBox="0 0 100 140" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
      <rect x="3.6" y="3.6" width="92.8" height="132.8" fill="none" stroke={c} strokeWidth={0.3} />
      <rect x="5" y="5" width="90" height="130" fill="none" stroke={c} strokeWidth={0.14} />
      {[
        [3.6, 3.6, 1, 1],
        [96.4, 3.6, -1, 1],
        [3.6, 136.4, 1, -1],
        [96.4, 136.4, -1, -1],
      ].map(([x, y, sx, sy], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
          <path d="M0 0 L7 0 M0 0 L0 7" stroke={c} strokeWidth={0.5} />
          <circle cx={2.4} cy={2.4} r={0.9} fill={c} />
        </g>
      ))}
    </svg>
  );
}

function Band({ position, palette }: { position: "left" | "right" | "background"; palette: CardPalette }) {
  const c = palette.primary;
  const gradient = `linear-gradient(90deg, ${darken(c, 0.25)}, ${c} 30%, ${lighten(c, 0.3)} 50%, ${c} 70%, ${darken(c, 0.25)})`;
  if (position === "background") {
    return (
      <div style={{ position: "absolute", left: "-20%", top: "66%", width: "140%", height: "6%", background: gradient, transform: "rotate(-24deg)", opacity: 0.22, transformOrigin: "center" }} />
    );
  }
  return (
    <div style={{ position: "absolute", top: 0, bottom: 0, [position]: "5%", width: "5.5%", background: gradient, boxShadow: "0 0 3cqw rgba(0,0,0,.18)" } as CSSProperties} />
  );
}

export function DecorationLayer({
  design,
  scope,
  exclude = [],
}: {
  design: CardDesign;
  /** "back" : éléments derrière le contenu ; "front" : par-dessus. */
  scope: "back" | "front";
  /** Types que la mise en page dessine elle-même. */
  exclude?: DecorationType[];
}) {
  const { palette } = design;
  const seed = `${design.id}${design.concept}${design.seed ?? ""}`;
  const density = design.layoutParams?.density === "airy" ? 0.6 : design.layoutParams?.density === "rich" ? 1.5 : 1;

  // Placements libres : un type placé librement n'est plus dessiné à sa position par défaut.
  const placements = (design.placements ?? []).filter(
    (p) => !["frame", "stars", "confetti", "hearts"].includes(p.type) && !exclude.includes(p.type)
  );
  const placedTypes = new Set(placements.map((p) => p.type));
  const layerOf = (p: (typeof placements)[number]) => p.layer ?? (p.type === "arcs" || p.type === "sunset" ? "back" : "front");

  const items = design.decorations.filter((d) => {
    if (exclude.includes(d.type)) return false;
    if (placedTypes.has(d.type)) return false;
    const isBack = d.position === "background";
    return scope === "back" ? isBack : !isBack;
  });

  const freeItems = placements.filter((p) => layerOf(p) === scope);

  return (
    <>
      {freeItems.map((p, i) => (
        <div
          key={`free-${p.type}-${i}`}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.w}%`,
            transform: transformFor({ w: p.w, rot: p.rot, flip: p.flip }),
            opacity: p.o,
            pointerEvents: "none",
          }}
        >
          <Asset type={p.type} palette={palette} />
        </div>
      ))}
      {items.map((d, index) => {
        const key = `${d.type}-${d.position}-${index}`;

        if (d.type === "frame") return scope === "front" ? <FrameOrnament key={key} palette={palette} /> : null;

        if (d.type === "stars" || d.type === "confetti" || d.type === "hearts") {
          return <Scatter key={key} type={d.type} position={d.position} palette={palette} seed={seed} density={density} />;
        }

        if (d.type === "ribbon" && (d.position === "left" || d.position === "right")) {
          return (
            <div key={key}>
              <Band position={d.position} palette={palette} />
            </div>
          );
        }
        if (d.type === "ribbon" && d.position === "background") {
          return <Band key={key} position="background" palette={palette} />;
        }

        return anchorsFor(d.type, d.position, design.layout).map((a, i) => (
          <div
            key={`${key}-${i}`}
            style={{
              position: "absolute",
              left: a.l !== undefined ? `${a.l}%` : undefined,
              right: a.r !== undefined ? `${a.r}%` : undefined,
              top: a.t !== undefined ? `${a.t}%` : undefined,
              bottom: a.b !== undefined ? `${a.b}%` : undefined,
              width: `${a.w}%`,
              transform: transformFor(a),
              opacity: a.o,
              pointerEvents: "none",
            }}
          >
            <Asset type={d.type} palette={palette} />
          </div>
        ));
      })}
    </>
  );
}

/** Éléments réutilisables par les mises en page (illustration du cadre photo, etc.). */
export const Illustrations = { Tulips, Gift, PaperFlower, SatinBow, Holly, Berries, PaperLeaves, Balloons };
