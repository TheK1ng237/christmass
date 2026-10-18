CREATE TABLE IF NOT EXISTS public.cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    gender text NOT NULL CHECK (gender IN ('boy', 'girl', 'neutral')),
    language text NOT NULL CHECK (language IN ('fr', 'en')),
    event_type text NOT NULL CHECK (
        event_type IN (
            'christmas',
            'newyear',
            'valentine',
            'easter',
            'birthday',
            'mothersday',
            'fathersday'
        )
    ),
    poem text NOT NULL,
    image_url text,
    share_token text NOT NULL UNIQUE,
    user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
    business_name text,
    phone text,
    is_public boolean NOT NULL DEFAULT true,
    views_count integer NOT NULL DEFAULT 0 CHECK (views_count >= 0),
    template_id integer,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cards_user_id_created_at_idx
    ON public.cards (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS cards_event_type_idx
    ON public.cards (event_type);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cards" ON public.cards;
CREATE POLICY "Users can view their own cards"
    ON public.cards
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cards" ON public.cards;
CREATE POLICY "Users can delete their own cards"
    ON public.cards
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.increment_card_views(t_token text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.cards
    SET views_count = views_count + 1
    WHERE share_token = t_token;
$$;

GRANT EXECUTE ON FUNCTION public.increment_card_views(text) TO anon, authenticated;
