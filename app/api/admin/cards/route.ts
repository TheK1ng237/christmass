import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { guardAdmin } from '@/lib/admin-guard';

export async function GET(request: NextRequest) {
    const { error, status } = await guardAdmin(request);
    if (error) return NextResponse.json({ error }, { status });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const event = searchParams.get('event');
    const from = (page - 1) * limit;

    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let query = admin
        .from('cards')
        .select('id, name, event_type, language, views_count, created_at, share_token, user_id', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);

    if (event) query = query.eq('event_type', event);

    const { data, count, error: dbErr } = await query;
    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

    return NextResponse.json({ cards: data ?? [], total: count ?? 0, page, limit });
}

export async function DELETE(request: NextRequest) {
    const { error, status } = await guardAdmin(request);
    if (error) return NextResponse.json({ error }, { status });

    const { ids } = await request.json();
    if (!ids?.length) return NextResponse.json({ error: 'ids requis' }, { status: 400 });

    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error: dbErr } = await admin.from('cards').delete().in('id', ids);
    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

    return NextResponse.json({ success: true, deleted: ids.length });
}
