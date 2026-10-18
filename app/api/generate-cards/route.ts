import { NextResponse } from "next/server";

import { generateCardDesigns } from "@/lib/ai/generate-card-designs";
import { GenerateRequestSchema } from "@/lib/schemas/card-design";

export const runtime = "nodejs";

function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const candidate = error as { status?: unknown; message?: unknown };
  return candidate.status === 429 || (typeof candidate.message === 'string' && candidate.message.includes('429'));
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type invalide" }, { status: 415 });
    }

    const body = await request.json();
    const validation = GenerateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Paramètres invalides",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const designs = await generateCardDesigns(validation.data);

    return NextResponse.json(
      { designs },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Erreur de génération des cartes", error);

    if (isRateLimitError(error)) {
      return NextResponse.json(
        {
          code: 'RATE_LIMITED',
          error: "Le service de création est très sollicité pour le moment.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        code: 'GENERATION_FAILED',
        error: "Impossible de créer les propositions pour le moment.",
      },
      { status: 502 }
    );
  }
}
