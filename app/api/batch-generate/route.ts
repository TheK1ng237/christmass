import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

import { generateCardDesigns } from '@/lib/ai/generate-card-designs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateShareToken } from '@/lib/utils';
import type { BatchContact, BatchGenerationResult, EventType, Language } from '@/lib/types';
import type { CardDesign } from '@/lib/schemas/card-design';

const eventTypes: EventType[] = [
    'christmas',
    'newyear',
    'valentine',
    'easter',
    'birthday',
    'mothersday',
    'fathersday',
];

const languages: Language[] = ['fr', 'en'];
const layouts: CardDesign['layout'][] = [
    'luxury-stationery',
    'editorial-poster',
    'botanical-frame',
    'illustrated-scene',
    'hero-object',
    'side-cluster',
    'type-stack',
    'scene-panel',
];

function isLanguage(value: unknown): value is Language {
    return typeof value === 'string' && languages.includes(value as Language);
}

function isEventType(value: unknown): value is EventType {
    return typeof value === 'string' && eventTypes.includes(value as EventType);
}

function isLayout(value: unknown): value is CardDesign['layout'] {
    return typeof value === 'string' && layouts.includes(value as CardDesign['layout']);
}

export async function POST(request: NextRequest) {
    const refreshedCookies: Array<{ name: string; value: string; options: CookieOptions }> = [];
    const withAuthCookies = (response: NextResponse) => {
        refreshedCookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
        });
        return response;
    };

    try {
        const authClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll: () => request.cookies.getAll(),
                    setAll: (cookiesToSet) => {
                        refreshedCookies.push(...cookiesToSet);
                    },
                },
            }
        );
        const { data: authData, error: authError } = await authClient.auth.getUser();

        if (authError && authError.name !== 'AuthSessionMissingError') {
            console.error('Unable to verify the current user for batch generation:', authError);
            return withAuthCookies(NextResponse.json({ error: 'Impossible de vérifier votre session.' }, { status: 503 }));
        }

        if (!authData.user) {
            return withAuthCookies(NextResponse.json({ error: 'Connexion requise.' }, { status: 401 }));
        }

        const body = await request.json();
        const {
            contacts,
            language,
            layout,
            eventType,
            logoUrl,
            businessName,
        } = body as {
            contacts?: BatchContact[];
            language?: Language;
            layout?: CardDesign['layout'];
            eventType?: EventType;
            logoUrl?: string;
            businessName?: string;
        };

        if (
            !Array.isArray(contacts) ||
            contacts.length === 0 ||
            contacts.length > 100 ||
            !isLanguage(language) ||
            !isLayout(layout) ||
            !isEventType(eventType)
        ) {
            return withAuthCookies(NextResponse.json({ error: 'Paramètres de génération groupée invalides' }, { status: 400 }));
        }

        const results: BatchGenerationResult[] = [];
        const designs = await generateCardDesigns({
            occasion: eventType,
            occasionId: eventType,
            recipient: '[[NAME]]',
            tone: 'warm',
            language,
            message: businessName
                ? language === 'fr'
                    ? `Un message chaleureux de la part de ${businessName}.`
                    : `A warm greeting from ${businessName}.`
                : undefined,
        });
        const requestedDesign = designs.find((candidate) => candidate.layout === layout) ?? designs[0];

        for (const contact of contacts) {
            try {
                if (!contact?.name?.trim() || !['boy', 'girl', 'neutral'].includes(contact.gender)) {
                    results.push({ success: false, error: 'Contact invalide', contact });
                    continue;
                }

                const personalize = (text: string) => text.replaceAll('[[NAME]]', contact.name);
                const design: CardDesign = {
                    ...requestedDesign,
                    content: {
                        ...requestedDesign.content,
                        title: personalize(requestedDesign.content.title) || contact.name,
                        message: personalize(requestedDesign.content.message),
                        signature: personalize(requestedDesign.content.signature),
                    },
                };
                const shareToken = generateShareToken();
                const { data, error } = await supabaseAdmin
                    .from('cards')
                    .insert({
                        name: contact.name,
                        gender: contact.gender,
                        language,
                        event_type: eventType,
                        poem: JSON.stringify(design),
                        image_url: logoUrl || null,
                        share_token: shareToken,
                        user_id: authData.user.id,
                        business_name: businessName || null,
                        phone: contact.phone || null,
                    })
                    .select()
                    .single();

                if (error) throw error;

                const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
                results.push({
                    success: true,
                    card: data,
                    contact,
                    shareUrl: `${baseUrl}/preview/${shareToken}`,
                });
            } catch (error) {
                console.error(`Échec de génération pour ${contact?.name ?? 'contact inconnu'}`, error);
                results.push({
                    success: false,
                    error: error instanceof Error ? error.message : 'Échec de génération',
                    contact,
                });
            }
        }

        return withAuthCookies(NextResponse.json({ results }, { headers: { 'Cache-Control': 'no-store' } }));
    } catch (error) {
        console.error('Erreur de génération groupée', error);
        return withAuthCookies(NextResponse.json({ error: 'La génération groupée a échoué.' }, { status: 500 }));
    }
}
