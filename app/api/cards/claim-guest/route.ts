import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const GUEST_COOKIE_NAME = 'mw_guest_id';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
    const refreshedCookies: Array<{ name: string; value: string; options: CookieOptions }> = [];

    try {
        const supabase = createServerClient(
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
        const { data, error } = await supabase.auth.getUser();

        if (error && error.name !== 'AuthSessionMissingError') {
            console.error('Unable to verify the current user when claiming guest cards:', error);
            return NextResponse.json({ error: 'Impossible de vérifier votre session.' }, { status: 503 });
        }

        if (!data.user) {
            return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
        }

        const guestId = request.cookies.get(GUEST_COOKIE_NAME)?.value;
        if (!guestId || !UUID_PATTERN.test(guestId)) {
            return NextResponse.json({ claimed: 0 });
        }

        const { data: claimedCards, error: claimError } = await supabaseAdmin
            .from('cards')
            .update({ user_id: data.user.id, guest_id: null })
            .eq('guest_id', guestId)
            .is('user_id', null)
            .select('id');

        if (claimError) {
            console.error('Unable to move guest cards to the signed-in account:', claimError);
            return NextResponse.json({ error: 'Impossible de rattacher vos cartes à votre compte.' }, { status: 500 });
        }

        const response = NextResponse.json({ claimed: claimedCards?.length ?? 0 });
        refreshedCookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
        });
        response.cookies.set(GUEST_COOKIE_NAME, '', {
            httpOnly: true,
            secure: request.nextUrl.protocol === 'https:',
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
        });

        return response;
    } catch (error) {
        console.error('Guest card claim failed:', error);
        return NextResponse.json({ error: 'Impossible de récupérer vos cartes.' }, { status: 500 });
    }
}
