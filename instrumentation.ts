/**
 * instrumentation.ts
 * Hook Next.js exécuté UNE SEULE FOIS au démarrage du serveur (Node.js runtime).
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
    // On importe dynamiquement pour éviter les problèmes Edge Runtime
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { seedAdmin } = await import('./lib/admin-seed');
        await seedAdmin();
    }
}
