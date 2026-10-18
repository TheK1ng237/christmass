import { NextResponse } from "next/server";

import { generateCardDesigns } from "@/lib/ai/generate-card-designs";
import { GenerateRequestSchema } from "@/lib/schemas/card-design";

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

    const message = error instanceof Error ? error.message : "La génération a échoué.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
