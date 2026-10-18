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

    // Toutes les données brutes en parallèle
    const [
        { count: totalCards },
        { data: { users: allUsers } },
        { data: allCards },
        { data: recentCards },
        { data: topViewedCards },
    ] = await Promise.all([
        admin.from('cards').select('*', { count: 'exact', head: true }),
        admin.auth.admin.listUsers({ perPage: 1000 }),
        admin.from('cards').select('event_type, language, views_count'),
        admin.from('cards')
            .select('id, name, event_type, created_at, views_count, share_token')
            .order('created_at', { ascending: false })
            .limit(10),
        admin.from('cards')
            .select('id, name, event_type, views_count, share_token')
            .order('views_count', { ascending: false })
            .limit(5),
    ]);

    // Stats par événement
    const eventStats: Record<string, number> = {};
    (allCards || []).forEach((c: any) => {
        eventStats[c.event_type] = (eventStats[c.event_type] || 0) + 1;
    });

    // Stats par langue
    const langStats = { fr: 0, en: 0 };
    (allCards || []).forEach((c: any) => {
        if (c.language === 'fr') langStats.fr++;
        else if (c.language === 'en') langStats.en++;
    });

    // Total vues
    const totalViews = (allCards || []).reduce(
        (sum: number, c: any) => sum + (c.views_count || 0), 0
    );

    return NextResponse.json({
        totalCards: totalCards ?? 0,
        totalUsers: allUsers?.length ?? 0,
        totalViews,
        eventStats,
        langStats,
        recentCards: recentCards ?? [],
        topViewedCards: topViewedCards ?? [],
    });
}
