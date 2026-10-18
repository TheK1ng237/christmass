import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { guardAdmin } from '@/lib/admin-guard';

export async function GET(request: NextRequest) {
    const { error, status } = await guardAdmin(request);
    if (error) return NextResponse.json({ error }, { status });

    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error: listErr } = await admin.auth.admin.listUsers({ perPage: 500 });
    if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });

    // Pour chaque user, on récupère son nombre de cartes
    const { data: cardCounts } = await admin
        .from('cards')
        .select('user_id');

    const countMap: Record<string, number> = {};
    (cardCounts || []).forEach((c: any) => {
        if (c.user_id) countMap[c.user_id] = (countMap[c.user_id] || 0) + 1;
    });

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

    const users = data.users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.user_metadata?.name || u.email?.split('@')[0],
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at,
        is_admin: u.email?.toLowerCase() === adminEmail || u.user_metadata?.role === 'admin',
        card_count: countMap[u.id] || 0,
        provider: u.app_metadata?.provider || 'email',
    }));

    return NextResponse.json({ users });
}
