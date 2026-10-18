'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { CardRenderer } from '@/components/cards/card-renderer';
import { getAvailableEvents } from '@/lib/events';
import { buildSampleDesigns } from '@/lib/cards/occasion-profile';
import type { EventType, Language } from '@/lib/types';

export default function TemplatesPage() {
    const router = useRouter();
    const [selectedEvent, setSelectedEvent] = useState<EventType>('christmas');
    const [language, setLanguage] = useState<Language>('fr');
    const fr = language === 'fr';
    const event = getAvailableEvents().find((item) => item.id === selectedEvent) ?? getAvailableEvents()[0];
    const designs = useMemo(() => buildSampleDesigns(selectedEvent, language), [selectedEvent, language]);

    return (
        <main className="min-h-screen bg-[#1A0F14] px-5 pb-24 pt-28 text-[#F6EFE4] relative overflow-hidden">

            {/* Ambient orbs */}
            <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: 600, height: 600,
                    top: '-10%', right: '-10%',
                    background: `radial-gradient(circle, ${event.colors.primary}20 0%, transparent 70%)`,
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
                className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                }}
            />

            <div className="relative z-10 mx-auto max-w-7xl">

                

                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12 max-w-2xl"
                >
                    <h1 className="font-serif text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl text-white">
                        {fr ? (
                            <>Chaque occasion a <em className="italic" style={{ color: event.colors.primary }}>son univers</em></>
                        ) : (
                            <>Every occasion has <em className="italic" style={{ color: event.colors.primary }}>its own world</em></>
                        )}
                    </h1>
                    <p className="mt-5 text-base leading-relaxed text-[#F6EFE4]/50">
                        {fr
                            ? 'Papier ivoire et ruban de satin pour Noël, papier découpé pour la fête des mères, affiche de magazine pour un anniversaire. Voici les directions de départ : Gemini les réinvente à chaque carte.'
                            : "Ivory paper and satin ribbon for Christmas, paper-cut flowers for Mother's Day, a magazine cover for a birthday. These are the starting directions: Gemini reinvents them for every card."}
                    </p>
                </motion.header>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12 flex flex-wrap items-center gap-2"
                >
                    {getAvailableEvents().map((item) => {
                        const active = selectedEvent === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => setSelectedEvent(item.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className="relative rounded-full px-4 py-2.5 text-sm font-medium transition-all"
                                style={{
                                    background: active ? `${item.colors.primary}22` : 'rgba(255,255,255,0.04)',
                                    border: active ? `1px solid ${item.colors.primary}60` : '1px solid rgba(255,255,255,0.09)',
                                    color: active ? '#F6EFE4' : 'rgba(246,239,228,.45)',
                                }}
                            >
                                {active && (
                                    <motion.span
                                        layoutId="event-pill"
                                        className="absolute inset-0 rounded-full"
                                        style={{ background: `${item.colors.primary}15` }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {active && (
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: item.colors.primary }}
                                        />
                                    )}
                                    {item.name[language]}
                                </span>
                            </motion.button>
                        );
                    })}

                    {/* Language toggle */}
                    <motion.button
                        onClick={() => setLanguage(fr ? 'en' : 'fr')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="ml-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.09)',
                            color: 'rgba(246,239,228,0.5)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#F6EFE4')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(246,239,228,0.5)')}
                    >
                        <Globe size={13} />
                        {language.toUpperCase()}
                    </motion.button>
                </motion.div>

                {/* Cards grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedEvent}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid gap-12 sm:grid-cols-2 xl:grid-cols-4"
                    >
                        {designs.map((design, index) => (
                            <motion.section
                                key={`${selectedEvent}-${design.id}`}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className="mx-auto w-full max-w-[440px]"
                            >
                                {/* Card preview */}
                                <div
                                    className="relative rounded-3xl overflow-hidden"
                                    style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                                >
                                    <CardRenderer design={design} />
                                    {/* Overlay CTA */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex justify-end">
                                        <button
                                            onClick={() => router.push(`/create?event=${selectedEvent}`)}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-white backdrop-blur-md transition-transform hover:scale-[1.02]"
                                            style={{ background: `${event.colors.primary}cc` }}
                                        >
                                            {fr ? 'Utiliser' : 'Use'} <ArrowRight size={13} />
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="mt-5 px-1">
                                    <h2 className="font-serif text-xl font-semibold text-white mb-1">{design.concept}</h2>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-white/35">
                                            {fr ? 'Style IA unique à chaque création' : 'AI style unique to each creation'}
                                        </p>
                                        <motion.button
                                            onClick={() => router.push(`/create?event=${selectedEvent}`)}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
                                            style={{
                                                background: `linear-gradient(135deg, ${event.colors.primary}, ${event.colors.primary}cc)`,
                                                boxShadow: `0 4px 16px ${event.colors.primary}30`,
                                            }}
                                        >
                                            {fr ? 'Créer' : 'Create'} <ArrowRight size={14} />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.section>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
}
