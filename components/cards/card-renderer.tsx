"use client";

import type { ReactNode } from "react";

import { FONT, Grain, HEADING, Burst, Ornament, Photo, bodyFont, fitMessage, fitTitle } from "@/components/cards/card-kit";
import { EXTRA_LAYOUTS } from "@/components/cards/card-layouts-extra";
import { DecorationLayer, Illustrations } from "@/components/cards/decorations";
import { darken, isDark, lighten, mix } from "@/lib/cards/color";
import type { CardDesign } from "@/lib/schemas/card-design";

/**
 * Rendu des cartes. Format portrait 5:7.
 * Toutes les tailles sont en `cqw` (1cqw = 1 % de la largeur de la carte) :
 * la carte garde exactement la même composition en aperçu, en vignette,
 * à l'impression et à l'export.
 */

/* ------------------------------------------------------------------ */
/* 1 · Papeterie de luxe                                               */
/* ------------------------------------------------------------------ */

function LuxuryStationery({ design, imageUrl }: { design: CardDesign; imageUrl?: string }) {
  const { palette, content } = design;
  const heading = HEADING[design.typography.headingStyle];
  const body = bodyFont(design.typography.bodyStyle);
  // Sur un fond sombre, la feuille reste un papier clair : l'encre devient la couleur du fond.
  const darkSurface = isDark(palette.background);
  const sheet = darkSurface ? "#FBF5EC" : mix(palette.background, "#ffffff", 0.78);
  const ink = darkSurface ? darken(palette.background, 0.1) : palette.text;
  const titleColor = darkSurface ? darken(palette.accent, 0.18) : palette.primary;
  // Avec une photo, la feuille a moins de place : titre et message se resserrent.
  const compact = Boolean(imageUrl);
  const params = design.layoutParams ?? {};
  const inset = params.inset ?? 12;
  const align = params.align ?? "center";
  const alignItems = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
  const frameMode = params.frame ?? "thin";
  const titleSize = fitTitle(9.5 * heading.scale, content.title) * (compact ? 0.78 : 1);
  const messageSize = fitMessage(3.9 * body.scale, content.message) * (compact ? 0.86 : 1);

  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 50% 0%, ${lighten(palette.background, 0.35)}, ${palette.background} 70%)` }} />
      <Grain paper={design.paper ?? "ivory"} />
      <DecorationLayer design={design} scope="back" />

      <div
        style={{
          position: "absolute",
          left: `${inset}%`,
          right: `${inset}%`,
          top: "12%",
          bottom: "15%",
          background: sheet,
          boxShadow: "0 1.4cqw 3.6cqw rgba(40,20,10,.22), 0 .25cqw .6cqw rgba(40,20,10,.18)",
          zIndex: 2,
        }}
      >
        {frameMode !== "none" && (
          <div style={{ position: "absolute", inset: "2.2cqw", border: `.25cqw solid ${palette.accent}88` }} />
        )}
        {frameMode === "double" && (
          <div style={{ position: "absolute", inset: "3.4cqw", border: `.12cqw solid ${palette.accent}66` }} />
        )}
        <div style={{ position: "relative", height: "100%", boxSizing: "border-box", padding: compact ? "5.5cqw 6.5cqw 7cqw" : "7cqw 6.5cqw 8cqw", display: "flex", flexDirection: "column", alignItems, textAlign: align, color: ink }}>
          {content.kicker && (
            <div style={{ fontFamily: FONT.cormorant, fontStyle: "italic", fontSize: "3.2cqw", color: darkSurface ? titleColor : palette.accent, letterSpacing: ".04em", marginBottom: "2.4cqw" }}>
              {content.kicker}
            </div>
          )}

          {imageUrl && (
            <div style={{ width: "21cqw", height: "24cqw", borderRadius: "10.5cqw 10.5cqw .6cqw .6cqw", overflow: "hidden", border: `.5cqw solid ${palette.accent}`, marginBottom: "2.2cqw", flexShrink: 0 }}>
              <Photo src={imageUrl} />
            </div>
          )}

          <h2 style={{ margin: 0, fontFamily: heading.family, fontWeight: heading.weight, fontSize: `${titleSize}cqw`, lineHeight: heading.lh, letterSpacing: heading.track, textTransform: heading.caps ? "uppercase" : "none", color: titleColor }}>
            {content.title}
          </h2>

          <div style={{ margin: compact ? "2cqw 0 2cqw" : "3.4cqw 0 3.2cqw", alignSelf: alignItems }}>
            <Ornament color={palette.accent} />
          </div>

          <p style={{ margin: 0, fontFamily: body.family, fontSize: `${messageSize}cqw`, lineHeight: 1.55, fontStyle: design.typography.bodyStyle === "serif" ? "italic" : "normal", fontWeight: design.typography.bodyStyle === "serif" ? 500 : 400, overflow: "hidden", minHeight: 0, flex: "0 1 auto" }}>
            {content.message}
          </p>

          <div style={{ marginTop: "auto", paddingTop: "3cqw", fontFamily: FONT.script, fontSize: `${fitTitle(6.8, content.signature)}cqw`, lineHeight: 1.1, color: titleColor }}>
            {content.signature}
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0, zIndex: 3 }}>
        <DecorationLayer design={design} scope="front" />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · Affiche éditoriale                                              */
/* ------------------------------------------------------------------ */

function EditorialPoster({ design, imageUrl }: { design: CardDesign; imageUrl?: string }) {
  const { palette, content } = design;
  const heading = HEADING[design.typography.headingStyle === "script" ? "display" : design.typography.headingStyle];
  const body = bodyFont(design.typography.bodyStyle);
  const title = content.title;
  const fs = Math.max(8, Math.min(22, 196 / Math.max(title.length, 1))) * (heading.caps ? 1 : 0.78);
  const tint = mix(palette.background, palette.accent, 0.28);

  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${lighten(palette.background, 0.08)}, ${darken(palette.background, 0.18)})` }} />
      <Grain paper={design.paper ?? "plain"} />

      {/* grande ombre de la photo en fond */}
      {imageUrl ? (
        <div style={{ position: "absolute", left: "34%", top: "-4%", width: "96%", height: "80%", opacity: 0.2, zIndex: 1, filter: "grayscale(.4)" }}>
          <Photo src={imageUrl} />
        </div>
      ) : (
        <div style={{ position: "absolute", left: "30%", top: "6%", width: "86cqw", height: "86cqw", borderRadius: "50%", border: `.35cqw solid ${palette.accent}55`, zIndex: 1 }} />
      )}

      <DecorationLayer design={design} scope="back" />

      {/* arche photo */}
      <div
        style={{
          position: "absolute",
          left: "5%",
          bottom: "7%",
          width: "62%",
          height: "68%",
          borderRadius: design.layoutParams?.shape === "rect" ? "1.4cqw" : design.layoutParams?.shape === "round" ? "31cqw" : "31cqw 31cqw 1.4cqw 1.4cqw",
          overflow: "hidden",
          zIndex: 2,
          background: `linear-gradient(180deg, ${tint}, ${mix(palette.background, palette.accent, 0.55)})`,
          boxShadow: "0 2cqw 5cqw rgba(0,0,0,.35)",
        }}
      >
        {imageUrl ? (
          <Photo src={imageUrl} style={{ objectPosition: "50% 20%" }} />
        ) : (
          <svg viewBox="0 0 100 110" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" aria-hidden>
            {[44, 34, 24, 14].map((r, i) => (
              <path key={r} d={`M${50 - r} 110 V${46} A${r} ${r} 0 0 1 ${50 + r} 46 V110`} fill="none" stroke={palette.primary} strokeOpacity={0.22 + i * 0.1} strokeWidth={0.6} />
            ))}
            <circle cx="50" cy="38" r="5" fill={palette.accent} opacity={0.9} />
          </svg>
        )}
      </div>

      {/* message en colonne */}
      <p style={{ position: "absolute", left: "6%", top: "5%", width: "34%", margin: 0, zIndex: 4, fontFamily: FONT.cormorant, fontStyle: "italic", fontSize: `${fitMessage(3.1 * body.scale, content.message)}cqw`, lineHeight: 1.35, color: palette.text, textAlign: "justify", opacity: 0.95 }}>
        {content.message}
      </p>

      {/* titre vertical géant */}
      <div style={{ position: "absolute", right: "3.5%", top: "4%", height: "92%", display: "flex", flexDirection: "row", gap: "1.6cqw", zIndex: 4 }}>
        <div style={{ writingMode: "vertical-rl", fontFamily: FONT.sans, fontSize: "2.5cqw", letterSpacing: ".42em", textTransform: "uppercase", color: palette.text, opacity: 0.9, whiteSpace: "nowrap", paddingTop: "1cqw" }}>
          {content.kicker}
        </div>
        <h2 style={{ margin: 0, writingMode: "vertical-rl", fontFamily: heading.family, fontWeight: heading.weight, fontSize: `${fs}cqw`, lineHeight: 0.9, letterSpacing: heading.track, textTransform: "uppercase", color: palette.primary, whiteSpace: "nowrap" }}>
          {title}
        </h2>
      </div>

      {/* signature */}
      <div style={{ position: "absolute", left: "7%", bottom: "4%", zIndex: 5, maxWidth: "34%", fontFamily: FONT.script, fontSize: `${fitTitle(11.5, content.signature)}cqw`, lineHeight: 1, color: palette.primary, textShadow: `0 .4cqw 1.6cqw ${darken(palette.background, 0.4)}` }}>
        {content.signature}
      </div>

      <div style={{ position: "absolute", inset: 0, zIndex: 6 }}>
        <DecorationLayer design={design} scope="front" />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · Papier découpé floral                                           */
