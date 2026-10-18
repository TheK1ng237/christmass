"use client";

import type { CSSProperties, ReactNode } from "react";

import { Burst, FONT, Grain, HEADING, Photo, bodyFont, fitMessage, fitTitle } from "@/components/cards/card-kit";
import { Asset, DecorationLayer } from "@/components/cards/decorations";
import { darken, isDark, lighten, mix, seeded } from "@/lib/cards/color";
import type { CardDesign, CardPalette, CardScene, DecorationType } from "@/lib/schemas/card-design";

/**
 * Quatre mises en page supplémentaires, inspirées des cartes de référence :
 *  - hero-object : un objet-héros centré, capitales espacées, cadre fin
 *  - side-cluster : texte à gauche, grappe d'objets qui déborde sur le bord droit
 *  - type-stack : titre géant empilé sur un champ de fleurs ou une photo
 *  - scene-panel : grand panneau-paysage et texte à côté
 */

type LayoutProps = { design: CardDesign; imageUrl?: string };

/** Décors « objets » (par opposition aux semis, cadres et fonds). */
const OBJECT_TYPES: DecorationType[] = [
  "ribbon", "holly", "berries", "flowers", "tulips", "leaves", "gift", "balloons",
  "eggs", "feathers", "lily", "cross", "rose", "birds", "tie",
];

const HERO_ORDER: DecorationType[] = ["rose", "lily", "tie", "tulips", "gift", "eggs", "flowers", "balloons"];

/** Largeur du héros en cqw (hauteur d'environ 60 cqw pour chacun). */
const HERO_WIDTH: Partial<Record<DecorationType, number>> = {
  rose: 35, lily: 60, tie: 23.5, tulips: 47, gift: 56, eggs: 56, flowers: 56, balloons: 40,
};

/** Dans « objet-héros », seuls ces décors accompagnent le héros : le reste le noierait. */
const HERO_COMPANIONS: DecorationType[] = ["eggs", "feathers", "cross", "birds"];
const heroExclude = (hero?: DecorationType): DecorationType[] =>
  OBJECT_TYPES.filter((type) => !HERO_COMPANIONS.includes(type) || type === hero);

const caps = (extra?: CSSProperties): CSSProperties => ({
  fontFamily: FONT.sans,
  textTransform: "uppercase",
  ...extra,
});

/* ------------------------------------------------------------------ */
/* 5 · Objet-héros                                                     */
/* ------------------------------------------------------------------ */

