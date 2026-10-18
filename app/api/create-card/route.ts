import { NextRequest, NextResponse } from 'next/server';
import { generateShareToken } from '@/lib/utils';
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import { CardDesignSchema } from "@/lib/schemas/card-design";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, gender, language, design, image_url, event_type, user_id } = body;
        const validatedDesign = CardDesignSchema.safeParse(design);

        if (
            typeof name !== "string" ||
            !name.trim() ||
            !["boy", "girl", "neutral"].includes(gender) ||
            !["fr", "en"].includes(language) ||
            !["christmas", "newyear", "valentine", "easter", "birthday", "mothersday", "fathersday"].includes(event_type) ||
            !validatedDesign.success
        ) {
            return NextResponse.json(
                { error: 'Paramètres de carte invalides' },
                { status: 400 }
            );
        }

        const shareToken = generateShareToken();

        const { data, error } = await supabaseAdmin
            .from('cards')
            .insert({
                name,
                gender,
                language,
                poem: JSON.stringify(validatedDesign.data),
                event_type,
                image_url: image_url || null,
                share_token: shareToken,
                user_id: user_id || null
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ card: data });
    } catch (error) {
        console.error('Error creating card:', error);
        return NextResponse.json(
            { error: 'Failed to create card' },
            { status: 500 }
        );
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