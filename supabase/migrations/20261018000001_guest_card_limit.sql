ALTER TABLE public.cards
    ADD COLUMN IF NOT EXISTS guest_id uuid;

CREATE INDEX IF NOT EXISTS cards_guest_id_idx
    ON public.cards (guest_id)
    WHERE guest_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.create_guest_card(
    p_name text,
    p_gender text,
    p_language text,
    p_poem text,
    p_event_type text,
    p_image_url text,
    p_share_token text,
    p_guest_id uuid
)
RETURNS SETOF public.cards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended(p_guest_id::text, 0));

    IF (
        SELECT count(*)
        FROM public.cards
        WHERE guest_id = p_guest_id
    ) >= 2 THEN
        RETURN;
    END IF;

    RETURN QUERY
    INSERT INTO public.cards (
        name,
        gender,
        language,
        poem,
        event_type,
        image_url,
        share_token,
        guest_id
    )
    VALUES (
        p_name,
        p_gender,
        p_language,
        p_poem,
        p_event_type,
        p_image_url,
        p_share_token,
        p_guest_id
    )
    RETURNING *;
END;
$$;

REVOKE ALL ON FUNCTION public.create_guest_card(text, text, text, text, text, text, text, uuid)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_guest_card(text, text, text, text, text, text, text, uuid)
    TO service_role;
