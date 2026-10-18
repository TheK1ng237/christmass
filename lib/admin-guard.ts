/**
 * lib/admin-guard.ts
 * Helper server-side : vérifie que l'appelant est un admin.
 * Usage dans les Route Handlers : const { error } = await guardAdmin(request);
 */
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export async function guardAdmin(request: NextRequest) {
    // 1. Récupère l'utilisateur depuis les cookies de session
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: () => {},
            },
        }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { user: null, error: 'Non authentifié', status: 401 };
    }

    // 2. Vérifie le rôle admin via user_metadata OU table admin_users
    const isAdminMeta = user.user_metadata?.role === 'admin';
    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdminEmail = user.email?.toLowerCase() === adminEmail?.toLowerCase();

    if (!isAdminMeta && !isAdminEmail) {
        // Fallback : vérifie la table admin_users avec le service role
        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const { data } = await adminClient
            .from('admin_users')
            .select('id')
            .eq('id', user.id)
            .single();

        if (!data) {
            return { user: null, error: 'Accès refusé', status: 403 };
        }
    }

    return { user, error: null, status: 200 };
}
