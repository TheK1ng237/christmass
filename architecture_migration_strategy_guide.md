# MakeWishes: Architecture and Migration Strategy Guide for High-End Dynamic Card Generation

## 1. Executive Summary & Diagnostic

Your current application (`MakeWishes` available on Vercel and GitHub) relies on a static text/poem generator using Gemini, rendering cards via generic templates. While functional, it suffers from a lack of visual diversity, layout personalization, and artistic direction. 

The core objective is to move away from static, monolithic card templates to a **structured design contract** powered by Gemini and rendered via sophisticated, theme-aware React and Tailwind CSS templates (such as luxury stationery styling and editorial posters).

---

## 2. What to Keep, Modify, and Add

### 🟢 What to Keep
- **Core Tech Stack:** Next.js (App Router), React, and Tailwind CSS.
- **Infrastructure:** Supabase integration (for saving/fetching cards if applicable), sharing mechanics, and PNG export features (`html-to-image` or equivalent).
- **Form State & UI Helpers:** Reusable UI components that handle inputs, user preferences, and general layout wrappers.
- **Fallback Engine:** **Crucial!** Keep your current generation engine operational until the new dual-template pipeline is fully tested and verified.

### 🟡 What to Modify
- **Gemini Service:** Transition the prompt logic from requesting plain text or unstructured poetry to returning a strictly typed JSON contract containing both content and layout configuration (`design-a` and `design-b`).
- **Card Rendering Flow:** Replace the single-layout display component with a dynamic `CardRenderer` that reads a layout specifier (`luxury-stationery`, `editorial-poster`, etc.) and injects theme tokens securely.
- **Export Workflow:** Adapt your screenshot/export capture utility to target the newly designed card components without breaking styling orfonts.

### 🔴 What to Add
- **Validation Layer:** Install `Zod` to strictly validate API payloads and Gemini's JSON responses.
- **API Route Handler:** Create a secure server-side route (`app/api/generate-cards/route.ts`) to handle keys privately.
- **AI Design Schema & Normalizer:** Typed data models defining color palettes, typographic styles, and structural decorations.
- **High-End Template Components:**
  - `LuxuryStationery` (e.g., textured frames, elegant serif typography, subtle accents).
  - `EditorialPoster` (e.g., bold asymmetric grids, high-contrast layouts).

---

## 3. Step-by-Step Implementation Roadmap

### Step 1: Install Dependencies
Ensure Zod is installed in your project:
```bash
npm install zod
```

### Step 2: Define the Design Schema
Create `lib/schemas/card-design.ts` to enforce a strict contract with Gemini:
```typescript
import { z } from "zod";

const ColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const CardDesignSchema = z.object({
  id: z.enum(["design-a", "design-b"]),
  concept: z.string().min(3).max(120),
  layout: z.enum([
    "luxury-stationery",
    "editorial-poster",
    "botanical-frame",
    "illustrated-scene",
  ]),
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
  decorations: z.array(
    z.object({
      type: z.enum(["ribbon", "holly", "flowers", "leaves", "stars", "confetti", "frame"]),
      position: z.enum(["top", "bottom", "corners", "left", "right", "background"]),
    })
  ).max(8),
  content: z.object({
    title: z.string().min(1).max(100),
    message: z.string().min(1).max(1200),
    signature: z.string().max(100),
  }),
});

export const CardDesignsSchema = z.object({
  designs: z.array(CardDesignSchema).length(2),
});

export const GenerateRequestSchema = z.object({
  occasion: z.string().trim().min(1).max(80),
  recipient: z.string().trim().min(1).max(100),
  tone: z.enum(["warm", "formal", "funny", "emotional", "spiritual"]),
  message: z.string().max(1200).optional(),
  language: z.enum(["fr", "en"]).default("fr"),
});

export type CardDesign = z.infer<typeof CardDesignSchema>;
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
```

