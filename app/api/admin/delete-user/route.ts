import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { guardAdmin } from '@/lib/admin-guard';

export async function DELETE(request: NextRequest) {
    const { error, status } = await guardAdmin(request);
    if (error) return NextResponse.json({ error }, { status });

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 });

    const adminEmail = process.env.ADMIN_EMAIL;
    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Sécurité : interdit de supprimer le compte admin
    const { data: target } = await admin.auth.admin.getUserById(userId);
    if (target?.user?.email?.toLowerCase() === adminEmail?.toLowerCase()) {
        return NextResponse.json({ error: 'Impossible de supprimer le compte admin' }, { status: 403 });
    }

    // Supprime les cartes de l'utilisateur d'abord
    await admin.from('cards').delete().eq('user_id', userId);

    // Supprime l'utilisateur
    const { error: deleteErr } = await admin.auth.admin.deleteUser(userId);
    if (deleteErr) return NextResponse.json({ error: deleteErr.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
