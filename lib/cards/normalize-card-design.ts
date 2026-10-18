import {
  CardDesignSchema,
  type CardDesign,
} from "@/lib/schemas/card-design";
import { getEventConfig } from "@/lib/events";
import type { EventType, Language } from "@/lib/types";

export function normalizeCardDesign(
  value: unknown,
  options: {
    name: string;
    eventType: EventType;
    language: Language;
  }
): CardDesign {
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      const validated = CardDesignSchema.safeParse(parsed);
      if (validated.success) return validated.data;
    } catch {
      // Existing cards store their message as plain text; render them with a safe default design.
    }
  } else {
    const validated = CardDesignSchema.safeParse(value);
    if (validated.success) return validated.data;
  }

  const event = getEventConfig(options.eventType);
  const message = typeof value === "string" ? value : "";

  return {
    id: "design-a",
    concept: options.language === "fr" ? "Carte de vœux" : "Greeting card",
    layout: "luxury-stationery",
    paper: "ivory",
    palette: {
      background: "#F4EEE3",
      primary: event.colors.primary,
      accent: event.colors.accent,
      text: "#2A2321",
    },
    typography: { headingStyle: "serif", bodyStyle: "serif" },
    decorations: [
      { type: "frame", position: "corners" },
      { type: "ribbon", position: "corners" },
    ],
    content: {
      title: options.name || (options.language === "fr" ? event.name.fr : event.name.en),
      message,
      signature: options.language === "fr" ? "Avec amour" : "With love",
    },
  };
}
