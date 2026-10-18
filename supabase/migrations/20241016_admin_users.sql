-- ─────────────────────────────────────────────────────────────────────────────
-- Migration : Table admin_users
-- Exécuter dans Supabase SQL Editor ou via supabase db push
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Création de la table admin_users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Activation RLS (Row Level Security)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Seule la service_role peut lire/écrire (les API routes utilisent supabaseAdmin)
CREATE POLICY "Service role only"
    ON public.admin_users
    FOR ALL
    USING (false)
    WITH CHECK (false);

-- 4. Index sur email pour les lookups rapides
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON public.admin_users(email);

-- ─────────────────────────────────────────────────────────────────────────────
-- Optionnel : colonne role dans les cards pour tracking (déjà dans auth.users.user_metadata)
-- Pas besoin de migration si on utilise uniquement user_metadata.role = 'admin'
-- ─────────────────────────────────────────────────────────────────────────────