/* ------------------------------------------------------------------ */

function BotanicalFrame({ design, imageUrl }: { design: CardDesign; imageUrl?: string }) {
  const { palette, content } = design;
  const heading = HEADING[design.typography.headingStyle === "script" ? "serif" : design.typography.headingStyle];
  const body = bodyFont(design.typography.bodyStyle);
  const panel = mix(palette.primary, "#ffffff", 0.7);
  const titleSize = fitTitle(11.2 * heading.scale, content.title);
  const { Tulips, Gift } = Illustrations;

  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(100% 70% at 50% 0%, ${lighten(palette.background, 0.4)}, ${palette.background})` }} />
      <Grain paper={design.paper ?? "white"} />
      <DecorationLayer design={design} scope="back" />

      {/* cadre photo incliné */}
      <div style={{ position: "absolute", left: "11%", top: "12%", width: "80%", height: "35%", transform: `rotate(${design.layoutParams?.side === "right" ? 3 : -3}deg)`, background: "#fff", padding: "1.1cqw", boxShadow: "0 1.4cqw 3.2cqw rgba(60,30,40,.25)", zIndex: 2 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: `linear-gradient(135deg, ${lighten(panel, 0.25)}, ${panel})` }}>
          {imageUrl ? (
            <Photo src={imageUrl} />
          ) : (
            <>
              <div style={{ position: "absolute", left: "3%", bottom: "-4%", width: "46%" }}>
                <Tulips palette={palette} />
              </div>
              <div style={{ position: "absolute", right: "6%", bottom: "6%", width: "34%" }}>
                <Gift palette={{ ...palette, primary: mix(palette.primary, "#ffffff", 0.45), accent: mix(palette.primary, "#ffffff", 0.7) }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* texte */}
      <div style={{ position: "absolute", left: "9%", right: "9%", top: "54%", bottom: "5%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", color: palette.text, zIndex: 3 }}>
        {content.kicker && (
          <div style={{ fontFamily: FONT.cormorant, fontSize: "3.3cqw", letterSpacing: ".1em", marginBottom: "1.4cqw", color: darken(palette.primary, 0.1) }}>
            {content.kicker}
          </div>
        )}
        <h2 style={{ margin: 0, fontFamily: heading.family, fontWeight: heading.weight === 400 ? 500 : heading.weight, fontSize: `${titleSize}cqw`, lineHeight: heading.lh, letterSpacing: heading.track, textTransform: heading.caps ? "uppercase" : "none", color: palette.text }}>
          {content.title}
        </h2>
        <p style={{ margin: "3cqw 0 0", width: "86%", fontFamily: body.family, fontSize: `${fitMessage(3.6 * body.scale, content.message)}cqw`, lineHeight: 1.5, fontStyle: design.typography.bodyStyle === "serif" ? "italic" : "normal", overflow: "hidden" }}>
          {content.message}
        </p>
        <div style={{ marginTop: "auto", fontFamily: FONT.script, fontSize: `${fitTitle(8, content.signature)}cqw`, lineHeight: 1.1, color: darken(palette.primary, 0.12) }}>
          {content.signature}
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0, zIndex: 4 }}>
        <DecorationLayer design={design} scope="front" />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4 · Scène festive                                                   */
/* ------------------------------------------------------------------ */

function IllustratedScene({ design, imageUrl }: { design: CardDesign; imageUrl?: string }) {
  const { palette, content } = design;
  const heading = HEADING[design.typography.headingStyle];
  const body = bodyFont(design.typography.bodyStyle);
  const titleSize = fitTitle(10.4 * heading.scale, content.title);
  const hasObject = design.decorations.some((d) => ["gift", "balloons", "tulips", "eggs", "lily", "rose", "sunset"].includes(d.type));

  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(110% 70% at 50% 18%, ${lighten(palette.background, 0.22)}, ${palette.background} 58%, ${darken(palette.background, 0.2)})` }} />
      {/* sol */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "26%", background: `linear-gradient(180deg, transparent, ${isDark(palette.background) ? darken(palette.background, 0.24) : mix(palette.background, palette.accent, 0.3)})` }} />
      {!hasObject && <Burst palette={palette} />}
      <Grain paper={design.paper ?? "plain"} />
      <DecorationLayer design={design} scope="back" />

      <div style={{ position: "absolute", left: "9%", right: "9%", top: "9%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", zIndex: 3, color: palette.text }}>
        {content.kicker && (
          <div style={{ fontFamily: FONT.cormorant, fontStyle: "italic", fontSize: "3.4cqw", color: palette.accent, marginBottom: "2cqw" }}>
            {content.kicker}
          </div>
        )}
        <h2 style={{ margin: 0, fontFamily: heading.family, fontWeight: heading.weight, fontSize: `${titleSize}cqw`, lineHeight: heading.lh, letterSpacing: heading.track, textTransform: heading.caps ? "uppercase" : "none", color: palette.primary, textShadow: `0 .5cqw 2cqw ${darken(palette.background, 0.35)}` }}>
          {content.title}
        </h2>
        <p style={{ margin: "3.2cqw 0 0", width: "88%", fontFamily: body.family, fontSize: `${fitMessage(3.7 * body.scale, content.message)}cqw`, lineHeight: 1.5, fontStyle: design.typography.bodyStyle === "serif" ? "italic" : "normal" }}>
          {content.message}
        </p>
        <div style={{ marginTop: "3.4cqw", fontFamily: FONT.script, fontSize: `${fitTitle(8.4, content.signature)}cqw`, lineHeight: 1.1, color: palette.accent }}>
          {content.signature}
        </div>
      </div>

      {imageUrl && (
        <div style={{ position: "absolute", right: "7%", top: "50%", width: "28%", transform: "rotate(5deg)", background: "#fff", padding: ".9cqw .9cqw 3cqw", boxShadow: "0 1.2cqw 3cqw rgba(0,0,0,.4)", zIndex: 4 }}>
          <div style={{ aspectRatio: "1 / 1.1" }}>
            <Photo src={imageUrl} />
          </div>
        </div>
      )}

      <div style={{ position: "absolute", inset: 0, zIndex: 5 }}>
        <DecorationLayer design={design} scope="front" />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

const LAYOUT_COMPONENTS: Record<CardDesign["layout"], (props: { design: CardDesign; imageUrl?: string }) => ReactNode> = {
  "luxury-stationery": LuxuryStationery,
  "editorial-poster": EditorialPoster,
  "botanical-frame": BotanicalFrame,
  "illustrated-scene": IllustratedScene,
  ...EXTRA_LAYOUTS,
};

export function CardRenderer({
  design,
  className = "",
  imageUrl,
}: {
  design: CardDesign;
  className?: string;
  imageUrl?: string;
}) {
  const Layout = LAYOUT_COMPONENTS[design.layout] ?? LuxuryStationery;

  return (
    <div className={className}>
      <div
        role="img"
        aria-label={`${design.content.title}. ${design.content.message}`}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "5 / 7",
          overflow: "hidden",
          containerType: "inline-size",
          background: design.palette.background,
          color: design.palette.text,
          boxShadow: `0 2.4rem 5rem -1.6rem ${design.palette.primary}55`,
          borderRadius: "1.2%/0.86%",
        }}
      >
        <Layout design={design} imageUrl={imageUrl} />
      </div>
    </div>
  );
}
