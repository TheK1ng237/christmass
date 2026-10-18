'use client';

<<<<<<< HEAD
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getAvailableEvents, getEventConfig } from '@/lib/events';
import { useEventTemplates } from '@/components/TemplateRoutes';
import { EventType, Language } from '@/lib/types';
import { Sparkles, ArrowRight, Eye } from 'lucide-react';
=======
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { CardRenderer } from '@/components/cards/card-renderer';
import { getAvailableEvents } from '@/lib/events';
import { buildSampleDesigns } from '@/lib/cards/occasion-profile';
import type { EventType, Language } from '@/lib/types';
>>>>>>> fd7cb0c0fb3b09b8d0a8f66a15d9e7e3534c46ff

export default function TemplatesPage() {
    const router = useRouter();
    const [selectedEvent, setSelectedEvent] = useState<EventType>('christmas');
    const [language, setLanguage] = useState<Language>('fr');
<<<<<<< HEAD
    const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null);

    const events = getAvailableEvents();
    const currentEvent = getEventConfig(selectedEvent);
    const templates = useEventTemplates(selectedEvent, language);

    const handleUseTemplate = (templateId: number) => {
        router.push(`/create?event=${selectedEvent}&template=${templateId}`);
    };

    return (
        <div className="min-h-screen bg-[#030712] text-white pt-32 pb-20">
            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div
                    className="absolute top-0 right-0 w-[40%] h-[40%] blur-[120px]"
                    style={{ backgroundColor: `${currentEvent.colors.primary}10` }}
                />
                <div
                    className="absolute bottom-0 left-0 w-[30%] h-[30%] blur-[120px]"
                    style={{ backgroundColor: `${currentEvent.colors.secondary}05` }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tighter">
                        Nos <span
                        className="text-transparent bg-clip-text"
                        style={{
                            backgroundImage: `linear-gradient(to right, ${currentEvent.colors.primary}, ${currentEvent.colors.accent})`
                        }}
                    >
                            Modèles
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Choisissez le style parfait pour votre carte de vœux
                    </p>
                </motion.div>

                {/* Event Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">
                        Sélectionnez un événement
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        {events.map((event) => {
                            const EventIcon = event.icon;
                            const isSelected = selectedEvent === event.id;

                            return (
                                <button
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event.id)}
                                    className={`
                                        flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300
                                        ${isSelected
                                        ? 'scale-105 shadow-2xl'
                                        : 'hover:scale-102 bg-white/5 hover:bg-white/10'
                                    }
                                    `}
                                    style={{
                                        backgroundColor: isSelected ? `${event.colors.primary}15` : undefined,
                                        borderWidth: '2px',
                                        borderColor: isSelected ? event.colors.primary : 'transparent',
                                    }}
                                >
                                    {/*<span className="text-4xl">{event.icon}</span>*/}
                                    <span
                                        className="text-xs font-bold text-center"
                                        style={{
                                            color: isSelected ? event.colors.primary : '#9CA3AF',
                                        }}
                                    >
                                        {event.name[language]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Templates Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid md:grid-cols-2 gap-8"
                >
                    {templates.map((template, index) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            onMouseEnter={() => setHoveredTemplate(template.id)}
                            onMouseLeave={() => setHoveredTemplate(null)}
                            className="relative group"
                        >
                            {/* Card Container */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 hover:border-white/20 transition-all duration-500">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">
                                            {template.label}
                                        </h3>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                                            Template {template.id}
                                        </p>
                                    </div>
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${currentEvent.colors.primary}20` }}
                                    >
                                        <Sparkles
                                            size={20}
                                            style={{ color: currentEvent.colors.primary }}
                                        />
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black mb-6 group-hover:shadow-2xl transition-all">
                                    <template.Component
                                        name="Exemple"
                                        poem={language === 'fr'
                                            ? "Un exemple de poème\nCréé spécialement\nPour cet événement"
                                            : "A sample poem\nCreated specially\nFor this event"
                                        }
                                        language={language}
                                    />

                                    {/* Hover Overlay */}
                                    {hoveredTemplate === template.id && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                                        >
                                            <div className="flex gap-3">
                                                <button
                                                    className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
                                                >
                                                    <Eye size={18} />
                                                    Aperçu
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => handleUseTemplate(template.id)}
                                    className="w-full h-14 rounded-2xl font-black text-white flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                                    style={{ backgroundColor: currentEvent.colors.primary }}
                                >
                                    Utiliser ce modèle
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 text-center"
                >
                    <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-12 border border-white/10">
                        <h2 className="text-4xl font-black mb-4">
                            Prêt à créer votre carte ?
                        </h2>
                        <p className="text-gray-400 mb-8 text-lg">
                            Tous nos modèles sont 100% personnalisables et gratuits
                        </p>
                        <button
                            onClick={() => router.push(`/create?event=${selectedEvent}`)}
                            className="px-12 py-4 rounded-2xl font-black text-black text-lg hover:scale-105 transition-transform"
                            style={{ backgroundColor: currentEvent.colors.primary }}
                        >
                            Commencer maintenant
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
=======
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
>>>>>>> fd7cb0c0fb3b09b8d0a8f66a15d9e7e3534c46ff