function HeroObject({ design, imageUrl }: LayoutProps) {
  const { palette, content } = design;
  const heading = HEADING[design.typography.headingStyle];
  const body = bodyFont(design.typography.bodyStyle);
  const dark = isDark(palette.background);
  const hero = HERO_ORDER.find((type) => design.decorations.some((d) => d.type === type));
  const heroWidth = hero ? HERO_WIDTH[hero] ?? 50 : 56;
  const titleSize = fitTitle(8.6 * heading.scale, content.title);

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(172deg, ${lighten(palette.background, dark ? 0.1 : 0.2)} 0%, ${palette.background} 46%, ${darken(palette.background, dark ? 0.3 : 0.1)} 100%)`,
        }}
      />
      {/* lumière de fenêtre sur les fonds clairs */}
      {!dark && (
        <svg viewBox="0 0 100 140" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }} aria-hidden>
          <polygon points="8,0 44,0 66,140 30,140" fill="#ffffff" opacity="0.28" />
          <polygon points="52,0 92,0 100,60 100,140 86,140" fill="#ffffff" opacity="0.2" />
          <polygon points="0,36 100,70 100,78 0,44" fill="#ffffff" opacity="0.16" />
        </svg>
      )}
      <Grain paper={design.paper ?? "plain"} />
      <DecorationLayer design={design} scope="back" exclude={heroExclude(hero)} />

      {design.layoutParams?.frame !== "none" && (
        <div style={{ position: "absolute", inset: "4cqw", border: `.22cqw solid ${palette.accent}`, opacity: 0.85, zIndex: 3, pointerEvents: "none" }} />
      )}
      {design.layoutParams?.frame === "double" && (
        <div style={{ position: "absolute", inset: "5.4cqw", border: `.12cqw solid ${palette.accent}`, opacity: 0.6, zIndex: 3, pointerEvents: "none" }} />
      )}

      <div style={{ position: "absolute", left: "9%", right: "9%", top: "11%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", zIndex: 4 }}>
        {content.kicker && (
          <div style={caps({ fontSize: "2.5cqw", letterSpacing: ".46em", color: palette.text, opacity: 0.9, paddingLeft: ".46em" })}>
            {content.kicker}
          </div>
        )}
        <h2
          style={{
            margin: "2.4cqw 0 0",
            fontFamily: heading.family,
            fontWeight: heading.weight,
            fontSize: `${titleSize}cqw`,
            lineHeight: heading.lh,
            letterSpacing: heading.track,
            textTransform: heading.caps ? "uppercase" : "none",
            color: palette.primary,
            textShadow: `0 .3cqw 1cqw ${darken(palette.background, 0.45)}55`,
          }}
        >
          {content.title}
        </h2>
      </div>

      {/* héros */}
      <div style={{ position: "absolute", left: "50%", top: "32%", width: `${imageUrl ? 46 : heroWidth}cqw`, transform: "translateX(-50%)", zIndex: 4, filter: "drop-shadow(0 1.2cqw 1.6cqw rgba(0,0,0,.22))" }}>
        {imageUrl ? (
          <div style={{ width: "100%", aspectRatio: "4 / 5", borderRadius: "23cqw 23cqw 1cqw 1cqw", overflow: "hidden", border: `.5cqw solid ${palette.accent}` }}>
            <Photo src={imageUrl} />
          </div>
        ) : hero ? (
          <Asset type={hero} palette={palette} />
        ) : (
          <Burst palette={palette} />
        )}
      </div>

      <div style={{ position: "absolute", left: "10%", right: "10%", bottom: "7.5%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", color: palette.text, zIndex: 5 }}>
        <div style={caps({ fontSize: `${fitTitle(3.4, content.signature)}cqw`, letterSpacing: ".42em", paddingLeft: ".42em", color: dark ? lighten(palette.accent, 0.35) : darken(palette.primary, 0.05), fontWeight: 500 })}>
          {content.signature}
        </div>
        <p style={{ margin: "2.6cqw 0 0", width: "86%", fontFamily: body.family, fontSize: `${fitMessage(3.3 * body.scale, content.message)}cqw`, lineHeight: 1.5, fontWeight: design.typography.bodyStyle === "serif" ? 500 : 400 }}>
          {content.message}
        </p>
      </div>

      <div style={{ position: "absolute", inset: 0, zIndex: 6 }}>
        <DecorationLayer design={design} scope="front" exclude={heroExclude(hero)} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 6 · Grappe sur le bord                                              */
/* ------------------------------------------------------------------ */

const CLUSTER_SLOTS = [
  { t: -3, w: 34, r: -9, rot: 8 },
  { t: 17, w: 46, r: -15, rot: -6 },
  { t: 41, w: 40, r: -10, rot: 10 },
  { t: 62, w: 46, r: -15, rot: -8 },
  { t: 83, w: 34, r: -8, rot: 6 },
];

const CLUSTER_SCALE: Partial<Record<DecorationType, number>> = {
  feathers: 0.45, rose: 0.6, tie: 0.5, balloons: 0.8, gift: 0.9, flowers: 0.95, leaves: 0.8,
  berries: 0.6, ribbon: 0.9, cross: 0.3, birds: 0.8, tulips: 0.95, holly: 0.95, lily: 1, eggs: 1,
};

function SideCluster({ design, imageUrl }: LayoutProps) {
  const { palette, content } = design;
  const heading = HEADING[design.typography.headingStyle];
  const body = bodyFont(design.typography.bodyStyle);
  const dark = isDark(palette.background);
  const objects = Array.from(new Set(design.decorations.map((d) => d.type))).filter(
    (type) => OBJECT_TYPES.includes(type) && type !== "birds"
  );
  const titleSize = fitTitle(12.5 * heading.scale, content.title);
  const clusterLeft = design.layoutParams?.side === "left";

  return (
    <>
      {/* fond minéral */}
      <div style={{ position: "absolute", inset: 0, background: palette.background }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: [
            `radial-gradient(60% 40% at 20% 15%, ${lighten(palette.background, dark ? 0.12 : 0.28)}, transparent 70%)`,
            `radial-gradient(50% 36% at 75% 55%, ${darken(palette.background, dark ? 0.2 : 0.07)}, transparent 70%)`,
            `radial-gradient(70% 40% at 30% 100%, ${darken(palette.background, dark ? 0.25 : 0.1)}, transparent 70%)`,
          ].join(","),
        }}
      />
      <Grain paper={design.paper ?? "kraft"} />
      <DecorationLayer design={design} scope="back" exclude={OBJECT_TYPES} />

      <div style={{ position: "absolute", left: clusterLeft ? "38%" : "8%", width: "54%", top: "25%", color: palette.text, zIndex: 4 }}>
        {content.kicker && (
          <div style={caps({ fontSize: "3.6cqw", fontWeight: 700, letterSpacing: ".14em", color: palette.primary, marginBottom: "1.2cqw" })}>
            {content.kicker}
          </div>
        )}
        <h2
          style={{
            margin: 0,
            fontFamily: heading.family,
            fontWeight: heading.weight,
            fontSize: `${titleSize}cqw`,
            lineHeight: heading.lh,
            letterSpacing: heading.track,
            textTransform: heading.caps ? "uppercase" : "none",
            color: palette.primary,
            textShadow: `0 .55cqw .3cqw ${darken(palette.background, 0.3)}55, 0 -.12cqw 0 ${lighten(palette.background, 0.4)}`,
          }}
        >
          {content.title}
        </h2>
        <p style={{ margin: "7cqw 0 0", fontFamily: FONT.sans, fontSize: `${fitMessage(3.3 * body.scale, content.message) * 1.02}cqw`, lineHeight: 1.55, fontWeight: 600, letterSpacing: ".01em" }}>
          {content.message}
        </p>
        <div style={{ marginTop: "5cqw", fontFamily: FONT.script, fontSize: `${fitTitle(8, content.signature)}cqw`, lineHeight: 1.1, color: palette.primary }}>
          {content.signature}
        </div>
      </div>

      {imageUrl && (
        <div style={{ position: "absolute", left: "9%", bottom: "6%", width: "28%", transform: "rotate(-4deg)", background: "#fff", padding: ".9cqw .9cqw 3cqw", boxShadow: "0 1.2cqw 3cqw rgba(0,0,0,.35)", zIndex: 5 }}>
          <div style={{ aspectRatio: "1 / 1.1" }}>
            <Photo src={imageUrl} />
          </div>
        </div>
      )}

      {/* grappe d'objets qui déborde sur le bord droit */}
      {objects.length > 0 &&
        CLUSTER_SLOTS.map((slot, i) => {
          const type = objects[i % objects.length];
          const scale = CLUSTER_SCALE[type] ?? 1;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                [clusterLeft ? "left" : "right"]: `${slot.r}%`,
                top: `${slot.t}%`,
                width: `${slot.w * scale * 0.88}%`,
                transform: `rotate(${clusterLeft ? -slot.rot : slot.rot}deg)${clusterLeft ? " scaleX(-1)" : ""}`,
                zIndex: 3 + (i % 2),
                filter: "drop-shadow(0 1cqw 1.4cqw rgba(0,0,0,.22))",
              }}
            >
              <Asset type={type} palette={palette} />
            </div>
          );
        })}

      <div style={{ position: "absolute", inset: 0, zIndex: 6 }}>
        <DecorationLayer design={design} scope="front" exclude={OBJECT_TYPES} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 7 · Titre empilé                                                    */
/* ------------------------------------------------------------------ */

function stackLines(title: string): string[] {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    const first = words.slice(0, Math.ceil(words.length / 2)).join(" ");
    const second = words.slice(Math.ceil(words.length / 2)).join(" ");
    return [first, second];
  }
  if (words.length === 2) return words;
  const word = words[0] ?? title;
  if (word.length <= 3) return [word];
  const cut = Math.ceil(word.length / 2);
  return [word.slice(0, cut), word.slice(cut)];
}

const BLOOM_TYPES: DecorationType[] = [
  "holly", "berries", "flowers", "rose", "lily", "tulips", "balloons", "eggs", "feathers",
];
const FLORAL: DecorationType[] = ["holly", "berries", "flowers", "rose", "lily", "tulips"];

function BloomField({ design }: { design: CardDesign }) {
  const { palette } = design;
  const rnd = seeded(`bloom-${design.id}-${design.concept}-${design.seed ?? 0}`);
  const types = Array.from(new Set(design.decorations.map((d) => d.type))).filter((type) => BLOOM_TYPES.includes(type));
  // Feuillage sombre et froid, comme sur les champs de roses de référence.
  const leafPalette: CardPalette = { ...palette, accent: mix("#6E9A8C", palette.background, 0.3) };
  const items: ReactNode[] = [];

  if (types.length === 0) {
    const bursts = [
      { l: -14, t: -4, w: 62, o: 0.5 },
      { l: 46, t: 34, w: 74, o: 0.45 },
      { l: -18, t: 66, w: 56, o: 0.4 },
    ];
    return (
      <>
        {bursts.map((b, i) => (
          <div key={i} style={{ position: "absolute", left: `${b.l}%`, top: `${b.t}%`, width: `${b.w}%`, opacity: b.o }}>
            <Burst palette={palette} />
          </div>
        ))}
      </>
    );
  }

  const cols = 4;
  const rows = 6;
  // d'abord le feuillage, derrière (uniquement pour les champs de fleurs)
  const foliage = types.some((type) => FLORAL.includes(type)) ? 12 : 0;
  for (let i = 0; i < foliage; i++) {
    items.push(
      <div
        key={`l${i}`}
        style={{
          position: "absolute",
          left: `${(i % 3) * 36 - 12 + rnd() * 14}%`,
          top: `${Math.floor(i / 3) * 27 - 8 + rnd() * 10}%`,
          width: `${30 + rnd() * 16}%`,
          transform: `rotate(${Math.round(rnd() * 360)}deg)`,
          opacity: 0.9,
        }}
      >
        <Asset type="leaves" palette={leafPalette} />
      </div>
    );
  }
  for (let i = 0; i < cols * rows; i++) {
    const type = types[i % types.length];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const isTall = type === "rose" || type === "balloons";
    items.push(
      <div
        key={`b${i}`}
        style={{
          position: "absolute",
          left: `${col * 28 - 10 + rnd() * 12}%`,
          top: `${row * 19 - 8 + rnd() * 8}%`,
          width: `${(isTall ? (type === "balloons" ? 24 : 20) : 30) + rnd() * 12}%`,
          transform: `rotate(${Math.round((rnd() - 0.5) * (type === "balloons" ? 50 : isTall ? 90 : 360))}deg)`,
          filter: "drop-shadow(0 .6cqw .8cqw rgba(0,0,0,.35))",
        }}
      >
        <Asset type={type} palette={palette} />
      </div>
    );
  }
  return <>{items}</>;
}

const STACK_FACTOR = { serif: 0.74, display: 0.42, sans: 0.7, script: 0.5 } as const;
const STACK_MAX = { serif: 34, display: 50, sans: 30, script: 28 } as const;

function TypeStack({ design, imageUrl }: LayoutProps) {
  const { palette, content } = design;
  const heading = HEADING[design.typography.headingStyle];
  const style = design.typography.headingStyle;
  const lines = stackLines(content.title);
  const longest = Math.max(...lines.map((line) => line.length), 1);
  const fs = Math.min(STACK_MAX[style], 56 / (longest * STACK_FACTOR[style]));
  const line = style === "display" ? 0.92 : 0.9;
  const stroke = palette.text;

  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${lighten(palette.background, 0.08)}, ${darken(palette.background, 0.25)})` }} />
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {imageUrl ? <Photo src={imageUrl} /> : <BloomField design={design} />}
      </div>
      {/* voile pour la lisibilité */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 50% 48%, ${palette.background}CC, ${palette.background}70 62%, ${palette.background}33 100%)` }} />
      <Grain paper={design.paper ?? "night"} />
      <DecorationLayer design={design} scope="back" exclude={OBJECT_TYPES} />

      {/* filets décalés */}
      {design.layoutParams?.frame === "double" && (
        <div style={{ position: "absolute", inset: "5cqw", border: `.3cqw solid ${stroke}`, opacity: 0.85, zIndex: 3, pointerEvents: "none" }} />
      )}
      <svg viewBox="0 0 100 140" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 3, pointerEvents: "none", display: design.layoutParams?.frame === "none" || design.layoutParams?.frame === "double" ? "none" : "block" }} aria-hidden>
        <path d="M21 20 V140" stroke={stroke} strokeWidth="0.32" fill="none" opacity="0.9" />
        <path d="M79 0 V112" stroke={stroke} strokeWidth="0.32" fill="none" opacity="0.9" />
        <path d="M21 24 H52" stroke={stroke} strokeWidth="0.32" fill="none" opacity="0.9" />
        <path d="M48 114 H79" stroke={stroke} strokeWidth="0.32" fill="none" opacity="0.9" />
      </svg>

      <div style={{ position: "absolute", left: "21%", right: "21%", top: "22%", bottom: "9%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: palette.text, zIndex: 4 }}>
        {content.kicker && (
          <div style={caps({ fontSize: "3cqw", letterSpacing: ".2em", paddingLeft: ".2em", marginBottom: "3cqw" })}>{content.kicker}</div>
        )}
        <h2 style={{ margin: 0, fontFamily: heading.family, fontWeight: style === "serif" ? 500 : heading.weight, fontSize: `${fs}cqw`, lineHeight: line, letterSpacing: style === "display" ? ".01em" : "-.01em", textTransform: "uppercase", color: palette.text, textShadow: `0 .6cqw 2.2cqw ${darken(palette.background, 0.5)}66` }}>
          {lines.map((l, i) => (
            <span key={i} style={{ display: "block" }}>{l}</span>
          ))}
        </h2>
        <div style={caps({ fontSize: `${fitTitle(3.1, content.signature)}cqw`, letterSpacing: ".24em", paddingLeft: ".24em", marginTop: "4cqw", color: lighten(palette.accent, 0.3), fontWeight: 600 })}>
          {content.signature}
        </div>
        <p style={{ margin: "2.4cqw 0 0", width: "100%", fontFamily: FONT.sans, fontSize: `${fitMessage(2.8, content.message)}cqw`, lineHeight: 1.55, opacity: 0.92 }}>
          {content.message}
        </p>
      </div>

      <div style={{ position: "absolute", inset: 0, zIndex: 6 }}>
        <DecorationLayer design={design} scope="front" exclude={OBJECT_TYPES} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 8 · Panneau-paysage                                                 */
/* ------------------------------------------------------------------ */

function SceneArt({ scene, palette, seed }: { scene: CardScene; palette: CardPalette; seed: string }) {
  const rnd = seeded(`scene-${seed}-${scene}`);
  const bg = palette.background;
  const acc = palette.accent;
  const gid = `sky-${scene}-${seed.replace(/[^a-z0-9]/gi, "").slice(0, 8)}`;

  const sky: Record<CardScene, [string, string, string]> = {
    sunset: [darken(acc, 0.55), acc, lighten(acc, 0.55)],
    night: [darken(bg, 0.5), bg, mix(bg, acc, 0.3)],
    fireworks: [darken(bg, 0.45), bg, mix(bg, palette.primary, 0.25)],
    dawn: [mix(palette.primary, "#ffffff", 0.35), lighten(acc, 0.25), lighten(acc, 0.75)],
    meadow: ["#BFD9EE", lighten(acc, 0.8), "#FFFFFF"],
  };
  const [s1, s2, s3] = sky[scene];

  const stars = Array.from({ length: 46 }, () => ({ x: rnd() * 100, y: rnd() * 120, r: 0.25 + rnd() * 0.7 }));
  const burst = (cx: number, cy: number, r: number, color: string) => (
    <g key={`${cx}-${cy}`}>
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i * Math.PI * 2) / 18;
        return (
          <g key={i}>
            <line x1={cx + Math.cos(a) * r * 0.25} y1={cy + Math.sin(a) * r * 0.25} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} stroke={color} strokeWidth={0.7} strokeLinecap="round" />
            <circle cx={cx + Math.cos(a) * r * 1.1} cy={cy + Math.sin(a) * r * 1.1} r={0.9} fill={color} />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={1.6} fill={color} />
    </g>
  );

  let grass = "M0 200";
  for (let x = 0; x <= 100; x += 2) grass += ` L${x} ${(192 - rnd() * 8).toFixed(1)} L${x + 1} ${(201 - rnd() * 3).toFixed(1)}`;
  grass += " L100 210 L0 210 Z";

  const skyline = Array.from({ length: 14 }, (_, i) => ({ x: i * 7.4 - 2, w: 5 + rnd() * 3.4, h: 18 + rnd() * 42 }));

  return (
    <svg viewBox="0 0 100 210" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s1} />
          <stop offset="0.55" stopColor={s2} />
          <stop offset="1" stopColor={s3} />
        </linearGradient>
      </defs>
      <rect width="100" height="210" fill={`url(#${gid})`} />

      {(scene === "night" || scene === "fireworks") &&
        stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.5 + rnd() * 0.5} />)}

      {scene === "sunset" && (
        <>
          <circle cx="42" cy="172" r="28" fill={lighten(acc, 0.85)} opacity="0.92" />
          {[[26, 56, 1], [46, 46, 0.8], [36, 70, 0.9], [66, 62, 0.7], [18, 88, 0.8]].map(([x, y, k], i) => (
            <path key={i} d="M0 0 C 3 -4 7 -4 9 0 C 11 -4 15 -4 18 0 C 15 -1.5 11 -1 9 3 C 7 -1 3 -1.5 0 0 Z" fill="#1A100E" transform={`translate(${x} ${y}) scale(${k})`} />
          ))}
          <path d={grass} fill="#140C0B" />
        </>
      )}

      {scene === "night" && (
        <>
          <circle cx="68" cy="52" r="15" fill={lighten(acc, 0.7)} />
          <circle cx="75" cy="47" r="13" fill={s1} opacity="0.92" />
          <path d="M0 150 C 24 128 52 134 100 120 L100 210 L0 210 Z" fill={mix("#ffffff", bg, 0.18)} />
          <path d="M0 176 C 30 158 66 168 100 150 L100 210 L0 210 Z" fill="#ffffff" opacity="0.95" />
          {[[16, 140, 1.1], [32, 150, 0.8], [78, 136, 1], [90, 146, 0.7]].map(([x, y, k], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${k})`} fill={darken(bg, 0.55)}>
              <path d="M0 -24 L7 -10 H3 L10 2 H4 L12 14 H-12 L-4 2 H-10 L-3 -10 H-7 Z" />
              <rect x="-1.5" y="14" width="3" height="5" />
            </g>
          ))}
        </>
      )}

      {scene === "fireworks" && (
        <>
          {burst(30, 70, 22, acc)}
          {burst(70, 100, 26, palette.primary)}
          {burst(46, 38, 14, lighten(acc, 0.4))}
          {skyline.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={210 - b.h} width={b.w} height={b.h} fill={darken(bg, 0.6)} />
              {Array.from({ length: Math.floor(b.h / 8) }, (_, j) => (
                <rect key={j} x={b.x + 1 + (j % 2) * 2} y={210 - b.h + 3 + j * 7} width="1" height="1.4" fill={acc} opacity={rnd() > 0.45 ? 0.9 : 0.15} />
              ))}
            </g>
          ))}
        </>
      )}

      {scene === "dawn" && (
        <>
          <circle cx="50" cy="150" r="32" fill={lighten(acc, 0.85)} opacity="0.9" />
          <path d="M0 160 C 30 140 60 150 100 136 L100 210 L0 210 Z" fill={mix(acc, palette.primary, 0.3)} opacity="0.85" />
          <path d="M0 184 C 30 168 70 178 100 164 L100 210 L0 210 Z" fill={mix(palette.primary, "#5a2a3a", 0.45)} />
          {Array.from({ length: 12 }, (_, i) => {
            const x = 4 + i * 8.2 + rnd() * 3;
            const h = 14 + rnd() * 20;
            return (
              <g key={i}>
                <path d={`M${x} 210 C ${x + 2} ${210 - h / 2} ${x - 2} ${210 - h * 0.8} ${x} ${210 - h}`} stroke="#3E5A34" strokeWidth="0.9" fill="none" />
                <circle cx={x} cy={210 - h} r={2.6 + rnd() * 1.4} fill={i % 2 ? lighten(palette.primary, 0.25) : lighten(acc, 0.1)} />
              </g>
            );
          })}
        </>
      )}

      {scene === "meadow" && (
        <>
          <circle cx="74" cy="46" r="15" fill="#FFE9A8" />
          <path d="M0 140 C 30 118 62 130 100 112 L100 210 L0 210 Z" fill={mix("#A9CD93", acc, 0.12)} />
          <path d="M0 170 C 34 150 68 162 100 146 L100 210 L0 210 Z" fill={mix("#7FB06F", acc, 0.12)} />
          {[[18, 168, 1], [42, 176, 1.2], [66, 164, 0.9], [84, 180, 1.1], [30, 192, 0.9]].map(([x, y, k], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
              <ellipse cx="0" cy="0" rx="6" ry="8" fill={i % 2 ? "#FBF8F2" : lighten(palette.primary, 0.55)} />
              <path d="M-6 -1 Q0 2 6 -1" stroke={palette.primary} strokeWidth="1" fill="none" />
              <path d="M-5 3 Q0 6 5 3" stroke={acc} strokeWidth="0.8" fill="none" />
            </g>
          ))}
        </>
      )}
    </svg>
  );
}

function ScenePanel({ design, imageUrl }: LayoutProps) {
  const { palette, content } = design;
  const heading = HEADING[design.typography.headingStyle];
  const body = bodyFont(design.typography.bodyStyle);
  const scene: CardScene = design.scene ?? "sunset";
  const side = design.layoutParams?.side ?? "left";
  const shape = design.layoutParams?.shape ?? (scene === "sunset" ? "rect" : "arch");
  const panelRadius = shape === "arch" ? "26.5cqw 26.5cqw 1cqw 1cqw" : shape === "round" ? "26.5cqw" : ".8cqw";
  const titleSize = fitTitle(7.6 * heading.scale, content.title);

  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(165deg, ${lighten(palette.background, 0.06)}, ${darken(palette.background, 0.14)})` }} />
      <Grain paper={design.paper ?? "plain"} />
      <DecorationLayer design={design} scope="back" exclude={["sunset", "tie", "birds", "ribbon"]} />

      <div
        style={{
          position: "absolute",
          left: side === "right" ? "41%" : "6%",
          top: "6%",
          width: "53%",
          height: "78%",
          overflow: "hidden",
          borderRadius: panelRadius,
          boxShadow: "0 2cqw 4.5cqw rgba(0,0,0,.35)",
          zIndex: 2,
        }}
      >
        {imageUrl ? (
          <>
            <Photo src={imageUrl} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 45%, ${palette.background}99)` }} />
          </>
        ) : (
          <SceneArt scene={scene} palette={palette} seed={design.id + design.concept} />
        )}
      </div>

      <div style={{ position: "absolute", left: side === "right" ? "6%" : "63%", right: side === "right" ? "61%" : "5%", top: "24%", color: palette.text, zIndex: 4 }}>
        {content.kicker && (
          <div style={caps({ fontSize: "2.2cqw", letterSpacing: ".2em", opacity: 0.85, marginBottom: "2cqw" })}>{content.kicker}</div>
        )}
        <h2 style={{ margin: 0, fontFamily: heading.family, fontWeight: heading.weight, fontSize: `${titleSize}cqw`, lineHeight: heading.lh, letterSpacing: heading.track, textTransform: heading.caps ? "uppercase" : "none", color: palette.primary }}>
          {content.title}
        </h2>
        <div style={{ width: "5cqw", height: ".3cqw", background: palette.accent, margin: "3.2cqw 0 3cqw" }} />
        <p style={{ margin: 0, fontFamily: body.family, fontSize: `${fitMessage(2.9 * body.scale, content.message) * 0.95}cqw`, lineHeight: 1.5, fontStyle: design.typography.bodyStyle === "serif" ? "italic" : "normal", fontWeight: design.typography.bodyStyle === "serif" ? 500 : 400 }}>
          {content.message}
        </p>
      </div>

      <div style={{ position: "absolute", left: "7%", right: "7%", bottom: "4.5%", zIndex: 4, fontFamily: FONT.script, fontSize: `${fitTitle(8.4, content.signature)}cqw`, lineHeight: 1.1, color: palette.primary }}>
        {content.signature}
      </div>

      <div style={{ position: "absolute", inset: 0, zIndex: 6 }}>
        <DecorationLayer design={design} scope="front" exclude={["sunset", "tie", "birds", "ribbon"]} />
      </div>
    </>
  );
}

export const EXTRA_LAYOUTS: Record<
  "hero-object" | "side-cluster" | "type-stack" | "scene-panel",
  (props: LayoutProps) => ReactNode
> = {
  "hero-object": HeroObject,
  "side-cluster": SideCluster,
  "type-stack": TypeStack,
  "scene-panel": ScenePanel,
};
