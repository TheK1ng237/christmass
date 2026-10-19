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

    if (!url || !serviceKey || !adminEmail) {
        console.error('[seed] NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY et ADMIN_EMAIL sont requis.');
        return;
    }

    // Client admin avec service_role (bypasse RLS)
    const admin = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    try {
        // 1. Vérifie si l'admin existe déjà dans auth.users
        const { data: existing, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
        if (listErr) throw listErr;

        const existingAdmin = existing.users.find(
            (u) => u.email?.toLowerCase() === adminEmail.toLowerCase()
        );

        let adminUserId: string;

        if (existingAdmin) {
            const { data: updated, error: updateErr } = await admin.auth.admin.updateUserById(
                existingAdmin.id,
                {
                    user_metadata: {
                        ...existingAdmin.user_metadata,
                        name: existingAdmin.user_metadata?.name || 'Admin',
                        role: 'admin',
                    },
                }
            );
            if (updateErr) throw updateErr;
            adminUserId = updated.user.id;
            console.log(`[seed] ✓ Rôle admin vérifié pour "${adminEmail}".`);
        } else {
            if (!adminPassword) {
                console.error('[seed] ADMIN_PASSWORD est requis pour créer le compte admin.');
                return;
            }

            const { data: created, error: createErr } = await admin.auth.admin.createUser({
                email: adminEmail,
                password: adminPassword,
                email_confirm: true,
                user_metadata: { name: 'Admin', role: 'admin' },
            });
            if (createErr) throw createErr;
            adminUserId = created.user.id;
        }

        const { error: insertErr } = await admin
            .from('admin_users')
            .upsert({ id: adminUserId, email: adminEmail }, { onConflict: 'id' });
        if (insertErr) {
            console.warn('[seed] Écriture dans admin_users échouée:', insertErr.message);
        }
    } catch (err: unknown) {
        console.error(
            '[seed] Erreur lors du seed admin:',
            err instanceof Error ? err.message : err
        );
    }
}
