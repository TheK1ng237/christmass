/**
 * lib/admin-seed.ts
 * Seed automatique : vérifie/crée le compte admin au démarrage du serveur.
 * Appelé depuis instrumentation.ts (Next.js server startup hook).
 */

import { createClient } from '@supabase/supabase-js';

export async function seedAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!url || !serviceKey || !adminEmail || !adminPassword) {
        console.warn('[seed] Variables manquantes — seed admin ignoré.');
        return;
    }

    // Client admin avec service_role (bypasse RLS)
    const admin = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    try {
        // 1. Vérifie si l'admin existe déjà dans auth.users
        const { data: existing, error: listErr } = await admin.auth.admin.listUsers();
        if (listErr) throw listErr;

        const alreadyExists = existing.users.some(
            (u) => u.email?.toLowerCase() === adminEmail.toLowerCase()
        );

        if (alreadyExists) {
            console.log(`[seed] ✓ Admin "${adminEmail}" existe déjà.`);
            return;
        }

        // 2. Crée l'utilisateur admin dans Auth
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,          // Pas besoin de confirmation par email
            user_metadata: { name: 'Admin', role: 'admin' },
        });
        if (createErr) throw createErr;

        // 3. Insère dans la table admin_users (si elle existe)
        //    On ne fait pas échouer si la table n'existe pas encore.
        if (created?.user) {
            const { error: insertErr } = await admin
                .from('admin_users')
                .upsert({ id: created.user.id, email: adminEmail }, { onConflict: 'id' });
            if (insertErr) {
                console.warn('[seed] Table admin_users absente — ignoré:', insertErr.message);
            }
        }

        console.log(`[seed] ✅ Admin "${adminEmail}" créé avec succès.`);
    } catch (err: any) {
        console.error('[seed] Erreur lors du seed admin:', err?.message ?? err);
    }
}
