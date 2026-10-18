'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Check,
    Pencil,
    RefreshCw,
    Upload,
    Wand2,
    X
} from "lucide-react";

import Button from '@/components/ui/Button';
import { getAvailableEvents, getEventConfig } from '@/lib/events';
import { buildSampleDesigns } from '@/lib/cards/occasion-profile';
import type { CardDesign } from '@/lib/schemas/card-design';
import { Language, Gender, EventType } from '@/lib/types';
import { CardRenderer } from '@/components/cards/card-renderer';

import { CardCreationError, eventService } from '@/lib/Services/eventService';
import { useAuth } from '@/lib/auth/AuthContext';

type Tone = 'warm' | 'formal' | 'funny' | 'emotional' | 'spiritual';

const TONES: { id: Tone; fr: string; en: string }[] = [
    { id: 'warm', fr: 'Chaleureux', en: 'Warm' },
    { id: 'emotional', fr: 'Ému', en: 'Heartfelt' },
    { id: 'funny', fr: 'Drôle', en: 'Funny' },
    { id: 'formal', fr: 'Élégant', en: 'Formal' },
    { id: 'spiritual', fr: 'Spirituel', en: 'Spiritual' },
];

const RELATION_HINTS: Record<EventType, { fr: string; en: string }> = {
    christmas: { fr: 'ma mère, mon collègue Paul, mes voisins…', en: 'my mother, my colleague Paul, my neighbours…' },
    newyear: { fr: 'mes amis, mon équipe, ma famille…', en: 'my friends, my team, my family…' },
    valentine: { fr: 'mon mari, ma fiancée, mon amour…', en: 'my husband, my fiancée, my love…' },
    easter: { fr: 'mes grands-parents, mes cousins…', en: 'my grandparents, my cousins…' },
    birthday: { fr: 'ma meilleure amie, mon frère…', en: 'my best friend, my brother…' },
    mothersday: { fr: 'ma mère, ma belle-mère, ma grand-mère…', en: 'my mother, my mother-in-law, my grandmother…' },
    fathersday: { fr: 'mon père, mon beau-père, mon oncle…', en: 'my father, my stepfather, my uncle…' },
};

const fieldClass =
    'w-full rounded-xl border border-[#F6EFE4]/15 bg-[#F6EFE4]/[0.04] px-4 py-3.5 text-lg text-[#F6EFE4] placeholder:text-[#F6EFE4]/30 focus:outline-none focus:border-[#C9A15B]/70 transition-colors';

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
    return (
        <div className="mb-2 flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold text-[#F6EFE4]/80">{children}</span>
            {hint && <span className="text-xs text-[#F6EFE4]/40">{hint}</span>}
        </div>
    );
}

function CreateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const [step, setStep] = useState<'form' | 'preview'>('form');
    const [loading, setLoading] = useState(false);
    const [selectingDesignId, setSelectingDesignId] = useState<CardDesign['id'] | null>(null);
    const [error, setError] = useState('');
    const [requiresLogin, setRequiresLogin] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<CardDesign['id'] | null>(null);

    // Formulaire : occasion, destinataire, ton, message facultatif
    const [eventType, setEventType] = useState<EventType>('christmas');
    const [relation, setRelation] = useState('');
    const [name, setName] = useState('');
    const [tone, setTone] = useState<Tone>('warm');
    const [message, setMessage] = useState('');
    const [language, setLanguage] = useState<Language>('fr');
    const [gender, setGender] = useState<Gender>('neutral');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [designs, setDesigns] = useState<CardDesign[]>([]);
    const [imageUrl, setImageUrl] = useState<string>('');

    useEffect(() => {
        const event = searchParams.get('event') as EventType | null;
        if (event && getAvailableEvents().some((item) => item.id === event)) {
            setEventType(event);
        }
    }, [searchParams]);

    useEffect(() => {
        if (eventType === 'mothersday') setGender('girl');
        else if (eventType === 'fathersday') setGender('boy');
        else setGender('neutral');
    }, [eventType]);

    const fr = language === 'fr';
    const eventConfig = getEventConfig(eventType);
    const sample = useMemo(() => buildSampleDesigns(eventType, language)[0], [eventType, language]);
    const photoForCard = imagePreview || imageUrl || undefined;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError(fr ? 'Image trop lourde (max 5 Mo)' : 'Image too large (max 5MB)');
            return;
        }
        setError('');
        setImage(file);
        setImageUrl('');
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleError = (err: unknown) => {
        console.error("Erreur:", err);
        const text = err instanceof Error ? err.message : 'Une erreur inattendue est survenue.';
        if (text.includes('429')) {
            setError(fr ? "L'IA est très sollicitée. Réessayez dans une minute." : "The AI is busy. Try again in a minute.");
        } else {
            setError(text);
        }
    };

    const handleGenerate = async () => {
        if (!name.trim()) {
            setError(fr ? 'Indiquez le prénom du destinataire.' : 'Enter the recipient\'s first name.');
            return;
        }
        setLoading(true);
        setError('');
        setRequiresLogin(false);

        try {
            let currentImageUrl = imageUrl;
            if (image && !imageUrl) {
                currentImageUrl = await eventService.uploadImage(image);
                setImageUrl(currentImageUrl);
            }

            const generatedDesigns = await eventService.generateCardDesigns({
                occasion: eventConfig.name[language],
                occasionId: eventType,
                recipient: name.trim(),
                relation: relation.trim() || undefined,
                tone,
                message: message.trim() || undefined,
                language,
            });

            setDesigns(generatedDesigns);
            setEditingId(null);
            setStep('preview');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: unknown) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const updateContent = (id: CardDesign['id'], patch: Partial<CardDesign['content']>) => {
        setDesigns((current) =>
            current.map((d) => (d.id === id ? { ...d, content: { ...d.content, ...patch } } : d))
        );
    };

    const handleSelectDesign = async (design: CardDesign) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setSelectingDesignId(design.id);
        setError('');
        setRequiresLogin(false);
        try {
            const data = await eventService.createCard({
                name,
                gender,
                language,
                eventType,
                design,
                imageUrl: imageUrl || null,
            });

            router.push(`/preview/${data.card.share_token}`);
        } catch (err) {
            if (err instanceof CardCreationError && err.code === 'LOGIN_REQUIRED') {
                setRequiresLogin(true);
                setError(fr
                    ? 'Vous avez utilisé vos 2 cartes gratuites. Connectez-vous pour en créer une autre.'
                    : 'You have used your 2 free cards. Log in to create another one.');
            } else {
                handleError(err);
            }
            setSelectingDesignId(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1A0F14] text-[#F6EFE4] pb-24 pt-24">
            <div
                className="pointer-events-none fixed inset-0 -z-10"
                style={{
                    background: `radial-gradient(60% 50% at 80% 0%, ${eventConfig.colors.primary}22, transparent 70%), radial-gradient(50% 40% at 0% 100%, ${eventConfig.colors.accent}14, transparent 70%)`,
                }}
            />

            <div className="mx-auto max-w-7xl px-6 pt-8">
                <header className="mb-10 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => (step === 'form' ? router.push('/') : setStep('form'))}
                        className="rounded-xl border border-[#F6EFE4]/10 text-[#F6EFE4]/70 hover:bg-[#F6EFE4]/5 hover:text-[#F6EFE4]"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {fr ? 'Retour' : 'Back'}
                    </Button>
                    <div className="flex rounded-full border border-[#F6EFE4]/15 p-1" role="group" aria-label="Langue">
                        {(['fr', 'en'] as Language[]).map((code) => (
                            <button
                                key={code}
                                type="button"
                                onClick={() => setLanguage(code)}
                                aria-pressed={language === code}
                                className="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
                                style={{
                                    background: language === code ? '#F6EFE4' : 'transparent',
                                    color: language === code ? '#1A0F14' : 'rgba(246,239,228,.6)',
                                }}
                            >
                                {code === 'fr' ? 'Français' : 'English'}
                            </button>
                        ))}
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {step === 'form' ? (
                        <motion.div
                            key="form-step"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            className="grid gap-14 lg:grid-cols-12"
                        >
                            {/* Aperçu de l'univers de l'occasion */}
                            <div className="lg:col-span-5">
                                <h1 className="font-serif text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl">
                                    {fr ? 'Une carte composée pour ' : 'A card composed for '}
                                    <span style={{ color: eventConfig.colors.accent }}>
                                        {eventConfig.name[language].toLowerCase()}
                                    </span>
                                </h1>
                                <p className="mt-5 max-w-md text-lg leading-relaxed text-[#F6EFE4]/60">
                                    {fr
                                        ? "Dites-nous pour qui et pour quelle occasion. Gemini imagine le concept, le message et les décors ; vous choisissez, vous retouchez, vous partagez."
                                        : "Tell us who it's for and what the occasion is. Gemini imagines the concept, the message and the decor; you choose, tweak and share."}
                                </p>
                                {!authLoading && !user && (
                                    <p className="mt-4 text-sm leading-relaxed text-[#E2B976]/80">
                                        {fr
                                            ? 'Créez deux cartes sans compte. La connexion sera nécessaire pour en créer une troisième.'
                                            : 'Create two cards without an account. Log in to create a third one.'}
                                    </p>
                                )}

                                <div className="mx-auto mt-10 w-[min(100%,300px)] lg:mx-0">
                                    <motion.div
                                        key={`${eventType}-${language}-${photoForCard ? 'p' : 'n'}`}
                                        initial={{ opacity: 0, rotate: -3, y: 12 }}
                                        animate={{ opacity: 1, rotate: -2, y: 0 }}
                                        transition={{ type: 'spring', bounce: 0.25 }}
                                    >
                                        <CardRenderer design={sample} imageUrl={photoForCard} />
                                    </motion.div>
                                    <p className="mt-5 text-sm text-[#F6EFE4]/40">
                                        {fr ? 'Exemple de direction pour cette occasion.' : 'Example direction for this occasion.'}
                                    </p>
                                </div>
                            </div>

                            {/* Formulaire */}
                            <div className="rounded-[2rem] border border-[#F6EFE4]/10 bg-[#241519] p-7 shadow-2xl md:p-10 lg:col-span-7">
                                <div className="space-y-8">
                                    <div>
                                        <Label>{fr ? 'Occasion' : 'Occasion'}</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {getAvailableEvents().map((event) => {
                                                const Icon = event.icon;
                                                const active = event.id === eventType;
                                                return (
                                                    <button
                                                        key={event.id}
                                                        type="button"
                                                        onClick={() => setEventType(event.id)}
                                                        className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                                                        style={{
                                                            borderColor: active ? event.colors.accent : 'rgba(246,239,228,.14)',
                                                            background: active ? `${event.colors.primary}33` : 'transparent',
                                                            color: active ? '#F6EFE4' : 'rgba(246,239,228,.6)',
                                                        }}
                                                    >
                                                        <Icon size={16} />
                                                        {event.name[language]}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <Label hint={fr ? 'facultatif' : 'optional'}>
                                                {fr ? 'Pour qui ?' : 'Who is it for?'}
                                            </Label>
                                            <input
                                                type="text"
                                                placeholder={RELATION_HINTS[eventType][language]}
                                                value={relation}
                                                onChange={(e) => setRelation(e.target.value)}
                                                className={fieldClass}
                                                maxLength={60}
                                            />
                                        </div>
                                        <div>
                                            <Label>{fr ? 'Prénom du destinataire' : 'Recipient\'s first name'}</Label>
                                            <input
                                                type="text"
                                                placeholder="Marie, Thomas…"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className={fieldClass}
                                                maxLength={100}
                                            />
                                        </div>
                                    </div>

                                    {eventType !== 'mothersday' && eventType !== 'fathersday' && (
                                        <div>
                                            <Label>{fr ? 'Genre du destinataire' : 'Recipient'}</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {([
                                                    { id: 'girl', fr: 'Elle', en: 'She' },
                                                    { id: 'boy', fr: 'Lui', en: 'He' },
                                                    { id: 'neutral', fr: 'Neutre', en: 'Neutral' },
                                                ] as { id: Gender; fr: string; en: string }[]).map((item) => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => setGender(item.id)}
                                                        className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                                                        style={{
                                                            borderColor: gender === item.id ? eventConfig.colors.accent : 'rgba(246,239,228,.14)',
                                                            background: gender === item.id ? `${eventConfig.colors.accent}22` : 'transparent',
                                                            color: gender === item.id ? '#F6EFE4' : 'rgba(246,239,228,.6)',
                                                        }}
                                                    >
                                                        {item[language]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <Label>{fr ? 'Ton du message' : 'Tone of the message'}</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {TONES.map((item) => {
                                                const active = item.id === tone;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => setTone(item.id)}
                                                        className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                                                        style={{
                                                            borderColor: active ? eventConfig.colors.accent : 'rgba(246,239,228,.14)',
                                                            background: active ? `${eventConfig.colors.accent}22` : 'transparent',
                                                            color: active ? '#F6EFE4' : 'rgba(246,239,228,.6)',
                                                        }}
                                                    >
                                                        {item[language]}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <Label hint={fr ? 'laissez vide, l’IA rédige' : 'leave empty, the AI writes it'}>
                                            {fr ? 'Votre message' : 'Your message'}
                                        </Label>
                                        <textarea
                                            rows={3}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            maxLength={600}
                                            placeholder={fr ? 'Quelques mots à glisser dans la carte…' : 'A few words to put in the card…'}
                                            className={`${fieldClass} resize-none text-base`}
                                        />
                                    </div>

                                    <div>
                                        <Label hint={fr ? 'facultatif' : 'optional'}>
                                            {fr ? 'Photo' : 'Photo'}
                                        </Label>
                                        {imagePreview ? (
                                            <div className="flex items-center gap-4 rounded-xl border border-[#F6EFE4]/10 p-3">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={imagePreview} alt="" className="h-16 w-16 rounded-lg object-cover" />
                                                <span className="flex-1 truncate text-sm text-[#F6EFE4]/60">{image?.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => { setImage(null); setImagePreview(''); setImageUrl(''); }}
                                                    className="rounded-full p-2 text-[#F6EFE4]/60 hover:bg-[#F6EFE4]/10 hover:text-[#F6EFE4]"
                                                    aria-label={fr ? 'Retirer la photo' : 'Remove photo'}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex h-24 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-[#F6EFE4]/20 text-[#F6EFE4]/50 transition-colors hover:border-[#C9A15B]/60 hover:text-[#F6EFE4]/80">
                                                <Upload size={20} style={{ color: eventConfig.colors.accent }} />
                                                <span className="text-sm">{fr ? 'Ajouter une photo (5 Mo max)' : 'Add a photo (5MB max)'}</span>
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                            </label>
                                        )}
                                    </div>

                                    {error && (
                                        <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">
                                            <X size={16} /> {error}
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleGenerate}
                                        isLoading={loading}
                                        className="h-16 w-full rounded-xl text-lg font-semibold text-white"
                                        style={{ backgroundColor: eventConfig.colors.primary === '#C9A15B' ? '#8E6B2E' : eventConfig.colors.primary }}
                                    >
                                        <Wand2 className="mr-3 h-5 w-5" />
                                        {fr ? 'Composer quatre cartes' : 'Compose four cards'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="preview-step"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-12"
                        >
                            <div className="mx-auto max-w-2xl text-center">
                                <div
                                    className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border"
                                    style={{ borderColor: `${eventConfig.colors.accent}66`, color: eventConfig.colors.accent }}
                                >
                                    <Check size={26} />
                                </div>
                                <h2 className="font-serif text-4xl font-semibold md:text-5xl">
                                    {fr ? `Quatre cartes pour ${name}` : `Four cards for ${name}`}
                                </h2>
                                <p className="mt-3 text-[#F6EFE4]/60">
                                    {fr
                                        ? 'Chaque carte a son propre univers. Retouchez le texte si besoin, puis choisissez.'
                                        : 'Each card has its own world. Tweak the text if you like, then pick one.'}
                                </p>
                            </div>

                            {error && (
                                <div role="alert" className="mx-auto flex max-w-xl flex-col items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">
                                    <span className="flex items-center gap-3">
                                        <X size={16} /> {error}
                                    </span>
                                    {requiresLogin && (
                                        <Button
                                            onClick={() => router.push(`/auth?next=${encodeURIComponent('/create')}`)}
                                            className="rounded-xl"
                                        >
                                            {fr ? 'Se connecter' : 'Log in'}
                                        </Button>
                                    )}
                                </div>
                            )}

                            <div className="grid gap-12 sm:grid-cols-2 xl:grid-cols-4">
                                {designs.map((design) => (
                                    <div key={design.id} className="mx-auto w-full max-w-[420px]">
                                        <CardRenderer design={design} imageUrl={photoForCard} />

                                        <p className="mt-5 text-center font-serif text-lg italic text-[#F6EFE4]/70">
                                            {design.concept}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => setEditingId(editingId === design.id ? null : design.id)}
                                            className="mx-auto mt-4 flex items-center gap-2 text-sm text-[#F6EFE4]/60 transition-colors hover:text-[#F6EFE4]"
                                        >
                                            <Pencil size={14} />
                                            {editingId === design.id
                                                ? (fr ? 'Fermer' : 'Close')
                                                : (fr ? 'Modifier le texte' : 'Edit the text')}
                                        </button>

                                        {editingId === design.id && (
                                            <div className="mt-4 space-y-3 rounded-xl border border-[#F6EFE4]/10 bg-[#241519] p-4">
                                                <input
                                                    value={design.content.title}
                                                    onChange={(e) => updateContent(design.id, { title: e.target.value })}
                                                    maxLength={100}
                                                    className={`${fieldClass} !py-2.5 !text-base`}
                                                    aria-label={fr ? 'Titre' : 'Title'}
                                                />
                                                <textarea
                                                    value={design.content.message}
                                                    onChange={(e) => updateContent(design.id, { message: e.target.value })}
                                                    maxLength={1200}
                                                    rows={5}
                                                    className={`${fieldClass} resize-none !py-2.5 !text-base`}
                                                    aria-label="Message"
                                                />
                                                <input
                                                    value={design.content.signature}
                                                    onChange={(e) => updateContent(design.id, { signature: e.target.value })}
                                                    maxLength={100}
                                                    className={`${fieldClass} !py-2.5 !text-base`}
                                                    aria-label={fr ? 'Signature' : 'Signature'}
                                                />
                                            </div>
                                        )}

                                        <Button
                                            onClick={() => handleSelectDesign(design)}
                                            isLoading={selectingDesignId === design.id}
                                            disabled={selectingDesignId !== null && selectingDesignId !== design.id}
                                            className="mt-6 h-14 w-full rounded-xl font-semibold text-white"
                                            style={{ backgroundColor: eventConfig.colors.primary === '#C9A15B' ? '#8E6B2E' : eventConfig.colors.primary }}
                                        >
                                            {fr ? 'Choisir cette carte' : 'Choose this card'}
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#F6EFE4]/15 px-5 py-2.5 text-sm text-[#F6EFE4]/70 transition-colors hover:bg-[#F6EFE4]/5 hover:text-[#F6EFE4] disabled:opacity-50"
                                >
                                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                                    {fr ? 'Proposer quatre autres cartes' : 'Suggest four other cards'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function CreatePage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#1A0F14]">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#C9A15B]/30 border-t-[#C9A15B]" />
            </div>
        }>
            <CreateContent />
        </Suspense>
    );
}
