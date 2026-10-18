
import fetch from "node-fetch";
import { Language, Gender, GeneratedPoem, TemplateId, EventType } from "./types";
import { getEventConfig } from "./events";

/* ================= CONFIG ================= */

const API_KEY = process.env.GEMINI_API_KEY!;
const MODEL = "gemini-2.5-flash";
const MAX_RETRIES = 4;
const TIMEOUT_MS = 20000;
const MAX_POEMS = 10;

/* ================= UTILS ================= */

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

function fetchWithTimeout(url: string, options: any, timeout = TIMEOUT_MS) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("⏱️ Timeout Gemini API")), timeout)
        ),
    ]);
}

/* ================= EVENT CONTEXT ================= */

const getEventContext = (eventType: EventType, language: Language) => {
    const contexts: Record<string, Record<Language, string>> = {
        christmas: { fr: "Noël et une bonne année", en: "Merry Christmas and Happy New Year" },
        newyear: { fr: "une excellente nouvelle année pleine de bonheur et de réussite", en: "a wonderful new year full of happiness and success" },
        valentine: { fr: "une joyeuse Saint-Valentin avec tout mon amour", en: "a happy Valentine's Day with all my love" },
        easter: { fr: "de joyeuses Pâques pleines de renouveau et de joie", en: "a happy Easter full of renewal and joy" },
        birthday: { fr: "un joyeux anniversaire rempli de bonheur", en: "a happy birthday filled with joy" },
        mothersday: { fr: "une merveilleuse fête des mères", en: "a wonderful Mother's Day" },
        fathersday: { fr: "une superbe fête des pères", en: "a great Father's Day" },
    };

    return contexts[eventType]?.[language] ?? contexts["christmas"][language];
};

/* ================= GEMINI CORE ================= */

async function callGemini(prompt: string, retry = 0): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    try {
        const res: any = await fetchWithTimeout(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            }),
        });

        if ([429, 503].includes(res.status)) {
            if (retry < MAX_RETRIES) {
                const delay = Math.min(2000 * 2 ** retry, 15000);
                console.warn(`⚠️ Gemini ${res.status} → retry ${retry + 1}/${MAX_RETRIES} (${delay}ms)`);
                await sleep(delay);
                return callGemini(prompt, retry + 1);
            }
        }

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Gemini API error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("Gemini returned empty response");

        return text;
    } catch (err: any) {
        if (retry < MAX_RETRIES) {
            const delay = Math.min(2000 * 2 ** retry, 15000);
            console.warn(`⚠️ Gemini error → retry ${retry + 1}/${MAX_RETRIES}: ${err.message}`);
            await sleep(delay);
            return callGemini(prompt, retry + 1);
        }

        console.error("❌ Gemini définitivement indisponible:", err.message);
        throw err;
    }
}

/* ================= JSON PARSER ================= */

function extractJSON(text: string): any {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*\]/);

    if (!match) throw new Error("Invalid JSON format from Gemini");

    return JSON.parse(match[0]);
}

/* ================= PROMPT BUILDER ================= */

function buildPrompt(params: {
    name: string;
    label: string;
    language: Language;
    eventContext: string;
    themeName: string;
}) {
    const { name, label, language, eventContext, themeName } = params;

    return `
You are a professional poet and linguist.

GOAL:
Generate exactly 10 festive poems in ${language === "fr" ? "French" : "English"}.

CONTEXT:
Name: "${name}"
Gender label: "${label}"
Event: ${eventContext}
Theme: ${themeName}

STRUCTURE:

ODD template_id (1,3,5,7,9):
- Exactly 4 lines.
- Lines 1-2: poetic meaning or etymology of "${name}".
- Lines 3-4: festive wishes.

EVEN template_id (2,4,6,8,10):
- Acrostic poem based on "${name}".
- Each line starts with a letter of the name.
- Number of lines = number of letters.
- Lines must be poetic sentences.

STYLE MAP:
1. Classic & Traditional
2. Modern & Cheerful
3. Childlike & Playful
4. Elegant & Luxury
5. Vintage & Nostalgic
6. Cosmic & Minimalist
7. Bold & Pop
8. Botanical & Zen
9. Cinematic & Dramatic
10. Geometric & Abstract

CONSTRAINTS:
- Poems must be concise.
- Avoid long sentences.
- Each poem must be unique.
- Return ONLY valid JSON.
- Exactly 10 objects.

FORMAT:
[
 {"template_id":1,"poem":"..."},
 {"template_id":2,"poem":"..."},
 {"template_id":3,"poem":"..."},
 {"template_id":4,"poem":"..."},
 {"template_id":5,"poem":"..."},
 {"template_id":6,"poem":"..."},
 {"template_id":7,"poem":"..."},
 {"template_id":8,"poem":"..."},
 {"template_id":9,"poem":"..."},
 {"template_id":10,"poem":"..."}
]
`;
}

/* ================= MAIN FUNCTION ================= */

export async function generatePoems(
    name: string,
    gender: Gender,
    language: Language,
    eventType: EventType
): Promise<GeneratedPoem[]> {
    const eventConfig = getEventConfig(eventType);
    const eventContext = getEventContext(eventType, language);

    const genderLabels: any = {
        fr: { boy: "garçon", girl: "fille", man: "homme", woman: "femme", male: "homme", female: "femme", neutral: "personne" },
        en: { boy: "boy", girl: "girl", man: "man", woman: "woman", male: "man", female: "woman", neutral: "person" },
    };

    const label = genderLabels[language][gender] ?? genderLabels[language].neutral;

    const themeName =
        eventConfig?.name?.[language] ?? (language === "fr" ? "Fête" : "Celebration");

    const prompt = buildPrompt({ name, label, language, eventContext, themeName });

    let poems: GeneratedPoem[] = [];

    try {
        const text = await callGemini(prompt);
        poems = extractJSON(text);
    } catch (err) {
        console.error("❌ Gemini failed → fallback mode:", err);
    }

    /* ✅ GARANTIE 10 POÈMES */
    if (!Array.isArray(poems)) poems = [];

    if (poems.length < MAX_POEMS) {
        for (let i = poems.length + 1; i <= MAX_POEMS; i++) {
            poems.push({
                template_id: i as TemplateId,
                poem:
                    language === "fr"
                        ? `Joyeuse célébration ${name} ✨`
                        : `Happy celebration ${name} ✨`,
            });
        }
    }

    return poems.slice(0, MAX_POEMS);
}

/* ================= SINGLE POEM ================= */

export async function generateSinglePoem(
    companyName: string,
    gender: Gender,
    language: Language,
    eventType: EventType,
    templateId: TemplateId = 1
): Promise<GeneratedPoem> {
    const eventContext = getEventContext(eventType, language);

    const prompt = `
Write a formal greeting in ${language === "fr" ? "French" : "English"}.
Context: ${eventContext}.
Company: ${companyName}.
Use [[NAME]] as placeholder.

Return ONLY JSON:
{"template_id":${templateId},"poem":"..."}
`;

    try {
        const text = await callGemini(prompt);
        return extractJSON(text);
    } catch (err) {
        console.error("❌ Single poem fallback:", err);
        return {
            template_id: templateId,
            poem:
                language === "fr"
                    ? `Cher(e) [[NAME]], ${companyName} vous souhaite ${eventContext}.`
                    : `Dear [[NAME]], ${companyName} wishes you ${eventContext}.`,
        };
    }
}
