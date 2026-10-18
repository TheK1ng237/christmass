import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { generateShareToken } from '@/lib/utils';
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import { CardDesignSchema } from "@/lib/schemas/card-design";

const GUEST_COOKIE_NAME = 'mw_guest_id';
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
    const refreshedCookies: Array<{ name: string; value: string; options: CookieOptions }> = [];
    let guestCookieToSet: string | null = null;
    const respond = (body: unknown, status = 200) => {
        const response = NextResponse.json(body, { status });

        refreshedCookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
        });

        if (guestCookieToSet) {
            response.cookies.set(GUEST_COOKIE_NAME, guestCookieToSet, {
                httpOnly: true,
                secure: request.nextUrl.protocol === 'https:',
                sameSite: 'lax',
                path: '/',
                maxAge: GUEST_COOKIE_MAX_AGE,
            });
        }

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
            console.error('Unable to verify the current user:', authError);
            return respond({ error: 'Impossible de vérifier votre session.' }, 503);
        }

        const user = authData.user;
        const body = await request.json();
        const { name, gender, language, design, image_url, event_type } = body;
        const validatedDesign = CardDesignSchema.safeParse(design);

        if (
            typeof name !== "string" ||
            !name.trim() ||
            !["boy", "girl", "neutral"].includes(gender) ||
            !["fr", "en"].includes(language) ||
            !["christmas", "newyear", "valentine", "easter", "birthday", "mothersday", "fathersday"].includes(event_type) ||
            !validatedDesign.success
        ) {
            return respond(
                { error: 'Paramètres de carte invalides' },
                400
            );
        }

        let guestId: string | null = null;
        if (!user) {
            const cookieGuestId = request.cookies.get(GUEST_COOKIE_NAME)?.value;
            guestId = cookieGuestId && UUID_PATTERN.test(cookieGuestId) ? cookieGuestId : randomUUID();
            guestCookieToSet = guestId;
        }

        const shareToken = generateShareToken();
        let data;
        let error;

        if (user) {
            const guestIdFromCookie = request.cookies.get(GUEST_COOKIE_NAME)?.value;
            if (guestIdFromCookie && UUID_PATTERN.test(guestIdFromCookie)) {
                const { error: claimError } = await supabaseAdmin
                    .from('cards')
                    .update({ user_id: user.id, guest_id: null })
                    .eq('guest_id', guestIdFromCookie)
                    .is('user_id', null);

                if (claimError) {
                    console.error('Unable to move guest cards to the signed-in account:', claimError);
                    return respond({ error: 'Impossible de rattacher vos cartes à votre compte.' }, 500);
                }
            }

            ({ data, error } = await supabaseAdmin
                .from('cards')
                .insert({
                    name,
                    gender,
                    language,
                    poem: JSON.stringify(validatedDesign.data),
                    event_type,
                    image_url: image_url || null,
                    share_token: shareToken,
                    user_id: user.id,
                })
                .select()
                .single());
        } else {
            const { data: guestCards, error: guestError } = await supabaseAdmin.rpc('create_guest_card', {
                p_name: name,
                p_gender: gender,
                p_language: language,
                p_poem: JSON.stringify(validatedDesign.data),
                p_event_type: event_type,
                p_image_url: image_url || null,
                p_share_token: shareToken,
                p_guest_id: guestId,
            });

            if (guestError) {
                console.error('Supabase guest card creation error:', guestError);
                return respond({ error: 'La création de la carte a échoué.' }, 500);
            }

            data = guestCards?.[0];
            error = null;

            if (!data) {
                return respond({
                    code: 'LOGIN_REQUIRED',
                    error: 'Les 2 cartes gratuites ont été utilisées. Connectez-vous pour en créer une autre.',
                }, 401);
            }
        }

        if (error) {
            console.error('Supabase error:', error);
            return respond({ error: error.message }, 500);
        }

        return respond({ card: data });
    } catch (error) {
        console.error('Error creating card:', error);
        return respond({ error: 'Failed to create card' }, 500);
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const shareToken = searchParams.get('token');

        if (!shareToken) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            );
        }

        // Récupérer la carte depuis la base de données
        const { data, error } = await supabaseAdmin
            .from('cards')
            .select('*')
            .eq('share_token', shareToken)
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: 'Card not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ card: data });
    } catch (error) {
        console.error('Error fetching card:', error);
        return NextResponse.json(
            { error: 'Failed to fetch card' },
            { status: 500 }
        );
    }
}