### Step 3: Implement the Server-Side Gemini Service
Create `lib/ai/generate-card-designs.ts` to talk securely with Gemini using structured outputs:
```typescript
import "server-only";
import { GoogleGenAI } from "@google/genai";
import { CardDesignsSchema, type GenerateRequest } from "@/lib/schemas/card-design";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY manquante");

const ai = new GoogleGenAI({ apiKey });

const responseSchema = {
  type: "OBJECT",
  properties: {
    designs: {
      type: "ARRAY",
      minItems: 2,
      maxItems: 2,
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING", enum: ["design-a", "design-b"] },
          concept: { type: "STRING" },
          layout: { type: "STRING", enum: ["luxury-stationery", "editorial-poster", "botanical-frame", "illustrated-scene"] },
          palette: {
            type: "OBJECT",
            properties: {
              background: { type: "STRING" },
              primary: { type: "STRING" },
              accent: { type: "STRING" },
              text: { type: "STRING" },
            },
            required: ["background", "primary", "accent", "text"],
          },
          typography: {
            type: "OBJECT",
            properties: {
              headingStyle: { type: "STRING", enum: ["serif", "script", "sans", "display"] },
              bodyStyle: { type: "STRING", enum: ["serif", "sans"] },
            },
            required: ["headingStyle", "bodyStyle"],
          },
          decorations: {
            type: "ARRAY",
            maxItems: 8,
            items: {
              type: "OBJECT",
              properties: {
                type: { type: "STRING", enum: ["ribbon", "holly", "flowers", "leaves", "stars", "confetti", "frame"] },
                position: { type: "STRING", enum: ["top", "bottom", "corners", "left", "right", "background"] },
              },
              required: ["type", "position"],
            },
          },
          content: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              message: { type: "STRING" },
              signature: { type: "STRING" },
            },
            required: ["title", "message", "signature"],
          },
        },
        required: ["id", "concept", "layout", "palette", "typography", "decorations", "content"],
      },
    },
  },
  required: ["designs"],
};

export async function generateCardDesigns(input: GenerateRequest) {
  const prompt = `
Tu es un directeur artistique spécialisé dans les cartes de vœux haut de gamme.
Crée exactement deux propositions de cartes visuellement distinctes pour l'occasion décrite ci-dessous.

Occasion : ${input.occasion}
Destinataire : ${input.recipient}
Ton : ${input.tone}
Langue : ${input.language}
Message fourni : ${input.message ?? "À rédiger selon l'occasion."}

DESIGN A :
Composition papeterie de luxe : fond texturé, cadre fin, ruban ou ornements chics, espaces négatifs et typographie élégante.

DESIGN B :
Affiche éditoriale ou illustration graphique : composition asymétrique, titre fort, hiérarchie typographique dynamique et positionnement moderne.

CONTRAINTES :
- Les deux layouts doivent être différents.
- Ne pas se limiter à changer uniquement les couleurs.
- Respecter strictement le schéma JSON de sortie.
`;

  const result = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  if (!result.text) throw new Error("Réponse vide de Gemini");

  const parsed = CardDesignsSchema.parse(JSON.parse(result.text));
  const [a, b] = parsed.designs;

  if (a.id === b.id || a.layout === b.layout) {
    throw new Error("Les deux designs doivent être distincts");
  }

  return parsed.designs;
}
```

### Step 4: Create the API Route
Create `app/api/generate-cards/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { GenerateRequestSchema } from "@/lib/schemas/card-design";
import { generateCardDesigns } from "@/lib/ai/generate-card-designs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type invalide" }, { status: 415 });
    }

    const body = await request.json();
    const validation = GenerateRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const designs = await generateCardDesigns(validation.data);
    return NextResponse.json({ designs }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Erreur de génération des cartes", error);
    return NextResponse.json({ error: "La génération a échoué." }, { status: 500 });
  }
}
```

### Step 5: Build the Renderer & Templates
Create `components/cards/card-renderer.tsx` and your template components under `components/cards/templates/`. Using inline CSS variables (`style={{ '--card-bg': palette.background }}`) allows Tailwind classes to remain static at build-time while rendering dynamic AI color palettes safely.

---

## 4. Summary of What to Delete Later
Once your new API route, templates, and gallery view are fully tested and running alongside your application:
1. Delete old direct client-side Gemini poem generation calls.
2. Remove legacy single-layout card preview components once fully replaced by `CardRenderer`.
3. Clean up unused helper mocks or static card data templates.